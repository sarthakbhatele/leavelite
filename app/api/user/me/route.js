import { connectDB } from "@/utils/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET(req) {
  await connectDB();
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });

  const { userId } = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(userId).select("-password");
  return NextResponse.json(user);
}
