import mongoose from "mongoose";

// Task school have assigned to student with term and week
const SchoolTaskSchema = new mongoose.Schema({
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    term: { type: Number, required: true },
    week: { type: Number, required: true },
});

export default mongoose.models.SchoolTask || mongoose.model("SchoolTask", SchoolTaskSchema);
