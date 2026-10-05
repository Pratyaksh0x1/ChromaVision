# ChromaVision - local photo restoration, enhancement, and colourisation

## What it does
Upload a photo and run it through the three models:
**1. Restoration** (noise, scratches, fading) → **2. Enhancement** (Real-ESRGAN, saaf/sharp) → **3. Colourisation** (grey photo mein colour).

---

## Quick Commands

### Run the React web app

Start the API server from the project root:
```bash
python server.py
```

In a second terminal, start the React frontend:
```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). The React app calls the API at port 8000.

### Run from command line
```bash
# Single photo (auto-detect models, output to ./results)
python process.py photo.jpg

# Multiple photos / folders (save results + create ZIP)
python process.py photo1.jpg photo2.jpg old_pics/ --out results --zip results.zip

# Full pipeline with all options
python process.py photo.jpg --steps --colorize always --T 0.45 --scale 2

# Skip enhancement (faster on CPU)
python process.py photo.jpg --no-enhance --no-restore

# Force CPU, smaller photos
python process.py photo.jpg --cpu --max_side 768
```

---

## Folder structure
```
chromavision_local/
  frontend/                 ← React web app (Vite)
  process.py                ← Command-line version (process folders of photos)
  chromavision_core.py      ← Core models and pipeline logic
  make_model_from_last.py   ← Repair incomplete training checkpoints
  server.py                 ← FastAPI server used by the React app
  requirements.txt
  models/                   ← Model files go here
      colorization_r34.pt
      restoration_r34.pt
      RealESRGAN_x4plus.pth
```

---

## Model files

### Where to get them
Kaggle mein final run ke **Output tab** se download karo (folder `chromavision_v4_outputs`):

| File | Location in Output tab |
|---|---|
| `colorization_r34.pt` | Root folder (direct) |
| `restoration_r34.pt` | Root folder (direct) |
| `RealESRGAN_x4plus.pth` | `weights/` subfolder |

### Important
- `*_last.pt` files **don't work** directly - they're training checkpoints only
- Any missing model file causes its step to be skipped (app will warn)
- Always use the final `.pt` files (not `_last.pt`)

---

## Setup (Windows)

```cmd
cd chromavision_local
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

**Python 3.10 or newer recommended.**

### Quick test
```bash
# Verify models are found
python process.py --help
```

---

## Command line options (process.py)

```
python process.py INPUT [INPUT...] [OPTIONS]

INPUTS           One or more image files or directories

Options:
  --models DIR     Folder with model files (default: ./models)
  --out DIR        Output folder (default: ./results)
  --zip NAME       Create ZIP of results (e.g., --zip my_photos.zip)
  --steps          Save intermediate steps (after each stage)
  --no-restore     Skip restoration step
  --no-enhance     Skip enhancement (Real-ESRGAN) step
  --colorize MODE  auto|always|never (default: auto)
                   auto = only grey photos get colourised
  --scale N        Output scale: 1 (same size), 2, or 4 (default: 1)
  --strength F     Enhancement strength 0.0-1.0 (default: 1.0)
  --T F            Colour temperature: 1.0 = natural, 0.3-0.5 = vivid (default: model's own)
  --max_side N     Resize photos bigger than N pixels (default: 1280, 0 to disable)
  --cpu            Force CPU instead of GPU
  --color_model    Path to custom colorization model
  --help           Show this help message
```

---

## Speed considerations (important!)

- **Enhancement (Real-ESRGAN) is the heaviest step.**
  - GPU: a few seconds per photo
  - CPU: several minutes per photo (depends on CPU and photo size)
- On CPU: use a smaller input image or disable Enhancement
- Output size 1x preserves detail (2x/4x is much slower and heavier)

---

## Auto mode colourisation

- **"Auto"** (default): Only grey/colourless photos get colourised
  - Colour photos: only restore + enhance
  - Grey photos: all three steps applied
- **"Always"**: Colourise everything (even colour photos)
  - Only checks brightness, may add colours incorrectly
- **"Never"**: Skip colourisation entirely

### Colour style
- **"Natural"**: Safe, accurate colours (use default T value)
- **"Vivid (T=0.45)"**: More saturated colours, higher risk of wrong colours
- **Custom T**: Slider from 0.25-1.0 (lower = more vivid)

---

## Troubleshooting: Crash / timeout during Kaggle training

If a Kaggle run stops before completion, you'll only get `colorization_r34_last.pt` files instead of the final `colorization_r34.pt`.

Convert them with:

```bash
python make_model_from_last.py colorization_r34_last.pt colorization_r34.pt models/colorization_r34_epoch24.pt
```

Arguments:
1. `*_last.pt` - New weights from interrupted training
2. Any existing FINAL file of the same model (same architecture)
3. Output path for the repaired model

---

## Known limitations

- Model sometimes produces incorrect colours (e.g., blue birds, green bottles) - this is a knowledge limitation, not a code bug
- Restoration removes noise/scratches but photos may appear slightly smoother than original
- `.pt` files are essentially pickles - **only use model files you trained yourself** or from trusted sources

---

## API server

The React frontend uses the local FastAPI server. Start it from the project root:

```bash
python server.py
```

The API listens on `http://127.0.0.1:8000`.