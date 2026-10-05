"""
chromavision_core.py - stand-alone inference for the whole ChromaVision pipeline (no Kaggle, no datasets needed).

    photo -> RESTORATION (restoration_*.pt) -> ENHANCEMENT (RealESRGAN_x4plus.pth) -> COLOURISATION (colorization_*.pt)

Every model file is optional: a stage whose model is missing is simply skipped.
Colourisation checkpoints: "unet" (trained from scratch) and "resnet34" (ImageNet-pretrained encoder, needs torchvision).
Always use the FINAL files, not the *_last.pt training checkpoints.
"""
import math
from pathlib import Path

import cv2
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image, ImageOps

COLOR_SIZE = 256            # working resolution of the network (short side). The models were trained at 256.
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".bmp", ".webp", ".tif", ".tiff"}


# ----------------------------------------------------------------------------- architectures (same as the notebooks)
def cbr(i, o, s=1, d=1):
    return nn.Sequential(nn.Conv2d(i, o, 3, s, d, dilation=d, bias=False), nn.BatchNorm2d(o), nn.ReLU(True))


class ColorNet(nn.Module):
    """L (B,1,H,W) -> logits over Q colour bins at HALF resolution (B,Q,H/2,W/2). U-Net + global scene branch."""
    def __init__(self, Q, c=64):
        super().__init__()
        self.e1 = nn.Sequential(cbr(1, c), cbr(c, c))
        self.e2 = nn.Sequential(cbr(c, 2 * c, 2), cbr(2 * c, 2 * c))
        self.e3 = nn.Sequential(cbr(2 * c, 4 * c, 2), cbr(4 * c, 4 * c), cbr(4 * c, 4 * c))
        self.e4 = nn.Sequential(cbr(4 * c, 8 * c, 2), cbr(8 * c, 8 * c), cbr(8 * c, 8 * c))
        self.e5 = nn.Sequential(cbr(8 * c, 8 * c, 2), cbr(8 * c, 8 * c, 1, 2), cbr(8 * c, 8 * c, 1, 2))
        self.glob = nn.Sequential(nn.AdaptiveAvgPool2d(1), nn.Flatten(), nn.Linear(8 * c, 8 * c), nn.ReLU(True))
        self.d4 = cbr(16 * c, 4 * c)
        self.d3 = cbr(8 * c, 2 * c)
        self.d2 = nn.Sequential(cbr(4 * c, 2 * c), cbr(2 * c, 2 * c))
        self.head = nn.Conv2d(2 * c, Q, 1)

    def forward(self, x):
        e1 = self.e1(x); e2 = self.e2(e1); e3 = self.e3(e2); e4 = self.e4(e3); e5 = self.e5(e4)
        b = e5 + self.glob(e5)[:, :, None, None]
        up = lambda t, ref: F.interpolate(t, size=ref.shape[-2:], mode="bilinear", align_corners=False)
        d4 = self.d4(torch.cat([up(b, e4), e4], 1))
        d3 = self.d3(torch.cat([up(d4, e3), e3], 1))
        d2 = self.d2(torch.cat([up(d3, e2), e2], 1))
        return self.head(d2)


