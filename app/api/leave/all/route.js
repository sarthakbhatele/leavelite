import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/utils/db";
import Leave from "@/models/Leave";

export async function GET(req) {
  await connectDB();
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });

  let payload;
  try { payload = jwt.verify(token, process.env.JWT_SECRET); }
  catch (e) { return NextResponse.json({ msg: "Invalid token" }, { status: 401 }); }

  if (payload.role !== "admin") return NextResponse.json({ msg: "Forbidden" }, { status: 403 });

  const leaves = await Leave.find({}).populate("user");
  return NextResponse.json(leaves);
}
