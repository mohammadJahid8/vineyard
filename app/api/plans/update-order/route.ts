import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import connectDB from '@/lib/mongodb';
import Plan from '@/lib/models/Plan';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('🚀 ~ POST ~ session:', session)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId, order } = await request.json();

    if (!planId || !order || !Array.isArray(order)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    // Find the plan using Mongoose model
    const plan = await Plan.findById(planId);

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Verify the plan belongs to the current user
    if (plan.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized access to plan' }, { status: 403 });
    }

    console.log('🚀 ~ POST ~ planId:', planId);
    console.log('🚀 ~ POST ~ order:', order);

    // Update the plan with the custom order
    const result = await Plan.findByIdAndUpdate(
      planId,
      { $set: { customOrder: order } },
      { new: true }
    );

    // console.log('🚀 ~ POST ~ result:', result);

    return NextResponse.json({ 
      success: true,
      message: 'Order updated successfully'
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
