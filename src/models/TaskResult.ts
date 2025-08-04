import mongoose from 'mongoose';

const taskResultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  answers: [{
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selected: String,
    isCorrect: Boolean
  }],
  score: Number,
  createdAt: { type: Date, default: Date.now },
});

taskResultSchema.index({ student: 1, task: 1 }, { unique: true });

export default mongoose.models.TaskResult || mongoose.model("TaskResult", taskResultSchema);