class ResColorNet(nn.Module):
    """ResNet encoder + U-Net decoder. (weights come from the checkpoint, nothing is downloaded here)"""
    def __init__(self, Q, backbone="resnet34"):
        super().__init__()
        try:
            import torchvision
        except ImportError:
            raise ImportError("This model needs torchvision:  pip install torchvision")
        m = getattr(torchvision.models, backbone)(weights=None)
        self.stem = nn.Sequential(m.conv1, m.bn1, m.relu)
        self.pool, self.l1, self.l2, self.l3, self.l4 = m.maxpool, m.layer1, m.layer2, m.layer3, m.layer4
        self.glob = nn.Sequential(nn.AdaptiveAvgPool2d(1), nn.Flatten(), nn.Linear(512, 512), nn.ReLU(True))
        self.d4 = cbr(512 + 256, 256)
        self.d3 = cbr(256 + 128, 128)
        self.d2 = cbr(128 + 64, 96)
        self.d1 = nn.Sequential(cbr(96 + 64, 96), cbr(96, 96))
        self.head = nn.Conv2d(96, Q, 1)
        self.register_buffer("mean", torch.tensor([0.485, 0.456, 0.406]).view(1, 3, 1, 1))
        self.register_buffer("std", torch.tensor([0.229, 0.224, 0.225]).view(1, 3, 1, 1))

    def forward(self, x):
        x = ((x + 1) * 0.5).expand(-1, 3, -1, -1)
        x = (x - self.mean) / self.std
        s0 = self.stem(x); s1 = self.l1(self.pool(s0)); s2 = self.l2(s1); s3 = self.l3(s2); s4 = self.l4(s3)
        b = s4 + self.glob(s4)[:, :, None, None]
        up = lambda t, ref: F.interpolate(t, size=ref.shape[-2:], mode="bilinear", align_corners=False)
        d4 = self.d4(torch.cat([up(b, s3), s3], 1))
        d3 = self.d3(torch.cat([up(d4, s2), s2], 1))
        d2 = self.d2(torch.cat([up(d3, s1), s1], 1))
        d1 = self.d1(torch.cat([up(d2, s0), s0], 1))
        return self.head(d1)


def build_color_net(arch, Q):
    if arch == "unet":
        return ColorNet(Q)
    if arch in ("resnet34", "resnet18"):
        return ResColorNet(Q, arch)
    raise ValueError(f"Unknown model architecture '{arch}' in this checkpoint.")


# ----------------------------------------------------------------------------- loading
def pick_device(prefer="auto"):
    if prefer == "cpu":
        return torch.device("cpu")
    return torch.device("cuda" if torch.cuda.is_available() else "cpu")


def find_files(dirs, prefix, exts):
    """Model files whose name starts with `prefix` (case-insensitive) in the given folders. Training '*_last.*' files are skipped."""
    seen, out = set(), []
    for d in dirs:
        d = Path(d)
        if not d.is_dir():
            continue
        for p in sorted(d.iterdir()):
            if (p.is_file() and p.suffix.lower() in exts and p.name.lower().startswith(prefix.lower())
                    and "_last" not in p.stem.lower() and p.resolve() not in seen):
                seen.add(p.resolve()); out.append(p)
    return out


def find_all_models(dirs):
    """-> dict(color=[...], restore=[...], enhance=[...]) of files found in the folders."""
    return dict(color=find_files(dirs, "colorization", {".pt"}),
                restore=find_files(dirs, "restoration", {".pt"}),
                enhance=find_files(dirs, "realesrgan", {".pth"}) or find_files(dirs, "esrgan", {".pth"}))


def find_models(dirs):
    return find_files(dirs, "colorization", {".pt"})


def load_model(path, device="auto"):
    """-> dict(net, centers, T, arch, Q, device, name). The .pt file is a pickle: only load files you trust (your own)."""
    path = Path(path).expanduser()
    if not path.exists():
        raise FileNotFoundError(f"Model file not found: {path}")
    dev = pick_device(device) if isinstance(device, str) else device
    ck = torch.load(path, map_location="cpu", weights_only=False)
    if not isinstance(ck, dict) or not all(k in ck for k in ("model", "quant", "Q")):
        raise ValueError(f"{path.name} is not a final ChromaVision model. Use the final 'colorization_<profile>.pt' file "
                         "(files ending in '_last.pt' are training checkpoints and cannot be used for colouring).")
    arch = ck.get("arch", "unet")
    net = build_color_net(arch, ck["Q"])
    net.load_state_dict(ck["model"])
    net.eval().to(dev)
    centers = torch.tensor(np.asarray(ck["quant"]["centers"], np.float32), device=dev)
    return dict(net=net, centers=centers, T=float(ck.get("T", 1.0)), arch=arch, Q=int(ck["Q"]), device=dev, name=path.stem)


