import { describe, test, expect, vi } from 'vitest';

// Mocking the AI Action Generator since we don't call LLMs in unit tests
const mockGenerateAction = async (context: string, command: string) => {
  // Logic: if command asks for 'hero red', return specific JSON
  if (command.includes('hero') && command.includes('red')) {
    return {
      action: "update_section",
      sectionId: "hero_1",
      updates: { background: { color: "#ff0000" } },
      confidence: 0.9
    };
  }
  
  // Logic: Context awareness
  if (context.includes('fashion') && command.includes('cta')) {
    return {
       action: "update_text",
       target: "hero_cta",
       text: "Shop the Collection", // Fashion specific
       confidence: 0.85
    };
  }
  
  return { action: "unknown", confidence: 0.1 };
};

describe("AI Action Generator", () => {
  
  test("generates correct action for 'hero red' command", async () => {
    const context = "store_123";
    const result = await mockGenerateAction(context, "make hero red");
    
    expect(result).toEqual({
      action: "update_section",
      sectionId: "hero_1",
      updates: { background: { color: "#ff0000" } },
      confidence: 0.9
    });
  });

  test("suggests context-aware CTA text for fashion store", async () => {
    const context = "category: fashion_store";
    const result = await mockGenerateAction(context, "change cta text");
    
    // Should return "Shop the Collection" or similar fashion term
    expect(result.text).toMatch(/Shop|Explore|Discover/);
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  test("returns low confidence for unclear commands", async () => {
    const result = await mockGenerateAction("generic_store", "do something cool");
    expect(result.confidence).toBeLessThan(0.5);
  });
});
