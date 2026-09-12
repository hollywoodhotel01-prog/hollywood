"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword as firebaseUpdatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

// --- Auth ---------------------------------------------------------------------

export type UserRole = "admin" | "cashier" | "receptionist" | "accountant";

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
  uid: string;
}

// Map of email → role & display name (roles are stored here since Firebase Auth
// doesn't store custom claims in the client SDK without a backend).
export const STAFF_ROSTER: Record<string, { name: string; role: UserRole }> = {
  "admin@hollywoodhotel.rw": { name: "Victor Adonis", role: "admin" },
  "cashier@hollywoodhotel.rw": { name: "Sandra Mbeki", role: "cashier" },
  "reception@hollywoodhotel.rw": { name: "James Osei", role: "receptionist" },
  "accounts@hollywoodhotel.rw": { name: "Grace Mutua", role: "accountant" },
};

// --- Room Bookings ------------------------------------------------------------

export type BookingStatus = "Confirmed" | "Pending" | "Cancelled";

export interface Booking {
  id: string;
  guestName: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  amount: number;
}

const initialBookings: Booking[] = [
  { id: "HH-2026-001", guestName: "Alice Johnson", roomType: "Deluxe Room", checkIn: "2026-07-20", checkOut: "2026-07-23", status: "Confirmed", amount: 360 },
  { id: "HH-2026-002", guestName: "Michael Smith", roomType: "Executive Room", checkIn: "2026-07-15", checkOut: "2026-07-18", status: "Confirmed", amount: 450 },
  { id: "HH-2026-003", guestName: "Sarah Connor", roomType: "Standard Room", checkIn: "2026-07-25", checkOut: "2026-07-27", status: "Pending", amount: 160 },
  { id: "HH-2026-004", guestName: "David Kim", roomType: "Hollywood Suite", checkIn: "2026-08-01", checkOut: "2026-08-05", status: "Confirmed", amount: 1200 },
  { id: "HH-2026-005", guestName: "Emma Brown", roomType: "Deluxe Room", checkIn: "2026-07-18", checkOut: "2026-07-20", status: "Cancelled", amount: 240 },
  { id: "HH-2026-006", guestName: "Robert Hayes", roomType: "Presidential Suite", checkIn: "2026-08-10", checkOut: "2026-08-14", status: "Confirmed", amount: 3200 },
];

export const ROOM_PRICES: Record<string, number> = {
  "Standard Room": 80,
  "Deluxe Room": 120,
  "Executive Room": 150,
  "Hollywood Suite": 300,
  "Presidential Suite": 800,
};

// --- Conference Bookings ------------------------------------------------------

export interface ConferenceBooking {
  id: string;
  contactName: string;
  phone: string;
  eventType: string;
  hall: string;
  guests: number;
  date: string;
  requirements: string;
  status: "Pending" | "Confirmed" | "Declined";
}

const initialConferenceBookings: ConferenceBooking[] = [
  { id: "CB-2026-001", contactName: "Lucia Fernandez", phone: "+250 781 234 567", eventType: "Corporate Meeting", hall: "Executive Boardroom", guests: 20, date: "2026-08-05", requirements: "Projector, whiteboard", status: "Confirmed" },
  { id: "CB-2026-002", contactName: "Peter Nkomo", phone: "+250 782 345 678", eventType: "Training / Workshop", hall: "Grand Ballroom", guests: 120, date: "2026-08-12", requirements: "Tea break catering", status: "Pending" },
];

// --- In-House Guests ----------------------------------------------------------

export interface InHouseGuest {
  id: string;
  fullName: string;
  idNumber: string;
  phone: string;
  nationality: string;
  roomAssigned: string;
  guestCount: number;
  checkIn: string;
  checkOut: string;
  checkedInAt: string;
}

const initialInHouseGuests: InHouseGuest[] = [
  { id: "IG-001", fullName: "Alice Johnson", idNumber: "NID-RW-123456", phone: "+250 700 111 222", nationality: "Rwandan", roomAssigned: "101", guestCount: 1, checkIn: "2026-07-20", checkOut: "2026-07-23", checkedInAt: "2026-07-20T10:30:00Z" },
  { id: "IG-002", fullName: "David Kim", idNumber: "PP-KR-AB123456", phone: "+82 10 1234 5678", nationality: "South Korean", roomAssigned: "401", guestCount: 2, checkIn: "2026-08-01", checkOut: "2026-08-05", checkedInAt: "2026-08-01T14:00:00Z" },
];

// --- Room Records -------------------------------------------------------------

export type RoomStatus = "Available" | "Occupied" | "Cleaning" | "Maintenance";

export interface RoomRecord {
  id: string;
  type: string;
  status: RoomStatus;
  housekeeper: string;
}

