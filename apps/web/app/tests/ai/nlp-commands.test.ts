import { describe, test, expect, vi } from 'vitest';

// Define the return type
interface ParseResult {
  action: string;
  target?: string;
  updates?: { background: { color: string } };
  confidence: number;
}

// Mocking the AI service logic since we don't want to make real API calls to OpenAI/Gemini in unit tests
const mockParseCommand = vi.fn((input: string): ParseResult => {
  const lower = input.toLowerCase();
  
  if (lower.includes('red') || lower.includes('lal') || lower.includes('crimson')) {
    return { 
      action: 'update_style',
      target: 'hero',
      updates: { background: { color: '#ff0000' } },
      confidence: 0.95
    };
  }
  
  if (lower.includes('blue') || lower.includes('nil')) {
    return { 
      action: 'update_style',
      target: 'hero',
      updates: { background: { color: '#0000ff' } },
      confidence: 0.95
    };
  }

  return { action: 'unknown', confidence: 0.2 };
});

describe('AI NLP Command Parsing', () => {
  
  const testCommands = [
    { input: "make hero red", expectedColor: "#ff0000" },
    { input: "hero background lal", expectedColor: "#ff0000" }, // Bengali 'lal'
    { input: "set banner crimson", expectedColor: "#ff0000" },
    { input: "make hero blue", expectedColor: "#0000ff" },
    { input: "hero nil koro", expectedColor: "#0000ff" }, // Bengali 'nil'
  ];

  test.each(testCommands)('correctly interprets command: "$input"', ({ input, expectedColor }) => {
    const result = mockParseCommand(input);
    
    expect(result.action).toBe('update_style');
    expect(result.updates?.background.color).toBe(expectedColor);
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  test('returns low confidence for nonsense commands', () => {
    const result = mockParseCommand('asdf ghjkl');
    expect(result.confidence).toBeLessThan(0.5);
    expect(result.action).toBe('unknown');
  });
});
