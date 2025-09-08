import nodemailer from 'nodemailer';
import connectDB from '@/lib/mongodb';
import OTPToken from '@/lib/models/OTPToken';

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASS,
  },
});

/**
 * Generate a 6-digit OTP
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP to email
 */
export async function sendOTP(email: string): Promise<{ success: boolean; message: string }> {
  try {
    await connectDB();
    
    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTP for this email
    await OTPToken.deleteMany({ email });

    // Save new OTP
    const otpToken = new OTPToken({
      email,
      otp,
      expiresAt,
    });
    await otpToken.save();

    // Send email
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Your Vineyard Tour Planner Login Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8B5A3C;">Your Login Code</h2>
          <p>Hello,</p>
          <p>You requested a login code for Vineyard Tour Planner. Use the code below to sign in:</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #8B5A3C; font-size: 32px; margin: 0; letter-spacing: 8px;">${otp}</h1>
          </div>
          <p style="color: #666;">This code will expire in 10 minutes.</p>
          <p style="color: #666;">If you didn't request this code, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">Vineyard Tour Planner</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: 'OTP sent successfully',
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return {
      success: false,
      message: 'Failed to send OTP',
    };
  }
}

/**
 * Verify OTP
 */
export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  try {
    await connectDB();
    
    const otpToken = await OTPToken.findOne({
      email,
      otp,
      expiresAt: { $gt: new Date() },
    });

    if (otpToken) {
      // Delete the used OTP
      await OTPToken.deleteOne({ _id: otpToken._id });
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return false;
  }
}

/**
 * Clean up expired OTPs
 */
export async function cleanupExpiredOTPs(): Promise<void> {
  try {
    await connectDB();
    await OTPToken.deleteMany({ expiresAt: { $lt: new Date() } });
  } catch (error) {
    console.error('Error cleaning up expired OTPs:', error);
  }
}
