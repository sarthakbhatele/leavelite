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

// v1
// import Leave from "@/models/Leave";

// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const { userId, startDate, endDate, reason, documentUrl } = body;

//     // Calculate days difference
//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     const diffTime = Math.abs(end - start);
//     const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive of both days

//     const leave = new Leave({
//       userId,
//       startDate,
//       endDate,
//       reason,
//       documentUrl,
//       days,   // ✅ add here
//       status: "pending",
//     });

//     await leave.save();

//     return new Response(JSON.stringify({ success: true, leave }), { status: 201 });
//   } catch (err) {
//     return new Response(JSON.stringify({ error: err.message }), { status: 500 });
//   }
// }

// app/api/leave/request/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/utils/db";
import Leave from "@/models/Leave";

// Use the same robust day calculation as the update route
function daysBetween(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const sUtc = Date.UTC(s.getFullYear(), s.getMonth(), s.getDate());
  const eUtc = Date.UTC(e.getFullYear(), e.getMonth(), e.getDate());
  return Math.floor((eUtc - sUtc) / (24 * 60 * 60 * 1000)) + 1;
}

export async function POST(req) {
  try {
    await connectDB();

    // Extract and validate JWT token
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ msg: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { startDate, endDate, reason, document } = body; // Note: 'document' not 'documentUrl'

    // Validate required fields
    if (!startDate || !endDate || !reason) {
      return NextResponse.json({ msg: "Missing required fields" }, { status: 400 });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ msg: "Invalid date format" }, { status: 400 });
    }

    if (start > end) {
      return NextResponse.json({ msg: "Start date cannot be after end date" }, { status: 400 });
    }

    // Calculate days using the same method as update route
    const days = daysBetween(startDate, endDate);

    const leave = new Leave({
      user: payload.userId,  // Use 'user' field to match the schema and populate calls
      startDate,
      endDate,
      reason,
      document,  // Use 'document' to match the schema
      days,
      status: "Pending",  // Capitalize to match update route
    });

    await leave.save();

    return NextResponse.json({ success: true, leave }, { status: 201 });
  } catch (err) {
    console.error('Error creating leave:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}