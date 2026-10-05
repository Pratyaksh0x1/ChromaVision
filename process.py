"""
process.py - run photos through the whole ChromaVision chain from the command line:  restore -> enhance -> colourise.

Examples
    python process.py photo.jpg
    python process.py photo1.jpg old_pics/ --out results --zip results.zip
    python process.py photo.jpg --steps --colorize always --T 0.45 --scale 2
    python process.py photo.jpg --no-enhance          # skip the (slow on CPU) Real-ESRGAN step
"""
import argparse
import sys
import time
import zipfile
from pathlib import Path

from PIL import Image

import chromavision_core as cc

HERE = Path(__file__).resolve().parent


def collect(inputs):
    files = []
    for p in map(Path, inputs):
        if p.is_dir():
            files += sorted(f for f in p.rglob("*") if f.suffix.lower() in cc.IMAGE_EXT)
        elif p.is_file():
            files.append(p)
        else:
            print(f"[skip] not found: {p}")
    return files


def main():
    ap = argparse.ArgumentParser(description="ChromaVision: restore -> enhance -> colourise")
    ap.add_argument("inputs", nargs="+", help="image files and/or folders")
    ap.add_argument("--models", default=None, help="folder with the model files (default: ./models next to this script)")
    ap.add_argument("--color_model", help="path to a specific colorization_*.pt")
    ap.add_argument("--out", default="results", help="output folder (default: ./results)")
    ap.add_argument("--zip", nargs="?", const="chromavision_results.zip", default=None, metavar="NAME.zip", help="pack the results into a ZIP")
    ap.add_argument("--steps", action="store_true", help="also save the picture after every step")
    ap.add_argument("--no-restore", action="store_true"); ap.add_argument("--no-enhance", action="store_true")
    ap.add_argument("--colorize", choices=["auto", "always", "never"], default="auto", help="auto = only grey photos")
    ap.add_argument("--scale", type=int, choices=[1, 2, 4], default=1, help="output size: 1 = same pixels, 2 / 4 = bigger")
    ap.add_argument("--strength", type=float, default=1.0, help="enhancement strength 0..1")
    ap.add_argument("--T", type=float, default=None, help="colour temperature: 1.0 natural, 0.3-0.5 vivid (default: model's own)")
    ap.add_argument("--max_side", type=int, default=1280, help="shrink photos whose longest side is bigger (0 = keep size)")
    ap.add_argument("--cpu", action="store_true", help="force CPU")
    a = ap.parse_args()

    dirs = [Path(a.models)] if a.models else [HERE / "models", HERE, Path.cwd() / "models", Path.cwd()]
    found = cc.find_all_models(dirs)
    color = a.color_model or (str(found["color"][0]) if found["color"] else None)
    restore = str(found["restore"][0]) if found["restore"] else None
    enhance = str(found["enhance"][0]) if found["enhance"] else None
    if not (color or restore or enhance):
        sys.exit("No model files found. Copy them into the 'models' folder (see README.md).")
    files = collect(a.inputs)
    if not files:
        sys.exit("No images found in the given inputs.")
    try:
        models = cc.load_models(color, restore if not a.no_restore else None, enhance if not a.no_enhance else None,
                                "cpu" if a.cpu else "auto")
    except (ValueError, FileNotFoundError, ImportError, RuntimeError) as e:
        sys.exit(f"Model error: {e}")
    print("models:", {k: v["name"] for k, v in models.items()}, "| device:", next(iter(models.values()))["device"])

    out_dir = Path(a.out); out_dir.mkdir(parents=True, exist_ok=True)
    written, used = [], set()

    def unique(stem):
        name, k = stem, 2
        while name in used:
            name, k = f"{stem}_{k}", k + 1
        used.add(name)
        return name

    for i, f in enumerate(files, 1):
        t0 = time.time()
        try:
            rgb = cc.read_image(f)
        except Exception as e:
            print(f"[{i}/{len(files)}] {f.name}: cannot read ({e})"); continue
        last = [-1.0]

        def prog(fr, txt):
            if fr - last[0] >= 0.1 or fr >= 1.0:
                last[0] = fr; print(f"    {txt} {fr * 100:3.0f}%", end="\r", flush=True)
        res = cc.run_pipeline(models, rgb, restore=not a.no_restore, enhance=not a.no_enhance, colorize_mode=a.colorize,
                              out_scale=a.scale, strength=a.strength, T=a.T, max_side=a.max_side, progress=prog)
        name = unique(f.stem)
        p = out_dir / f"{name}_chromavision.png"
        Image.fromarray(res["final"]).save(p); written.append(p)
        if a.steps:
            for lab, img in res["steps"]:
                ps = out_dir / f"{name}_step_{lab.lower()}.png"
                Image.fromarray(img).save(ps); written.append(ps)
        print(f"[{i}/{len(files)}] {f.name} -> {p.name}  [{' > '.join(l for l, _ in res['steps'])}]  ({time.time() - t0:.0f}s)        ")
        for n in res["notes"]:
            print("    note:", n)
    if a.zip and written:
        zp = Path(a.zip)
        with zipfile.ZipFile(zp, "w", zipfile.ZIP_DEFLATED) as z:
            for p in written:
                z.write(p, arcname=p.name)
        print(f"zip: {zp.resolve()}  ({len(written)} files)")
    print(f"done. results in: {out_dir.resolve()}")


if __name__ == "__main__":
    main()
