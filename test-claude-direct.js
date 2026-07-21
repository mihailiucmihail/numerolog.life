const { generateText } = require('ai');

async function test() {
  try {
    console.log('[v0] Testing Claude directly...');
    console.log('[v0] AI_GATEWAY_API_KEY exists:', !!process.env.AI_GATEWAY_API_KEY);
    console.log('[v0] AI_GATEWAY_API_KEY length:', process.env.AI_GATEWAY_API_KEY?.length);
    
    const response = await generateText({
      model: 'claude-3-5-sonnet',
      prompt: 'Salut! Spune-mi o scurtă interpretare numerologică pentru numărul 3.',
    });

    console.log('[v0] Response received!');
    console.log('[v0] Text:', response.text.substring(0, 200));
  } catch (error) {
    console.error('[v0] Error:', error.message);
    console.error('[v0] Full error:', error);
  }
}

test();
