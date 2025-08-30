"use client";
import { useState } from "react";

export default function LeaveForm({ refreshLeaves }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [document, setDocument] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let docBase64 = "";
    if (document) {
      const reader = new FileReader();
      reader.readAsDataURL(document);
      await new Promise((resolve) => {
        reader.onload = () => {
          docBase64 = reader.result;
          resolve();
        };
      });
    }

    const res = await fetch("/api/leave/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startDate, endDate, reason, document: docBase64 }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Leave requested!");
      setStartDate("");
      setEndDate("");
      setReason("");
      setDocument(null);
      refreshLeaves();
    } else alert(data.msg);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 mt-2 border p-4 rounded shadow-sm bg-white"
    >
      <label className="font-semibold">Start Date</label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="border p-2 rounded"
        required
      />

      <label className="font-semibold">End Date</label>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="border p-2 rounded"
        required
      />

      <label className="font-semibold">Reason</label>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Enter reason for leave"
        className="border p-2 rounded"
        required
      />

      <label className="font-semibold">Supporting Document (Optional)</label>
      <input
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.png"
        onChange={(e) => setDocument(e.target.files[0])}
        className="border p-2 rounded"
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-2"
      >
        Submit Leave
      </button>
    </form>
  );
}
