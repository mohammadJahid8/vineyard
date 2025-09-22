import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  imageUrl?: string;
  role: 'user' | 'admin' | 'moderator';
  selectedPlan?: 'free' | 'plus' | 'premium' | 'pro';
  planSelectedAt?: Date;
  subscriptionExpiresAt?: Date;
  isSubscriptionActive: boolean;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Method declarations
  isAdmin(): boolean;
  isModerator(): boolean;
  hasAccess(): boolean;
  createSubscription(planType?: string): Promise<IUser>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    username: {
      type: String,
      trim: true,
      sparse: true, // Allows unique constraint with null values
      unique: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user',
      required: true,
    },
    selectedPlan: {
      type: String,
      enum: ['free', 'plus', 'premium', 'pro'],
      default: null,
    },
    planSelectedAt: {
      type: Date,
    },
    subscriptionExpiresAt: {
      type: Date,
    },
    isSubscriptionActive: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Indexes for better query performance
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function (this: IUser) {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName || this.lastName || this.username || this.email;
});

// Instance methods
UserSchema.methods.updateLastLogin = function () {
  this.lastLoginAt = new Date();
  return this.save();
};

UserSchema.methods.isAdmin = function () {
  return this.role === 'admin';
};

UserSchema.methods.isModerator = function () {
  return this.role === 'moderator' || this.role === 'admin';
};

UserSchema.methods.hasAccess = function () {
  // Admin users always have access
  if (this.role === 'admin') {
    return true;
  }
  
  // Check if user has an active subscription
  return this.isSubscriptionActive && this.subscriptionExpiresAt && new Date() < this.subscriptionExpiresAt;
};

UserSchema.methods.createSubscription = function (planType = 'free') {
  // Create subscription based on plan type
  const expirationDate = new Date();
  
  if (planType === 'free') {
    expirationDate.setMinutes(expirationDate.getMinutes() + 30); // 5 minutes for testing
  } else {
    expirationDate.setDate(expirationDate.getDate() + 30); // 30 days for paid plans
  }
  
  this.selectedPlan = planType;
  this.planSelectedAt = new Date();
  this.subscriptionExpiresAt = expirationDate;
  this.isSubscriptionActive = true;
  
  return this.save();
};

// Static methods
UserSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

UserSchema.statics.getActiveUsers = function () {
  return this.find({ isActive: true });
};

// Pre-save middleware
UserSchema.pre('save', function (next) {
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  next();
});

// Check if model is already registered to prevent re-compilation error
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 

export default User;
