
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const prompt = `
You are a payment intent parser. Extract payment details into a JSON object.
Text: "Send 5 cUSD to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
JSON format: { action: string, amount: number, currency: string, recipient: string, confidence: number }
`;

async function testHaikuParsing() {
  console.log('Testing Haiku Parsing...');
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    });
    console.log('Haiku Response:', response.content[0]);
  } catch (error) {
    console.log('Haiku Parsing Error:', error.message);
  }
}

testHaikuParsing();
