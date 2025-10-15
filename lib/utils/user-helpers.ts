import User, { IUser } from '@/lib/models/User';

// Helper function to ensure we get a user document with methods
export async function findUserWithMethods(email: string): Promise<IUser | null> {
  const user = await User.findOne({ email: email.toLowerCase() });
  
  if (!user) {
    return null;
  }

  // Ensure the document has the methods by casting to IUser
  return user as IUser;
}

// Helper function to create a subscription for a user
export async function createUserSubscription(user: IUser, planType: string = 'free'): Promise<IUser> {
  // Check if user is trying to use free tier again
  if (planType === 'free' && user.hasUsedFreeTier && user.role !== 'admin') {
    throw new Error('Free tier can only be used once per user');
  }

  // Create subscription based on plan type
  const expirationDate = new Date();
  
  if (planType === 'free') {
    expirationDate.setDate(expirationDate.getDate() + 3); // 3 days for free tier
    // expirationDate.setMinutes(expirationDate.getMinutes() + 3); // 3 minutes for free tier (testing)
    user.hasUsedFreeTier = true; // Mark that user has used free tier
  } else {
    expirationDate.setDate(expirationDate.getDate() + 30); // 30 days for paid plans
  }
  
  user.selectedPlan = planType as 'free' | 'plus' | 'premium' | 'pro';
  user.planSelectedAt = new Date();
  user.subscriptionExpiresAt = expirationDate;
  user.isSubscriptionActive = true;
  
  return await user.save();
}

// Helper function to check if user has access
export async function checkUserAccess(user: IUser): Promise<boolean> {
  // Admin users always have access
  if (user.role === 'admin') {
    return true;
  }
  
  // Check if subscription has expired and update the flag
  if (user.isSubscriptionActive && user.subscriptionExpiresAt && new Date() >= user.subscriptionExpiresAt) {
    user.isSubscriptionActive = false;
    await user.save();
    return false;
  }
  
  // Check if user has an active subscription
  return user.isSubscriptionActive && user.subscriptionExpiresAt ? new Date() < user.subscriptionExpiresAt : false;
}
