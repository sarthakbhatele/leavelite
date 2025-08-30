// import mongoose from "mongoose";

// const LeaveSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   startDate: { type: Date, required: true },
//   endDate: { type: Date, required: true },
//   reason: { type: String, required: true },
//   document: { type: String }, // Cloudinary URL
//   status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
//   adminComment: { type: String },
// }, { timestamps: true });

// export default mongoose.models.Leave || mongoose.model("Leave", LeaveSchema);


// models/Leave.js
import mongoose from "mongoose";

const LeaveSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  days: { type: Number, required: true },            // <-- new field
  reason: { type: String, required: true },
  document: { type: String }, // Cloudinary URL
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  adminComment: { type: String },
}, { timestamps: true });

export default mongoose.models.Leave || mongoose.model("Leave", LeaveSchema);