# ----------------------------------------------------------------------------- colourising
def guided_filter(I, p, r, eps=1e-3):
    k = (2 * r + 1, 2 * r + 1)
    box = lambda a: cv2.boxFilter(a, -1, k, normalize=True, borderType=cv2.BORDER_REFLECT)
    mI = box(I); vI = box(I * I) - mI * mI
    out = np.empty_like(p)
    for c in range(p.shape[2]):
        mp = box(p[..., c]); a = (box(I * p[..., c]) - mI * mp) / (vI + eps)
        out[..., c] = box(a) * I + box(mp - a * mI)
    return out


def compose_rgb(L_u8, ab):
    lab = np.empty(L_u8.shape + (3,), np.uint8)
    lab[..., 0] = L_u8
    lab[..., 1:] = np.clip(np.round(ab + 128.0), 0, 255).astype(np.uint8)
    return cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)


def limit_size(rgb_u8, max_side):
    """Shrink very large photos (keeps memory and time sane). max_side = 0/None -> keep as is."""
    if max_side and max(rgb_u8.shape[:2]) > max_side:
        s = max_side / max(rgb_u8.shape[:2])
        rgb_u8 = cv2.resize(rgb_u8, (round(rgb_u8.shape[1] * s), round(rgb_u8.shape[0] * s)), interpolation=cv2.INTER_AREA)
    return rgb_u8


@torch.no_grad()
def colorize(bundle, rgb_u8, T=None, side=COLOR_SIZE):
    """Any-size uint8 RGB (grey, sepia or even colour: only its brightness is used) -> colourised uint8 RGB.
    T = colour temperature: 1.0 = natural / safe, lower (0.3-0.5) = more vivid but riskier. None = the model's own default."""
    net, centers, dev = bundle["net"], bundle["centers"], bundle["device"]
    T = float(T if T else bundle["T"])
    H, W = rgb_u8.shape[:2]
    L_u8 = cv2.cvtColor(rgb_u8, cv2.COLOR_RGB2LAB)[..., 0]
    s = side / min(H, W)
    wh, ww = max(16, int(round(H * s / 16)) * 16), max(16, int(round(W * s / 16)) * 16)
    Lw = cv2.resize(L_u8, (ww, wh), interpolation=cv2.INTER_AREA if s < 1 else cv2.INTER_CUBIC)
    x = torch.from_numpy(Lw.astype(np.float32) / 255.0 * 2 - 1)[None, None].to(dev)
    with torch.autocast(device_type=dev.type, dtype=torch.float16, enabled=(dev.type == "cuda")):
        logits = net(x)
    probs = torch.softmax(logits.float() / T, dim=1)
    ab = torch.einsum("bqhw,qc->bchw", probs, centers)[0].permute(1, 2, 0).cpu().numpy()
    ab = cv2.resize(ab, (W, H), interpolation=cv2.INTER_CUBIC)
    ab = guided_filter(L_u8.astype(np.float32) / 255.0, ab.astype(np.float32), r=max(2, round(min(H, W) / 60)))
    return compose_rgb(L_u8, ab)


def grey_version(rgb_u8):
    """The brightness-only picture the model really sees (as RGB, for display)."""
    L = cv2.cvtColor(rgb_u8, cv2.COLOR_RGB2LAB)[..., 0]
    return compose_rgb(L, np.zeros(L.shape + (2,), np.float32))


def looks_grey(rgb_u8, thr=6.0):
    ab = cv2.cvtColor(rgb_u8, cv2.COLOR_RGB2LAB)[..., 1:].astype(np.float32).reshape(-1, 2)
    return float(np.hypot(*(ab - ab.mean(0)).T).mean()) < thr


# ----------------------------------------------------------------------------- image I/O
def read_image(src):
    """path / file-like -> uint8 RGB array (EXIF rotation applied, any mode converted)."""
    im = Image.open(src)
    im = ImageOps.exif_transpose(im)
    return np.asarray(im.convert("RGB"))


def png_bytes(rgb_u8):
    import io
    buf = io.BytesIO()
    Image.fromarray(rgb_u8).save(buf, format="PNG")
    return buf.getvalue()


