import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import connectDB from '@/lib/mongodb';
import Plan from '@/lib/models/Plan';


export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId, locationId, time } = await request.json();

    if (!planId || !locationId || time === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

     await connectDB();
    

    // Find the plan
    const plan = await Plan.findById(planId);

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Update the time based on location type
    const updateQuery: any = {};
    
    if (locationId.startsWith('vineyard-')) {
      const index = parseInt(locationId.split('-')[1]);
      updateQuery[`vineyards.${index}.time`] = time;
    } else if (locationId.startsWith('restaurant-')) {
      updateQuery['restaurant.time'] = time;
    } else {
      return NextResponse.json({ error: 'Invalid location ID' }, { status: 400 });
    }

    console.log('🚀 ~ POST ~ updateQuery:', updateQuery);
    // Update the plan
    const result = await Plan.findByIdAndUpdate(
      planId,
      { $set: updateQuery }
    );
    console.log('🚀 ~ POST ~ result:', result);

    return NextResponse.json({ 
      success: true,
      message: 'Time updated successfully'
    });

  } catch (error) {
    console.error('Error updating time:', error);
    return NextResponse.json(
      { error: 'Failed to update time' },
      { status: 500 }
    );
  }
}
