# Arena.ai Automation Server

A Python Flask server that automates arena.ai for free LLM access.

## Setup

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install Playwright browsers
playwright install chromium

# Run server
python server.py
```

## API Endpoints

### Health Check

```
GET /health
```

### Generate Landing Page

```
POST /generate
Content-Type: application/json

{
  "prompt": "Create a shoe product landing page with dark theme",
  "image": "base64_encoded_image (optional)",
  "model": "claude-opus-4.5"
}
```

Response:

```json
{
  "success": true,
  "code": "...",
  "model": "claude-opus-4.5"
}
```

### Available Models

```
GET /models
```

## Available Models

- `claude-opus-4.5` - Best quality, slower
- `claude-sonnet-4` - Good balance
- `gpt-4o` - OpenAI model
- `gemini-2` - Google model

## Integration with AI Builder

Update your AI Builder's `ARENA_API_URL`:

```env
NEXT_PUBLIC_ARENA_API_URL=http://localhost:5000
```

## Notes

- First run may take longer (browser initialization)
- arena.ai may rate limit heavy usage
- Headless mode is default for production
