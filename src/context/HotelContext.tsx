"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { CustomerAdvance } from "@/types/finance";
import {
  STORES,
  getAllFromStore,
  replaceStoreData,
  putItemToStore,
  deleteItemFromStore,
  setMetadata,
  getMetadata,
} from "@/lib/offlineDb";
import { syncEngine } from "@/lib/syncEngine";

export type UserRole = "admin" | "manager" | "cashier" | "receptionist" | "accountant";

export interface AuthUser {
  email: string;
  role: UserRole;
  uid: string;
  displayName?: string;
}

export const STAFF_ROSTER: Record<string, { role: UserRole; displayName?: string }> = {
  "admin@hollywoodhotel.rw": { role: "admin", displayName: "Victor Adonis (Admin)" },
  "manager@hollywoodhotel.rw": { role: "manager", displayName: "Hotel Manager" },
  "cashier@hollywoodhotel.rw": { role: "cashier", displayName: "Sandra Mbeki (Cashier)" },
  "reception@hollywoodhotel.rw": { role: "receptionist", displayName: "James Osei (Receptionist)" },
  "accounts@hollywoodhotel.rw": { role: "accountant", displayName: "Grace Mutua (Accountant)" },
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
  advancePaid?: number;
  advanceDate?: string;
  consumedAmount?: number;
}

export const ROOM_PRICES: Record<string, number> = {
  "Standard": 50000,
  "Standard Room": 50000,
  "Superior": 80000,
  "Superior Room": 80000,
  "Deluxe": 120000,
  "Deluxe Room": 120000,
  "Executive Suite": 200000,
  "Executive Room": 200000,
  "Hollywood Suite": 180000,
  "Presidential Suite": 250000,
  "Luxury Room": 120000,
};

export interface ConferenceBooking {
  id: string;
  contactName: string;
  phone: string;
  eventType: string;
  guests: number;
  date: string;
  requirements: string;
  status: "Pending" | "Confirmed" | "Declined";
  paymentMethod?: string;
  paymentStatus?: "Full Paid" | "Partially Paid" | "Not Yet Paid";
  createdAt?: string;
}

export type SaunaBookingStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

export interface SaunaBooking {
  id: string;
  guestName: string;
  phone: string;
  date: string;
  timeSlot: string;
  guests: number;
  sessionType: string;
  status: SaunaBookingStatus;
  price: number;
  amount: number;
  paymentMethod?: string;
  paymentStatus?: "Full Paid" | "Partially Paid" | "Not Yet Paid";
  notes?: string;
  roomNumber?: string;
  createdAt?: string;
}

export const DEFAULT_SAUNA_PRICE = 10000;

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

