import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    // Pastikan koneksi database aktif
    await connectToDatabase();

    const { username, password } = await request.json();

    // Cek apakah user ada di database
    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json(
        { message: "Username not found. Please check your credentials." },
        { status: 401 }
      );
    }

    // Cek apakah password benar
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    // Cek apakah `JWT_SECRET` tersedia
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { message: "Server configuration error. Please contact support." },
        { status: 500 }
      );
    }

    // Buat token dengan masa berlaku 1 jam
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Simpan token di httpOnly cookie agar lebih aman
    cookies().set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60, // 1 jam
      path: "/",
    });

    return NextResponse.json(
      { message: "Login successful. Redirecting to dashboard..." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login Error:", error); // Log error untuk debugging

    return NextResponse.json(
      { message: "Something went wrong on our end. Please try again later." },
      { status: 500 }
    );
  }
}
