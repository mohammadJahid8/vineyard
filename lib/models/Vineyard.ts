import mongoose, { Document, Schema } from 'mongoose';

export interface IVineyard extends Document {
  vineyard_id: string;
  vineyard: string;
  region: string;
  sub_region: string;
  type: string;
  g: number;
  g_ratig_user: string;
  lowest_cost_per_adult: number;
  highest_cost_per_adult: number;
  reason_1?: string;
  reason_2?: string;
  reason_3?: string;
  reason_4?: string;
  reason_5?: string;
  image_url?: string;
  maplink?: string;
  tasting_only?: boolean;
  tour_and_tasting?: boolean;
  pairing_and_lunch?: boolean;
  vine_experience?: boolean;
  masterclass_workshop?: boolean;
}

const VineyardSchema = new Schema<IVineyard>(
  {
    vineyard_id: {
      type: String,
      required: true,
      unique: true,
    },
    vineyard: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
    sub_region: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    g: {
      type: Number,
      required: true,
    },
    g_ratig_user: {
      type: String,
      required: true,
    },
    lowest_cost_per_adult: {
      type: Number,
      required: true,
    },
    highest_cost_per_adult: {
      type: Number,
      required: true,
    },
    reason_1: String,
    reason_2: String,
    reason_3: String,
    reason_4: String,
    reason_5: String,
    image_url: String,
    maplink: String,
    tasting_only: Boolean,
    tour_and_tasting: Boolean,
    pairing_and_lunch: Boolean,
    vine_experience: Boolean,
    masterclass_workshop: Boolean,
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
VineyardSchema.index({ vineyard_id: 1 });
VineyardSchema.index({ region: 1 });
VineyardSchema.index({ type: 1 });
VineyardSchema.index({ lowest_cost_per_adult: 1 });
VineyardSchema.index({ highest_cost_per_adult: 1 });

// Check if model is already registered to prevent re-compilation error
const Vineyard = mongoose.models.Vineyard || mongoose.model<IVineyard>('Vineyard', VineyardSchema);

export default Vineyard;