# ============================================================================= RESTORATION (residual U-Net with channel attention)
class RB(nn.Module):
    """Residual block with channel attention."""
    def __init__(self, c):
        super().__init__()
        self.c1, self.c2 = nn.Conv2d(c, c, 3, 1, 1), nn.Conv2d(c, c, 3, 1, 1)
        self.ca = nn.Sequential(nn.AdaptiveAvgPool2d(1), nn.Conv2d(c, max(c // 8, 4), 1), nn.ReLU(True),
                                nn.Conv2d(max(c // 8, 4), c, 1), nn.Sigmoid())

    def forward(self, x):
        r = self.c2(F.relu(self.c1(x), True))
        return x + r * self.ca(r)


def blocks(c, n):
    return nn.Sequential(*[RB(c) for _ in range(n)])


class RestoNet(nn.Module):
    """Residual U-Net. Output = input + learned correction, so 'do nothing' is the easy default."""
    def __init__(self, c=48):
        super().__init__()
        self.head = nn.Conv2d(3, c, 3, 1, 1)
        self.e1, self.d1 = blocks(c, 2), nn.Conv2d(c, 2 * c, 3, 2, 1)
        self.e2, self.d2 = blocks(2 * c, 2), nn.Conv2d(2 * c, 4 * c, 3, 2, 1)
        self.e3, self.d3 = blocks(4 * c, 4), nn.Conv2d(4 * c, 8 * c, 3, 2, 1)
        self.mid = blocks(8 * c, 6)
        self.u3, self.f3, self.g3 = nn.Sequential(nn.Conv2d(8 * c, 16 * c, 1), nn.PixelShuffle(2)), nn.Conv2d(8 * c, 4 * c, 1), blocks(4 * c, 2)
        self.u2, self.f2, self.g2 = nn.Sequential(nn.Conv2d(4 * c, 8 * c, 1), nn.PixelShuffle(2)), nn.Conv2d(4 * c, 2 * c, 1), blocks(2 * c, 2)
        self.u1, self.f1, self.g1 = nn.Sequential(nn.Conv2d(2 * c, 4 * c, 1), nn.PixelShuffle(2)), nn.Conv2d(2 * c, c, 1), blocks(c, 2)
        self.out = nn.Conv2d(c, 3, 3, 1, 1)

    def forward(self, x):
        h = self.head(x)
        s1 = self.e1(h); s2 = self.e2(self.d1(s1)); s3 = self.e3(self.d2(s2))
        m = self.mid(self.d3(s3))
        y = self.g3(self.f3(torch.cat([self.u3(m), s3], 1)))
        y = self.g2(self.f2(torch.cat([self.u2(y), s2], 1)))
        y = self.g1(self.f1(torch.cat([self.u1(y), s1], 1)))
        return x + self.out(y)


# ============================================================================= ENHANCEMENT (Real-ESRGAN x4plus, pre-trained)
ESRGAN_URL = "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth"


class RDB(nn.Module):
    def __init__(self, nf=64, gc=32):
        super().__init__()
        self.conv1, self.conv2 = nn.Conv2d(nf, gc, 3, 1, 1), nn.Conv2d(nf + gc, gc, 3, 1, 1)
        self.conv3, self.conv4 = nn.Conv2d(nf + 2 * gc, gc, 3, 1, 1), nn.Conv2d(nf + 3 * gc, gc, 3, 1, 1)
        self.conv5 = nn.Conv2d(nf + 4 * gc, nf, 3, 1, 1)

    def forward(self, x):
        a = lambda t: F.leaky_relu(t, 0.2, True)
        x1 = a(self.conv1(x)); x2 = a(self.conv2(torch.cat([x, x1], 1)))
        x3 = a(self.conv3(torch.cat([x, x1, x2], 1))); x4 = a(self.conv4(torch.cat([x, x1, x2, x3], 1)))
        return self.conv5(torch.cat([x, x1, x2, x3, x4], 1)) * 0.2 + x


class RRDB(nn.Module):
    def __init__(self, nf=64, gc=32):
        super().__init__()
        self.rdb1, self.rdb2, self.rdb3 = RDB(nf, gc), RDB(nf, gc), RDB(nf, gc)

    def forward(self, x):
        return self.rdb3(self.rdb2(self.rdb1(x))) * 0.2 + x


class RRDBNet(nn.Module):
    """Architecture of RealESRGAN_x4plus (key names match the released .pth file)."""
    def __init__(self, nf=64, nb=23, gc=32):
        super().__init__()
        self.conv_first = nn.Conv2d(3, nf, 3, 1, 1)
        self.body = nn.Sequential(*[RRDB(nf, gc) for _ in range(nb)])
        self.conv_body = nn.Conv2d(nf, nf, 3, 1, 1)
        self.conv_up1, self.conv_up2 = nn.Conv2d(nf, nf, 3, 1, 1), nn.Conv2d(nf, nf, 3, 1, 1)
        self.conv_hr, self.conv_last = nn.Conv2d(nf, nf, 3, 1, 1), nn.Conv2d(nf, 3, 3, 1, 1)

    def forward(self, x):
        a = lambda t: F.leaky_relu(t, 0.2, True)
        f = self.conv_first(x); f = f + self.conv_body(self.body(f))
        f = a(self.conv_up1(F.interpolate(f, scale_factor=2, mode="nearest")))
        f = a(self.conv_up2(F.interpolate(f, scale_factor=2, mode="nearest")))
        return self.conv_last(a(self.conv_hr(f)))


def download_esrgan(dest):
    """Download the pre-trained Real-ESRGAN weights (~64 MB) to `dest` (needs Internet)."""
    dest = Path(dest); dest.parent.mkdir(parents=True, exist_ok=True)
    torch.hub.download_url_to_file(ESRGAN_URL, str(dest), progress=False)
    return dest


def _freeze(net, dev):
    net.eval().to(dev)
    for p in net.parameters():
        p.requires_grad_(False)
    return net


def load_restoration(path, device="auto"):
    path = Path(path).expanduser()
    dev = pick_device(device) if isinstance(device, str) else device
    ck = torch.load(path, map_location="cpu", weights_only=False)
    sd = ck["model"] if isinstance(ck, dict) and "model" in ck else ck
    net = RestoNet()
    try:
        net.load_state_dict(sd)
    except RuntimeError as e:
        raise ValueError(f"{path.name} does not look like a ChromaVision restoration model ({str(e)[:160]})")
    return dict(net=_freeze(net, dev), device=dev, name=path.stem)


def load_enhancer(path, device="auto"):
    path = Path(path).expanduser()
    dev = pick_device(device) if isinstance(device, str) else device
    try:
        sd = torch.load(path, map_location="cpu", weights_only=True)
    except Exception:
        sd = torch.load(path, map_location="cpu", weights_only=False)
    if isinstance(sd, dict):
        sd = sd.get("params_ema", sd.get("params", sd))
    net = RRDBNet()
    try:
        net.load_state_dict(sd, strict=True)
    except RuntimeError as e:
        raise ValueError(f"{path.name} is not the RealESRGAN_x4plus weights file ({str(e)[:160]})")
    return dict(net=_freeze(net, dev), device=dev, name=path.stem)


# ============================================================================= tiling + the two image-to-image stages
def make_blend_mask(h, w, pad):
    """2D feathering window to eliminate tile boundary seams."""
    def ramp(length, p):
        if p <= 0 or p * 2 >= length:
            return torch.ones(length, dtype=torch.float32)
        r = torch.linspace(0.0, 1.0, p, dtype=torch.float32)
        mid = torch.ones(length - 2 * p, dtype=torch.float32)
        return torch.cat([r, mid, r.flip(0)])

    wy = ramp(h, pad).view(1, 1, h, 1)
    wx = ramp(w, pad).view(1, 1, 1, w)
    return wy * wx


def tiled_apply(fn, x, tile, pad, scale=1, mult=8, progress=None):
    """
    x: (1,C,H,W) tensor. fn maps a (1,C,h,w) patch -> (1,C',h*scale,w*scale).
    Seamless execution with direct evaluation when possible, and weighted overlap
    feathering when tiling to completely eliminate vertical and horizontal seam lines.
    """
    _, C, H, W = x.shape

    # 1. If image fits within one tile, execute directly without any tiling or seams
    if tile <= 0 or (H <= tile and W <= tile):
        rh, rw = (-H) % mult, (-W) % mult
        px = F.pad(x, (0, rw, 0, rh), mode="reflect") if (rh or rw) else x
        res = fn(px)[:, :, :H * scale, :W * scale]
        if progress:
            progress(1.0)
        return res

    # 2. Seamless overlapping tiling with smooth feathering
    overlap = max(16, pad * 2)
    stride = max(32, tile - overlap)
    ys = list(range(0, max(1, H - tile + stride), stride))
    xs = list(range(0, max(1, W - tile + stride), stride))

    if ys[-1] + tile < H:
        ys.append(H - tile)
    if xs[-1] + tile < W:
        xs.append(W - tile)
    ys = sorted(list(set(ys)))
    xs = sorted(list(set(xs)))

    out = None
    weights = torch.zeros(1, 1, H * scale, W * scale, device=x.device, dtype=torch.float32)
    total, done = len(ys) * len(xs), 0

    for y0 in ys:
        for x0 in xs:
            y1 = min(H, y0 + tile)
            x1 = min(W, x0 + tile)
            patch = x[:, :, y0:y1, x0:x1]
            ph, pw = patch.shape[2:]

            rh, rw = (-ph) % mult, (-pw) % mult
            if rh or rw:
                patch = F.pad(patch, (0, rw, 0, rh), mode="reflect")

            res = fn(patch)[:, :, :ph * scale, :pw * scale]
            if out is None:
                out = torch.zeros(1, res.shape[1], H * scale, W * scale, device=x.device, dtype=torch.float32)

            mask = make_blend_mask(ph * scale, pw * scale, pad * scale).to(x.device)

            # Preserve full weight on outer image boundaries
            if y0 == 0:
                mask[:, :, :pad * scale, :] = 1.0
            if y1 == H:
                mask[:, :, -(pad * scale):, :] = 1.0
            if x0 == 0:
                mask[:, :, :, :pad * scale] = 1.0
            if x1 == W:
                mask[:, :, :, -(pad * scale):] = 1.0

            out[:, :, y0 * scale:y1 * scale, x0 * scale:x1 * scale] += res.float() * mask
            weights[:, :, y0 * scale:y1 * scale, x0 * scale:x1 * scale] += mask

            done += 1
            if progress:
                progress(done / total)

    out = out / torch.clamp(weights, min=1e-6)
    return out



@torch.no_grad()
def restore_image(b, x, tile=2048, pad=48, progress=None):
    """x: float32 RGB (H,W,3) in [0,1] -> restored float32."""
    net, dev = b["net"], b["device"]
    t = torch.from_numpy(np.ascontiguousarray(x.transpose(2, 0, 1)))[None].to(dev)

    def fn(p):
        with torch.autocast(device_type=dev.type, dtype=torch.float16, enabled=(dev.type == "cuda")):
            return net(p).float()
    out = tiled_apply(fn, t, tile, pad, 1, 8, progress)
    return out[0].clamp(0, 1).permute(1, 2, 0).cpu().numpy()


@torch.no_grad()
def enhance_image(b, x, out_scale=1.0, strength=1.0, tile=512, pad=32, progress=None):
    """x float32 RGB [0,1]. Runs the 4x model, then resizes to out_scale x the input size
    (1.0 = same size: you keep the recovered detail, not the extra pixels). strength < 1 blends with the plain input."""
    net, dev = b["net"], b["device"]
    if dev.type == "cpu":
        tile = min(tile, 128)
    H, W = x.shape[:2]
    t = torch.from_numpy(np.ascontiguousarray(x.transpose(2, 0, 1)))[None].to(dev)

    def fn(p):
        with torch.autocast(device_type=dev.type, dtype=torch.float16, enabled=(dev.type == "cuda")):
            return net(p).float()
    sr = tiled_apply(fn, t, tile, pad, 4, 1, progress)[0].clamp(0, 1).permute(1, 2, 0).cpu().numpy()
    size = (max(1, round(W * out_scale)), max(1, round(H * out_scale)))
    sr = cv2.resize(sr, size, interpolation=cv2.INTER_AREA if out_scale < 4 else cv2.INTER_LINEAR)
    if strength < 1.0:
        base = cv2.resize(x, size, interpolation=cv2.INTER_CUBIC)
        sr = base * (1 - strength) + sr * strength
    return np.clip(sr, 0, 1).astype(np.float32)


def to_u8(x):
    return np.clip(np.round(x * 255.0), 0, 255).astype(np.uint8)


# ============================================================================= the whole chain
def load_models(color=None, restore=None, enhance=None, device="auto"):
    """Load whichever model files are given (paths or None) -> dict(color=, restoration=, enhancement=)."""
    m = {}
    if color:   m["color"] = load_model(color, device)
    if restore: m["restoration"] = load_restoration(restore, device)
    if enhance: m["enhancement"] = load_enhancer(enhance, device)
    return m


def run_pipeline(models, rgb_u8, restore=True, enhance=True, colorize_mode="auto", out_scale=1.0, strength=1.0,
                 T=None, max_side=1280, progress=None):
    """restoration -> enhancement -> colourisation (colour last, so the colours are never 'enhanced' twice).
    colorize_mode: "auto" (only photos that look grey), "always", "never".
    progress(fraction 0..1, text) is optional.
    -> dict(final=uint8 RGB, steps=[(label, uint8 RGB), ...], notes=[...], was_grey=bool)"""
    notes = []
    rgb_u8 = limit_size(rgb_u8, max_side)
    steps = [("Input", rgb_u8)]
    plan = []
    if restore:
        if models.get("restoration") is not None: plan.append(("restore", 2.0))
        else: notes.append("Restoration skipped: no restoration model loaded.")
    if enhance:
        if models.get("enhancement") is not None: plan.append(("enhance", 10.0))
        else: notes.append("Enhancement skipped: no Real-ESRGAN weights loaded.")
    if colorize_mode != "never":
        if models.get("color") is not None: plan.append(("color", 1.0))
        else: notes.append("Colourisation skipped: no colorization model loaded.")
    tot, spans, c = sum(w for _, w in plan) or 1.0, {}, 0.0
    for name, w in plan:
        spans[name] = (c / tot, (c + w) / tot); c += w

    def cb(name, text):
        if progress is None or name not in spans:
            return None
        a, b = spans[name]
        return lambda f: progress(a + (b - a) * f, text)

    x = rgb_u8.astype(np.float32) / 255.0
    if "restore" in spans:
        if progress: progress(spans["restore"][0], "Restoring ...")
        x = restore_image(models["restoration"], x, progress=cb("restore", "Restoring ..."))
        steps.append(("Restored", to_u8(x)))
    if "enhance" in spans:
        if progress: progress(spans["enhance"][0], "Enhancing (Real-ESRGAN) ...")
        x = enhance_image(models["enhancement"], x, out_scale, strength, progress=cb("enhance", "Enhancing (Real-ESRGAN) ..."))
        steps.append(("Enhanced", to_u8(x)))
    out = to_u8(x)
    grey = looks_grey(rgb_u8) or looks_grey(out)          # judged on the input too, so a tint left by restoration cannot block colouring
    if "color" in spans:
        if colorize_mode == "always" or grey:
            if progress: progress(spans["color"][0], "Colourising ...")
            out = colorize(models["color"], out, T=T)
            steps.append(("Colourised", out))
        else:
            notes.append("This photo already has colour, so colourisation was skipped (set Colourise to 'Always' to recolour it anyway).")
    if progress: progress(1.0, "Done")
    return dict(final=out, steps=steps, notes=notes, was_grey=grey)
