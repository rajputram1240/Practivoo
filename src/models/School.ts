import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const schoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  phone: String,
  address: String,
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
schoolSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.models.School || mongoose.model("School", schoolSchema);