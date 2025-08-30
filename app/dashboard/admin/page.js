"use client";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
    const [leaves, setLeaves] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch("/api/leave/all");
            if (!res.ok) throw new Error('Failed to fetch leaves');
            const data = await res.json();
            setLeaves(data || []);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching leaves:', err);
        } finally {
            setLoading(false);
        }
    };

    // Only fetch data on component mount
    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleAction = async (id, action) => {
        const comment = prompt(`Enter a comment for ${action}ing this leave:`);
        if (comment === null) return;

        if (!comment.trim()) {
            alert('Please enter a comment');
            return;
        }

        setIsUpdating(true);
        try {
            const res = await fetch("/api/leave/update", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ leaveId: id, action, comment: comment.trim() }),
            });

            if (!res.ok) throw new Error(`Failed to ${action} leave`);

            await fetchLeaves();
            setSelected(null);
        } catch (err) {
            alert(`Error: ${err.message}`);
            console.error('Error updating leave:', err);
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'text-green-600 bg-green-50 border-green-200';
            case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
            case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return 'Invalid Date';
        }
    };

    // PDF Preview Modal
    const PdfPreviewModal = ({ pdfUrl, onClose }) => (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">PDF Document Preview</h3>
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
                        className="w-full h-[70vh] border border-gray-200 rounded-lg"
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

    if (loading && leaves.length === 0) {
        return (
            <div className="p-6 flex items-center justify-center min-h-64">
                <div className="text-gray-500">Loading leaves...</div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen">
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-400">Leave Management Dashboard</h1>
                    <button
                        onClick={fetchLeaves}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600">Error: {error}</p>
                    </div>
                )}

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-gray-900">{leaves.length}</div>
                        <div className="text-sm text-gray-500">Total Requests</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <div className="text-2xl font-bold text-yellow-700">
                            {leaves.filter(l => l.status?.toLowerCase() === 'pending').length}
                        </div>
                        <div className="text-sm text-yellow-600">Pending</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="text-2xl font-bold text-green-700">
                            {leaves.filter(l => l.status?.toLowerCase() === 'approved').length}
                        </div>
                        <div className="text-sm text-green-600">Approved</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="text-2xl font-bold text-red-700">
                            {leaves.filter(l => l.status?.toLowerCase() === 'rejected').length}
                        </div>
                        <div className="text-sm text-red-600">Rejected</div>
                    </div>
                </div>

                {leaves.length === 0 && !loading ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-lg">No leave requests found</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {leaves.map(leave => (
                                        <tr key={leave._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">
                                                    {leave.user?.name || 'Unknown User'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {leave.user?.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div>{formatDate(leave.startDate)}</div>
                                                <div className="text-gray-500">to {formatDate(leave.endDate)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <span className="font-medium">{leave.days || 0}</span> day{leave.days !== 1 ? 's' : ''}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className="max-w-xs truncate" title={leave.reason}>
                                                    {leave.reason || 'No reason provided'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {leave.document ? (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => setSelectedPdf(leave.document)}
                                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                        >
                                                            Preview
                                                        </button>
                                                        <a
                                                            href={leave.document}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                                                        >
                                                            Open
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">No document</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(leave.status)}`}>
                                                    {leave.status || 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={() => setSelected(leave)}
                                                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Leave Details Modal */}
                {selected && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            {selected.user?.name || 'Unknown User'}
                                        </h2>
                                        <p className="text-sm text-gray-500">{selected.user?.email}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelected(null)}
                                        className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                            <p className="text-sm text-gray-900">{formatDate(selected.startDate)}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">End Date</label>
                                            <p className="text-sm text-gray-900">{formatDate(selected.endDate)}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Duration</label>
                                        <p className="text-sm text-gray-900">
                                            <span className="font-medium">{selected.days || 0}</span> day{selected.days !== 1 ? 's' : ''}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Current Status</label>
                                        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(selected.status)}`}>
                                            {selected.status || 'Unknown'}
                                        </span>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-sm text-gray-900">{selected.reason || 'No reason provided'}</p>
                                        </div>
                                    </div>

                                    {selected.document && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Supporting Document</label>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => setSelectedPdf(selected.document)}
                                                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                >
                                                    📄 Preview Document
                                                </button>
                                                <a
                                                    href={selected.document}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                                >
                                                    🔗 Open in New Tab
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={() => setSelected(null)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Close
                                    </button>
                                    {selected.status?.toLowerCase() === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleAction(selected._id, "reject")}
                                                disabled={isUpdating}
                                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                                            >
                                                {isUpdating ? "Processing..." : "Reject"}
                                            </button>
                                            <button
                                                onClick={() => handleAction(selected._id, "approve")}
                                                disabled={isUpdating}
                                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                            >
                                                {isUpdating ? "Processing..." : "Approve"}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PDF Preview Modal */}
                {selectedPdf && (
                    <PdfPreviewModal
                        pdfUrl={selectedPdf}
                        onClose={() => setSelectedPdf(null)}
                    />
                )}
            </div>
        </div>
    );
}
