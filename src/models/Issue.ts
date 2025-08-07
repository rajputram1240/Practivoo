import mongoose, { Schema, models, model } from 'mongoose';

const IssueSchema = new Schema(
  {
    user: {
      type: String,
      required: true, // e.g., "Gabby | Class A2 | Student"
    },
    school: {
      type: String,
      required: true, // or use a ref to School model if needed
    },
    type: {
      type: String,
      required: true, // e.g., "Instruction/Text", "Audio", "UI"
    },
    message: {
      type: String,
      required: true, // actual feedback text
    },
    topic: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'resolved'],
      default: 'pending',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default models.Issue || model('Issue', IssueSchema);