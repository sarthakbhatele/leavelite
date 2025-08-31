import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/utils/db";
import Leave from "@/models/Leave";
import User from "@/models/User"; // Import User model to check available leaves

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
    const { startDate, endDate, reason, document, days: providedDays } = body;

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
    const calculatedDays = daysBetween(startDate, endDate);

    // Use provided days if valid, otherwise use calculated days
    const days = (typeof providedDays === "number" && providedDays > 0)
      ? providedDays
      : calculatedDays;

    // Validate leave duration
    if (days > 30) {
      return NextResponse.json({ msg: "Leave request cannot exceed 30 days" }, { status: 400 });
    }

    // Check for existing pending leave requests
    const existingPendingLeave = await Leave.findOne({
      user: payload.userId,
      status: "Pending"
    });

    if (existingPendingLeave) {
      return NextResponse.json({
        msg: "You already have a pending leave request. Please wait for approval or cancellation before submitting a new request.",
        existingRequest: {
          startDate: existingPendingLeave.startDate,
          endDate: existingPendingLeave.endDate,
          days: existingPendingLeave.days,
          reason: existingPendingLeave.reason,
          submittedAt: existingPendingLeave.createdAt
        }
      }, { status: 400 });
    }

    // Check user's available leaves
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ msg: "User not found" }, { status: 404 });
    }

    // Check if user has sufficient leave balance
    if (user.availableLeave <= 0) {
      return NextResponse.json({
        msg: "You have no available leaves remaining. Cannot submit leave request.",
        availableLeave: user.availableLeave
      }, { status: 400 });
    }

    // Check if requested days exceed available leaves
    if (days > user.availableLeave) {
      return NextResponse.json({
        msg: `Insufficient leave balance. You have ${user.availableLeave} days available, but requested ${days} days.`,
        availableLeave: user.availableLeave,
        requestedDays: days
      }, { status: 400 });
    }

    // Validate document URL if provided
    if (document && !document.startsWith('https://')) {
      return NextResponse.json({ msg: "Invalid document URL" }, { status: 400 });
    }

    const leave = new Leave({
      user: payload.userId,  // Use 'user' field to match the schema and populate calls
      startDate,
      endDate,
      reason,
      document: document || "",  // Use 'document' to match the schema
      days,
      status: "Pending",  // Capitalize to match update route
    });

    await leave.save();

    return NextResponse.json({
      success: true,
      leave,
      message: "Leave request submitted successfully",
      remainingLeaves: user.availableLeave // Show current balance (will be updated when leave is approved)
    }, { status: 201 });
  } catch (err) {
    console.error('Error creating leave:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}