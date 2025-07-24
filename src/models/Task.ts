import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  heading: String,
  questionText: String,
  options: [String],
  correctOption: String,
  imageUrl: String,
  audioUrl: String,
  explanation: String,
  additionalMessage: String,
}, { _id: false });

const taskSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  level: { type: String, required: true },
  category: { type: String, required: true },
  status: { type: String, enum: ['Assigned', 'Drafts'], default: 'Drafts' },
  questions: [questionSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Task || mongoose.model('Task', taskSchema);