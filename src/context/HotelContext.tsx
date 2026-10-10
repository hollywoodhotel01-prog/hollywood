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

export type UserRole = "admin" | "manager" | "cashier" | "receptionist" | "accountant";

export interface AuthUser {
  email: string;
  role: UserRole;
  uid: string;
}

export const STAFF_ROSTER: Record<string, { role: UserRole }> = {
  "admin@hollywoodhotel.rw": { role: "admin" },
  "manager@hollywoodhotel.rw": { role: "manager" },
  "cashier@hollywoodhotel.rw": { role: "cashier" },
  "reception@hollywoodhotel.rw": { role: "receptionist" },
  "accounts@hollywoodhotel.rw": { role: "accountant" },
};

export type BookingStatus = "Confirmed" | "Pending" | "Cancelled";

export interface Booking {
  id: string;
  guestName: string;
  roomType: string;
  numberOfRooms?: number;
  price?: number;
  days?: number;
  discount?: number;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  amount: number;
  paymentMethod?: string;
  paymentStatus?: "Full Paid" | "Partially Paid" | "Not Yet Paid";
  phone?: string;
}

export const ROOM_PRICES: Record<string, number> = {
  "Standard Room": 50000,
  "Deluxe Room": 80000,
  "Executive Room": 120000,
  "Hollywood Suite": 180000,
  "Presidential Suite": 250000,
  "Luxury Room": 100000,
};

export interface ConferenceBooking {
  id: string;
  contactName: string;
  phone: string;
  eventType: string;
  hall: string;
  guests: number;
  date: string;
  amount: number;
  requirements: string;
  status: "Pending" | "Confirmed" | "Declined";
  paymentMethod?: string;
  paymentStatus?: "Full Paid" | "Partially Paid" | "Not Yet Paid";
  createdAt?: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

export interface OtherRevenue {
  id: string;
  source: string;
  description: string;
  amount: number;
  date: string;
}

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

export type RoomStatus = "Available" | "Occupied" | "Booked" | "Maintenance";

export interface RoomRecord {
  id: string;
  type: string;
  status: RoomStatus;
  housekeeper: string;
  price?: number;
}

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

interface HotelContextType {
  currentUser: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  authLoading: boolean;
  dataLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  adminChangePassword: (targetEmail: string, newPassword: string) => Promise<void>;
  demoAccounts: { email: string; password: string; role: UserRole }[];
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, "id" | "status" | "amount"> & { amount?: number, paymentMethod?: string, price?: number, days?: number, discount?: number, status?: BookingStatus, phone?: string }) => Booking;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  conferenceBookings: ConferenceBooking[];
  addConferenceBooking: (booking: Omit<ConferenceBooking, "id" | "status">) => Promise<ConferenceBooking>;
  updateConferenceBooking: (id: string, updates: Partial<ConferenceBooking>) => Promise<void>;
  deleteConferenceBooking: (id: string) => Promise<void>;
  inHouseGuests: InHouseGuest[];
  addInHouseGuest: (guest: Omit<InHouseGuest, "id" | "checkedInAt">) => void;
  checkOutGuest: (id: string) => void;
  roomsData: RoomRecord[];
  updateRoomStatus: (roomId: string, status: RoomStatus) => void;
  addRoom: (room: Omit<RoomRecord, never>) => Promise<void>;
  editRoom: (roomId: string, updates: Partial<RoomRecord>) => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;
  dailySalesReport: DailySalesReport | null;
  dailySalesHistory: any[];
  isGeneratingReport: boolean;
  uploadAndGenerateReport: () => void;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, "id">) => void;
  deleteExpense: (id: string) => void;
  otherRevenues: OtherRevenue[];
  addOtherRevenue: (revenue: Omit<OtherRevenue, "id">) => void;
  deleteOtherRevenue: (id: string) => void;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

const DEMO_ACCOUNTS = [
  { email: "admin@hollywoodhotel.rw", password: "Admin@2050", role: "admin" as UserRole },
  { email: "manager@hollywoodhotel.rw", password: "Manager@2050", role: "manager" as UserRole },
  { email: "cashier@hollywoodhotel.rw", password: "Cashier@2050", role: "cashier" as UserRole },
  { email: "reception@hollywoodhotel.rw", password: "Recept@2050", role: "receptionist" as UserRole },
  { email: "accounts@hollywoodhotel.rw", password: "Account@2050", role: "accountant" as UserRole },
];

