/**
 * Test script for Retell AI integration
 * Run with: node test-retell.js
 */

require('dotenv').config();

const RETELL_API_KEY = process.env.RETELL_API_KEY;
const BASE_URL = 'https://api.retellai.com';

async function testRetellConnection() {
  console.log('🧪 Testing Retell AI Connection...\n');
  
  if (!RETELL_API_KEY) {
    console.error('❌ RETELL_API_KEY not found in .env file');
    process.exit(1);
  }
  
  console.log('✅ API Key found:', RETELL_API_KEY.substring(0, 10) + '...');
  
  try {
    // Test 1: Create a Retell LLM
    console.log('\n🧠 Test 1: Creating Retell LLM...');
    const llmResponse = await fetch(`${BASE_URL}/create-retell-llm`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        model_temperature: 0.7,
        start_speaker: 'agent',
        begin_message: 'Hello! This is a test call from Mirai. How are you today?',
        general_prompt: 'You are a friendly sales representative. Keep responses under 40 words. Be professional and helpful.',
        general_tools: [
          {
            type: 'end_call',
            name: 'end_call',
            description: 'End the call when the conversation is complete.',
          },
        ],
      }),
    });
    
    if (!llmResponse.ok) {
      const error = await llmResponse.text();
      console.error('❌ LLM Creation Error:', error);
      throw new Error(`LLM creation failed: ${error}`);
    }
    
    const llm = await llmResponse.json();
    console.log('✅ LLM created successfully!');
    console.log('🆔 LLM ID:', llm.llm_id);
    
    // Test 2: Create an agent with the LLM
    console.log('\n🤖 Test 2: Creating agent with LLM...');
    const agentResponse = await fetch(`${BASE_URL}/agent`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_name: 'Test Agent - Mirai',
        voice_id: '11labs-Rachel',
        response_engine: {
          type: 'retell-llm',
          llm_id: llm.llm_id,
        },
        language: 'en-US',
        responsiveness: 1,
        interruption_sensitivity: 0.8,
        enable_backchannel: true,
        backchannel_frequency: 0.8,
      }),
    });
    
    if (!agentResponse.ok) {
      const error = await agentResponse.text();
      console.error('❌ Agent Creation Error:', error);
      throw new Error(`Agent creation failed: ${error}`);
    }
    
    const agent = await agentResponse.json();
    console.log('✅ Agent created successfully!');
    console.log('🆔 Agent ID:', agent.agent_id);
    console.log('📝 Agent Name:', agent.agent_name);
    
    console.log('\n🎉 All tests passed! Retell AI is ready to use.');
    console.log('\n📋 Summary:');
    console.log('   - API Key: Valid ✅');
    console.log('   - Connection: Working ✅');
    console.log('   - Agent Creation: Working ✅');
    console.log('\n💡 You can now make real AI phone calls through the Mirai setup flow!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('   1. Check if your API key is correct');
    console.error('   2. Verify you have internet connection');
    console.error('   3. Check Retell AI dashboard: https://app.retellai.com');
    process.exit(1);
  }
}

testRetellConnection();
