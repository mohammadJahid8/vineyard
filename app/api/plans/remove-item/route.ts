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

    const { planId, locationId } = await request.json();

    if (!planId || !locationId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();
    
    // Find the plan
    const plan = await Plan.findById(planId);

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Remove the item based on location type
    if (locationId.startsWith('vineyard-')) {
      const index = parseInt(locationId.split('-')[1]);
      if (index >= 0 && index < plan.vineyards.length) {
        plan.vineyards.splice(index, 1);
        
        // Update custom order to remove the deleted item and adjust indices
        if (plan.customOrder && Array.isArray(plan.customOrder)) {
          plan.customOrder = plan.customOrder
            .filter((item: any) => item.id !== locationId)
            .map((item: any) => {
              // Adjust vineyard indices that are greater than the removed index
              if (item.id.startsWith('vineyard-')) {
                const itemIndex = parseInt(item.id.split('-')[1]);
                if (itemIndex > index) {
                  return {
                    ...item,
                    id: `vineyard-${itemIndex - 1}`,
                  };
                }
              }
              return item;
            });
        }
      } else {
        return NextResponse.json({ error: 'Invalid vineyard index' }, { status: 400 });
      }
    } else if (locationId.startsWith('restaurant-')) {
      const index = parseInt(locationId.split('-')[1]);
      if (index >= 0 && index < plan.restaurants.length) {
        plan.restaurants.splice(index, 1);
        
        // Update custom order to remove the deleted item and adjust indices
        if (plan.customOrder && Array.isArray(plan.customOrder)) {
          plan.customOrder = plan.customOrder
            .filter((item: any) => item.id !== locationId)
            .map((item: any) => {
              // Adjust restaurant indices that are greater than the removed index
              if (item.id.startsWith('restaurant-')) {
                const itemIndex = parseInt(item.id.split('-')[1]);
                if (itemIndex > index) {
                  return {
                    ...item,
                    id: `restaurant-${itemIndex - 1}`,
                  };
                }
              }
              return item;
            });
        }
      } else {
        return NextResponse.json({ error: 'Invalid restaurant index' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Invalid location ID' }, { status: 400 });
    }

    // Check if plan still has at least one vineyard (business rule)
    if (plan.vineyards.length === 0) {
      return NextResponse.json({ 
        error: 'Cannot remove the last vineyard. At least one vineyard is required.' 
      }, { status: 400 });
    }

    await plan.save();

    return NextResponse.json({ 
      success: true,
      message: 'Item removed successfully',
      plan
    });

  } catch (error) {
    console.error('Error removing item:', error);
    return NextResponse.json(
      { error: 'Failed to remove item' },
      { status: 500 }
    );
  }
}
