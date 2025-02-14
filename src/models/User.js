import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  preferred_timezone: { type: String, required: true },
  password: { type: String, required: true },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
