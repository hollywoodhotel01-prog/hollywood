import { NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Initialize Firebase Admin
if (!getApps().length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      console.warn("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is missing.");
    } else {
      const serviceAccount = JSON.parse(serviceAccountKey);
      initializeApp({
        credential: cert(serviceAccount)
      });
    }
  } catch (error: any) {
    console.error("Firebase Admin initialization error:", error.message);
  }
}

export async function POST(req: Request) {
  try {
    if (!getApps().length) {
      return NextResponse.json(
        { error: "Firebase Admin is not initialized. Please add FIREBASE_SERVICE_ACCOUNT_KEY to .env.local." },
        { status: 500 }
      );
    }

    const { targetEmail, newPassword } = await req.json();

    if (!targetEmail || !newPassword) {
      return NextResponse.json({ error: "Missing email or new password" }, { status: 400 });
    }

    const auth = getAuth();
    // Get the user by email
    const userRecord = await auth.getUserByEmail(targetEmail);
    
    // Update the password
    await auth.updateUser(userRecord.uid, {
      password: newPassword
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error changing password via Admin SDK:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
