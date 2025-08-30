import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/utils/db";
import User from "@/models/User";

export async function GET(req) {
  await connectDB();

  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return NextResponse.json({ msg: "Invalid token" }, { status: 401 });
  }

  const user = await User.findById(payload.userId).select("-password"); // exclude password
  if (!user) {
    return NextResponse.json({ msg: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    availableLeave: user.availableLeave
  });
}
