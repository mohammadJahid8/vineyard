import mongoose, { Document, Schema } from 'mongoose';

export interface IOffer extends Document {
  vineyard_id: string;
  region: string;
  sub_region: string;
  type: string;
  vineyard: string;
  title: string;
  experience: string;
  cost_per_adult: number;
  duration: string;
}

const OfferSchema = new Schema<IOffer>(
  {
    vineyard_id: {
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
    vineyard: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    cost_per_adult: {
      type: Number,
      required: true,
    },
    duration: {
      type: String,
      required: true,
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
OfferSchema.index({ vineyard_id: 1 });
OfferSchema.index({ region: 1 });
OfferSchema.index({ type: 1 });
OfferSchema.index({ cost_per_adult: 1 });

// Check if model is already registered to prevent re-compilation error
const Offer = mongoose.models.Offer || mongoose.model<IOffer>('Offer', OfferSchema);

export default Offer;
