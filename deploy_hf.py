import os
from huggingface_hub import HfApi, create_repo

def deploy():
    token = "YOUR_HF_TOKEN_HERE"

    api = HfApi(token=token)
    
    # Get current user
    username = api.whoami()["name"]
    repo_id = f"{username}/kargosetu-api"
    
    print(f"Creating Hugging Face Space: {repo_id}...")
    
    # Create the Space (Docker template, standard 16GB free tier)
    try:
        api.create_repo(
            repo_id=repo_id, 
            repo_type="space", 
            space_sdk="gradio",
            private=False,
            exist_ok=True
        )
        print("Space created or already exists.")
    except Exception as e:
        print(f"Failed to create space: {e}")
        return

    print("Configuring Environment Secrets...")
    # Add secrets
    secrets = {
        "DATABASE_URL": "postgresql://user:password@host:port/db",
        "FRONTEND_URL": "https://kargosetu-web.vercel.app", # Placeholder/Actual if they gave it
        "JWT_SECRET_KEY": "kargosetu_secure_production_key_2026",
        "GOOGLE_CLIENT_ID": "YOUR_GOOGLE_CLIENT_ID_HERE"
    }
    
    for key, value in secrets.items():
        try:
            api.add_space_secret(repo_id=repo_id, key=key, value=value)
        except Exception as e:
            print(f"Could not set secret {key}: {e}")

    print("Uploading backend codebase to the Space...")
    # Upload the entire backend folder to the root of the Space
    api.upload_folder(
        folder_path="backend",
        repo_id=repo_id,
        repo_type="space",
        commit_message="Deploy backend via automation"
    )
    
    print(f"\n✅ Deployment Complete!")
    print(f"Your API is now building at: https://huggingface.co/spaces/{repo_id}")

if __name__ == "__main__":
    deploy()
