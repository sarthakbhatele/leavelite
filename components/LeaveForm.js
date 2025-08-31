"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { uploadToCloudinary, validateFile } from "@/utils/clientUpload";

export default function LeaveForm({ refreshLeaves }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [document, setDocument] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [availableLeaves, setAvailableLeaves] = useState(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [debugInfo, setDebugInfo] = useState(""); // Added for debugging
  const fileInputRef = useRef(null);

  // Fetch user's available leave balance
  useEffect(() => {
    const fetchLeaveBalance = async () => {
      try {
        setDebugInfo("Fetching leave balance...");

        // Try multiple possible endpoints
        const endpoints = [
          "/api/profile",
          "/api/leave/my"
        ];

        let userData = null;
        let successEndpoint = null;

        for (const endpoint of endpoints) {
          try {
            console.log(`Trying endpoint: ${endpoint}`);
            const res = await fetch(endpoint);
            const data = await res.json();

            console.log(`Response from ${endpoint}:`, { status: res.status, data });

            if (res.ok && data) {
              userData = data;
              successEndpoint = endpoint;
              break;
            }
          } catch (err) {
            console.log(`Failed to fetch from ${endpoint}:`, err.message);
          }
        }

        if (!userData) {
          // If no endpoint works, let's try to get user info differently
          // This is a fallback - you might need to adjust based on your auth setup
          setDebugInfo("No user endpoint found. Check API routes.");
          console.log("Available routes check needed");
          setAvailableLeaves(12); // Temporary fallback for testing
          return;
        }

        console.log("Final userData:", userData);

        // Handle different response structures (matching your User model)
        let leaves = null;
        if (userData.user?.availableLeave !== undefined) {
          leaves = userData.user.availableLeave;
        } else if (userData.availableLeave !== undefined) {
          leaves = userData.availableLeave;
        } else if (userData.user?.availableLeaves !== undefined) {
          leaves = userData.user.availableLeaves;
        } else if (userData.availableLeaves !== undefined) {
          leaves = userData.availableLeaves;
        }

        console.log("Extracted leaves:", leaves);
        setDebugInfo(`Success! Endpoint: ${successEndpoint}, Leaves: ${leaves}`);
        setAvailableLeaves(leaves || 0);

      } catch (err) {
        console.error("Error fetching leave balance:", err);
        setDebugInfo(`Error: ${err.message}`);
        // Remove this fallback once API is working
        setAvailableLeaves(0); // Don't set default here, let it show the actual error
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchLeaveBalance();
  }, []);

  // Calculate days between dates
  const calculateDays = useCallback((start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, []);

  // Check if form should be disabled
  const isFormDisabled = availableLeaves <= 0;
  const requestedDays = calculateDays(startDate, endDate);
  const exceedsBalance = requestedDays > availableLeaves;

  // Handle drag and drop
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  // Handle file selection
  const handleFileSelect = (file) => {
    setError("");

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      setError(validation.errors.join(' '));
      return;
    }

    setDocument(file);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Check if form should be disabled
    if (isFormDisabled) {
      setError("You have no available leaves remaining.");
      return;
    }

    // Validate form
    if (!startDate || !endDate || !reason) {
      setError("Please fill in all required fields.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date cannot be after end date.");
      return;
    }

    const days = calculateDays(startDate, endDate);
    if (days > 30) {
      setError("Leave request cannot exceed 30 days.");
      return;
    }

    if (days > availableLeaves) {
      setError(`Insufficient leave balance. You have ${availableLeaves} days available, but requested ${days} days.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let documentUrl = "";

      // Upload document if provided
      if (document) {
        setUploadProgress(50);
        documentUrl = await uploadToCloudinary(document);
        setUploadProgress(100);
      }

      // Submit leave request
      const res = await fetch("/api/leave/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate,
          endDate,
          reason,
          document: documentUrl,
          days
        }),
      });

      const data = await res.json();
      console.log("Leave request response:", { status: res.status, data });

      if (res.ok) {
        setSuccess("Leave request submitted successfully!");
        // Reset form
        setStartDate("");
        setEndDate("");
        setReason("");
        setDocument(null);
        setUploadProgress(0);
        // Refresh leaves list and potentially update balance
        refreshLeaves();
      } else {
        setError(data.msg || data.error || "Failed to submit leave request");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.message || "An error occurred");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Remove selected file
  const removeFile = () => {
    setDocument(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (isLoadingBalance) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading leave balance...</span>
        {debugInfo && <div className="text-xs text-gray-500 mt-2">{debugInfo}</div>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug Information - Remove this in production */}
      {/* <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-xs text-gray-600">
        <p><strong>Debug Info:</strong> {debugInfo}</p>
        <p><strong>Available Leaves:</strong> {availableLeaves}</p>
        <p><strong>Form Disabled:</strong> {isFormDisabled ? "Yes" : "No"}</p>
      </div> */}

      {/* Leave Balance Display */}
      <div className={`p-4 rounded-lg border ${availableLeaves <= 0
          ? 'bg-red-50 border-red-200'
          : availableLeaves <= 5
            ? 'bg-yellow-50 border-yellow-200'
            : 'bg-green-50 border-green-200'
        }`}>
        <div className="flex items-center space-x-2">
          <svg className={`h-5 w-5 ${availableLeaves <= 0
              ? 'text-red-500'
              : availableLeaves <= 5
                ? 'text-yellow-500'
                : 'text-green-500'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className={`text-sm font-medium ${availableLeaves <= 0
              ? 'text-red-800'
              : availableLeaves <= 5
                ? 'text-yellow-800'
                : 'text-green-800'
            }`}>
            Available Leave Balance: {availableLeaves} day{availableLeaves !== 1 ? 's' : ''}
          </span>
        </div>
        {availableLeaves <= 0 && (
          <p className="text-sm text-red-700 mt-1">
            You have no available leaves remaining. Please contact HR for more information.
          </p>
        )}
      </div>

      {/* Disable form if no leaves available */}
      <div className={isFormDisabled ? 'opacity-50 pointer-events-none' : ''}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
                min={new Date().toISOString().split('T')[0]}
                disabled={isFormDisabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
                min={startDate || new Date().toISOString().split('T')[0]}
                disabled={isFormDisabled}
              />
            </div>
          </div>

          {/* Days Calculation Display */}
          {startDate && endDate && (
            <div className={`border rounded-lg p-3 ${exceedsBalance
                ? 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200'
              }`}>
              <p className={`text-sm ${exceedsBalance ? 'text-red-800' : 'text-blue-800'
                }`}>
                <span className="font-medium">Duration:</span> {requestedDays} day{requestedDays !== 1 ? 's' : ''}
                {exceedsBalance && (
                  <span className="block text-red-600 text-xs mt-1">
                    ⚠️ This exceeds your available leave balance of {availableLeaves} days
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Leave <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a detailed reason for your leave request..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              required
              disabled={isFormDisabled}
            />
          </div>

          {/* Document Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supporting Document (Optional)
            </label>

            {/* Drag & Drop Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isFormDisabled
                  ? 'border-gray-200 bg-gray-50'
                  : dragActive
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              onDragEnter={!isFormDisabled ? handleDrag : undefined}
              onDragLeave={!isFormDisabled ? handleDrag : undefined}
              onDragOver={!isFormDisabled ? handleDrag : undefined}
              onDrop={!isFormDisabled ? handleDrop : undefined}
            >
              {!document ? (
                <div>
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      <span
                        className={`font-medium ${isFormDisabled ? 'text-gray-400' : 'text-blue-600 hover:text-blue-500 cursor-pointer'}`}
                        onClick={!isFormDisabled ? () => fileInputRef.current?.click() : undefined}
                      >
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF files only, max 5MB</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{document.name}</p>
                    <p className="text-xs text-gray-500">{(document.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    disabled={isFormDisabled}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
              disabled={isFormDisabled}
            />
          </div>

          {/* Upload Progress */}
          {isUploading && uploadProgress > 0 && (
            <div className="bg-gray-100 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          {/* Error and Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              <p className="text-sm">{success}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading || isFormDisabled || exceedsBalance}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading
              ? "Submitting..."
              : isFormDisabled
                ? "No Leaves Available"
                : exceedsBalance
                  ? "Exceeds Available Balance"
                  : "Submit Leave Request"
            }
          </button>
        </form>
      </div>
    </div>
  );
}