export function HotelProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [conferenceBookings, setConferenceBookings] = useState<ConferenceBooking[]>([]);
  const [inHouseGuests, setInHouseGuests] = useState<InHouseGuest[]>([]);
  const [roomsData, setRoomsData] = useState<RoomRecord[]>([]);
  const [dailySalesReport, setDailySalesReport] = useState<DailySalesReport | null>(null);
  const [dailySalesHistory, setDailySalesHistory] = useState<any[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [otherRevenues, setOtherRevenues] = useState<OtherRevenue[]>([]);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser && fbUser.email) {
        const roster = STAFF_ROSTER[fbUser.email.toLowerCase()];
        if (roster) {
          setCurrentUser({ email: fbUser.email, role: roster.role, uid: fbUser.uid });
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

  // Load room catalog immediately on mount so all booking forms and views have registered rooms and prices
  useEffect(() => {
    fetch('/api/rooms')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.rooms)) {
          setRoomsData(data.rooms.filter((r: any) => r.id));
        }
      })
      .catch(console.error);
  }, []);

  // Load live data from Google Sheets when user logs in
  useEffect(() => {
    if (!currentUser) return;
    async function loadAll() {
      setDataLoading(true);
      try {
        const [roomsRes, bookingsRes, guestsRes, eventsRes, expensesRes, otherRevRes, historyRes] = await Promise.all([
          fetch('/api/rooms'),
          fetch('/api/bookings'),
          fetch('/api/guests'),
          fetch('/api/events'),
          fetch('/api/expenses'),
          fetch('/api/otherRevenues'),
          fetch('/api/reports/history'),
        ]);
        const safeJson = async (res: Response) => {
          try {
            return await res.json();
          } catch (e) {
            return {};
          }
        };

        const [roomsJson, bookingsJson, guestsJson, eventsJson, expensesJson, otherRevJson, historyJson] = await Promise.all([
          safeJson(roomsRes),
          safeJson(bookingsRes),
          safeJson(guestsRes),
          safeJson(eventsRes),
          safeJson(expensesRes),
          safeJson(otherRevRes),
          safeJson(historyRes),
        ]);
        if (roomsJson.success && Array.isArray(roomsJson.rooms)) setRoomsData(roomsJson.rooms.filter((r: any) => r.id));
        if (bookingsJson.success && Array.isArray(bookingsJson.bookings)) setBookings(bookingsJson.bookings.filter((b: any) => b.id));
        if (guestsJson.success && Array.isArray(guestsJson.guests)) setInHouseGuests(guestsJson.guests.filter((g: any) => g.id));
        if (eventsJson.success && Array.isArray(eventsJson.events)) setConferenceBookings(eventsJson.events.filter((e: any) => e.id));
        if (expensesJson.success && Array.isArray(expensesJson.expenses)) setExpenses(expensesJson.expenses.filter((e: any) => e.id));
        if (otherRevJson.success && Array.isArray(otherRevJson.otherRevenues)) setOtherRevenues(otherRevJson.otherRevenues.filter((r: any) => r.id));
        if (historyJson.success && Array.isArray(historyJson.entries)) setDailySalesHistory(historyJson.entries);
      } catch (e) {
        console.error('Failed to load data from sheets:', e);
      } finally {
        setDataLoading(false);
      }
    }
    loadAll();
  }, [currentUser]);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const fbUser = cred.user;
    const roster = STAFF_ROSTER[fbUser.email!.toLowerCase()];
    if (!roster) {
      await signOut(auth);
      throw new Error("This email is not a registered staff account.");
    }
    const user: AuthUser = { email: fbUser.email!, role: roster.role, uid: fbUser.uid };
    setCurrentUser(user);
    return user;
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setFirebaseUser(null);
    setRoomsData([]);
    setBookings([]);
    setInHouseGuests([]);
    setConferenceBookings([]);
    setExpenses([]);
    setOtherRevenues([]);
    setDailySalesHistory([]);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!firebaseUser || !firebaseUser.email) throw new Error("Not authenticated.");
    const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
    await reauthenticateWithCredential(firebaseUser, credential);
    await firebaseUpdatePassword(firebaseUser, newPassword);
  };

  const adminChangePassword = async (targetEmail: string, newPassword: string) => {
    if (currentUser?.role !== "admin") throw new Error("Only admins can perform this action.");
    const res = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetEmail, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to change password");
  };

  const addBooking = (bookingData: Omit<Booking, "id" | "status" | "amount"> & { amount?: number, paymentMethod?: string, price?: number, days?: number, discount?: number, status?: BookingStatus, phone?: string }): Booking => {
    const d1 = new Date(bookingData.checkIn);
    const d2 = new Date(bookingData.checkOut);
    const diffTime = d2.getTime() - d1.getTime();
    const days = bookingData.days || Math.max(1, Math.round(diffTime / (1000 * 3600 * 24)) || 1);
    // Hardcoded price from room registration
    const registeredRoom = roomsData.find(r => r.type === bookingData.roomType || r.id === (bookingData as any).roomId || r.id === (bookingData as any).roomAssigned);
    const pricePerNight = bookingData.price !== undefined && bookingData.price > 0
      ? bookingData.price
      : (registeredRoom?.price ?? ROOM_PRICES[bookingData.roomType] ?? 0);
    const roomsCount = bookingData.numberOfRooms || 1;
    const discount = bookingData.discount || 0;
    const calculatedRevenue = Math.max(0, (days * pricePerNight * roomsCount) - discount);
    const amount = bookingData.amount !== undefined ? bookingData.amount : calculatedRevenue;
    const newBooking: Booking = {
      ...bookingData,
      numberOfRooms: roomsCount,
      price: pricePerNight,
      days,
      discount,
      id: `HH-${new Date().getFullYear()}-${String(bookings.length + 1).padStart(3, "0")}`,
      status: bookingData.status || "Pending",
      amount,
    };
    setBookings((prev) => [newBooking, ...prev]);
    // Persist to sheet
    fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newBooking) }).catch(console.error);
    return newBooking;
  };

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    fetch('/api/bookings', { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ id, ...updates }) 
    }).catch(console.error);
  };

  const addConferenceBooking = async (booking: Omit<ConferenceBooking, "id" | "status">): Promise<ConferenceBooking> => {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...booking, status: "Pending" }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to save conference booking");
    }
    const savedBooking: ConferenceBooking = data.event || {
      ...booking,
      id: `CB-${new Date().getFullYear()}-${String(conferenceBookings.length + 1).padStart(3, "0")}`,
      status: "Pending",
    };
    setConferenceBookings((prev) => [savedBooking, ...prev]);
    return savedBooking;
  };

  const updateConferenceBooking = async (id: string, updates: Partial<ConferenceBooking>) => {
    setConferenceBookings((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    await fetch('/api/events', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    }).catch(console.error);
  };

  const deleteConferenceBooking = async (id: string) => {
    setConferenceBookings((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/events?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(console.error);
  };

  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense: Expense = {
      ...expense,
      id: `EXP-${Date.now()}`,
    };
    setExpenses((prev) => [newExpense, ...prev]);
    fetch('/api/expenses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newExpense) }).catch(console.error);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    fetch(`/api/expenses?id=${id}`, { method: 'DELETE' }).catch(console.error);
  };

  const addOtherRevenue = (revenue: Omit<OtherRevenue, "id">) => {
    const newRevenue: OtherRevenue = {
      ...revenue,
      id: `OREV-${Date.now()}`,
    };
    setOtherRevenues((prev) => [newRevenue, ...prev]);
    fetch('/api/otherRevenues', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newRevenue) }).catch(console.error);
  };

  const deleteOtherRevenue = (id: string) => {
    setOtherRevenues((prev) => prev.filter((r) => r.id !== id));
    fetch(`/api/otherRevenues?id=${id}`, { method: 'DELETE' }).catch(console.error);
  };

  const addInHouseGuest = (guest: Omit<InHouseGuest, "id" | "checkedInAt">) => {
    const newGuest: InHouseGuest = {
      ...guest,
      id: `IG-${Date.now()}`,
      checkedInAt: new Date().toISOString(),
    };
    setInHouseGuests((prev) => [newGuest, ...prev]);
    setRoomsData((prev) => prev.map((r) => (r.id === guest.roomAssigned ? { ...r, status: "Occupied" } : r)));
    fetch('/api/guests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newGuest) }).catch(console.error);
  };

  const checkOutGuest = (id: string) => {
    const guest = inHouseGuests.find((g) => g.id === id);
    setInHouseGuests((prev) => prev.filter((g) => g.id !== id));
    if (guest) {
      setRoomsData((prev) => prev.map((r) => (r.id === guest.roomAssigned ? { ...r, status: "Available" } : r)));
      fetch(`/api/guests/${id}`, { method: 'DELETE' }).catch(console.error);
    }
  };

  const updateRoomStatus = (roomId: string, status: RoomStatus) => {
    setRoomsData((prev) => prev.map((r) => (r.id === roomId ? { ...r, status } : r)));
    fetch(`/api/rooms/${roomId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).catch(console.error);
  };

  const addRoom = async (room: RoomRecord) => {
    setRoomsData((prev) => [...prev, room]);
    await fetch('/api/rooms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(room) });
  };

  const editRoom = async (roomId: string, updates: Partial<RoomRecord>) => {
    setRoomsData((prev) => prev.map((r) => (r.id === roomId ? { ...r, ...updates } : r)));
    await fetch(`/api/rooms/${roomId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
  };

  const deleteRoom = async (roomId: string) => {
    setRoomsData((prev) => prev.filter((r) => r.id !== roomId));
    await fetch(`/api/rooms/${roomId}`, { method: 'DELETE' });
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
        currentUser, firebaseUser, authLoading, dataLoading,
        login, logout, changePassword, adminChangePassword,
        demoAccounts: DEMO_ACCOUNTS,
        bookings,
        addBooking,
        updateBooking,
        conferenceBookings, addConferenceBooking, updateConferenceBooking, deleteConferenceBooking,
        inHouseGuests, addInHouseGuest, checkOutGuest,
        roomsData, updateRoomStatus, addRoom, editRoom, deleteRoom,
        dailySalesReport, dailySalesHistory, isGeneratingReport, uploadAndGenerateReport,
        expenses, addExpense, deleteExpense,
        otherRevenues, addOtherRevenue, deleteOtherRevenue,
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

export function useBookings() {
  const { bookings, addBooking } = useHotel();
  return { bookings, addBooking };
}

export { HotelProvider as BookingProvider };
