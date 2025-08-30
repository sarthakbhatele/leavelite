import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/utils/db";
import Leave from "@/models/Leave";
import User from "@/models/User";

function daysBetween(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const sUtc = Date.UTC(s.getFullYear(), s.getMonth(), s.getDate());
  const eUtc = Date.UTC(e.getFullYear(), e.getMonth(), e.getDate());
  return Math.floor((eUtc - sUtc) / (24 * 60 * 60 * 1000)) + 1;
}

export async function PATCH(req) {
  await connectDB();
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });

  let payload;
  try { payload = jwt.verify(token, process.env.JWT_SECRET); }
  catch (e) { return NextResponse.json({ msg: "Invalid token" }, { status: 401 }); }

  if (payload.role !== "admin") return NextResponse.json({ msg: "Forbidden" }, { status: 403 });

  const { leaveId, action, comment } = await req.json();
  if (!leaveId || !action) return NextResponse.json({ msg: "Missing params" }, { status: 400 });

  const leave = await Leave.findById(leaveId).populate("user");
  if (!leave) return NextResponse.json({ msg: "Leave not found" }, { status: 404 });
  if (leave.status !== "Pending") return NextResponse.json({ msg: "Already processed" }, { status: 400 });

  const days = (typeof leave.days === "number" && leave.days > 0)
    ? leave.days
    : daysBetween(leave.startDate, leave.endDate);

  if (action === "approve") {
    // prevent negative balance
    const user = leave.user;
    if (user.availableLeave < days) {
      return NextResponse.json({ msg: "User has insufficient leave balance to approve" }, { status: 400 });
    }

    user.availableLeave = Math.max(0, user.availableLeave - days);
    await user.save();

    leave.status = "Approved";
  } else if (action === "reject") {
    // rejection doesn't change balance
    leave.status = "Rejected";
  } else {
    return NextResponse.json({ msg: "Invalid action" }, { status: 400 });
  }

  leave.adminComment = comment || "";
  await leave.save();

  // return both updated leave and user so frontend can refresh quickly
  return NextResponse.json({ msg: `Leave ${leave.status}`, leave, user: leave.user }, { status: 200 });
}
