import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { DateTime } from "luxon";
import { connectToDatabase } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const appointments = await Appointment.find({
      $or: [{ creator_id: userId }, { participants: userId }],
    })
      .populate("creator_id", "name")
      .populate("participants", "name")
      .select("title creator_id start end participants");

    console.log("Appointments Fetched:", JSON.stringify(appointments, null, 2));

    return NextResponse.json({ appointments }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch appointments", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.title || !body.start || !body.end || !body.creator_id) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const creatorId = mongoose.Types.ObjectId.createFromHexString(
      body.creator_id
    );

    const creator = await User.findById(creatorId).select("preferred_timezone");

    if (!creator || !creator.preferred_timezone) {
      return NextResponse.json(
        { message: "Creator not found or missing preferred timezone" },
        { status: 404 }
      );
    }

    const startInUTC = DateTime.fromISO(body.start)
      .setZone(creator.preferred_timezone)
      .toUTC();
    const endInUTC = DateTime.fromISO(body.end)
      .setZone(creator.preferred_timezone)
      .toUTC();

    const participants = body.participants
      ? body.participants.map((id) =>
          mongoose.Types.ObjectId.createFromHexString(id)
        )
      : [];

    const newAppointment = await Appointment.create({
      title: body.title,
      start: startInUTC.toISO(),
      end: endInUTC.toISO(),
      creator_id: creatorId,
      participants,
    });

    return NextResponse.json({ appointment: newAppointment }, { status: 201 });
  } catch (error) {
    console.error("Error:", error.message);
    return NextResponse.json(
      { message: "Failed to add appointment", error: error.message },
      { status: 500 }
    );
  }
}
