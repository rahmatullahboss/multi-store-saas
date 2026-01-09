
/**
 * Test Xiaomi Mimo using raw fetch (bypass SDK version issues)
 */

const MIMO_CONFIG = {
  baseUrl: 'https://api.xiaomimimo.com/v1',
  model: 'mimo-v2-flash',
  apiKey: 'sk-skia6s7nirhj9r58im6iz2s9xq6tl59q2738l44bxnwydj14'
};

async function testXiaomiMimoRaw() {
  console.log('--- TESTING XIAOMI MIMO (RAW FETCH) ---');
  console.log('Endpoint:', `${MIMO_CONFIG.baseUrl}/chat/completions`);
  console.log('Model:', MIMO_CONFIG.model);
  
  const systemPrompt = `You are an expert e-commerce consultant. Given a business description, generate:
1. A catchy, professional store name
2. SEO keywords (5-8 keywords)
3. A sample product with title, description, and suggested price in BDT

Your response MUST be valid JSON in this exact format:
{
  "storeName": "Store Name Here",
  "seoKeywords": ["keyword1", "keyword2"],
  "product": {
    "title": "Product Title",
    "description": "Compelling product description",
    "suggestedPrice": 1500
  }
}`;

  const userPrompt = `Business description: Handmade leather bags in Dhaka

Generate store setup JSON:`;

  try {
    const response = await fetch(`${MIMO_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MIMO_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: MIMO_CONFIG.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ API Response received!');
    console.log('Model:', data.model);
    console.log('Usage:', data.usage);
    
    const content = data.choices[0].message.content;
    console.log('\n--- AI Generated Content ---');
    console.log(content);
    
    // Parse and validate
    const parsed = JSON.parse(content);
    console.log('\n--- Parsed JSON ---');
    console.log('Store Name:', parsed.storeName);
    console.log('Keywords:', parsed.seoKeywords);
    console.log('Product:', parsed.product.title);
    console.log('Price:', parsed.product.suggestedPrice, 'BDT');
    
    console.log('\n🎉 SUCCESS! Xiaomi Mimo integration works!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testXiaomiMimoRaw();
