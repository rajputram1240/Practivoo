import mongoose from 'mongoose';

const levelSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  defaultName: { type: String, required: true },
  createdBy: { type: String, default: "admin" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Level || mongoose.model("Level", levelSchema);