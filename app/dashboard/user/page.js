"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import LeaveForm from "@/components/LeaveForm";
import AuthGuard from "@/components/AuthGuard";

export default function UserDashboard() {
    const [user, setUser] = useState(null);
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPdf, setSelectedPdf] = useState(null);

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

    // Only fetch data on component mount
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Manual refresh function
    const handleManualRefresh = useCallback(() => {
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

    // PDF Preview Modal
    const PdfPreviewModal = ({ pdfUrl, onClose }) => (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">PDF Preview</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>
                <div className="p-4">
                    <iframe
                        src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                        className="w-full h-96 border border-gray-200 rounded-lg"
                        title="PDF Preview"
                    />
                    <div className="mt-4 flex justify-end space-x-3">
                        <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Open in New Tab
                        </a>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

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
        <AuthGuard>
            <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen">
                <div className="p-6 max-w-6xl mx-auto">
                    {/* User Info Section */}
                    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Welcome, {user?.name || "User"}
                        </h1>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <p className="text-sm text-purple-600 font-medium">Pending Requests</p>
                                <p className="text-2xl font-bold text-purple-900">
                                    {leaves.filter(l => l.status?.toLowerCase() === 'pending').length}
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
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-500">
                                    {leaves.length} request{leaves.length !== 1 ? "s" : ""}
                                </span>
                                <button
                                    onClick={handleManualRefresh}
                                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Refresh
                                </button>
                            </div>
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

                                            {leave.days && (
                                                <div>
                                                    <span className="text-sm font-medium text-gray-700">Duration: </span>
                                                    <span className="text-sm text-gray-600">
                                                        {leave.days} day{leave.days !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            )}

                                            {leave.adminComment && (
                                                <div>
                                                    <span className="text-sm font-medium text-gray-700">Admin Comment: </span>
                                                    <span className="text-sm text-gray-600">{leave.adminComment}</span>
                                                </div>
                                            )}

                                            {/* Document Section */}
                                            {leave.document && (
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm font-medium text-gray-700">Document: </span>
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => setSelectedPdf(leave.document)}
                                                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                                                        >
                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            Preview
                                                        </button>
                                                        <a
                                                            href={leave.document}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                                                        >
                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                            </svg>
                                                            Download
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* PDF Preview Modal */}
                    {selectedPdf && (
                        <PdfPreviewModal
                            pdfUrl={selectedPdf}
                            onClose={() => setSelectedPdf(null)}
                        />
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}