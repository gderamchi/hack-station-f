import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/prisma';
import { getRetellClient, generateAgentInstructions } from '@/lib/retell/retell-client';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { campaignId, prospectId, companyId } = body;

    // Get company info
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Get prospect
    const prospect = await prisma.prospect.findUnique({
      where: { id: prospectId },
    });

    if (!prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    // Initialize Retell client
    const retellClient = getRetellClient();
    
    if (!retellClient) {
      return NextResponse.json(
        { error: 'Retell AI not configured. Please add RETELL_API_KEY to environment variables.' },
        { status: 500 }
      );
    }

    // Generate agent instructions from company profile
    const instructions = generateAgentInstructions({
      name: company.name,
      description: company.description || '',
      targetMarket: company.targetIndustries.join(', '),
    });

    // Create or get agent
    const agent = await retellClient.createAgent({
      name: `${company.name} Sales Agent`,
      instructions,
      voiceId: 'elevenlabs-rachel', // Use ElevenLabs Rachel voice
    });

    // Make the call
    const call = await retellClient.makeCall({
      agentId: agent.agent_id,
      toNumber: prospect.phone,
      fromNumber: process.env.TWILIO_PHONE_NUMBER || '+15705548338',
    });

    // Create call record in database
    const callRecord = await prisma.call.create({
      data: {
        campaignId,
        prospectId,
        fromNumber: process.env.TWILIO_PHONE_NUMBER || '+15705548338',
        toNumber: prospect.phone,
        status: 'initiated',
        metadata: {
          retellCallId: call.call_id,
          retellAgentId: agent.agent_id,
        },
      },
    });

    // Update prospect status
    await prisma.prospect.update({
      where: { id: prospectId },
      data: { status: 'contacted' },
    });

    return NextResponse.json({
      success: true,
      callId: callRecord.id,
      retellCallId: call.call_id,
      message: 'Call initiated successfully',
    });

  } catch (error: any) {
    console.error('Retell call error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to make call',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
