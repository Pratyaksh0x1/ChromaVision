"""
ChromaVision API Server - FastAPI backend for the React UI.
Supports individual and chained execution of:
1. Restoration (restoration_R_34PT)
2. Enhancement (Real-ESRGAN x4plus)
3. Colorization (colorization_R_34PT)
"""

import base64
import io
import json
import os
import threading
import time
from pathlib import Path
from typing import Optional, List, Dict, Any
from uuid import uuid4

import cv2
import numpy as np
from PIL import Image
import torch
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

import chromavision_core as cc

HERE = Path(__file__).resolve().parent
MODELS_DIR = HERE / "models"
METRICS_PATH = MODELS_DIR / "metrics_summary.json"

app = FastAPI(title="ChromaVision Neural Suite API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import gc

# Global models cache
MODELS: Dict[str, Any] = {}
PROCESS_PROGRESS: Dict[str, Dict[str, Any]] = {}
PROCESS_PROGRESS_LOCK = threading.Lock()
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"


def set_process_progress(processing_id, progress, stage, status="processing"):
    with PROCESS_PROGRESS_LOCK:
        PROCESS_PROGRESS[processing_id] = {
            "status": status,
            "progress": max(0, min(100, round(progress))),
            "stage": stage,
            "updated_at": time.time(),
        }


def get_loaded_models():
    global MODELS
    if not MODELS:
        restore_path = MODELS_DIR / "restoration_r34.pt"
        color_path = MODELS_DIR / "colorization_r34.pt"
        enhance_path = MODELS_DIR / "RealESRGAN_x4plus.pth"

        print(f"Loading ChromaVision neural models on {DEVICE}...")
        MODELS = cc.load_models(
            color=str(color_path) if color_path.exists() else None,
            restore=str(restore_path) if restore_path.exists() else None,
            enhance=str(enhance_path) if enhance_path.exists() else None,
            device="auto"
        )
        print(f"Models loaded: {list(MODELS.keys())}")
    return MODELS

# Preload on server start
try:
    get_loaded_models()
except Exception as _e:
    print("Startup preload note:", _e)


def img_to_base64_data_uri(img_u8: np.ndarray, format: str = "PNG") -> str:
    """Convert RGB uint8 numpy array to base64 data URI."""
    pil_img = Image.fromarray(img_u8)
    buf = io.BytesIO()
    pil_img.save(buf, format=format, optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/{format.lower()};base64,{b64}"


from PIL import Image, ImageOps, ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True

def read_image_from_bytes(data: bytes, max_side: int = 1024) -> np.ndarray:
    """Read uploaded bytes into RGB uint8 array, safely handling EXIF and memory."""
    pil = Image.open(io.BytesIO(data))
    pil = ImageOps.exif_transpose(pil)
    pil = pil.convert("RGB")
    if max_side and max(pil.size) > max_side:
        w, h = pil.size
        scale = max_side / max(w, h)
        new_w, new_h = max(16, round(w * scale)), max(16, round(h * scale))
        pil = pil.resize((new_w, new_h), Image.Resampling.BILINEAR)
    return np.array(pil, dtype=np.uint8)


@app.get("/api/status")
def get_status():
    models_status = {
        "restoration": (MODELS_DIR / "restoration_r34.pt").exists(),
        "colorization": (MODELS_DIR / "colorization_r34.pt").exists(),
        "enhancement": (MODELS_DIR / "RealESRGAN_x4plus.pth").exists(),
    }
    
    metrics = {}
    def sanitize(o):
        if isinstance(o, dict):
            return {k: sanitize(v) for k, v in o.items()}
        elif isinstance(o, list):
            return [sanitize(v) for v in o]
        elif isinstance(o, float):
            if o == float("inf") or o == float("-inf") or str(o).lower() == "inf":
                return "Infinity"
            elif o != o: # nan
                return None
        return o

    if METRICS_PATH.exists():
        try:
            with open(METRICS_PATH, "r", encoding="utf-8") as f:
                metrics = sanitize(json.load(f))
        except Exception as e:
            metrics = {"error": str(e)}

    return {
        "status": "ready",
        "device": DEVICE,
        "device_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "Host CPU",
        "models": {
            "restoration": {
                "name": "Restoration R-34 (restoration_R_34PT)",
                "arch": "ResNet-34 + Custom Dilated U-Net",
                "available": models_status["restoration"],
                "role": "Scratch, tear, noise, dust & degradation repair",
                "parameters": "21.8M",
            },
            "colorization": {
                "name": "Colorization R-34 (colorization_R_34PT)",
                "arch": "ResNet-34 Encoder + Global Context Decoder",
                "available": models_status["colorization"],
                "role": "Lab Chroma ab prediction with temperature scaling",
                "parameters": "23.5M",
            },
            "enhancement": {
                "name": "Real-ESRGAN x4plus",
                "arch": "RRDBNet (Residual in Residual Dense Block)",
                "available": models_status["enhancement"],
                "role": "High-fidelity 4x super-resolution & sharpening",
                "parameters": "16.7M",
            }
        },
        "benchmarks": metrics,
        "pipeline_order": [
            "1. Restoration (Noise, scratches, physical decay)",
            "2. Enhancement (Real-ESRGAN super-resolution & detail synthesis)",
            "3. Colorization (Chroma synthesis on enhanced structure)"
        ]
    }


@app.get("/api/process-progress/{processing_id}")
def get_process_progress(processing_id: str):
    with PROCESS_PROGRESS_LOCK:
        progress = PROCESS_PROGRESS.get(processing_id)
    if progress is None:
        return {"status": "waiting", "progress": 0, "stage": "Waiting for processing to start."}
    return progress


@app.post("/api/process")
def process_image(
    file: UploadFile = File(...),
    run_restoration: bool = Form(False),
    run_colorization: bool = Form(False),
    run_enhancement: bool = Form(False),
    color_style: str = Form("natural"),  # natural, vivid, custom
    T: Optional[float] = Form(None),
    out_scale: float = Form(1.0),
    strength: float = Form(1.0),
    max_side: int = Form(1024),
    processing_id: str = Form(""),
):
    processing_id = processing_id or str(uuid4())
    set_process_progress(processing_id, 2, "Reading and resizing the uploaded photo.")
    try:
        content = file.file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty file uploaded.")
        
        rgb_u8 = read_image_from_bytes(content, max_side=max_side)
        proc_h, proc_w = rgb_u8.shape[:2]
        
        set_process_progress(processing_id, 5, f"Photo ready ({proc_w}×{proc_h}); preparing selected models.")
        models = get_loaded_models()
        
        steps_output = []
        durations = {}
        notes = []

        stage_specs = [
            ("restoration", run_restoration, "Restoration", 20),
            ("enhancement", run_enhancement, "Enhancement", 65),
            ("color", run_colorization, "Colorization", 15),
        ]
        active_stages = [
            (key, label, weight)
            for key, enabled, label, weight in stage_specs
            if enabled and models.get(key) is not None
        ]
        total_weight = sum(weight for _, _, weight in active_stages) or 1
        stage_offsets = {}
        offset = 5.0
        for key, label, weight in active_stages:
            span = 90.0 * weight / total_weight
            stage_offsets[key] = (label, offset, span)
            offset += span

        def stage_progress(key, fraction):
            label, start, span = stage_offsets[key]
            fraction = max(0.0, min(1.0, float(fraction)))
            set_process_progress(
                processing_id,
                start + span * fraction,
                f"{label}: {round(fraction * 100)}% complete.",
            )
        
        # Record initial input
        input_uri = img_to_base64_data_uri(rgb_u8)
        steps_output.append({
            "key": "input",
            "title": "Original Input",
            "image": input_uri,
            "dimensions": f"{proc_w}x{proc_h}",
            "description": "Original user uploaded picture."
        })
        
        current_float = rgb_u8.astype(np.float32) / 255.0
        current_u8 = rgb_u8.copy()
        
        # Determine Temperature T for colorization
        if color_style == "vivid":
            temp_value = 0.45
        elif color_style == "custom" and T is not None:
            temp_value = float(T)
        elif T is not None and float(T) > 0:
            temp_value = float(T)
        else:
            temp_value = 1.0  # Natural default

        # STRICT ORDER OF EXECUTION:
        # 1. Restoration
        # 2. Enhancement
        # 3. Colorization
        
        # 1. RESTORATION
        if run_restoration:
            if models.get("restoration") is not None:
                t0 = time.time()
                current_float = cc.restore_image(
                    models["restoration"],
                    current_float,
                    tile=2048,
                    pad=48,
                    progress=lambda fraction: stage_progress("restoration", fraction),
                )
                current_u8 = cc.to_u8(current_float)
                d_resto = round(time.time() - t0, 3)
                durations["restoration"] = d_resto
                steps_output.append({
                    "key": "restoration",
                    "title": "Step 1: Restoration (R-34PT)",
                    "image": img_to_base64_data_uri(current_u8),
                    "dimensions": f"{current_u8.shape[1]}x{current_u8.shape[0]}",
                    "duration": f"{d_resto}s",
                    "description": "Scratches, dust, noise, and film decay successfully healed."
                })
            else:
                notes.append("Restoration model weights not found in models/restoration_r34.pt")

        # 2. ENHANCEMENT
        if run_enhancement:
            if models.get("enhancement") is not None:
                t0 = time.time()
                # Run enhancement on float32 RGB with seamless feathering
                current_float = cc.enhance_image(
                    models["enhancement"],
                    current_float,
                    out_scale=out_scale,
                    strength=strength,
                    tile=512,
                    pad=32,
                    progress=lambda fraction: stage_progress("enhancement", fraction),
                )
                current_u8 = cc.to_u8(current_float)
                d_enh = round(time.time() - t0, 3)
                durations["enhancement"] = d_enh
                steps_output.append({
                    "key": "enhancement",
                    "title": "Step 2: Enhancement (Real-ESRGAN x4+)",
                    "image": img_to_base64_data_uri(current_u8),
                    "dimensions": f"{current_u8.shape[1]}x{current_u8.shape[0]}",
                    "duration": f"{d_enh}s",
                    "description": f"Super-resolved {out_scale}x with perceptual sharpness."
                })
            else:
                notes.append("Real-ESRGAN weights not found in models/RealESRGAN_x4plus.pth")

        # 3. COLORIZATION
        if run_colorization:
            if models.get("color") is not None:
                t0 = time.time()
                stage_progress("color", 0)
                current_u8 = cc.colorize(models["color"], current_u8, T=temp_value)
                stage_progress("color", 1)
                current_float = current_u8.astype(np.float32) / 255.0
                d_color = round(time.time() - t0, 3)
                durations["colorization"] = d_color
                steps_output.append({
                    "key": "colorization",
                    "title": "Step 3: Colorization (R-34PT)",
                    "image": img_to_base64_data_uri(current_u8),
                    "dimensions": f"{current_u8.shape[1]}x{current_u8.shape[0]}",
                    "duration": f"{d_color}s",
                    "description": f"Chroma ab channels predicted (Temperature: {temp_value})."
                })
            else:
                notes.append("Colorization model weights not found in models/colorization_r34.pt")

        set_process_progress(processing_id, 97, "Encoding the final image and pipeline steps.")
        final_uri = img_to_base64_data_uri(current_u8)
        
        executed_stages = []
        if run_restoration: executed_stages.append("Restoration")
        if run_enhancement: executed_stages.append("Enhancement")
        if run_colorization: executed_stages.append("Colorization")

        result = {
            "success": True,
            "filename": file.filename,
            "original_dimensions": {"width": proc_w, "height": proc_h},
            "processed_dimensions": {"width": current_u8.shape[1], "height": current_u8.shape[0]},
            "executed_stages": executed_stages,
            "order_applied": "1. Restoration -> 2. Enhancement -> 3. Colorization",
            "durations": durations,
            "notes": notes,
            "steps": steps_output,
            "final_image": final_uri
        }
        set_process_progress(processing_id, 100, "All requested model stages completed.", "completed")
        return result

    except HTTPException as e:
        set_process_progress(processing_id, 0, f"Processing failed: {e.detail}", "error")
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        set_process_progress(processing_id, 0, f"Processing failed: {e}", "error")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    print("Starting ChromaVision API Server on http://127.0.0.1:8000 ...")
    uvicorn.run(app, host="127.0.0.1", port=8000)
