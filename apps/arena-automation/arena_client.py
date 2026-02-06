"""
Arena.ai Browser Automation Client

Uses Playwright to automate arena.ai for free LLM access.
Supports model selection, image upload, and code retrieval.
"""

import asyncio
import os
import re
from typing import Optional
from playwright.async_api import async_playwright, Browser, Page, BrowserContext


class ArenaClient:
    """Playwright-based client for arena.ai automation."""
    
    ARENA_URL = "https://arena.ai"
    
    # Top models from arena.ai Code leaderboard
    MODELS = {
        "claude-opus-4-5-thinking": "Claude Opus 4.5 Thinking",
        "gpt-5.2-high": "GPT-5.2 High",
        "claude-opus-4-5": "Claude Opus 4.5",
        "gemini-3-pro": "Gemini 3 Pro",
        "kimi-k2.5-thinking": "Kimi K2.5 Thinking",
        "gemini-3-flash": "Gemini 3 Flash",
        "glm-4.7": "GLM 4.7",
        "minimax-m2.1-preview": "MiniMax M2.1",
        "gpt-5.2": "GPT-5.2",
    }
    
    def __init__(self, headless: bool = True, model: str = "claude-opus-4-5-thinking"):
        self.headless = headless
        self.model = model
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None
        self._playwright = None
        
    async def start(self):
        """Initialize browser and navigate to arena.ai."""
        self._playwright = await async_playwright().start()
        
        self.browser = await self._playwright.chromium.launch(
            headless=self.headless,
            args=['--no-sandbox', '--disable-dev-shm-usage']
        )
        
        # Use persistent context to keep cookies/session
        user_data_dir = os.path.join(os.path.dirname(__file__), ".browser_data")
        os.makedirs(user_data_dir, exist_ok=True)
        
        self.context = await self.browser.new_context(
            viewport={"width": 1280, "height": 800},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        )
        
        self.page = await self.context.new_page()
        await self.page.goto(self.ARENA_URL)
        
        # Handle Terms of Use modal if present
        await self._accept_terms()
        
        # Switch to Direct Chat mode
        await self._switch_to_direct_chat()
        
    async def _accept_terms(self):
        """Accept Terms of Use modal if it appears."""
        try:
            agree_button = await self.page.wait_for_selector(
                "button:has-text('Agree')", 
                timeout=3000
            )
            if agree_button:
                await agree_button.click()
                await self.page.wait_for_timeout(500)
        except:
            pass  # Modal not present, continue
            
    async def _switch_to_direct_chat(self):
        """Switch from Battle mode to Direct Chat."""
        try:
            # Click the mode dropdown (Battle/Direct Chat)
            mode_button = await self.page.wait_for_selector(
                "button:has-text('Battle'), button:has-text('Direct')",
                timeout=3000
            )
            if mode_button:
                await mode_button.click()
                await self.page.wait_for_timeout(300)
                
                # Click Direct Chat option
                direct_chat = await self.page.wait_for_selector(
                    "text=Direct Chat",
                    timeout=2000
                )
                if direct_chat:
                    await direct_chat.click()
                    await self.page.wait_for_timeout(500)
        except:
            pass  # Already in correct mode
            
    async def select_model(self, model_name: str = None):
        """Select a specific model from the dropdown."""
        model = model_name or self.model
        model_display = self.MODELS.get(model, model)
        
        try:
            # Click model selector in header
            model_buttons = await self.page.query_selector_all("header button")
            for btn in model_buttons:
                text = await btn.inner_text()
                if any(m in text.lower() for m in ["claude", "gpt", "gemini", "max"]):
                    await btn.click()
                    await self.page.wait_for_timeout(500)
                    break
            
            # Click on Code tab to filter code models
            code_tab = await self.page.query_selector("button:has-text('Code')")
            if code_tab:
                await code_tab.click()
                await self.page.wait_for_timeout(300)
            
            # Select the model
            model_option = await self.page.query_selector(f"text={model_display}")
            if model_option:
                await model_option.click()
                await self.page.wait_for_timeout(300)
                
        except Exception as e:
            print(f"Model selection warning: {e}")
            
    async def upload_image(self, image_path: str):
        """Upload an image file."""
        try:
            # Find the hidden file input
            file_input = await self.page.query_selector('input[type="file"]')
            if file_input:
                await file_input.set_input_files(image_path)
                await self.page.wait_for_timeout(1000)
                
                # Handle "Start new chat session?" modal
                continue_btn = await self.page.query_selector("button:has-text('Continue')")
                if continue_btn:
                    await continue_btn.click()
                    await self.page.wait_for_timeout(500)
        except Exception as e:
            print(f"Image upload warning: {e}")
            
    async def generate(self, prompt: str, image_path: Optional[str] = None, timeout: int = 60000) -> str:
        """
        Send prompt and retrieve generated code.
        
        Args:
            prompt: The text prompt for code generation
            image_path: Optional path to reference image
            timeout: Max wait time for generation (ms)
            
        Returns:
            Generated code as string
        """
        # Upload image first if provided
        if image_path and os.path.exists(image_path):
            await self.upload_image(image_path)
            
        # Find and fill the textarea
        textarea = await self.page.wait_for_selector(
            'textarea[placeholder*="Ask"]',
            timeout=5000
        )
        
        # Add landing page specific instructions
        full_prompt = f"""Create a professional landing page with the following requirement:

{prompt}

IMPORTANT: 
- Use Tailwind CSS for styling
- Make it fully responsive (mobile-first)
- Include a hero section, features, and a contact/order form
- Use modern design with gradients and shadows
- Output ONLY the React component code, no explanations
"""
        
        await textarea.fill(full_prompt)
        await self.page.keyboard.press("Enter")
        
        # Wait for generation to start and complete
        await self.page.wait_for_timeout(2000)
        
        # Wait for the agent to finish (look for idle state)
        try:
            await self.page.wait_for_function(
                """() => {
                    const building = document.querySelector('[class*="Building"]');
                    const thinking = document.body.innerText.includes('Thinking');
                    return !building && !thinking;
                }""",
                timeout=timeout
            )
        except:
            pass  # Timeout, try to get whatever code is available
            
        await self.page.wait_for_timeout(2000)
        
        # Extract code from the code editor
        code = await self._extract_code()
        
        return code
    
    async def _extract_code(self) -> str:
        """Extract generated code from the Code tab."""
        try:
            # Click on Code tab
            code_tab = await self.page.query_selector('[aria-label="Code"], button:has-text("Code")')
            if code_tab:
                await code_tab.click()
                await self.page.wait_for_timeout(500)
            
            # Look for CodeMirror editor content
            code_element = await self.page.query_selector('.cm-content')
            if code_element:
                code = await code_element.inner_text()
                return code
                
            # Fallback: look for any code blocks
            code_blocks = await self.page.query_selector_all('pre code, .code-block')
            if code_blocks:
                all_code = []
                for block in code_blocks:
                    text = await block.inner_text()
                    all_code.append(text)
                return "\n\n".join(all_code)
                
            # Last resort: get from download
            return await self._download_code()
            
        except Exception as e:
            print(f"Code extraction error: {e}")
            return ""
            
    async def _download_code(self) -> str:
        """Download code as ZIP and extract."""
        # This is a fallback - implement if needed
        return ""
        
    async def close(self):
        """Clean up browser resources."""
        if self.page:
            await self.page.close()
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
        if self._playwright:
            await self._playwright.stop()


async def generate_landing_page(
    prompt: str, 
    image_path: Optional[str] = None,
    model: str = "claude-opus-4.5",
    headless: bool = True
) -> str:
    """
    High-level function to generate a landing page.
    
    Args:
        prompt: Description of the landing page
        image_path: Optional reference image
        model: Model to use
        headless: Run browser in headless mode
        
    Returns:
        Generated React/HTML code
    """
    client = ArenaClient(headless=headless, model=model)
    
    try:
        await client.start()
        await client.select_model()
        code = await client.generate(prompt, image_path)
        return code
    finally:
        await client.close()


# CLI usage
if __name__ == "__main__":
    import sys
    
    prompt = sys.argv[1] if len(sys.argv) > 1 else "Create a product landing page for shoes"
    
    code = asyncio.run(generate_landing_page(prompt, headless=False))
    print("Generated Code:")
    print("-" * 50)
    print(code)
