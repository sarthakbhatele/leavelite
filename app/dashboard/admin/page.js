// "use client";
// import { useEffect, useState } from "react";

// export default function AdminDashboard() {
//   const [leaves, setLeaves] = useState([]);

//   const fetchLeaves = async () => {
//     const res = await fetch("/api/leave/all");
//     const data = await res.json();
//     setLeaves(data);
//   };

//   const handleAction = async (id, action) => {
//     const comment = prompt("Enter a short comment");
//     if (!comment) return;
//     await fetch("/api/leave/update", {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ leaveId: id, action, comment }),
//     });
//     fetchLeaves();
//   };

//   useEffect(() => { fetchLeaves(); }, []);

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
//       {leaves.map(l => (
//         <div key={l._id} className="border p-4 my-2 rounded">
//           <p>User: {l.user.name}</p>
//           <p>{l.startDate} to {l.endDate}</p>
//           <p>Reason: {l.reason}</p>
//           {l.document && <a href={l.document} target="_blank" className="text-blue-600">View Document</a>}
//           <div className="mt-2">
//             <button onClick={() => handleAction(l._id, "approve")} className="px-3 py-1 bg-green-500 text-white mr-2 rounded">Approve</button>
//             <button onClick={() => handleAction(l._id, "reject")} className="px-3 py-1 bg-red-500 text-white rounded">Reject</button>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }


// "use client";
// import { useEffect, useState } from "react";

// export default function AdminDashboard() {
//     const [leaves, setLeaves] = useState([]);
//     const [selected, setSelected] = useState(null);

//     const fetchLeaves = async () => {
//         const res = await fetch("/api/leave/all");
//         const data = await res.json();
//         setLeaves(data);
//     };

//     useEffect(() => { fetchLeaves(); }, []);

//     const handleAction = async (id, action) => {
//         const comment = prompt("Enter a short comment");
//         if (comment === null) return;
//         await fetch("/api/leave/update", {
//             method: "PATCH",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ leaveId: id, action, comment }),
//         });
//         fetchLeaves();
//         setSelected(null);
//     };

//     return (
//         <div className="p-6">
//             <h1 className="text-2xl font-bold mb-4">Admin - All Leaves</h1>

//             <table className="w-full table-auto border">
//                 <thead>
//                     <tr className="bg-gray-100">
//                         <th className="p-2">User</th>
//                         <th className="p-2">Dates</th>
//                         {/* <th className="p-2">Days</th> */}
//                         <th className="p-2">Reason</th>
//                         <th className="p-2">Status</th>
//                         <th className="p-2">Action</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {leaves.map(l => (
//                         <tr key={l._id} className="hover:bg-gray-50">
//                             <td className="p-2">{l.user?.name}</td>
//                             <td className="p-2">{new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</td>
//                             {/* <td className="p-2">{l.days}</td> */}
//                             <td className="p-2">{l.reason}</td>
//                             <td className="p-2">{l.status}</td>
//                             <td className="p-2">
//                                 <button onClick={() => setSelected(l)} className="px-2 py-1 bg-blue-600 text-white rounded">View</button>
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>

//             {selected && (
//                 <div className="fixed inset-0 flex items-center justify-center bg-background bg-opacity-50">
//                     <div className="bg-white p-6 rounded shadow-md w-[600px]">
//                         <h2 className="text-xl font-bold mb-2">{selected.user.name} — {selected.days} day(s)</h2>
//                         <p>{new Date(selected.startDate).toLocaleDateString()} → {new Date(selected.endDate).toLocaleDateString()}</p>
//                         <p className="mt-2">{selected.reason}</p>
//                         {selected.document && <a href={selected.document} target="_blank" className="text-blue-600">View document</a>}
//                         <div className="mt-4 flex justify-end gap-2">
//                             <button onClick={() => handleAction(selected._id, "reject")} className="px-3 py-1 bg-red-500 text-white rounded">Reject</button>
//                             <button onClick={() => handleAction(selected._id, "approve")} className="px-3 py-1 bg-green-500 text-white rounded">Approve</button>
//                             <button onClick={() => setSelected(null)} className="px-3 py-1 bg-gray-300 rounded">Close</button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

// // claude v1
"use client";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
    const [leaves, setLeaves] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'text-green-600 bg-green-50';
            case 'rejected': return 'text-red-600 bg-red-50';
            case 'pending': return 'text-yellow-600 bg-yellow-50';
            default: return 'text-gray-600 bg-gray-50';
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

    if (loading && leaves.length === 0) {
        return (
            <div className="p-6 flex items-center justify-center min-h-64">
                <div className="text-gray-500">Loading leaves...</div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
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
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(leave.status)}`}>
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

            {/* Modal */}
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
                                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selected.status)}`}>
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
                                        <a 
                                            href={selected.document} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            📄 View Document
                                        </a>
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
                                {selected.status === 'pending' && (
                                    <>
                                        <button 
                                            onClick={() => handleAction(selected._id, "reject")} 
                                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            Reject
                                        </button>
                                        <button 
                                            onClick={() => handleAction(selected._id, "approve")} 
                                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            Approve
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
