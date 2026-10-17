import { NextResponse } from "next/server";
import { overrideUserPassword } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { targetEmail, newPassword } = await req.json();

    if (!targetEmail || !newPassword) {
      return NextResponse.json({ error: "Missing email or new password" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    await overrideUserPassword(targetEmail, newPassword);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error changing password via Admin SDK:", error);
    return NextResponse.json({ error: error.message || "Failed to update password" }, { status: 500 });
  }
}
