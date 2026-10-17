import { NextResponse } from "next/server";
import {
  getStaffUsers,
  createStaffUser,
  deleteStaffUser,
  UserRole,
} from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const users = await getStaffUsers();
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, displayName, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, error: "Email, password, and role are required." },
        { status: 400 }
      );
    }

    const newUser = await createStaffUser({
      email,
      password,
      displayName,
      role: role as UserRole,
    });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create user" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");
    const email = searchParams.get("email") || undefined;

    if (!uid && !email) {
      return NextResponse.json(
        { success: false, error: "User UID or Email is required for deletion." },
        { status: 400 }
      );
    }

    await deleteStaffUser(uid || "", email);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/admin/users error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete user" },
      { status: 400 }
    );
  }
}
