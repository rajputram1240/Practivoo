import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    level: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    phone: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    studentId: {
      type: String,
      default: () => Math.floor(1000 + Math.random() * 9000).toString(),
      unique: true,
    },
    score: { type: Number, default: 0 }, // ✅ Added default score
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Student || mongoose.model("Student", studentSchema);