export interface StaffUserItem {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt?: string;
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
  staffUsers: StaffUserItem[];
  fetchStaffUsers: () => Promise<StaffUserItem[]>;
  createStaffUser: (data: { email: string; password: string; displayName?: string; role: UserRole }) => Promise<StaffUserItem>;
  deleteStaffUser: (uid: string, email?: string) => Promise<void>;
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
  updateCategoryPrice: (categoryName: string, newPrice: number) => Promise<void>;
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
  saunaBookings: SaunaBooking[];
  addSaunaBooking: (booking: Omit<SaunaBooking, "id"> & { id?: string }) => Promise<SaunaBooking>;
  updateSaunaBooking: (id: string, updates: Partial<SaunaBooking>) => Promise<void>;
  deleteSaunaBooking: (id: string) => Promise<void>;
  customerAdvances: CustomerAdvance[];
  addCustomerAdvance: (advance: Omit<CustomerAdvance, "id" | "createdAt">) => Promise<CustomerAdvance>;
  recordAdvanceConsumption: (id: string, amountToConsume: number, note?: string) => Promise<void>;
  deleteCustomerAdvance: (id: string) => Promise<void>;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const DEMO_ACCOUNTS = [
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
  const [saunaBookings, setSaunaBookings] = useState<SaunaBooking[]>([]);
  const [customerAdvances, setCustomerAdvances] = useState<CustomerAdvance[]>([]);
  const [staffUsers, setStaffUsers] = useState<StaffUserItem[]>([]);

  // 1. Initial Local Cache Hydration (IndexedDB)
  useEffect(() => {
    async function loadLocalDatabase() {
      try {
        const [
          cachedRooms,
          cachedSauna,
          cachedBookings,
          cachedGuests,
          cachedEvents,
          cachedExpenses,
          cachedRevenues,
          cachedHistory,
          cachedAdvances,
          cachedStaff,
          cachedAuth,
        ] = await Promise.all([
          getAllFromStore<RoomRecord>(STORES.ROOMS),
          getAllFromStore<SaunaBooking>(STORES.SAUNA),
          getAllFromStore<Booking>(STORES.BOOKINGS),
          getAllFromStore<InHouseGuest>(STORES.GUESTS),
          getAllFromStore<ConferenceBooking>(STORES.EVENTS),
          getAllFromStore<Expense>(STORES.EXPENSES),
          getAllFromStore<OtherRevenue>(STORES.OTHER_REVENUES),
          getAllFromStore<any>(STORES.SALES_HISTORY),
          getAllFromStore<CustomerAdvance>(STORES.ADVANCES),
          getAllFromStore<StaffUserItem>(STORES.STAFF),
          getMetadata<AuthUser>("cachedAuthUser"),
        ]);

        if (cachedRooms.length > 0) setRoomsData(cachedRooms);
        if (cachedSauna.length > 0) setSaunaBookings(cachedSauna);
        if (cachedBookings.length > 0) setBookings(cachedBookings);
        if (cachedGuests.length > 0) setInHouseGuests(cachedGuests);
        if (cachedEvents.length > 0) setConferenceBookings(cachedEvents);
        if (cachedExpenses.length > 0) setExpenses(cachedExpenses);
        if (cachedRevenues.length > 0) setOtherRevenues(cachedRevenues);
        if (cachedHistory.length > 0) setDailySalesHistory(cachedHistory);
        if (cachedAdvances.length > 0) setCustomerAdvances(cachedAdvances);
        if (cachedStaff.length > 0) setStaffUsers(cachedStaff);

        // Restore cached offline session if available
        if (cachedAuth && !currentUser) {
          setCurrentUser(cachedAuth);
        }
      } catch (err) {
        console.warn("Could not hydrate from IndexedDB:", err);
      }
    }
    loadLocalDatabase();
  }, []);

  const fetchStaffUsers = async (): Promise<StaffUserItem[]> => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setStaffUsers(data.users);
        replaceStoreData(STORES.STAFF, data.users).catch(console.error);
        return data.users;
      }
    } catch (e) {
      console.warn("Failed to load live staff users (offline fallback active):", e);
    }
    return [];
  };

  useEffect(() => {
    fetchStaffUsers();
  }, []);

  // Listen to Firebase auth state & handle offline fallback session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser && fbUser.email) {
        const lowerEmail = fbUser.email.toLowerCase();
        let userToSet: AuthUser | null = null;

        const found = staffUsers.find((u) => u.email.toLowerCase() === lowerEmail);
        if (found) {
          userToSet = {
            email: fbUser.email,
            role: found.role,
            uid: fbUser.uid,
            displayName: found.displayName,
          };
        } else {
          const roster = STAFF_ROSTER[lowerEmail];
          if (roster) {
            userToSet = {
              email: fbUser.email,
              role: roster.role,
              uid: fbUser.uid,
              displayName: roster.displayName,
            };
          } else {
            try {
              const freshList = await fetchStaffUsers();
              const freshFound = freshList.find((u) => u.email.toLowerCase() === lowerEmail);
              if (freshFound) {
                userToSet = {
                  email: fbUser.email,
                  role: freshFound.role,
                  uid: fbUser.uid,
                  displayName: freshFound.displayName,
                };
              }
            } catch (_) {}
          }
        }

        if (userToSet) {
          setCurrentUser(userToSet);
          setMetadata("cachedAuthUser", userToSet).catch(console.error);
        }
      } else {
        // If not logged in on Firebase, check if we have a valid offline session stored
        getMetadata<AuthUser>("cachedAuthUser").then((cached) => {
          if (cached && !navigator.onLine) {
            setCurrentUser(cached);
          } else if (!cached) {
            setCurrentUser(null);
          }
        }).catch(() => {});
      }
      setAuthLoading(false);
    });

    return unsubscribe;
  }, [staffUsers.length]);

  // Load baseline rooms and sauna catalog
  useEffect(() => {
    fetch("/api/rooms")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.rooms)) {
          const valid = data.rooms.filter((r: any) => r.id);
          setRoomsData(valid);
          replaceStoreData(STORES.ROOMS, valid).catch(console.error);
        }
      })
      .catch((e) => console.warn("Rooms live load failed, using local cache:", e));

    fetch("/api/sauna")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.bookings)) {
          const valid = data.bookings.filter((b: any) => b.id);
          setSaunaBookings(valid);
          replaceStoreData(STORES.SAUNA, valid).catch(console.error);
        }
      })
      .catch((e) => console.warn("Sauna live load failed, using local cache:", e));
  }, []);

  // Comprehensive data loader from backend
  const loadAllFromServer = useCallback(async () => {
    setDataLoading(true);
    try {
      const safeJson = async (res: Response): Promise<any> => {
        try {
          return await res.json();
        } catch (e) {
          return {};
        }
      };

      const [
        roomsRes,
        bookingsRes,
        guestsRes,
        eventsRes,
        expensesRes,
        otherRevRes,
        historyRes,
        saunaRes,
        advancesRes,
      ] = await Promise.all([
        fetch("/api/rooms"),
        fetch("/api/bookings"),
        fetch("/api/guests"),
        fetch("/api/events"),
        fetch("/api/expenses"),
        fetch("/api/otherRevenues"),
        fetch("/api/reports/history"),
        fetch("/api/sauna"),
        fetch("/api/advances"),
      ]);

      const [
        roomsJson,
        bookingsJson,
        guestsJson,
        eventsJson,
        expensesJson,
        otherRevJson,
        historyJson,
        saunaJson,
        advancesJson,
      ] = await Promise.all([
        safeJson(roomsRes),
        safeJson(bookingsRes),
        safeJson(guestsRes),
        safeJson(eventsRes),
        safeJson(expensesRes),
        safeJson(otherRevRes),
        safeJson(historyRes),
        safeJson(saunaRes),
        safeJson(advancesRes),
      ]);

      if (roomsJson.success && Array.isArray(roomsJson.rooms)) {
        const valid = roomsJson.rooms.filter((r: any) => r.id);
        setRoomsData(valid);
        replaceStoreData(STORES.ROOMS, valid).catch(console.error);
      }
      if (bookingsJson.success && Array.isArray(bookingsJson.bookings)) {
        const valid = bookingsJson.bookings.filter((b: any) => b.id);
        setBookings(valid);
        replaceStoreData(STORES.BOOKINGS, valid).catch(console.error);
      }
      if (guestsJson.success && Array.isArray(guestsJson.guests)) {
        const valid = guestsJson.guests.filter((g: any) => g.id);
        setInHouseGuests(valid);
        replaceStoreData(STORES.GUESTS, valid).catch(console.error);
      }
      if (eventsJson.success && Array.isArray(eventsJson.events)) {
        const valid = eventsJson.events.filter((e: any) => e.id);
        setConferenceBookings(valid);
        replaceStoreData(STORES.EVENTS, valid).catch(console.error);
      }
      if (expensesJson.success && Array.isArray(expensesJson.expenses)) {
        const valid = expensesJson.expenses.filter((e: any) => e.id);
        setExpenses(valid);
        replaceStoreData(STORES.EXPENSES, valid).catch(console.error);
      }
      if (otherRevJson.success && Array.isArray(otherRevJson.otherRevenues)) {
        const valid = otherRevJson.otherRevenues.filter((r: any) => r.id);
        setOtherRevenues(valid);
        replaceStoreData(STORES.OTHER_REVENUES, valid).catch(console.error);
      }
      if (historyJson.success && Array.isArray(historyJson.entries)) {
        setDailySalesHistory(historyJson.entries);
        replaceStoreData(STORES.SALES_HISTORY, historyJson.entries).catch(console.error);
      }
      if (saunaJson.success && Array.isArray(saunaJson.bookings)) {
        const valid = saunaJson.bookings.filter((b: any) => b.id);
        setSaunaBookings(valid);
        replaceStoreData(STORES.SAUNA, valid).catch(console.error);
      }
      if (advancesJson.success && Array.isArray(advancesJson.advances)) {
        const valid = advancesJson.advances.filter((a: any) => a.id);
        setCustomerAdvances(valid);
        replaceStoreData(STORES.ADVANCES, valid).catch(console.error);
      }
    } catch (e) {
      console.warn("Could not fetch server data (offline fallback active):", e);
    } finally {
      setDataLoading(false);
    }
  }, []);

  // Fetch when user is logged in
  useEffect(() => {
    if (currentUser) {
      loadAllFromServer();
    }
  }, [currentUser, loadAllFromServer]);

  // Hook syncEngine onSyncComplete to reload server data whenever Wi-Fi reconnects and syncs
  useEffect(() => {
    const unsub = syncEngine.onSyncComplete(async () => {
      console.log("[Sync] Wi-Fi synchronization completed. Refreshing server data...");
      await loadAllFromServer();
    });
    return unsub;
  }, [loadAllFromServer]);

  // Offline-capable Login
  const login = async (email: string, password: string): Promise<AuthUser> => {
    const lowerEmail = email.toLowerCase().trim();

    // Try online Firebase authentication
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = cred.user;

      let role: UserRole | undefined = staffUsers.find((u) => u.email.toLowerCase() === lowerEmail)?.role;
      let displayName: string | undefined = staffUsers.find((u) => u.email.toLowerCase() === lowerEmail)?.displayName;

      if (!role) {
        const roster = STAFF_ROSTER[lowerEmail];
        if (roster) {
          role = roster.role;
          displayName = roster.displayName;
        } else {
          const freshList = await fetchStaffUsers();
          const freshFound = freshList.find((u) => u.email.toLowerCase() === lowerEmail);
          if (freshFound) {
            role = freshFound.role;
            displayName = freshFound.displayName;
          }
        }
      }

      if (!role) {
        await signOut(auth);
        throw new Error("This email is not registered as a staff account.");
      }

      const user: AuthUser = { email: fbUser.email!, role, uid: fbUser.uid, displayName };
      setCurrentUser(user);
      await setMetadata("cachedAuthUser", user);
      return user;
    } catch (err: any) {
      const isOfflineErr =
        err?.code === "auth/network-request-failed" ||
        !navigator.onLine ||
        err?.message?.includes("network");

      if (isOfflineErr) {
        // Offline Authentication Fallback: check demo accounts or cached staff
        const matchedDemo = DEMO_ACCOUNTS.find(
          (d) => d.email.toLowerCase() === lowerEmail && d.password === password
        );

        if (matchedDemo) {
          const fallbackUser: AuthUser = {
            email: matchedDemo.email,
            role: matchedDemo.role,
            uid: `offline-${Date.now()}`,
            displayName: STAFF_ROSTER[lowerEmail]?.displayName || "Staff (Offline)",
          };
          setCurrentUser(fallbackUser);
          await setMetadata("cachedAuthUser", fallbackUser);
          return fallbackUser;
        }

        const matchedStaff = staffUsers.find((u) => u.email.toLowerCase() === lowerEmail);
        if (matchedStaff) {
          const fallbackUser: AuthUser = {
            email: matchedStaff.email,
            role: matchedStaff.role,
            uid: matchedStaff.uid,
            displayName: matchedStaff.displayName,
          };
          setCurrentUser(fallbackUser);
          await setMetadata("cachedAuthUser", fallbackUser);
          return fallbackUser;
        }
      }

      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (_) {}
    setCurrentUser(null);
    setFirebaseUser(null);
    await setMetadata("cachedAuthUser", null);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!currentUser?.email) throw new Error("Not authenticated.");
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: currentUser.email,
        currentPassword,
        newPassword,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to change password");
    }
  };

  const adminChangePassword = async (targetEmail: string, newPassword: string) => {
    if (currentUser?.role !== "admin" && currentUser?.role !== "manager") {
      throw new Error("Only Admin or Manager can perform password reset overrides.");
    }
    const res = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetEmail, newPassword }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to change password");
    }
  };

  const createStaffUserHandler = async (data: {
    email: string;
    password: string;
    displayName?: string;
    role: UserRole;
  }): Promise<StaffUserItem> => {
    if (currentUser?.role !== "admin") {
      throw new Error("Only Administrators can register new staff accounts.");
    }
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok || !resData.success) {
      throw new Error(resData.error || "Failed to create staff account");
    }
    await fetchStaffUsers();
    return resData.user;
  };

  const deleteStaffUserHandler = async (uid: string, email?: string): Promise<void> => {
    if (currentUser?.role !== "admin") {
      throw new Error("Only Administrators can delete staff accounts.");
    }
    const params = new URLSearchParams();
    if (uid) params.set("uid", uid);
    if (email) params.set("email", email);
    const res = await fetch(`/api/admin/users?${params.toString()}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to delete staff user");
    }
    await fetchStaffUsers();
  };

  // ───────────────────────────────────────────────────────────────────────────
  // OFFLINE-SAFE MUTATIONS WITH OUTBOX SYNC QUEUE
  // ───────────────────────────────────────────────────────────────────────────

  const addBooking = (
    bookingData: Omit<Booking, "id" | "status" | "amount"> & {
      amount?: number;
      paymentMethod?: string;
      price?: number;
      days?: number;
      discount?: number;
      status?: BookingStatus;
      phone?: string;
      advancePaid?: number;
      advanceDate?: string;
      consumedAmount?: number;
    }
  ): Booking => {
    const d1 = new Date(bookingData.checkIn);
    const d2 = new Date(bookingData.checkOut);
    const diffTime = d2.getTime() - d1.getTime();
    const days = bookingData.days || Math.max(1, Math.round(diffTime / (1000 * 3600 * 24)) || 1);
    const registeredRoom = roomsData.find(
      (r) =>
        r.type === bookingData.roomType ||
        r.id === (bookingData as any).roomId ||
        r.id === (bookingData as any).roomAssigned
    );
    const pricePerNight =
      bookingData.price !== undefined && bookingData.price > 0
        ? bookingData.price
        : registeredRoom?.price ?? ROOM_PRICES[bookingData.roomType] ?? 0;
    const roomsCount = bookingData.numberOfRooms || 1;
    const discount = bookingData.discount || 0;
    const calculatedRevenue = Math.max(0, days * pricePerNight * roomsCount - discount);
    const amount = bookingData.amount !== undefined ? bookingData.amount : calculatedRevenue;
    const advancePaid =
      bookingData.advancePaid !== undefined
        ? bookingData.advancePaid
        : bookingData.paymentStatus === "Full Paid"
        ? amount
        : 0;
    const advanceDate = bookingData.advanceDate || bookingData.checkIn || new Date().toISOString().split("T")[0];

    const newBooking: Booking = {
      ...bookingData,
      numberOfRooms: roomsCount,
      price: pricePerNight,
      days,
      discount,
      id: `HH-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      status: bookingData.status || "Pending",
      amount,
      advancePaid,
      advanceDate,
      consumedAmount: bookingData.consumedAmount || 0,
    };

    // 1. Update React State
    setBookings((prev) => [newBooking, ...prev]);

    // 2. Persist locally to IndexedDB
    putItemToStore(STORES.BOOKINGS, newBooking).catch(console.error);

    // 3. Queue into Sync Engine (syncs immediately if Wi-Fi connected, or when online)
    syncEngine.queueMutation(
      "/api/bookings",
      "POST",
      newBooking,
      `Add booking for ${newBooking.guestName} (${newBooking.roomType})`
    ).catch(console.error);

    return newBooking;
  };

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    let updatedBooking: Booking | null = null;
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          updatedBooking = { ...b, ...updates };
          return updatedBooking;
        }
        return b;
      })
    );

    if (updatedBooking) {
      putItemToStore(STORES.BOOKINGS, updatedBooking).catch(console.error);
      syncEngine.queueMutation(
        "/api/bookings",
        "PUT",
        { id, ...updates },
        `Update booking ${id}`
      ).catch(console.error);
    }
  };

  const addConferenceBooking = async (
    booking: Omit<ConferenceBooking, "id" | "status">
  ): Promise<ConferenceBooking> => {
    const savedBooking: ConferenceBooking = {
      ...booking,
      id: `CB-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    setConferenceBookings((prev) => [savedBooking, ...prev]);
    await putItemToStore(STORES.EVENTS, savedBooking);

    syncEngine.queueMutation(
      "/api/events",
      "POST",
      savedBooking,
      `Add conference reservation for ${savedBooking.contactName}`
    ).catch(console.error);

    return savedBooking;
  };

  const updateConferenceBooking = async (id: string, updates: Partial<ConferenceBooking>) => {
    let updated: ConferenceBooking | null = null;
    setConferenceBookings((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          updated = { ...c, ...updates };
          return updated;
        }
        return c;
      })
    );

    if (updated) {
      await putItemToStore(STORES.EVENTS, updated);
      syncEngine.queueMutation(
        "/api/events",
        "PUT",
        { id, ...updates },
        `Update conference ${id}`
      ).catch(console.error);
    }
  };

  const deleteConferenceBooking = async (id: string) => {
    setConferenceBookings((prev) => prev.filter((c) => c.id !== id));
    await deleteItemFromStore(STORES.EVENTS, id);
    syncEngine.queueMutation(
      `/api/events?id=${encodeURIComponent(id)}`,
      "DELETE",
      null,
      `Delete conference ${id}`
    ).catch(console.error);
  };

  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense: Expense = {
      ...expense,
      id: `EXP-${Date.now()}`,
    };
    setExpenses((prev) => [newExpense, ...prev]);
    putItemToStore(STORES.EXPENSES, newExpense).catch(console.error);
    syncEngine.queueMutation(
      "/api/expenses",
      "POST",
      newExpense,
      `Record expense: ${newExpense.category} (RWF ${newExpense.amount})`
    ).catch(console.error);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    deleteItemFromStore(STORES.EXPENSES, id).catch(console.error);
    syncEngine.queueMutation(
      `/api/expenses?id=${id}`,
      "DELETE",
      null,
      `Delete expense ${id}`
    ).catch(console.error);
  };

  const addOtherRevenue = (revenue: Omit<OtherRevenue, "id">) => {
    const newRevenue: OtherRevenue = {
      ...revenue,
      id: `OREV-${Date.now()}`,
    };
    setOtherRevenues((prev) => [newRevenue, ...prev]);
    putItemToStore(STORES.OTHER_REVENUES, newRevenue).catch(console.error);
    syncEngine.queueMutation(
      "/api/otherRevenues",
      "POST",
      newRevenue,
      `Record other revenue: ${newRevenue.source} (RWF ${newRevenue.amount})`
    ).catch(console.error);
  };

  const deleteOtherRevenue = (id: string) => {
    setOtherRevenues((prev) => prev.filter((r) => r.id !== id));
    deleteItemFromStore(STORES.OTHER_REVENUES, id).catch(console.error);
    syncEngine.queueMutation(
      `/api/otherRevenues?id=${id}`,
      "DELETE",
      null,
      `Delete other revenue ${id}`
    ).catch(console.error);
  };

  const addInHouseGuest = (guest: Omit<InHouseGuest, "id" | "checkedInAt">) => {
    const newGuest: InHouseGuest = {
      ...guest,
      id: `IG-${Date.now()}`,
      checkedInAt: new Date().toISOString(),
    };
    setInHouseGuests((prev) => [newGuest, ...prev]);
    setRoomsData((prev) =>
      prev.map((r) => (r.id === guest.roomAssigned ? { ...r, status: "Occupied" } : r))
    );

    putItemToStore(STORES.GUESTS, newGuest).catch(console.error);

    syncEngine.queueMutation(
      "/api/guests",
      "POST",
      newGuest,
      `Check-in guest ${newGuest.fullName} into Room ${newGuest.roomAssigned}`
    ).catch(console.error);

    // Sync updated room status
    syncEngine.queueMutation(
      `/api/rooms/${newGuest.roomAssigned}`,
      "PUT",
      { status: "Occupied" },
      `Update Room ${newGuest.roomAssigned} status to Occupied`
    ).catch(console.error);
  };

  const checkOutGuest = (id: string) => {
    const guest = inHouseGuests.find((g) => g.id === id);
    setInHouseGuests((prev) => prev.filter((g) => g.id !== id));
    deleteItemFromStore(STORES.GUESTS, id).catch(console.error);

    if (guest) {
      setRoomsData((prev) =>
        prev.map((r) => (r.id === guest.roomAssigned ? { ...r, status: "Available" } : r))
      );
      syncEngine.queueMutation(
        `/api/guests/${id}`,
        "DELETE",
        null,
        `Check out guest ${guest.fullName}`
      ).catch(console.error);
      syncEngine.queueMutation(
        `/api/rooms/${guest.roomAssigned}`,
        "PUT",
        { status: "Available" },
        `Update Room ${guest.roomAssigned} status to Available`
      ).catch(console.error);
    }
  };

  const updateRoomStatus = (roomId: string, status: RoomStatus) => {
    setRoomsData((prev) => prev.map((r) => (r.id === roomId ? { ...r, status } : r)));
    syncEngine.queueMutation(
      `/api/rooms/${roomId}`,
      "PUT",
      { status },
      `Set Room ${roomId} status to ${status}`
    ).catch(console.error);
  };

  const addRoom = async (room: RoomRecord) => {
    setRoomsData((prev) => [...prev, room]);
    await putItemToStore(STORES.ROOMS, room);
    syncEngine.queueMutation(
      "/api/rooms",
      "POST",
      room,
      `Add Room ${room.id} (${room.type})`
    ).catch(console.error);
  };

  const editRoom = async (roomId: string, updates: Partial<RoomRecord>) => {
    let updated: RoomRecord | null = null;
    setRoomsData((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          updated = { ...r, ...updates };
          return updated;
        }
        return r;
      })
    );
    if (updated) {
      await putItemToStore(STORES.ROOMS, updated);
      syncEngine.queueMutation(
        `/api/rooms/${roomId}`,
        "PUT",
        updates,
        `Edit Room ${roomId}`
      ).catch(console.error);
    }
  };

  const deleteRoom = async (roomId: string) => {
    setRoomsData((prev) => prev.filter((r) => r.id !== roomId));
    await deleteItemFromStore(STORES.ROOMS, roomId);
    syncEngine.queueMutation(
      `/api/rooms/${roomId}`,
      "DELETE",
      null,
      `Delete Room ${roomId}`
    ).catch(console.error);
  };

  const updateCategoryPrice = async (categoryName: string, newPrice: number) => {
    const targetPrice = Number(newPrice) || 0;
    const catLower = categoryName.toLowerCase();
    const matchingRooms = roomsData.filter((r) => {
      const rLower = (r.type || "").toLowerCase();
      return rLower === catLower || rLower.includes(catLower) || catLower.includes(rLower);
    });

    if (matchingRooms.length > 0) {
      for (const room of matchingRooms) {
        await editRoom(room.id, { price: targetPrice });
      }
    } else {
      const cleanPrefix =
        categoryName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase() || "CAT";
      const newRoomId = `${cleanPrefix}-${Date.now().toString().slice(-3)}`;
      await addRoom({
        id: newRoomId,
        type: categoryName,
        status: "Available",
        housekeeper: "Front Desk",
        price: targetPrice,
      });
    }
  };

  const uploadAndGenerateReport = () => {
    setIsGeneratingReport(true);
    setDailySalesReport(null);
    setTimeout(() => {
      setDailySalesReport(generateMockReport());
      setIsGeneratingReport(false);
    }, 1500);
  };

  const addSaunaBooking = async (
    booking: Omit<SaunaBooking, "id"> & { id?: string }
  ): Promise<SaunaBooking> => {
    const savedBooking: SaunaBooking = {
      ...booking,
      id: booking.id || `SAUNA-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      status: booking.status || "Pending",
      createdAt: new Date().toISOString(),
    };

    setSaunaBookings((prev) => [savedBooking, ...prev.filter((b) => b.id !== savedBooking.id)]);
    await putItemToStore(STORES.SAUNA, savedBooking);

    syncEngine.queueMutation(
      "/api/sauna",
      "POST",
      savedBooking,
      `Book sauna session for ${savedBooking.guestName}`
    ).catch(console.error);

    return savedBooking;
  };

  const updateSaunaBooking = async (id: string, updates: Partial<SaunaBooking>) => {
    let updated: SaunaBooking | null = null;
    setSaunaBookings((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          updated = { ...s, ...updates };
          return updated;
        }
        return s;
      })
    );

    if (updated) {
      await putItemToStore(STORES.SAUNA, updated);
      syncEngine.queueMutation(
        "/api/sauna",
        "PUT",
        { id, ...updates },
        `Update sauna booking ${id}`
      ).catch(console.error);
    }
  };

  const deleteSaunaBooking = async (id: string) => {
    setSaunaBookings((prev) => prev.filter((s) => s.id !== id));
    await deleteItemFromStore(STORES.SAUNA, id);
    syncEngine.queueMutation(
      `/api/sauna?id=${encodeURIComponent(id)}`,
      "DELETE",
      null,
      `Delete sauna booking ${id}`
    ).catch(console.error);
  };

  const addCustomerAdvance = async (
    advanceData: Omit<CustomerAdvance, "id" | "createdAt">
  ): Promise<CustomerAdvance> => {
    const saved: CustomerAdvance = {
      ...advanceData,
      id: `ADV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      balanceRemaining: (advanceData.totalAmount || 0) - (advanceData.consumedAmount || 0),
    };

    setCustomerAdvances((prev) => [saved, ...prev]);
    await putItemToStore(STORES.ADVANCES, saved);

    syncEngine.queueMutation(
      "/api/advances",
      "POST",
      saved,
      `Add customer advance deposit for ${saved.guestName}`
    ).catch(console.error);

    return saved;
  };

  const recordAdvanceConsumption = async (id: string, amountToConsume: number, note?: string) => {
    setCustomerAdvances((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const newConsumed = (a.consumedAmount || 0) + amountToConsume;
          const newBalance = Math.max(0, (a.totalAmount || 0) - newConsumed);
          const updated = {
            ...a,
            consumedAmount: newConsumed,
            balanceRemaining: newBalance,
            notes: note ? `${a.notes || ""}; ${note}` : a.notes,
          };
          putItemToStore(STORES.ADVANCES, updated).catch(console.error);
          return updated;
        }
        return a;
      })
    );

    syncEngine.queueMutation(
      "/api/advances",
      "PUT",
      { id, addConsumption: amountToConsume, notes: note, appendNote: true },
      `Record advance consumption RWF ${amountToConsume} for ${id}`
    ).catch(console.error);
  };

  const deleteCustomerAdvance = async (id: string) => {
    setCustomerAdvances((prev) => prev.filter((a) => a.id !== id));
    await deleteItemFromStore(STORES.ADVANCES, id);
    syncEngine.queueMutation(
      `/api/advances?id=${encodeURIComponent(id)}`,
      "DELETE",
      null,
      `Delete customer advance ${id}`
    ).catch(console.error);
  };

  return (
    <HotelContext.Provider
      value={{
        currentUser,
        firebaseUser,
        authLoading,
        dataLoading,
        login,
        logout,
        changePassword,
        adminChangePassword,
        staffUsers,
        fetchStaffUsers,
        createStaffUser: createStaffUserHandler,
        deleteStaffUser: deleteStaffUserHandler,
        demoAccounts: DEMO_ACCOUNTS,
        bookings,
        addBooking,
        updateBooking,
        conferenceBookings,
        addConferenceBooking,
        updateConferenceBooking,
        deleteConferenceBooking,
        inHouseGuests,
        addInHouseGuest,
        checkOutGuest,
        roomsData,
        updateRoomStatus,
        addRoom,
        editRoom,
        deleteRoom,
        updateCategoryPrice,
        dailySalesReport,
        dailySalesHistory,
        isGeneratingReport,
        uploadAndGenerateReport,
        expenses,
        addExpense,
        deleteExpense,
        otherRevenues,
        addOtherRevenue,
        deleteOtherRevenue,
        saunaBookings,
        addSaunaBooking,
        updateSaunaBooking,
        deleteSaunaBooking,
        customerAdvances,
        addCustomerAdvance,
        recordAdvanceConsumption,
        deleteCustomerAdvance,
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
