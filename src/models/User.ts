// src/models/User.ts
import mongoose, { Schema, model, models } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
  isVerified: boolean;
  wishlistProducts?: string[];
  wishlistPosts?: string[];
  
  // Storage paths for OTP-based verification
  otpCode?: string;
  otpExpiresAt?: Date;

  // Storage paths for password recovery updates
  resetToken?: string;
  resetTokenExpiresAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    passwordHash: { 
      type: String, 
      required: true 
    },
    role: { 
      type: String, 
      enum: ["user", "admin"], 
      default: "user" 
    },
    isVerified: { 
      type: Boolean, 
      default: false 
    },
    wishlistProducts: {
      type: [String],
      default: [],
    },
    wishlistPosts: {
      type: [String],
      default: [],
    },
    
    // OTP security document paths
    otpCode: { type: String },
    otpExpiresAt: { type: Date },

    // Password recovery document paths
    resetToken: { type: String },
    resetTokenExpiresAt: { type: Date },
  },
  { 
    timestamps: true // Automatically gives us createdAt and updatedAt timestamps
  }
);

export const User = models.User || model<IUser>("User", UserSchema);