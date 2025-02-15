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
    const creator = await User.findById(creatorId).select(
      "preferred_timezone name"
    );

    if (!creator || !creator.preferred_timezone) {
      return NextResponse.json(
        {
          message: `Creator ${
            creator?.name || "Unknown"
          } not found or missing preferred timezone`,
        },
        { status: 404 }
      );
    }

    console.log(
      `Creator: ${creator.name}, Timezone: ${creator.preferred_timezone}`
    );

    const participants = body.participants
      ? await User.find({ _id: { $in: body.participants } }).select(
          "preferred_timezone name"
        )
      : [];

    const allUsers = [creator, ...participants];

    const isWithinWorkingHours = (dateTime, timezone) => {
      if (!timezone) {
        console.error(`Invalid timezone for date: ${dateTime}`);
        return false;
      }

      const localTime = DateTime.fromISO(dateTime, { zone: "utc" }).setZone(
        timezone
      );
      const { hour, minute } = localTime;

      return hour >= 9 && (hour < 17 || (hour === 17 && minute === 0));
    };

    const invalidUsers = allUsers
      .map((user) => {
        const startLocalTime = DateTime.fromISO(body.start).setZone(
          user.preferred_timezone
        );
        const endLocalTime = DateTime.fromISO(body.end).setZone(
          user.preferred_timezone
        );

        const startValid = isWithinWorkingHours(
          body.start,
          user.preferred_timezone
        );
        const endValid = isWithinWorkingHours(
          body.end,
          user.preferred_timezone
        );

        let reason = [];
        if (!startValid)
          reason.push(`Start (${startLocalTime.toFormat("HH:mm")})`);
        if (!endValid) reason.push(`End (${endLocalTime.toFormat("HH:mm")})`);

        return !startValid || !endValid
          ? { user, reason: reason.join(" & ") }
          : null;
      })
      .filter(Boolean);

    if (invalidUsers.length > 0) {
      return NextResponse.json(
        {
          message: `Appointment must be within working hours (09:00 - 17:00) for these users:\n${invalidUsers
            .map(
              ({ user, reason }) =>
                `- ${user.name} (${user.preferred_timezone} UTC${DateTime.now()
                  .setZone(user.preferred_timezone)
                  .toFormat("ZZ")}) | Issue: ${reason}`
            )
            .join("\n")}`,
        },
        { status: 400 }
      );
    }

    const startInUTC = DateTime.fromISO(body.start, {
      zone: creator.preferred_timezone,
    }).toUTC();
    const endInUTC = DateTime.fromISO(body.end, {
      zone: creator.preferred_timezone,
    }).toUTC();

    const participantIds = body.participants
      ? body.participants.map((id) =>
          mongoose.Types.ObjectId.createFromHexString(id)
        )
      : [];

    const newAppointment = await Appointment.create({
      title: body.title,
      start: startInUTC.toISO(),
      end: endInUTC.toISO(),
      creator_id: creatorId,
      participants: participantIds,
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
