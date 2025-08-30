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

  const response = NextResponse.json({ msg: "Logged in", role: user.role });
  response.cookies.set("token", token, { httpOnly: true, maxAge: 7*24*60*60 });
  return response;
}