const initialRoomsData: RoomRecord[] = [
  { id: "101", type: "Standard Room", status: "Occupied", housekeeper: "Jane Doe" },
  { id: "102", type: "Standard Room", status: "Available", housekeeper: "Jane Doe" },
  { id: "103", type: "Standard Room", status: "Cleaning", housekeeper: "Jane Doe" },
  { id: "201", type: "Deluxe Room", status: "Occupied", housekeeper: "John Smith" },
  { id: "202", type: "Deluxe Room", status: "Available", housekeeper: "John Smith" },
  { id: "203", type: "Deluxe Room", status: "Cleaning", housekeeper: "John Smith" },
  { id: "301", type: "Executive Room", status: "Occupied", housekeeper: "Mary Johnson" },
  { id: "302", type: "Executive Room", status: "Maintenance", housekeeper: "-" },
  { id: "303", type: "Executive Room", status: "Available", housekeeper: "Mary Johnson" },
  { id: "401", type: "Hollywood Suite", status: "Occupied", housekeeper: "Jane Doe" },
  { id: "402", type: "Hollywood Suite", status: "Available", housekeeper: "Jane Doe" },
  { id: "501", type: "Presidential Suite", status: "Available", housekeeper: "Mary Johnson" },
  { id: "502", type: "Presidential Suite", status: "Occupied", housekeeper: "Mary Johnson" },
];

// --- Daily Sales Report -------------------------------------------------------

export interface DailySalesReport {
  date: string;
  totalSales: number;
  totalOrders: number;
  categories: { food: number; drinks: number; roomService: number; bar: number };
  paymentMethods: { cash: number; mobileMoney: number; card: number };
  topItems: { name: string; qty: number; amount: number }[];
  vsYesterday: number;
}

function generateMockReport(): DailySalesReport {
  const food = Math.round(180 + Math.random() * 120);
  const drinks = Math.round(90 + Math.random() * 60);
  const roomService = Math.round(60 + Math.random() * 80);
  const bar = Math.round(140 + Math.random() * 100);
  const total = food + drinks + roomService + bar;
  const cash = Math.round(total * (0.25 + Math.random() * 0.15));
  const mobile = Math.round(total * (0.35 + Math.random() * 0.15));
  const card = total - cash - mobile;
  return {
    date: new Date().toISOString().split("T")[0],
    totalSales: total,
    totalOrders: Math.round(28 + Math.random() * 20),
    categories: { food, drinks, roomService, bar },
    paymentMethods: { cash, mobileMoney: mobile, card },
    topItems: [
      { name: "Grilled Tilapia Platter", qty: Math.round(8 + Math.random() * 6), amount: Math.round(120 + Math.random() * 60) },
      { name: "Hollywood Club Sandwich", qty: Math.round(12 + Math.random() * 8), amount: Math.round(96 + Math.random() * 40) },
      { name: "Signature Cocktail", qty: Math.round(15 + Math.random() * 10), amount: Math.round(135 + Math.random() * 50) },
      { name: "Breakfast Buffet", qty: Math.round(20 + Math.random() * 12), amount: Math.round(100 + Math.random() * 40) },
      { name: "Espresso / Coffee", qty: Math.round(30 + Math.random() * 15), amount: Math.round(60 + Math.random() * 30) },
    ],
    vsYesterday: Math.round(-8 + Math.random() * 24),
  };
}

// --- Context Type -------------------------------------------------------------

interface HotelContextType {
  currentUser: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  // Legacy: kept so login page demo buttons still compile
  demoAccounts: { name: string; email: string; password: string; role: UserRole }[];
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, "id" | "status" | "amount">) => Booking;
  conferenceBookings: ConferenceBooking[];
  addConferenceBooking: (booking: Omit<ConferenceBooking, "id" | "status">) => void;
  inHouseGuests: InHouseGuest[];
  addInHouseGuest: (guest: Omit<InHouseGuest, "id" | "checkedInAt">) => void;
  checkOutGuest: (id: string) => void;
  roomsData: RoomRecord[];
  updateRoomStatus: (roomId: string, status: RoomStatus) => void;
  dailySalesReport: DailySalesReport | null;
  isGeneratingReport: boolean;
  uploadAndGenerateReport: () => void;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

// Staff accounts shown on login page (passwords shown for convenience — these
// are the real Firebase Auth passwords set when accounts were created).
const DEMO_ACCOUNTS = [
  { name: "Victor Adonis", email: "admin@hollywoodhotel.rw", password: "Admin@2050", role: "admin" as UserRole },
  { name: "Sandra Mbeki", email: "cashier@hollywoodhotel.rw", password: "Cashier@2050", role: "cashier" as UserRole },
  { name: "James Osei", email: "reception@hollywoodhotel.rw", password: "Recept@2050", role: "receptionist" as UserRole },
  { name: "Grace Mutua", email: "accounts@hollywoodhotel.rw", password: "Account@2050", role: "accountant" as UserRole },
];

