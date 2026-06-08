import mongoose, { Schema, model, models } from "mongoose";

export interface IReview {
  userId: mongoose.Types.ObjectId;
  reviewerName: string;
  productId: string; // 👈 Add this line to your TypeScript interface
  rating: number;
  comment: string;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewerName: {
      type: String,
      required: true,
      trim: true,
    },
    productId: { // 👈 Add this property mapping validation context
      type: String,
      required: true,
      index: true, // Speeds up search fetching when matching specific slugs
    },
    rating: {
      type: Number,
      required: true,
      min: [1, "Rating must be at least 1 star"],
      max: [5, "Rating cannot exceed 5 stars"],
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxLength: [1000, "Comments cannot exceed 1000 characters"],
    },
  },
  { 
    timestamps: true 
  }
);

export const Review = models.Review || model<IReview>("Review", ReviewSchema);
