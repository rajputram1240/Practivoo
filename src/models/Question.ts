import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  heading: String,
  question: String,
  media: {
    image: String,
    audio: String,
  },
  options: [String],
  correctAnswer: String,
  explanation: { type: String },
  type: { type: String, enum: ['single', 'multi'], default: 'single' },
});

export default mongoose.models.Question || mongoose.model('Question', questionSchema);