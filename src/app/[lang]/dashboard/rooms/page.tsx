"use client";

import { motion } from "framer-motion";
import { BedDouble, CheckCircle, Clock, AlertCircle, Filter, Search } from "lucide-react";
import { useHotel } from "@/context/HotelContext";
import { RoomStatus } from "@/context/HotelContext";
import { useState } from "react";

export default function RoomsManagementPage() {
  const { roomsData, updateRoomStatus } = useHotel();
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = roomsData.filter(r =>
    r.id.includes(searchTerm) || r.type.toLowerCase().includes(searchTerm.toLowerCase()) || r.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const available = roomsData.filter(r => r.status === "Available").length;
  const occupied = roomsData.filter(r => r.status === "Occupied").length;
  const cleaning = roomsData.filter(r => r.status === "Cleaning").length;

  const cycleStatus = (roomId: string, current: RoomStatus) => {
    const cycle: RoomStatus[] = ["Available", "Occupied", "Cleaning", "Maintenance"];
    const next = cycle[(cycle.indexOf(current) + 1) % cycle.length];
    updateRoomStatus(roomId, next);
  };

  return (
    <>
      <div className="mb-12">
        <h1 className="text-4xl font-heading font-black text-black mb-2">Rooms Management</h1>
        <p className="text-gray-600 font-medium text-lg">Monitor room status and housekeeping. Click Update to cycle status.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-12">
        {[
          { label: "Total Rooms", value: roomsData.length, color: "hover:border-gold" },
          { label: "Available", value: available, color: "hover:border-green-400", valColor: "text-green-500" },
          { label: "Occupied", value: occupied, color: "hover:border-blue-400", valColor: "text-blue-500" },
          { label: "Cleaning", value: cleaning, color: "hover:border-orange-400", valColor: "text-orange-500" },
        ].map((s, i) => (
          <div key={i} className={`bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-colors ${s.color}`}>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-2">{s.label}</p>
            <p className={`text-4xl font-black ${s.valColor ?? "text-black"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-6 md:p-8 border-b-2 border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-gray-50/50">
          <h2 className="text-2xl font-black text-black">Room Status</h2>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:border-gold hover:text-black transition-colors">
              <Filter size={18} />
              <span>Filter</span>
            </button>
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search room..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-12 pr-5 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-0 focus:border-gold bg-white text-black font-medium w-full sm:w-64 transition-colors"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-gray-400 border-b-2 border-gray-100">
              <tr>
                <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Room #</th>
                <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Type</th>
                <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Status</th>
                <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Housekeeper</th>
                <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((room, i) => (
                <motion.tr key={room.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="hover:bg-gold/5 transition-colors group">
                  <td className="px-8 py-5 font-black text-black text-lg">{room.id}</td>
                  <td className="px-8 py-5 font-bold text-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg text-gray-500 group-hover:bg-gold group-hover:text-black transition-colors">
                        <BedDouble size={16} strokeWidth={2.5} />
                      </div>
                      {room.type}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${
                      room.status === "Available" ? "bg-green-50 text-green-700 border-green-200" :
                      room.status === "Occupied" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      room.status === "Cleaning" ? "bg-orange-50 text-orange-700 border-orange-200" :
                      "bg-red-50 text-red-700 border-red-200"
                    }`}>
                      {room.status === "Available" && <CheckCircle size={14} strokeWidth={3} />}
                      {room.status === "Cleaning" && <Clock size={14} strokeWidth={3} />}
                      {room.status === "Maintenance" && <AlertCircle size={14} strokeWidth={3} />}
                      {room.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-medium text-gray-600">{room.housekeeper}</td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => cycleStatus(room.id, room.status)} className="px-4 py-2 bg-black hover:bg-gray-900 text-white rounded-lg font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-xs uppercase tracking-wider">
                      Update
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
