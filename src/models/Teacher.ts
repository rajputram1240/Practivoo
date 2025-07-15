import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String },
  yoe: { type: String }, // Years of Experience
  phone: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  teacherId: {
      type: String,
      default: () => Math.floor(1000 + Math.random() * 9000).toString(),
      unique: true,
  }
}, { timestamps: true });

export default mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema);