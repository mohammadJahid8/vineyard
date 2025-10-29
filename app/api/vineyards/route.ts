import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Vineyard from '@/lib/models/Vineyard';
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const type = searchParams.get('type');
    const minCost = searchParams.get('minCost');
    const maxCost = searchParams.get('maxCost');
    const search = searchParams.get('search');
    const experience = searchParams.get('experience');
    
    console.log({region, type, minCost, maxCost, search, experience})
    
    // Build query object
    const query: any = {};

    if (region && region !== 'all') {
      query.sub_region = { $regex: region, $options: 'i' };
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    if (minCost || maxCost) {
      query.lowest_cost_per_adult = {};
      if (minCost) {
        query.lowest_cost_per_adult.$gte = parseFloat(minCost);
      }
      if (maxCost) {
        query.lowest_cost_per_adult.$lte = parseFloat(maxCost);
      }
    }

    if (experience) {
      const experiences = experience.split(',');
      const experienceConditions = experiences.map(exp => {
        switch (exp.trim()) {
          case 'tasting_only':
            return { tasting_only: true };
          case 'tour_and_tasting':
            return { tour_and_tasting: true };
          case 'pairing_and_lunch':
            return { pairing_and_lunch: true };
          case 'vine_experience':
            return { vine_experience: true };
          case 'masterclass_workshop':
            return { masterclass_workshop: true };
          default:
            return null;
        }
      }).filter(Boolean);
      
      if (experienceConditions.length > 0) {
        query.$or = experienceConditions;
      }
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const searchConditions = [
        { vineyard: searchRegex },
        { vineyard_id: searchRegex },
        { region: searchRegex },
        { sub_region: searchRegex },
        { type: searchRegex },
      ];
      
      if (query.$or) {
        // Combine experience and search conditions
        query.$and = [
          { $or: query.$or },
          { $or: searchConditions }
        ];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    console.log('🚀 ~ GET ~ vineyards query:', JSON.stringify(query, null, 2))
    const vineyards = await Vineyard.find(query).sort({ g: -1 });
    console.log('🚀 ~ GET ~ vineyards:', vineyards)

    // If results are less than 3 (including zero), fetch additional recommendations
    let additionalRecommendations = [];
    if (vineyards.length < 3) {
      // Build alternative query - relax some constraints
      const altQuery: any = {};

      if (vineyards.length > 0) {
        // If we have at least one result, use it as reference
        const referenceVineyard = vineyards[0];
        altQuery.vineyard_id = { $nin: vineyards.map((v: any) => v.vineyard_id) };

        // Keep region if it was specified
        if (region && region !== 'all') {
          altQuery.sub_region = { $regex: region, $options: 'i' };
        }

        // Relax cost constraint slightly (±20 from reference)
        if (referenceVineyard.lowest_cost_per_adult) {
          const refCost = referenceVineyard.lowest_cost_per_adult;
          altQuery.lowest_cost_per_adult = {
            $gte: Math.max(0, refCost - 20),
            $lte: refCost + 20
          };
        }
      } else {
        // No results found, show general recommendations based on filters
        // Keep region if specified
        if (region && region !== 'all') {
          altQuery.sub_region = { $regex: region, $options: 'i' };
        }
        
        // Use original cost range if specified
        if (minCost || maxCost) {
          altQuery.lowest_cost_per_adult = {};
          if (minCost) {
            altQuery.lowest_cost_per_adult.$gte = parseFloat(minCost);
          }
          if (maxCost) {
            altQuery.lowest_cost_per_adult.$lte = parseFloat(maxCost);
          }
        }
        
        // If still no constraints, just get top rated
        if (Object.keys(altQuery).length === 0) {
          // Get top rated vineyards
        }
      }

      // Get additional options
      additionalRecommendations = await Vineyard.find(altQuery)
        .sort({ g: -1 })
        .limit(6);
    }

    return createSuccessResponse({
      vineyards,
      additionalRecommendations: additionalRecommendations.length > 0 ? additionalRecommendations : undefined
    }, 'Vineyards fetched successfully');
  } catch (error) {
    console.error('Error fetching vineyards:', error);
    return handleApiError(error);
  }
}
