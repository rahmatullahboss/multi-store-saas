"""
Arena.ai Automation API Server

Flask server that exposes arena.ai automation as an HTTP API.
"""

import os
import asyncio
import tempfile
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from arena_client import generate_landing_page

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["*"])  # Allow all origins for development

# Top models from arena.ai Code leaderboard
ALLOWED_MODELS = [
    "claude-opus-4-6-thinking",
    "claude-opus-4-6",
    "claude-opus-4-5-thinking",
    "gpt-5.2-high",
    "claude-opus-4-5",
    "gemini-3-pro",
    "kimi-k2.5-thinking",
    "gemini-3-flash",
    "glm-4.7",
    "minimax-m2.1-preview",
    "gpt-5.2",
]

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok", "service": "arena-automation"})


@app.route("/models", methods=["GET"])
def list_models():
    """List available models."""
    return jsonify({"models": ALLOWED_MODELS})


@app.route("/generate", methods=["POST"])
def generate():
    """
    Generate landing page code using arena.ai
    
    Request body:
    {
        "prompt": "Create a shoe landing page",
        "image": "base64_encoded_image (optional)",
        "model": "claude-opus-4.5 (optional)"
    }
    
    Response:
    {
        "success": true,
        "code": "generated code...",
        "model": "claude-opus-4.5"
    }
    """
    try:
        data = request.get_json()
        
        if not data or "prompt" not in data:
            return jsonify({
                "success": False, 
                "error": "prompt is required"
            }), 400
            
        prompt = data["prompt"]
        model = data.get("model", "claude-opus-4.5")
        image_base64 = data.get("image")
        
        # Validate model
        if model not in ALLOWED_MODELS:
            model = "claude-opus-4.5"
            
        # Handle image if provided
        image_path = None
        if image_base64:
            try:
                # Remove data URL prefix if present
                if "," in image_base64:
                    image_base64 = image_base64.split(",")[1]
                    
                image_data = base64.b64decode(image_base64)
                
                # Save to temp file
                with tempfile.NamedTemporaryFile(
                    delete=False, 
                    suffix=".png"
                ) as f:
                    f.write(image_data)
                    image_path = f.name
            except Exception as e:
                print(f"Image processing error: {e}")
                
        # Run async generation in sync context
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            code = loop.run_until_complete(
                generate_landing_page(
                    prompt=prompt,
                    image_path=image_path,
                    model=model,
                    headless=True
                )
            )
        finally:
            loop.close()
            
            # Cleanup temp file
            if image_path and os.path.exists(image_path):
                os.unlink(image_path)
                
        if not code:
            return jsonify({
                "success": False,
                "error": "Failed to generate code - empty response"
            }), 500
            
        return jsonify({
            "success": True,
            "code": code,
            "model": model
        })
        
    except Exception as e:
        print(f"Generation error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    
    print(f"Starting Arena Automation Server on port {port}")
    print(f"Available models: {ALLOWED_MODELS}")
    
    app.run(host="0.0.0.0", port=port, debug=debug)
