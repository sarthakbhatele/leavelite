// "use client";

// export default function LeaveCard({ leave, onAction }) {
//   return (
//     <div className="border p-4 my-2 rounded shadow-sm">
//       <p><strong>User:</strong> {leave.user?.name || "You"}</p>
//       <p><strong>Dates:</strong> {leave.startDate} to {leave.endDate}</p>
//       <p><strong>Reason:</strong> {leave.reason}</p>
//       {leave.document && (
//         <p>
//           <strong>Document:</strong>{" "}
//           <a href={leave.document} target="_blank" className="text-blue-600">View</a>
//         </p>
//       )}
//       <p><strong>Status:</strong> {leave.status}</p>
//       {leave.adminComment && <p><strong>Admin Comment:</strong> {leave.adminComment}</p>
//       }

//       {onAction && (
//         <div className="mt-2 flex gap-2">
//           <button
//             className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
//             onClick={() => onAction(leave._id, "approve")}
//           >
//             Approve
//           </button>
//           <button
//             className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
//             onClick={() => onAction(leave._id, "reject")}
//           >
//             Reject
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }


// "use client";

// export default function LeaveCard({ leave, onAction }) {
//     return (
//         <div className="border p-4 my-3 rounded-xl shadow-md bg-white">
//             {/* User Name */}
//             <p className="text-lg font-semibold">
//                 <strong>User:</strong> {leave.user?.name || "You"}
//             </p>

//             {/* Leave Dates */}
//             <p className="text-gray-700">
//                 <strong>Dates:</strong> {leave.startDate} → {leave.endDate}
//             </p>

//             {/* Reason */}
//             <p className="text-gray-700">
//                 <strong>Reason:</strong> {leave.reason}
//             </p>

//             {/* Document Link */}
//             {leave.document && (
//                 <p>
//                     <strong>Document:</strong>{" "}
//                     <a
//                         href={leave.document}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-blue-600 underline"
//                     >
//                         View
//                     </a>
//                 </p>
//             )}

//             {/* Status Badge */}
//             <div className="mt-2">
//                 <strong>Status: </strong>
//                 <span
//                     className={`px-2 py-1 rounded text-sm font-medium ${leave.status === "Pending"
//                             ? "bg-yellow-100 text-yellow-800"
//                             : leave.status === "Approved"
//                                 ? "bg-green-100 text-green-800"
//                                 : "bg-red-100 text-red-800"
//                         }`}
//                 >
//                     {leave.status}
//                 </span>
//             </div>

//             {/* Admin Comment */}
//             {leave.adminComment && (
//                 <p className="mt-1 text-gray-600">
//                     <strong>Admin Comment:</strong> {leave.adminComment}
//                 </p>
//             )}

//             {/* Action Buttons (only visible for Admins if onAction exists) */}
//             {onAction && (
//                 <div className="mt-3 flex gap-3">
//                     <button
//                         className="px-4 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
//                         onClick={() => onAction(leave._id, "approve")}
//                     >
//                         Approve
//                     </button>
//                     <button
//                         className="px-4 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
//                         onClick={() => onAction(leave._id, "reject")}
//                     >
//                         Reject
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// }


"use client";
import { useState, memo } from "react";

