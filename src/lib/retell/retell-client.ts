/**
 * Retell AI Client for Conversational Phone Calls
 * https://www.retellai.com
 */

import Retell from 'retell-sdk';

interface RetellLLM {
  llm_id: string;
  version: number;
  is_published: boolean;
  model: string;
}

interface RetellAgent {
  agent_id: string;
  agent_name: string;
  voice_id: string;
  language: string;
}

interface RetellCall {
  call_id: string;
  agent_id: string;
  phone_number: string;
  status: string;
}

export class RetellClient {
  private client: Retell;

  constructor(apiKey: string) {
    this.client = new Retell({
      apiKey,
    });
  }

  /**
   * Create a Retell LLM with custom instructions
   */
  async createLLM(params: {
    instructions: string;
    beginMessage?: string;
  }): Promise<RetellLLM> {
    const llm = await this.client.llm.create({
      model: 'gpt-4o-mini',
      model_temperature: 0.7,
      start_speaker: 'agent',
      begin_message: params.beginMessage || 'Hello! This is a call from our sales team. How are you today?',
      general_prompt: params.instructions,
      general_tools: [
        {
          type: 'end_call',
          name: 'end_call',
          description: 'End the call when the conversation is complete or if the prospect is not interested.',
        },
      ],
    });

    return llm as RetellLLM;
  }

  /**
   * Create an AI agent with custom instructions
   */
  async createAgent(params: {
    name: string;
    llmId: string;
    voiceId?: string;
  }): Promise<RetellAgent> {
    try {
      const agent = await this.client.agent.create({
        agent_name: params.name,
        voice_id: params.voiceId || '21m00Tcm4TlvDq8ikWAM', // Rachel - ElevenLabs
        response_engine: {
          type: 'retell-llm',
          llm_id: params.llmId,
        },
        language: 'en-US',
        responsiveness: 1,
        interruption_sensitivity: 0.8,
        enable_backchannel: true,
        backchannel_frequency: 0.8,
      });

      return agent as RetellAgent;
    } catch (error: any) {
      // If agent creation fails, it might be due to missing phone number
      // Return a mock agent with the LLM ID so we can still track it
      console.error('Agent creation failed:', error.message);
      throw new Error(`Agent creation failed: ${error.message}. You may need to purchase a phone number in the Retell dashboard first.`);
    }
  }

  /**
   * Create LLM and Agent in one step
   */
  async createAgentWithLLM(params: {
    name: string;
    instructions: string;
    beginMessage?: string;
    voiceId?: string;
  }): Promise<{ llm: RetellLLM; agent: RetellAgent }> {
    // Step 1: Create LLM
    const llm = await this.createLLM({
      instructions: params.instructions,
      beginMessage: params.beginMessage,
    });

    // Step 2: Create Agent with LLM
    const agent = await this.createAgent({
      name: params.name,
      llmId: llm.llm_id,
      voiceId: params.voiceId,
    });

    return { llm, agent };
  }

  /**
   * Make an outbound call
   */
  async makeCall(params: {
    agentId: string;
    toNumber: string;
    fromNumber: string;
    dynamicVariables?: Record<string, any>;
  }): Promise<RetellCall> {
    const call = await this.client.call.createPhoneCall({
      override_agent_id: params.agentId,
      to_number: params.toNumber,
      from_number: params.fromNumber,
      retell_llm_dynamic_variables: params.dynamicVariables || {},
    });

    return call as RetellCall;
  }

  /**
   * Get call details and transcript
   */
  async getCall(callId: string): Promise<any> {
    const call = await this.client.call.retrieve(callId);
    return call;
  }

  /**
   * List all calls
   */
  async listCalls(): Promise<any[]> {
    const calls = await this.client.call.list();
    return calls || [];
  }
}

/**
 * Generate agent instructions from company profile
 */
export function generateAgentInstructions(company: {
  name: string;
  description: string;
  targetMarket: string;
}): string {
  return `You are Sarah, a professional sales representative calling on behalf of ${company.name}.

COMPANY INFORMATION:
${company.description}

TARGET MARKET:
${company.targetMarket}

YOUR ROLE:
You are making an outbound prospecting call to qualify leads and book product demos.

CONVERSATION STRUCTURE:
1. Opening: Greet warmly, introduce yourself and ${company.name}
2. Value Proposition: Briefly explain what ${company.name} does and the key benefit
3. Discovery: Ask 1-2 qualifying questions about their current situation
4. Pitch: If they show interest, explain how you can help
5. Close: If interested, offer to schedule a 15-minute demo
6. Handle Objections: Be empathetic and helpful

TONE:
- Professional but friendly
- Conversational, not scripted
- Respectful of their time
- Enthusiastic about the product
- Listen actively and adapt

RULES:
- Keep responses under 40 words
- Don't be pushy
- If not interested, thank them politely and end the call
- If interested, get specific meeting time
- Be natural and human-like

GOAL:
Book a 15-minute product demo meeting.`;
}

/**
 * Initialize Retell client
 */
export function getRetellClient(): RetellClient | null {
  const apiKey = process.env.RETELL_API_KEY;
  
  if (!apiKey) {
    console.warn('RETELL_API_KEY not set');
    return null;
  }

  return new RetellClient(apiKey);
}
