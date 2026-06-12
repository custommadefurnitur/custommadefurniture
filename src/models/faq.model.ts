import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IFAQ extends Document {
  question: string;
  answer?: string;
  isPublished: boolean;
  helpfulVotes: number;
  askedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const faqSchema = new Schema<IFAQ>({
  question: { type: String, required: true, trim: true },
  answer: { type: String, trim: true, default: '' },
  isPublished: { type: Boolean, default: false },
  helpfulVotes: { type: Number, default: 0 },
  askedBy: { type: String, required: false }
}, { timestamps: true });

// Fallback check prevents compilation errors during Next.js hot-reloads
export default models.FAQ || model<IFAQ>('FAQ', faqSchema);