const LeaveCard = memo(({ leave, onAction, showUserName = false, isAdmin = false }) => {
    const [isActioning, setIsActioning] = useState(false);
    const [showFullReason, setShowFullReason] = useState(false);

    // Format dates consistently
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Calculate duration between dates
    const calculateDuration = (startDate, endDate) => {
        if (!startDate || !endDate) return null;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    // Get status styling
    const getStatusStyle = (status) => {
        const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border";
        switch (status?.toLowerCase()) {
            case "pending":
                return `${baseClasses} bg-yellow-50 text-yellow-800 border-yellow-200`;
            case "approved":
                return `${baseClasses} bg-green-50 text-green-800 border-green-200`;
            case "rejected":
                return `${baseClasses} bg-red-50 text-red-800 border-red-200`;
            default:
                return `${baseClasses} bg-gray-50 text-gray-800 border-gray-200`;
        }
    };

    // Get priority indicator
    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case "high":
                return "border-l-red-500";
            case "medium":
                return "border-l-yellow-500";
            case "low":
                return "border-l-green-500";
            default:
                return "border-l-gray-300";
        }
    };

    // Handle action with loading state
    const handleAction = async (action) => {
        if (!onAction || isActioning) return;
        
        setIsActioning(true);
        try {
            await onAction(leave._id, action);
        } catch (error) {
            console.error(`Error ${action}ing leave:`, error);
        } finally {
            setIsActioning(false);
        }
    };

    // Truncate long text
    const truncateText = (text, maxLength = 100) => {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    };

    const duration = calculateDuration(leave.startDate, leave.endDate);
    const isLongReason = leave.reason && leave.reason.length > 100;

    return (
        <div className={`
            relative border-l-4 ${getPriorityColor(leave.priority)} 
            bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 
            p-5 my-3 border border-gray-100
        `}>
            {/* Header Section */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    {showUserName && (
                        <div className="flex items-center mb-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-2">
                                {leave.user?.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <span className="font-semibold text-gray-900">
                                {leave.user?.name || "Unknown User"}
                            </span>
                        </div>
                    )}
                    
                    {/* Leave Type Badge */}
                    {leave.leaveType && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md mb-2">
                            {leave.leaveType}
                        </span>
                    )}
                </div>

                {/* Status Badge */}
                <div className="flex items-center space-x-2">
                    {leave.priority && (
                        <span className={`
                            text-xs px-2 py-1 rounded-full font-medium
                            ${leave.priority.toLowerCase() === 'high' ? 'bg-red-100 text-red-700' :
                              leave.priority.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'}
                        `}>
                            {leave.priority}
                        </span>
                    )}
                    <span className={getStatusStyle(leave.status)}>
                        {leave.status || "Pending"}
                    </span>
                </div>
            </div>

            {/* Dates Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Start Date</p>
                    <p className="font-medium text-gray-900">{formatDate(leave.startDate)}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">End Date</p>
                    <p className="font-medium text-gray-900">{formatDate(leave.endDate)}</p>
                </div>
                {duration && (
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Duration</p>
                        <p className="font-medium text-gray-900">
                            {duration} day{duration !== 1 ? 's' : ''}
                        </p>
                    </div>
                )}
            </div>

            {/* Reason Section */}
            {leave.reason && (
                <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Reason</p>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {showFullReason || !isLongReason 
                                ? leave.reason 
                                : truncateText(leave.reason)
                            }
                        </p>
                        {isLongReason && (
                            <button
                                onClick={() => setShowFullReason(!showFullReason)}
                                className="text-blue-600 text-xs hover:text-blue-800 mt-2 font-medium"
                            >
                                {showFullReason ? "Show less" : "Show more"}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Document Section */}
            {leave.document && (
                <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Supporting Document</p>
                    <a
                        href={leave.document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span>View Document</span>
                    </a>
                </div>
            )}

            {/* Admin Comment */}
            {leave.adminComment && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">Admin Response</p>
                    <p className="text-sm text-blue-700">{leave.adminComment}</p>
                </div>
            )}

            {/* Timestamps */}
            <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                {leave.createdAt && (
                    <span>Submitted: {formatDate(leave.createdAt)}</span>
                )}
                {leave.updatedAt && leave.updatedAt !== leave.createdAt && (
                    <span>Updated: {formatDate(leave.updatedAt)}</span>
                )}
            </div>

            {/* Action Buttons */}
            {onAction && isAdmin && leave.status?.toLowerCase() === 'pending' && (
                <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-100">
                    <button
                        className={`
                            flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium
                            hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all duration-200
                        `}
                        onClick={() => handleAction("approve")}
                        disabled={isActioning}
                    >
                        {isActioning ? "Processing..." : "Approve"}
                    </button>
                    <button
                        className={`
                            flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium
                            hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all duration-200
                        `}
                        onClick={() => handleAction("reject")}
                        disabled={isActioning}
                    >
                        {isActioning ? "Processing..." : "Reject"}
                    </button>
                </div>
            )}

            {/* User Actions for their own leaves */}
            {!isAdmin && leave.status?.toLowerCase() === 'pending' && (
                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                        className={`
                            px-4 py-2 bg-gray-600 text-white rounded-lg font-medium text-sm
                            hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all duration-200
                        `}
                        onClick={() => handleAction("cancel")}
                        disabled={isActioning}
                    >
                        {isActioning ? "Canceling..." : "Cancel Request"}
                    </button>
                </div>
            )}
        </div>
    );
});

LeaveCard.displayName = 'LeaveCard';

export default LeaveCard;