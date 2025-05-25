# fastapi_app.py
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
import uuid
import os
import json
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model (once)
model = WhisperModel("tiny", device="cpu")  # or device="cpu"
# model = WhisperModel("tiny", device="cuda", compute_type="float16")

@app.post("/transcribe-stream")
async def transcribe_stream(file: UploadFile = File(...)):
    temp_filename = f"temp_{uuid.uuid4().hex}_{file.filename}"
    with open(temp_filename, "wb") as f:
        f.write(await file.read())

    def generate():
        try:
            segments, info = model.transcribe(temp_filename, beam_size=5, language="en")
            for segment in segments:
                line = {
                    "text": segment.text,
                    "start": segment.start,
                    "end": segment.end
                }
                yield f"data: {json.dumps(line)}\n\n"
                time.sleep(0.1)  # Optional: mimic natural speed
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        finally:
            os.remove(temp_filename)

    return StreamingResponse(generate(), media_type="text/event-stream")
