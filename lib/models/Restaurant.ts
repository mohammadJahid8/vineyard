import mongoose, { Document, Schema } from 'mongoose';

export interface IRestaurant extends Document {
  region: string;
  sub_region: string;
  actual_type: string;
  approx_google_type: string;
  restaurants: string;
  gkp_link: string;
  g_rating: number;
  open_days: string;
  bracket: string;
  avg_est_lunch_cost: number;
  ta_link?: string;
  ta_rating?: number;
  dinner_tf?: boolean;
  open_days_1?: string;
  bracket_1?: string;
  avg_dinner_cost?: number;
  latitude: number;
  longitude: number;
  image_url?: string;
}

const RestaurantSchema = new Schema<IRestaurant>(
  {
    region: {
      type: String,
      required: true,
    },
    sub_region: {
      type: String,
      required: true,
    },
    actual_type: {
      type: String,
      required: true,
    },
    approx_google_type: {
      type: String,
      required: true,
    },
    restaurants: {
      type: String,
      required: true,
    },
    gkp_link: {
      type: String,
      required: true,
    },
    g_rating: {
      type: Number,
      required: true,
    },
    open_days: {
      type: String,
      required: true,
    },
    bracket: {
      type: String,
      required: true,
    },
    avg_est_lunch_cost: {
      type: Number,
      required: true,
    },
    ta_link: String,
    ta_rating: Number,
    dinner_tf: Boolean,
    open_days_1: String,
    bracket_1: String,
    avg_dinner_cost: Number,
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    image_url: String,
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
RestaurantSchema.index({ id: 1 });
RestaurantSchema.index({ region: 1 });
RestaurantSchema.index({ actual_type: 1 });
RestaurantSchema.index({ g_rating: -1 });
RestaurantSchema.index({ avg_est_lunch_cost: 1 });
RestaurantSchema.index({ latitude: 1, longitude: 1 }); // For geospatial queries

// Check if model is already registered to prevent re-compilation error
const Restaurant = mongoose.models.Restaurant || mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);

export default Restaurant;
