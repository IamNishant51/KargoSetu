import gradio as gr
from app.main import app as fastapi_app

# Create a minimal Gradio interface to satisfy Hugging Face's SDK requirements
def health_check():
    return "KargoSetu API is Live & Running on Hugging Face (Gradio SDK Loophole)"

demo = gr.Interface(fn=health_check, inputs=None, outputs="text", title="KargoSetu API Status")

# Mount the FastAPI app onto the Gradio app
# The FastAPI routes (like /api/v1/...) remain untouched and fully accessible
app = gr.mount_gradio_app(fastapi_app, demo, path="/ui")
