import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's campaigns
    const campaigns = await prisma.campaign.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    });

    const campaignIds = campaigns.map(c => c.id);

    // Get all calls for user's campaigns
    const calls = await prisma.call.findMany({
      where: {
        campaignId: { in: campaignIds },
      },
      select: {
        status: true,
        duration: true,
        answeredBy: true,
      },
    });

    // Calculate metrics
    const totalCalls = calls.length;
    const completedCalls = calls.filter(c => c.status === 'completed').length;
    const activeCalls = calls.filter(c => c.status === 'in-progress').length;
    
    // Estimate qualified leads (calls that were answered and lasted > 60 seconds)
    const qualifiedLeads = calls.filter(c => 
      c.status === 'completed' && 
      c.answeredBy === 'human' && 
      (c.duration || 0) > 60
    ).length;

    // Calculate average duration
    const totalDuration = calls.reduce((sum, call) => sum + (call.duration || 0), 0);
    const avgDurationSeconds = totalCalls > 0 ? totalDuration / totalCalls : 0;
    const avgDurationMinutes = Math.floor(avgDurationSeconds / 60);
    const avgDurationSecs = Math.floor(avgDurationSeconds % 60);
    const avgDuration = `${avgDurationMinutes}:${avgDurationSecs.toString().padStart(2, '0')}`;

    return NextResponse.json({
      success: true,
      metrics: {
        totalCalls,
        completedCalls,
        activeCalls,
        qualifiedLeads,
        avgDurationMinutes: avgDuration,
      },
    });

  } catch (error: any) {
    console.error('Error fetching overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
