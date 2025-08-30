// import { connectDB } from "@/utils/db";
// import Leave from "@/models/Leave";
// import jwt from "jsonwebtoken";
// import { NextResponse } from "next/server";

// export async function GET(req) {
//   await connectDB();
//   const token = req.cookies.get("token")?.value;
//   if (!token) return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });

//   const { userId } = jwt.verify(token, process.env.JWT_SECRET);
//   const leaves = await Leave.find({ user: userId }).sort({ createdAt: -1 });
//   return NextResponse.json(leaves);
// }

// app/api/leave/my/route.js

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

  const leaves = await Leave.find({ user: payload.userId }).sort({ createdAt: -1 });
  return NextResponse.json(leaves);
}
