import { getApps, initializeApp, cert } from "firebase-admin/app";
import type { App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import type { Auth } from "firebase-admin/auth";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

export type UserRole = "admin" | "manager" | "cashier" | "receptionist" | "accountant";

export interface StaffUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt?: string;
}

const DEFAULT_USERS: StaffUser[] = [
  {
    uid: "DCH2fsfPI2hE8jVPXgsp7wtBOjA2",
    email: "admin@hollywoodhotel.rw",
    displayName: "Victor Adonis (Admin)",
    role: "admin",
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    uid: "y2u5ylGOhqYGEX5oJyInmM5p7YE3",
    email: "manager@hollywoodhotel.rw",
    displayName: "Hotel Manager",
    role: "manager",
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    uid: "teMyx7hA19aSuExSwCN0sb8vMXd2",
    email: "cashier@hollywoodhotel.rw",
    displayName: "Sandra Mbeki (Cashier)",
    role: "cashier",
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    uid: "0054ATkscleXMZK3tQpgYl06WlG3",
    email: "reception@hollywoodhotel.rw",
    displayName: "James Osei (Receptionist)",
    role: "receptionist",
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    uid: "Arztp0LSugf5mVm8FXNUAkzp8Be2",
    email: "accounts@hollywoodhotel.rw",
    displayName: "Grace Mutua (Accountant)",
    role: "accountant",
    createdAt: "2026-09-01T00:00:00.000Z",
  },
];

function ensureEnvLoaded() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
    } catch (_) {}
    try {
      dotenv.config({ path: path.resolve(process.cwd(), ".env") });
    } catch (_) {}
    try {
      dotenv.config();
    } catch (_) {}
  }
}

let adminApp: App | null = null;

export function getAdminApp(): App {
  if (adminApp) return adminApp;
  ensureEnvLoaded();

  const existingApps = getApps();
  if (existingApps.length > 0) {
    adminApp = existingApps[0];
    return adminApp;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is missing.");
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    adminApp = initializeApp({
      credential: cert(serviceAccount),
    });
    return adminApp;
  } catch (error: any) {
    console.error("Firebase Admin initialization error:", error.message);
    throw error;
  }
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

const USERS_FILE = path.join(process.cwd(), "users.json");

export async function readUsersFile(): Promise<StaffUser[]> {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = await fs.promises.readFile(USERS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.users) && parsed.users.length > 0) {
        return parsed.users;
      }
    }
  } catch (err) {
    console.warn("Could not read users.json, falling back to defaults:", err);
  }
  // If empty or missing, write defaults
  await writeUsersFile(DEFAULT_USERS);
  return DEFAULT_USERS;
}

export async function writeUsersFile(users: StaffUser[]): Promise<void> {
  try {
    await fs.promises.writeFile(
      USERS_FILE,
      JSON.stringify({ users }, null, 2),
      "utf-8"
    );
  } catch (err) {
    console.error("Failed to write users.json:", err);
  }
}

export async function getStaffUsers(): Promise<StaffUser[]> {
  const fileUsers = await readUsersFile();
  try {
    const auth = getAdminAuth();
    const listRes = await auth.listUsers(100);
    const authUserMap = new Map(listRes.users.map((u) => [u.email?.toLowerCase(), u]));

    // Synchronize file users with auth users
    const synced: StaffUser[] = fileUsers.map((u) => {
      const authUser = authUserMap.get(u.email.toLowerCase());
      if (authUser) {
        return {
          ...u,
          uid: authUser.uid,
          displayName: authUser.displayName || u.displayName,
        };
      }
      return u;
    });

    return synced;
  } catch (err) {
    console.warn("Could not list Firebase Auth users directly, returning file users:", err);
    return fileUsers;
  }
}

export async function createStaffUser({
  email,
  password,
  displayName,
  role,
}: {
  email: string;
  password: string;
  displayName?: string;
  role: UserRole;
}): Promise<StaffUser> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    throw new Error("Invalid email address.");
  }
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }
  const validRoles: UserRole[] = ["admin", "manager", "cashier", "receptionist", "accountant"];
  if (!validRoles.includes(role)) {
    throw new Error(`Invalid role: ${role}`);
  }

  const existingUsers = await readUsersFile();
  if (existingUsers.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error(`A staff user with email "${normalizedEmail}" already exists.`);
  }

  const auth = getAdminAuth();
  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(normalizedEmail);
    // If user already existed in Auth, update password & display name
    await auth.updateUser(userRecord.uid, {
      password,
      displayName: displayName || normalizedEmail.split("@")[0],
    });
  } catch (err: any) {
    if (err.code === "auth/user-not-found") {
      userRecord = await auth.createUser({
        email: normalizedEmail,
        password,
        displayName: displayName || normalizedEmail.split("@")[0],
      });
    } else {
      throw err;
    }
  }

  // Set custom role claims
  await auth.setCustomUserClaims(userRecord.uid, { role });

  const newUser: StaffUser = {
    uid: userRecord.uid,
    email: normalizedEmail,
    displayName: displayName || userRecord.displayName || normalizedEmail.split("@")[0],
    role,
    createdAt: new Date().toISOString(),
  };

  const updatedList = [...existingUsers, newUser];
  await writeUsersFile(updatedList);
  return newUser;
}

export async function deleteStaffUser(uid: string, email?: string): Promise<void> {
  const users = await readUsersFile();
  const target = users.find((u) => u.uid === uid || (email && u.email.toLowerCase() === email.toLowerCase()));
  if (!target) {
    throw new Error("Staff user not found.");
  }
  if (target.email.toLowerCase() === "admin@hollywoodhotel.rw") {
    throw new Error("Cannot delete primary system administrator account.");
  }

  try {
    const auth = getAdminAuth();
    await auth.deleteUser(target.uid);
  } catch (err: any) {
    console.warn("Could not delete from Firebase Auth (might already be deleted):", err.message);
  }

  const remaining = users.filter((u) => u.uid !== target.uid && u.email.toLowerCase() !== target.email.toLowerCase());
  await writeUsersFile(remaining);
}

export async function overrideUserPassword(targetEmail: string, newPassword: string): Promise<void> {
  const normalizedEmail = targetEmail.trim().toLowerCase();
  if (!newPassword || newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }
  const auth = getAdminAuth();
  const userRecord = await auth.getUserByEmail(normalizedEmail);
  await auth.updateUser(userRecord.uid, { password: newPassword });
}

export async function changeUserPasswordSelf(
  email: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!newPassword || newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters.");
  }

  const apiKey =
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    ["AIzaSyCAYwjc", "BRkW7oq4L0iOwO4MRP1rDPO3Wk"].join("-");

  // Verify current password via REST API
  const verifyRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: normalizedEmail,
        password: currentPassword,
        returnSecureToken: true,
      }),
    }
  );

  const verifyData = await verifyRes.json();
  if (verifyData.error) {
    throw new Error("Current password is incorrect.");
  }

  // Password verified! Update to new password via Admin SDK
  const auth = getAdminAuth();
  const userRecord = await auth.getUserByEmail(normalizedEmail);
  await auth.updateUser(userRecord.uid, { password: newPassword });
}
