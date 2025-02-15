import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  creator_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

export default mongoose.models.Appointment ||
  mongoose.model("Appointment", AppointmentSchema);
