import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import connectDB from '@/lib/mongodb';
import Plan from '@/lib/models/Plan';
import {
  createSuccessResponse,
  createErrorResponse,
  handleApiError,
  HttpStatus,
  ErrorType,
} from '@/lib/api-response';

// Get user's plans
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse(
        ErrorType.UNAUTHORIZED,
        'Authentication required',
        HttpStatus.UNAUTHORIZED
      );
    }

    await connectDB();
    
    

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type'); // 'active' or 'confirmed'

    let query: any = { userId: session.user.id };

    if (type === 'active') {
      const activePlan = await Plan.findActiveByUserId(session.user.id);
      
      return createSuccessResponse(
        { plan: activePlan },
        activePlan ? 'Active plan found' : 'No active plan'
      );
    } else {
      // Get all plans with optional status filter
      if (status) {
        query.status = status;
      }
      query.isActive = true;

      const plans = await Plan.find(query).sort({ createdAt: -1 });
      return createSuccessResponse({ plans }, 'Plans retrieved successfully');
    }
  } catch (error) {
    return handleApiError(error);
  }
}

// Create or update a plan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse(
        ErrorType.UNAUTHORIZED,
        'Authentication required',
        HttpStatus.UNAUTHORIZED
      );
    }

    const { vineyards, restaurants, title } = await request.json();

    // if (!vineyards || !Array.isArray(vineyards) || vineyards.length === 0) {
    //   return createErrorResponse(
    //     ErrorType.VALIDATION_ERROR,
    //     'At least one vineyard is required',
    //     HttpStatus.BAD_REQUEST
    //   );
    // }

    if (vineyards.length > 10) {
      return createErrorResponse(
        ErrorType.VALIDATION_ERROR,
        'Maximum 10 vineyards allowed',
        HttpStatus.BAD_REQUEST
      );
    }

    if (restaurants && restaurants.length > 3) {
      return createErrorResponse(
        ErrorType.VALIDATION_ERROR,
        'Maximum 3 restaurants allowed',
        HttpStatus.BAD_REQUEST
      );
    }

    await connectDB();
    



    let plan = await Plan.findOne({
      userId: session.user.id,
      isActive: true,
 
    });

 

    if (plan) {
      
      plan.vineyards = vineyards.map((v: any) => ({
        vineyardId: v.vineyard.vineyard_id,
        vineyard: v.vineyard,
        offer: v.offer,
        time: v.time,
      }));
      
      if (restaurants && Array.isArray(restaurants)) {
        plan.restaurants = restaurants.map((r: any) => ({
          restaurantId: r.restaurant.id,
          restaurant: r.restaurant,
          time: r.time,
        }));
      } else {
        plan.restaurants = [];
      }
      
      if (title) {
        plan.title = title;
      }
      
   
      
      await plan.save();
    } else {
      
      const planData: any = {
        userId: session.user.id,
        vineyards: vineyards.map((v: any) => ({
          vineyardId: v.vineyard.vineyard_id,
          vineyard: v.vineyard,
          offer: v.offer,
          time: v.time,
        })),
        restaurants: restaurants && Array.isArray(restaurants) 
          ? restaurants.map((r: any) => ({
              restaurantId: r.restaurant.id,
              restaurant: r.restaurant,
              time: r.time,
            }))
          : [],
        customOrder: []
        
      };

      if (title) {
        planData.title = title;
      }

      plan = new Plan(planData);
      console.log('🚀 ~ POST ~ plan:', plan)
      await plan.save();
    }

    return createSuccessResponse(
      { plan },
      plan.isNew ? 'Plan created successfully' : 'Plan updated successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
