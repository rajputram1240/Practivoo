// models/SchoolLevel.ts
import mongoose from "mongoose";

const schoolLevelSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, required: true },
  levelCode: { type: String, required: true },
  customName: { type: String },
  modifiedAt: { type: Date, default: Date.now },
});

export default mongoose.models.SchoolLevel || mongoose.model("SchoolLevel", schoolLevelSchema, "school_levels");