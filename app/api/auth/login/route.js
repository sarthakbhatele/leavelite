import { connectDB } from "@/utils/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectDB();
  const { email, password } = await req.json();

  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ msg: "Invalid credentials" }, { status: 400 });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return NextResponse.json({ msg: "Invalid credentials" }, { status: 400 });

  const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

  // Return JSON response with user data
  const response = NextResponse.json({ 
    msg: "Logged in successfully", 
    role: user.role,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });

  // Set the JWT token cookie - accessible to client for authentication
  response.cookies.set("token", token, { 
    httpOnly: false, // Allow client-side access for easier auth management
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/"
  });

  return response;
}
