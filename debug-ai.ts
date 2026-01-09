
import { createAIService } from './app/services/ai.server';
import dotenv from 'dotenv';
import fs from 'fs';

// Load .dev.vars manually since it's not standard .env
const devVars = fs.readFileSync('.dev.vars', 'utf8');
const apiKeyMatch = devVars.match(/OPENROUTER_API_KEY=(.*)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim().replace(/^["']|["']$/g, '') : '';

console.log('Using API Key starts with:', apiKey.substring(0, 8));

async function test() {
  if (!apiKey) {
    console.error('No API key found in .dev.vars');
    return;
  }

  const ai = createAIService(apiKey);
  try {
    console.log('Calling generateStoreSetup...');
    const result = await ai.generateStoreSetup('Handmade leather bags in Dhaka');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();
