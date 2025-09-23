import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const schoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  profilepic: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  phone: String,
  address: String,
  image: String,
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  country: { type: String },
  code: { type: String }
});

// Hash password before saving
schoolSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.models.School || mongoose.model("School", schoolSchema);