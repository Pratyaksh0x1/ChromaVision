"""
make_model_from_last.py - turn a training checkpoint (colorization_r34_last.pt) into a model file the app can use.

Why: the app needs a FINAL model file (it contains the colour bins). If a Kaggle run stops before the end, only the
*_last.pt file has the newest weights. This script takes the weights from it and the colour bins from an older final file.

    python make_model_from_last.py colorization_r34_last.pt colorization_r34.pt models/colorization_r34_epoch24.pt
                                   ^ newest weights            ^ any older FINAL file of the SAME model family   ^ output
"""
import sys
from pathlib import Path

import torch


def main():
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    last_p, old_p, out_p = map(Path, sys.argv[1:])
    last = torch.load(last_p, map_location="cpu", weights_only=False)
    old = torch.load(old_p, map_location="cpu", weights_only=False)
    for k in ("model",):
        if k not in last: sys.exit(f"{last_p.name} has no '{k}' - is it a *_last.pt training checkpoint?")
    for k in ("quant", "Q"):
        if k not in old: sys.exit(f"{old_p.name} has no '{k}' - the second file must be a FINAL colorization_*.pt (not *_last.pt).")
    arch = last.get("arch", old.get("arch", "unet"))
    head = [v for k, v in last["model"].items() if k.endswith("head.weight")]
    if head and head[0].shape[0] != old["Q"]:
        sys.exit(f"Colour-bin mismatch: weights predict {head[0].shape[0]} bins but {old_p.name} has {old['Q']}. Use a final file of the same model.")
    out_p.parent.mkdir(parents=True, exist_ok=True)
    torch.save(dict(model=last["model"], quant=old["quant"], T=old.get("T", 1.0), Q=old["Q"], arch=arch), out_p)
    print(f"saved {out_p}  (arch {arch}, trained up to epoch {last.get('epoch', '?')}, step {last.get('step', '?')})")


if __name__ == "__main__":
    main()
