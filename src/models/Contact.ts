// src/models/Contact.ts
import mongoose, { Schema, model, models } from "mongoose";

export interface IContact {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactSchema = new Schema<IContact>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { 
    timestamps: true // Tracks the exact day and hour the message was submitted
  }
);

export const Contact = models.Contact || model<IContact>("Contact", ContactSchema);
