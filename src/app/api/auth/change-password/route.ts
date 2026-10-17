import { NextResponse } from "next/server";
import { changeUserPasswordSelf } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { email, currentPassword, newPassword } = await req.json();

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Email, current password, and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters." },
        { status: 400 }
      );
    }

    await changeUserPasswordSelf(email, currentPassword, newPassword);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in /api/auth/change-password:", error);
    const msg = error.message || "Failed to update password.";
    const status = msg.includes("Current password is incorrect") ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
