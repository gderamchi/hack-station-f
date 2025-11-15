import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/prisma';
import { openai } from '@/lib/ai/openai-client';
import { findLeadsWithAI } from '@/lib/ai/lead-finder';
import { getRetellClient, generateAgentInstructions } from '@/lib/retell/retell-client';
import twilio from 'twilio';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      companyName,
      industry,
      description,
      targetMarket,
      testName,
      testPhone,
      testCompany,
      testRole,
      callNow,
    } = body;

    // Step 1: Create company
    const company = await prisma.company.create({
      data: {
        userId: session.user.id,
        name: companyName,
        industry,
        description,
        targetIndustries: [targetMarket],
        knowledgeSource: description,
        knowledgeType: 'text',
        onboardingCompleted: true,
      },
    });

    // Step 2: Generate AI script using Blackbox AI
    const scriptPrompt = `You are an expert sales script writer. Generate a persuasive telephone prospecting script for outbound calls.

Company: ${companyName}
Industry: ${industry}
Product/Service: ${description}
Target Market: ${targetMarket}

Create a natural, conversational script that:
1. Opens with a friendly greeting
2. Quickly establishes value
3. Asks qualifying questions
4. Handles objections
5. Closes with a meeting request

Keep it under 90 seconds when spoken. Make it sound natural and human, not robotic.

Script:`;

    const completion = await openai.chat.completions.create({
      model: 'blackboxai/openai/gpt-4o-mini', // Blackbox AI model path
      messages: [
        { role: 'system', content: 'You are an expert sales script writer.' },
        { role: 'user', content: scriptPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const scriptContent = completion.choices[0]?.message?.content || 'Default script';

    // Step 3: Create script
    const script = await prisma.script.create({
      data: {
        userId: session.user.id,
        companyName,
        industry,
        description,
        targetMarket,
        knowledgeSource: description,
        content: scriptContent,
        status: 'approved', // Auto-approve for simplified flow
      },
    });

    // Step 4: Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        userId: session.user.id,
        name: `${companyName} - Demo Campaign`,
        scriptId: script.id,
        voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel - female voice
        dailyLimit: 100,
        timeWindows: [{ start: '09:00', end: '18:00' }],
        activeDays: [1, 2, 3, 4, 5], // Monday to Friday
        maxAttempts: 3,
        status: 'active',
        launchedAt: new Date(),
      },
    });

    // Step 5: Find leads with AI (Perplexity)
    let prospects = [];
    
    // Always add test lead first for demo
    const testProspect = await prisma.prospect.create({
      data: {
        campaignId: campaign.id,
        firstName: testName.split(' ')[0] || testName,
        lastName: testName.split(' ')[1] || '',
        phone: testPhone,
        company: testCompany,
        title: testRole,
        status: 'pending',
      },
    });
    
    prospects.push(testProspect);

    // Find additional leads with AI (async, don't wait)
    // Uses Blackbox API with Perplexity models for online search
    if (process.env.BLACKBOX_API_KEY) {
      // Run in background - don't block the response
      findAndAddLeads(campaign.id, {
        companyName,
        industry,
        targetMarket,
        description,
        count: 5, // Find 5 additional leads
      }).catch(err => console.error('Background lead finding error:', err));
    }

    // Step 6: Initiate call if requested
    let callSessionId = null;
    
    if (callNow) {
      // Create call session
      const callSession = await prisma.call.create({
        data: {
          campaignId: campaign.id,
          prospectId: testProspect.id,
          fromNumber: process.env.TWILIO_PHONE_NUMBER!,
          toNumber: testPhone,
          status: 'queued',
        },
      });

      callSessionId = callSession.id;

      // Try Retell AI first, fallback to Twilio if it fails
      const retellClient = getRetellClient();
      let callSuccess = false;

      if (retellClient) {
        try {
          console.log('🤖 Initiating Retell AI call...');
          
          // Generate agent instructions from company profile
          const agentInstructions = generateAgentInstructions({
            name: companyName,
            description: description,
            targetMarket: targetMarket,
          });

          // Create Retell AI LLM and Agent
          const { llm, agent } = await retellClient.createAgentWithLLM({
            name: `${companyName} Sales Agent`,
            instructions: agentInstructions,
            beginMessage: `Hello! This is a call from ${companyName}. How are you today?`,
            voiceId: '11labs-Rachel', // Use ElevenLabs Rachel voice
          });

          console.log('✅ Retell AI LLM created:', llm.llm_id);
          console.log('✅ Retell AI agent created:', agent.agent_id);

          // Make the call with Retell AI
          const retellCall = await retellClient.makeCall({
            agentId: agent.agent_id,
            toNumber: testPhone,
            fromNumber: process.env.TWILIO_PHONE_NUMBER!,
          });

          console.log('✅ Retell AI call initiated:', retellCall.call_id);

          // Update call session with Retell info
          await prisma.call.update({
            where: { id: callSession.id },
            data: { 
              retellCallId: retellCall.call_id,
              retellAgentId: agent.agent_id,
              status: 'initiated',
              metadata: {
                provider: 'retell',
                agentName: `${companyName} Sales Agent`,
              },
            },
          });

          // Update prospect status
          await prisma.prospect.update({
            where: { id: testProspect.id },
            data: { status: 'contacted' },
          });

          callSuccess = true;
          console.log('🎉 Retell AI call successfully initiated!');

        } catch (retellError: any) {
          console.error('❌ Retell AI error:', retellError);
          console.log('⚠️  Falling back to Twilio...');
          
          // Update metadata to show Retell failed
          await prisma.call.update({
            where: { id: callSession.id },
            data: { 
              metadata: {
                retellAttempted: true,
                retellError: retellError.message,
                fallbackToTwilio: true,
              },
            },
          });
        }
      } else {
        console.log('⚠️  Retell AI not configured, using Twilio...');
      }

      // Fallback to Twilio if Retell failed or not configured
      if (!callSuccess) {
        try {
          // Check if we're in development with localhost URL
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
          const isLocalhost = appUrl.includes('localhost') || appUrl.includes('127.0.0.1');
          
          if (isLocalhost) {
            console.warn('⚠️  Cannot make Twilio call in development with localhost URL');
            console.warn('   To test calls, use ngrok or deploy to production');
            console.warn('   Marking call as "simulated" for development');
            
            // Update call session to simulated status
            await prisma.call.update({
              where: { id: callSession.id },
              data: { 
                status: 'completed',
                duration: 0,
                metadata: {
                  simulated: true,
                  reason: 'Localhost URL cannot be used with Twilio. Use ngrok or production URL for real calls.',
                },
              },
            });
            
            // Update prospect status
            await prisma.prospect.update({
              where: { id: testProspect.id },
              data: { status: 'contacted' },
            });
            
          } else {
            // Production mode - make real call
            const call = await twilioClient.calls.create({
              to: testPhone,
              from: process.env.TWILIO_PHONE_NUMBER!,
              url: `${appUrl}/api/twilio/voice?callSessionId=${callSession.id}`,
              statusCallback: `${appUrl}/api/twilio/status`,
              statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
              statusCallbackMethod: 'POST',
              record: true,
            });

            // Update call session with Twilio SID
            await prisma.call.update({
              where: { id: callSession.id },
              data: { 
                twilioCallSid: call.sid,
                status: 'initiated',
              },
            });

            // Update prospect status
            await prisma.prospect.update({
              where: { id: testProspect.id },
              data: { status: 'contacted' },
            });
          }

        } catch (twilioError: any) {
          console.error('Twilio error:', twilioError);
          
          // Update call session with error
          await prisma.call.update({
            where: { id: callSession.id },
            data: { 
              status: 'failed',
              errorMessage: twilioError.message || 'Unknown error',
              metadata: {
                error: twilioError.message,
                errorCode: twilioError.code,
              },
            },
          });
          
          // Don't fail the whole setup if call fails
          console.log('Call failed but continuing with setup...');
        }
      }
    }

    return NextResponse.json({
      success: true,
      companyId: company.id,
      campaignId: campaign.id,
      scriptId: script.id,
      prospectId: testProspect.id,
      callSessionId,
      message: 'Setup complete! Your AI agent is ready. Finding additional leads in the background...',
    });

  } catch (error: any) {
    console.error('Setup error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      name: error.name,
    });
    
    return NextResponse.json(
      { 
        error: 'Setup failed', 
        details: error.message,
        code: error.code,
        type: error.name,
      },
      { status: 500 }
    );
  }
}

/**
 * Background function to find and add leads using AI
 */
async function findAndAddLeads(
  campaignId: string,
  params: {
    companyName: string;
    industry: string;
    targetMarket: string;
    description: string;
    count: number;
  }
) {
  try {
    console.log('Finding leads with AI for campaign:', campaignId);
    
    const leads = await findLeadsWithAI(params);
    
    console.log(`Found ${leads.length} leads with AI`);

    // Add leads to database
    for (const lead of leads) {
      try {
        await prisma.prospect.create({
          data: {
            campaignId,
            firstName: lead.firstName,
            lastName: lead.lastName,
            phone: lead.phone,
            company: lead.company,
            title: lead.title,
            email: lead.email,
            status: 'pending',
            metadata: {
              source: lead.source,
              foundByAI: true,
            },
          },
        });
      } catch (err) {
        // Skip duplicates
        console.log('Skipping duplicate lead:', lead.phone);
      }
    }

    console.log(`Successfully added ${leads.length} AI-found leads to campaign ${campaignId}`);

  } catch (error) {
    console.error('Error in background lead finding:', error);
  }
}
