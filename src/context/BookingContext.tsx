"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

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

interface BookingContextType {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, "id" | "status" | "amount">) => Booking;
}

const initialBookings: Booking[] = [
  {
    id: "MH-2026-001",
    guestName: "Alice Johnson",
    roomType: "Deluxe Room",
    checkIn: "2026-07-20",
    checkOut: "2026-07-23",
    status: "Confirmed",
    amount: 350,
  },
  {
    id: "MH-2026-002",
    guestName: "Michael Smith",
    roomType: "Executive Room",
    checkIn: "2026-07-15",
    checkOut: "2026-07-18",
    status: "Confirmed",
    amount: 450,
  },
  {
    id: "MH-2026-003",
    guestName: "Sarah Connor",
    roomType: "Standard Room",
    checkIn: "2026-07-25",
    checkOut: "2026-07-27",
    status: "Pending",
    amount: 160,
  },
  {
    id: "MH-2026-004",
    guestName: "David Kim",
    roomType: "Suite",
    checkIn: "2026-08-01",
    checkOut: "2026-08-05",
    status: "Confirmed",
    amount: 1200,
  },
  {
    id: "MH-2026-005",
    guestName: "Emma Brown",
    roomType: "Deluxe Room",
    checkIn: "2026-07-18",
    checkOut: "2026-07-20",
    status: "Cancelled",
    amount: 240,
  },
];

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  const addBooking = (bookingData: Omit<Booking, "id" | "status" | "amount">) => {
    // Generate mock price based on room type
    const prices: Record<string, number> = {
      "Standard Room": 80,
      "Deluxe Room": 120,
      "Executive Room": 150,
      "Suite": 300,
    };
    
    // Calculate nights (mock calculation)
    const d1 = new Date(bookingData.checkIn);
    const d2 = new Date(bookingData.checkOut);
    const nights = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)));
    
    const pricePerNight = prices[bookingData.roomType] || 100;
    const amount = pricePerNight * nights;

    const newBooking: Booking = {
      ...bookingData,
      id: `MH-2026-${String(bookings.length + 1).padStart(3, "0")}`,
      status: "Confirmed",
      amount,
    };

    setBookings((prev) => [newBooking, ...prev]);
    return newBooking;
  };

  return (
    <BookingContext.Provider value={{ bookings, addBooking }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBookings must be used within a BookingProvider");
  }
  return context;
}
