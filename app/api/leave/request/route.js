// import { connectDB } from "@/utils/db";
// import Leave from "@/models/Leave";
// import User from "@/models/User";
// import { uploadDocument } from "@/utils/cloudinary";
// import jwt from "jsonwebtoken";
// import { NextResponse } from "next/server";

// export async function POST(req) {
//   await connectDB();
//   const token = req.cookies.get("token")?.value;
//   if (!token) return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });

//   const { userId } = jwt.verify(token, process.env.JWT_SECRET);
//   const user = await User.findById(userId);
//   if (user.availableLeave <= 0) return NextResponse.json({ msg: "No leave balance" }, { status: 400 });

//   const { startDate, endDate, reason, document } = await req.json();
//   if (new Date(endDate) < new Date(startDate)) return NextResponse.json({ msg: "Invalid date range" }, { status: 400 });

//   let docUrl = "";
//   if (document) docUrl = await uploadDocument(document);

//   const leave = await Leave.create({ user: user._id, startDate, endDate, reason, document: docUrl });
//   return NextResponse.json({ msg: "Leave requested", leave }, { status: 201 });
// }


import Leave from "@/models/Leave";

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, startDate, endDate, reason, documentUrl } = body;

    // Calculate days difference
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive of both days

    const leave = new Leave({
      userId,
      startDate,
      endDate,
      reason,
      documentUrl,
      days,   // ✅ add here
      status: "pending",
    });

    await leave.save();

    return new Response(JSON.stringify({ success: true, leave }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
