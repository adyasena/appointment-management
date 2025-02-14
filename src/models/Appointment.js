import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  creator_id: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
});

export default mongoose.models.Appointment || mongoose.model("Appointment", AppointmentSchema);
