import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Return upload configuration for client-side uploads
    const signature = {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      uploadPreset: "leavelite-pdf", // Your unsigned preset
      folder: "leave-applications"
    };
    
    if (!signature.cloudName) {
      return NextResponse.json(
        { error: 'Cloudinary configuration missing' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json(signature);
  } catch (error) {
    console.error('Error getting upload signature:', error);
    return NextResponse.json(
      { error: 'Failed to get upload signature' }, 
      { status: 500 }
    );
  }
}
