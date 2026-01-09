
import { createAIService } from './app/services/ai.server';
import fs from 'fs';

// Load .dev.vars manually
const devVars = fs.readFileSync('.dev.vars', 'utf8');
const apiKeyMatch = devVars.match(/OPENROUTER_API_KEY=(.*)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim().replace(/^["']|["']$/g, '') : '';

// Xiaomi Mimo Config
const MIMO_CONFIG = {
  baseUrl: 'https://api.xiaomimimo.com/v1',
  model: 'mimo-v2-flash'
};

async function testXiaomiMimo() {
  if (!apiKey || apiKey.includes('your-')) {
    console.error('❌ No valid API key found in .dev.vars. Please add your Xiaomi Mimo API key to OPENROUTER_API_KEY line for this test.');
    return;
  }

  console.log('--- TESTING XIAOMI MIMO PROVIDER ---');
  console.log('Base URL:', MIMO_CONFIG.baseUrl);
  console.log('Model:', MIMO_CONFIG.model);

  const ai = createAIService(apiKey, {
    baseUrl: MIMO_CONFIG.baseUrl,
    model: MIMO_CONFIG.model
  });

  try {
    console.log('Step: Calling generateStoreSetup...');
    const result = await ai.generateStoreSetup('Handmade leather bags in Dhaka');
    console.log('✅ Success! Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Error Message:', error.message);
    }
  }
}

testXiaomiMimo();
