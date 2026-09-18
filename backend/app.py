import os
import subprocess
import sys

# Perform Prisma setup at runtime for Hugging Face Gradio SDK
try:
    print("Generating Prisma Client...")
    subprocess.run([sys.executable, "-m", "prisma", "generate"], check=True)

    print("Pushing DB Schema...")
    subprocess.run(
        [sys.executable, "-m", "prisma", "db", "push", "--accept-data-loss"],
        check=True,
    )
except Exception as e:
    print(f"Prisma initialization failed: {e}")

import gradio as gr
from app.main import app as fastapi_app


def health_check():
    return "KargoSetu API is Live and Running on Hugging Face (Gradio SDK Loophole)"


demo = gr.Interface(
    fn=health_check, inputs=None, outputs="text", title="KargoSetu API Status"
)

app = gr.mount_gradio_app(fastapi_app, demo, path="/ui")
