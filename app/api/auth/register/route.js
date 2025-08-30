import { connectDB } from "@/utils/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectDB();
  const body = await req.json();
  const { name, email, password, role } = body;

  if (!name || !email || !password) return NextResponse.json({ msg: "All fields required" }, { status: 400 });
  
  const existing = await User.findOne({ email });
  if (existing) return NextResponse.json({ msg: "Email already exists" }, { status: 400 });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role });
  return NextResponse.json({ msg: "User created", userId: user._id }, { status: 201 });
}
