import mongoose, { Document, Schema } from 'mongoose';

export interface IOTPToken extends Document {
  _id: string;
  email: string;
  otp: string;
  expiresAt: Date;
  createdAt: Date;
}

const OTPTokenSchema = new Schema<IOTPToken>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // MongoDB will automatically delete expired documents
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
OTPTokenSchema.index({ email: 1 });
OTPTokenSchema.index({ email: 1, otp: 1 });

// Check if model is already registered to prevent re-compilation error
const OTPToken = mongoose.models.OTPToken || mongoose.model<IOTPToken>('OTPToken', OTPTokenSchema);

export default OTPToken;