export function HotelProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [conferenceBookings, setConferenceBookings] = useState<ConferenceBooking[]>(initialConferenceBookings);
  const [inHouseGuests, setInHouseGuests] = useState<InHouseGuest[]>(initialInHouseGuests);
  const [roomsData, setRoomsData] = useState<RoomRecord[]>(initialRoomsData);
  const [dailySalesReport, setDailySalesReport] = useState<DailySalesReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser && fbUser.email) {
        const roster = STAFF_ROSTER[fbUser.email.toLowerCase()];
        if (roster) {
          setCurrentUser({ name: roster.name, email: fbUser.email, role: roster.role, uid: fbUser.uid });
        } else {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const fbUser = cred.user;
    const roster = STAFF_ROSTER[fbUser.email!.toLowerCase()];
    if (!roster) {
      await signOut(auth);
      throw new Error("This email is not a registered staff account.");
    }
    const user: AuthUser = { name: roster.name, email: fbUser.email!, role: roster.role, uid: fbUser.uid };
    setCurrentUser(user);
    return user;
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setFirebaseUser(null);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!firebaseUser || !firebaseUser.email) throw new Error("Not authenticated.");
    // Re-authenticate first (Firebase requires recent login for sensitive ops)
    const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
    await reauthenticateWithCredential(firebaseUser, credential);
    await firebaseUpdatePassword(firebaseUser, newPassword);
  };

  const addBooking = (bookingData: Omit<Booking, "id" | "status" | "amount">): Booking => {
    const d1 = new Date(bookingData.checkIn);
    const d2 = new Date(bookingData.checkOut);
    const nights = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)));
    const pricePerNight = ROOM_PRICES[bookingData.roomType] ?? 100;
    const amount = pricePerNight * nights;
    const newBooking: Booking = {
      ...bookingData,
      id: `HH-2026-${String(bookings.length + 1).padStart(3, "0")}`,
      status: "Confirmed",
      amount,
    };
    setBookings((prev) => [newBooking, ...prev]);
    setRoomsData((prev) => {
      const targetIdx = prev.findIndex((r) => r.type === bookingData.roomType && r.status === "Available");
      if (targetIdx === -1) return prev;
      const updated = [...prev];
      updated[targetIdx] = { ...updated[targetIdx], status: "Occupied" };
      return updated;
    });
    return newBooking;
  };

  const addConferenceBooking = (booking: Omit<ConferenceBooking, "id" | "status">) => {
    const newBooking: ConferenceBooking = {
      ...booking,
      id: `CB-2026-${String(conferenceBookings.length + 1).padStart(3, "0")}`,
      status: "Pending",
    };
    setConferenceBookings((prev) => [newBooking, ...prev]);
  };

  const addInHouseGuest = (guest: Omit<InHouseGuest, "id" | "checkedInAt">) => {
    const newGuest: InHouseGuest = {
      ...guest,
      id: `IG-${String(inHouseGuests.length + 1).padStart(3, "0")}`,
      checkedInAt: new Date().toISOString(),
    };
    setInHouseGuests((prev) => [newGuest, ...prev]);
    setRoomsData((prev) =>
      prev.map((r) => (r.id === guest.roomAssigned ? { ...r, status: "Occupied" } : r))
    );
  };

  const checkOutGuest = (id: string) => {
    const guest = inHouseGuests.find((g) => g.id === id);
    setInHouseGuests((prev) => prev.filter((g) => g.id !== id));
    if (guest) {
      setRoomsData((prev) =>
        prev.map((r) => (r.id === guest.roomAssigned ? { ...r, status: "Cleaning" } : r))
      );
    }
  };

  const updateRoomStatus = (roomId: string, status: RoomStatus) => {
    setRoomsData((prev) => prev.map((r) => (r.id === roomId ? { ...r, status } : r)));
  };

  const uploadAndGenerateReport = () => {
    setIsGeneratingReport(true);
    setDailySalesReport(null);
    setTimeout(() => {
      setDailySalesReport(generateMockReport());
      setIsGeneratingReport(false);
    }, 2000);
  };

  return (
    <HotelContext.Provider
      value={{
        currentUser, firebaseUser, authLoading,
        login, logout, changePassword,
        demoAccounts: DEMO_ACCOUNTS,
        bookings, addBooking,
        conferenceBookings, addConferenceBooking,
        inHouseGuests, addInHouseGuest, checkOutGuest,
        roomsData, updateRoomStatus,
        dailySalesReport, isGeneratingReport, uploadAndGenerateReport,
      }}
    >
      {children}
    </HotelContext.Provider>
  );
}

export function useHotel() {
  const context = useContext(HotelContext);
  if (context === undefined) throw new Error("useHotel must be used within a HotelProvider");
  return context;
}

// Backward-compat alias so existing pages importing useBookings still work
export function useBookings() {
  const { bookings, addBooking } = useHotel();
  return { bookings, addBooking };
}

export { HotelProvider as BookingProvider };
