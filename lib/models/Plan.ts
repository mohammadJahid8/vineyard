import mongoose, { Document, Schema } from 'mongoose';

export interface IPlanVineyard {
  vineyardId: string;
  vineyard: any; // Store the full vineyard object
  offer?: any; // Store the full offer object
  time?: string;
}

export interface IPlanRestaurant {
  restaurantId: string;
  restaurant: any; // Store the full restaurant object
  time?: string;
}

export interface IPlan extends Document {
  _id: string;
  userId: string;
  title?: string;
  vineyards: IPlanVineyard[];
  restaurants: IPlanRestaurant[];
  customOrder?: Array<{ id: string; order: number; type: 'vineyard' | 'restaurant' }>;
  // status: 'draft' | 'confirmed' | 'expired';  // Removed status field
  isActive: boolean;
  expiresAt: Date;
  confirmedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  isExpired(): boolean;
  confirm(): Promise<IPlan>;
  expire(): Promise<IPlan>;
}

const PlanVineyardSchema = new Schema({
  vineyardId: {
    type: String,
    required: true,
  },
  vineyard: {
    type: Schema.Types.Mixed,
    required: true,
  },
  offer: {
    type: Schema.Types.Mixed,
  },
  time: {
    type: String,
  },
}, { _id: false });

const PlanRestaurantSchema = new Schema({
  restaurantId: {
    type: String,
    required: true,
  },
  restaurant: {
    type: Schema.Types.Mixed,
    required: true,
  },
  time: {
    type: String,
  },
}, { _id: false });

const PlanSchema = new Schema<IPlan>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
    },
    vineyards: {
      type: [PlanVineyardSchema],
      default: [],
      // validate: {
      //   validator: function(v: IPlanVineyard[]) {
      //     return v.length <= 10; // Max 10 vineyards
      //   },
      //   message: 'Maximum 10 vineyards allowed per plan'
      // }
    },
    restaurants: {
      type: [PlanRestaurantSchema],
      default: [],
      // validate: {
      //   validator: function(v: IPlanRestaurant[]) {
      //     return v.length <= 3; // Max 3 restaurants
      //   },
      //   message: 'Maximum 3 restaurants allowed per plan'
      // }
    },
    customOrder: {
      type: Array,
      default: [],
      required: true,
    },
   
    isActive: {
      type: Boolean,
      default: true,
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
PlanSchema.index({ userId: 1, isActive: 1 });
PlanSchema.index({ userId: 1, status: 1, isActive: 1 });

// Instance methods
PlanSchema.methods.isExpired = function () {
  return this.expiresAt && new Date() > this.expiresAt;
};

// PlanSchema.methods.confirm = function () {
//   this.status = 'confirmed';
//   this.confirmedAt = new Date();
  
//   // Set expiry only if not already set (first confirmation)
//   if (!this.expiresAt) {
//     const expirationMinutes = process.env.NODE_ENV === 'development' ? 5 : 1440; // 5 min or 24 hours
//     this.expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
//   }
  
//   return this.save();
// };

// PlanSchema.methods.expire = function () {
//   this.status = 'expired';
//   this.isActive = false;
//   return this.save();
// };

// Static methods interface
interface IPlanModel extends mongoose.Model<IPlan> {
  findActiveByUserId(userId: string): Promise<IPlan | null>;
  findConfirmedByUserId(userId: string): Promise<IPlan[]>;
  
}

// Static methods
PlanSchema.statics.findActiveByUserId = function (userId: string) {
  return this.findOne({ 
    userId, 
    isActive: true
  });
};


// Pre-save middleware to auto-generate title if not provided
PlanSchema.pre('save', function (next) {
  if (!this.title && this.vineyards.length > 0) {
    const vineyardNames = this.vineyards.map(v => v.vineyard.vineyard).slice(0, 2);
    this.title = `${vineyardNames.join(' & ')} Tour`;
    if (this.vineyards.length > 2) {
      this.title += ` +${this.vineyards.length - 2} more`;
    }
  }
  next();
});


const Plan = mongoose.model<IPlan, IPlanModel>('Plan', PlanSchema, undefined, { overwriteModels: true });


export default Plan;
