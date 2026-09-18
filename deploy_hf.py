"""Sync backend/ to the Hugging Face Space (code only, never secrets).

Used by .github/workflows/hf-sync.yml and for manual deploys:
    HF_TOKEN=<token> SPACE_ID=Nishant51/kargosetu-api python deploy_hf.py

- Never creates the Space (create it once via huggingface.co/new-space,
  SDK Gradio, hardware CPU Basic free) — fails loudly if missing.
- Never touches Space secrets. Manage them in Space Settings.
- Never uploads the local README (wrong SDK), .venv, node_modules,
  or any .env files.
"""

import os
import sys

from huggingface_hub import HfApi


def deploy() -> None:
    token = os.environ.get("HF_TOKEN", "")
    if not token:
        print("HF_TOKEN env var is required.", file=sys.stderr)
        raise SystemExit(1)
    space_id = os.environ.get("SPACE_ID", "Nishant51/kargosetu-api")

    api = HfApi(token=token)
    try:
        info = api.space_info(space_id)
    except Exception as exc:
        print(f"Space {space_id} not found: {exc}", file=sys.stderr)
        print("Create it first: huggingface.co/new-space, SDK Gradio, "
              "hardware CPU Basic.", file=sys.stderr)
        raise SystemExit(1) from exc
    print(f"Target: {space_id} (sdk={info.sdk})")

    api.upload_folder(
        folder_path="backend",
        repo_id=space_id,
        repo_type="space",
        ignore_patterns=[
            "README.md",  # local copy declares the wrong SDK; keep Space README
            ".venv/**", "node_modules/**", "__pycache__/**",
            ".pytest_cache/**", ".ruff_cache/**", "*.pyc",
            ".env", ".env_bak", ".env.test",
        ],
        commit_message="Sync backend from GitHub",
    )
    print(f"Deployed. Building at: https://huggingface.co/spaces/{space_id}")


if __name__ == "__main__":
    deploy()
