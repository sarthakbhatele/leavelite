// "use client";
// import { useEffect, useState } from "react";
// import LeaveForm from "@/components/LeaveForm";

// export default function UserDashboard() {
//   const [user, setUser] = useState({});
//   const [leaves, setLeaves] = useState([]);

//   const fetchData = async () => {
//     const res1 = await fetch("/api/user/me");
//     const data1 = await res1.json();
//     setUser(data1);

//     const res2 = await fetch("/api/leave/my");
//     const data2 = await res2.json();
//     setLeaves(data2);
//   };

//   useEffect(() => { fetchData(); }, []);

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Welcome, {user.name}</h1>
//       <p>Total Leave: {user.totalLeave}</p>
//       <p>Available Leave: {user.availableLeave}</p>

//       <h2 className="mt-6 text-xl font-semibold">Request Leave</h2>
//       <LeaveForm refreshLeaves={fetchData} />

//       <h2 className="mt-6 text-xl font-semibold">Your Leave Requests</h2>
//       {leaves.map(l => (
//         <div key={l._id} className="border p-4 my-2 rounded">
//           <p>{l.startDate} to {l.endDate}</p>
//           <p>Reason: {l.reason}</p>
//           <p>Status: {l.status}</p>
//           <p>Admin Comment: {l.adminComment || "N/A"}</p>
//         </div>
//       ))}
//     </div>
//   );
// }


"use client";
import { useEffect, useState, useCallback } from "react";
import LeaveForm from "@/components/LeaveForm";
import LeaveCard from "@/components/LeaveCard";

export default function UserDashboard() {
    const [user, setUser] = useState(null);
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [userRes, leavesRes] = await Promise.all([
                fetch("/api/user/me"),
                fetch("/api/leave/my")
            ]);

            if (!userRes.ok) {
                throw new Error(`Failed to fetch user data: ${userRes.status}`);
            }
            if (!leavesRes.ok) {
                throw new Error(`Failed to fetch leave data: ${leavesRes.status}`);
            }

            const [userData, leavesData] = await Promise.all([
                userRes.json(),
                leavesRes.json()
            ]);

            setUser(userData);
            setLeaves(Array.isArray(leavesData) ? leavesData : []);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString();
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "approved":
                return "text-green-600 bg-green-50 border-green-200";
            case "rejected":
                return "text-red-600 bg-red-50 border-red-200";
            case "pending":
                return "text-yellow-600 bg-yellow-50 border-yellow-200";
            default:
                return "text-gray-600 bg-gray-50 border-gray-200";
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-4 w-64"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2 w-48"></div>
                    <div className="h-4 bg-gray-200 rounded mb-6 w-48"></div>
                    <div className="h-6 bg-gray-200 rounded mb-4 w-32"></div>
                    <div className="h-32 bg-gray-200 rounded mb-6"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    <h3 className="font-semibold">Error</h3>
                    <p>{error}</p>
                    <button
                        onClick={fetchData}
                        className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* User Info Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Welcome, {user?.name || "User"}
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">Total Leave Days</p>
                        <p className="text-2xl font-bold text-blue-900">
                            {user?.totalLeave ?? "N/A"}
                        </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">Available Days</p>
                        <p className="text-2xl font-bold text-green-900">
                            {user?.availableLeave ?? "N/A"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Leave Request Form */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Request Leave
                </h2>
                <LeaveForm refreshLeaves={fetchData} />
            </div>

            {/* Leave History */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Your Leave Requests
                    </h2>
                    <span className="text-sm text-gray-500">
                        {leaves.length} request{leaves.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {leaves.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No leave requests found.</p>
                        <p className="text-sm">Submit your first leave request above.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {leaves.map((leave) => (
                            <div
                                key={leave._id}
                                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <h3 className="font-medium text-gray-900">
                                            {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                                        </h3>
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(leave.status)}`}
                                        >
                                            {leave.status || "Pending"}
                                        </span>
                                    </div>
                                    {leave.createdAt && (
                                        <span className="text-sm text-gray-500 mt-1 sm:mt-0">
                                            Requested: {formatDate(leave.createdAt)}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Reason: </span>
                                        <span className="text-sm text-gray-600">
                                            {leave.reason || "No reason provided"}
                                        </span>
                                    </div>

                                    {leave.adminComment && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Admin Comment: </span>
                                            <span className="text-sm text-gray-600">{leave.adminComment}</span>
                                        </div>
                                    )}

                                    {leave.daysRequested && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Days: </span>
                                            <span className="text-sm text-gray-600">{leave.daysRequested}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
           
        </div>
    );
}