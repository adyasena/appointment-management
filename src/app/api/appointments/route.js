import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";

export async function GET() {
  try {
    await connectToDatabase();
    
    const appointments = await Appointment.find().select("title creator_id start end");

    return NextResponse.json({ appointments }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch appointments", error: error.message },
      { status: 500 }
    );
  }
}
