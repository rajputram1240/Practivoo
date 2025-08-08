import mongoose, { Schema, models, model } from 'mongoose';

// models/Issue.ts
const IssueSchema = new Schema({
  user: { type: String, required: true },     // display label or studentId
  studentId: { type: String, index: true },   // <— add this for reliable filtering
  school: { type: String, required: true, index: true },
  type: { type: String, required: true },
  message: { type: String, default: "" },     // optional in UI
  topic: { type: String },
  status: { type: String, enum: ["pending", "resolved"], default: "pending", index: true },
}, { timestamps: true });


export default models.Issue || model('Issue', IssueSchema);