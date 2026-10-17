"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BedDouble, CheckCircle, AlertCircle, Filter, Search, Calendar, Plus, Pencil, Trash2, X, LayoutGrid, List } from "lucide-react";
import { useHotel } from "@/context/HotelContext";
import { RoomRecord, RoomStatus } from "@/context/HotelContext";
import { useState } from "react";

const ROOM_TYPES = ["Standard Room", "Superior Room", "Deluxe Room", "Executive Suite", "Hollywood Suite", "Presidential Suite"];
const STATUSES: RoomStatus[] = ["Available", "Occupied", "Booked", "Maintenance"];

const emptyForm = { id: "", type: "Standard Room", status: "Available" as RoomStatus, housekeeper: "", price: 50000 };

export default function RoomsManagementPage() {
  const { roomsData, updateRoomStatus, addRoom, editRoom, deleteRoom, dataLoading } = useHotel();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [modal, setModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [editTarget, setEditTarget] = useState<RoomRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoomRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtered = roomsData.filter(r =>
    (r.id?.includes(searchTerm) || r.type?.toLowerCase().includes(searchTerm.toLowerCase()) || r.status?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter ? r.status === statusFilter : true)
  );

  const available = roomsData.filter(r => r.status === "Available").length;
  const occupied = roomsData.filter(r => r.status === "Occupied").length;
  const booked = roomsData.filter(r => r.status === "Booked").length;

  const cycleStatus = (roomId: string, current: RoomStatus) => {
    const cycle: RoomStatus[] = ["Available", "Occupied", "Booked", "Maintenance"];
    const next = cycle[(cycle.indexOf(current) + 1) % cycle.length];
    updateRoomStatus(roomId, next);
  };

  const openAdd = () => { setForm({ ...emptyForm, price: 0 }); setModal("add"); };
  const openEdit = (room: RoomRecord) => {
    setEditTarget(room);
    setForm({
      id: room.id,
      type: room.type,
      status: room.status,
      housekeeper: room.housekeeper,
      price: room.price ?? 0,
    });
    setModal("edit");
  };
  const openDelete = (room: RoomRecord) => { setDeleteTarget(room); setModal("delete"); };
  const closeModal = () => { setModal(null); setEditTarget(null); setDeleteTarget(null); };

  const handleSaveAdd = async () => {
    if (!form.id || !form.housekeeper) return;
    setSaving(true);
    await addRoom({
      id: form.id,
      type: form.type,
      status: form.status,
      housekeeper: form.housekeeper,
      price: Number(form.price) || 0,
    } as RoomRecord);
    setSaving(false);
    closeModal();
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    setSaving(true);
    await editRoom(editTarget.id, {
      type: form.type,
      status: form.status,
      housekeeper: form.housekeeper,
      price: Number(form.price) || 0,
    });
    setSaving(false);
    closeModal();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    await deleteRoom(deleteTarget.id);
    setSaving(false);
    closeModal();
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium text-sm";

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="text-4xl font-heading font-black text-black mb-2">Rooms Management</h1>
          <p className="text-gray-600 font-medium text-lg">Monitor, add, edit, and remove hotel rooms.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-6 py-3 bg-black hover:bg-gray-900 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-[0_10px_20px_rgba(251,191,36,0.2)] hover:-translate-y-0.5"
        >
          <Plus size={18} /> Add Room
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-12">
        {[
          { label: "Total Rooms", value: roomsData.length, color: "hover:border-gold", filterValue: null },
          { label: "Available", value: available, color: "hover:border-green-400", valColor: "text-green-500", filterValue: "Available" },
          { label: "Occupied", value: occupied, color: "hover:border-blue-400", valColor: "text-blue-500", filterValue: "Occupied" },
          { label: "Booked", value: booked, color: "hover:border-purple-400", valColor: "text-purple-500", filterValue: "Booked" },
        ].map((s, i) => (
          <div key={i} onClick={() => setStatusFilter(s.filterValue)} className={`bg-white p-6 rounded-3xl border-2 shadow-[0_10px_30px_rgba(0,0,0,0.03)] cursor-pointer transition-all hover:scale-105 ${statusFilter === s.filterValue ? 'border-gold ring-4 ring-gold/20' : 'border-gray-100'} ${s.color}`}>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-2">{s.label}</p>
            {dataLoading ? <div className="h-10 w-16 bg-gray-200 animate-pulse rounded-xl" /> : <p className={`text-4xl font-black ${s.valColor ?? "text-black"}`}>{s.value}</p>}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-6 md:p-8 border-b-2 border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-gray-50/50">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-black">Room Status</h2>
            <div className="flex bg-gray-200/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${
                  viewMode === "cards" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"
                }`}
              >
                <LayoutGrid size={15} /> Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${
                  viewMode === "table" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"
                }`}
              >
                <List size={15} /> Table
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
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

        {viewMode === "cards" ? (
          <div className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {dataLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-44 bg-gray-100 animate-pulse rounded-2xl" />
              ))
            ) : filtered.map((room, i) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white p-5 rounded-2xl border-2 border-gray-100 hover:border-gold hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                {/* Price on top of card */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-3 py-1.5 bg-black text-white text-xs font-black rounded-xl tracking-wide shadow-sm">
                    RWF {(room.price ?? 0).toLocaleString()} <span className="text-[10px] text-gray-400 font-bold">/ night</span>
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${
                    room.status === "Available" ? "bg-green-50 text-green-700 border-green-200" :
                    room.status === "Occupied" ? "bg-blue-50 text-blue-700 border-blue-200" :
                    room.status === "Booked" ? "bg-purple-50 text-purple-700 border-purple-200" :
                    "bg-red-50 text-red-700 border-red-200"
                  }`}>
                    {room.status}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-2xl font-black text-black">Room {room.id}</p>
                  <p className="text-xs font-bold text-gray-500 mt-0.5">{room.type}</p>
                  <p className="text-xs text-gray-400 font-medium mt-1">Housekeeper: {room.housekeeper}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <button
                    onClick={() => cycleStatus(room.id, room.status)}
                    className="px-3 py-1.5 bg-black hover:bg-gray-800 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Cycle Status
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => openEdit(room)} className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors" title="Edit room">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => openDelete(room)} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors" title="Delete room">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            {!dataLoading && filtered.length === 0 && (
              <div className="col-span-full py-16 text-center text-gray-400 font-medium">No rooms found.</div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-400 border-b-2 border-gray-100">
                <tr>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Room #</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Type</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Price / Night</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Status</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Housekeeper</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dataLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-8 py-5">
                          <div className="h-4 bg-gray-100 rounded-lg w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.map((room, i) => (
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
                    <td className="px-8 py-5 font-black text-black">
                      RWF {(room.price ?? 0).toLocaleString()}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${
                        room.status === "Available" ? "bg-green-50 text-green-700 border-green-200" :
                        room.status === "Occupied" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        room.status === "Booked" ? "bg-purple-50 text-purple-700 border-purple-200" :
                        "bg-red-50 text-red-700 border-red-200"
                      }`}>
                        {room.status === "Available" && <CheckCircle size={14} strokeWidth={3} />}
                        {room.status === "Booked" && <Calendar size={14} strokeWidth={3} />}
                        {room.status === "Maintenance" && <AlertCircle size={14} strokeWidth={3} />}
                        {room.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-medium text-gray-600">{room.housekeeper}</td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => cycleStatus(room.id, room.status)} className="px-3 py-2 bg-black hover:bg-gray-900 text-white rounded-lg font-bold transition-all text-xs uppercase tracking-wider">Update</button>
                        <button onClick={() => openEdit(room)} className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors" title="Edit room">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => openDelete(room)} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors" title="Delete room">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {!dataLoading && filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-8 py-16 text-center text-gray-400 font-medium">No rooms found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {(modal === "add" || modal === "edit") && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
              <button onClick={closeModal} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-black rounded-xl"><BedDouble size={20} className="text-gold" /></div>
                <h2 className="text-2xl font-black text-black">{modal === "add" ? "Add New Room" : `Edit Room ${editTarget?.id}`}</h2>
              </div>
              <div className="space-y-4">
                {modal === "add" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Room Number</label>
                    <input type="text" value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} className={inputClass} placeholder="e.g. 205" />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Room Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    className={`${inputClass} appearance-none`}
                  >
                    {ROOM_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Price / Night (RWF)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                    className={inputClass}
                    placeholder="e.g. 50000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as RoomStatus })} className={`${inputClass} appearance-none`}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Housekeeper</label>
                  <input type="text" value={form.housekeeper} onChange={e => setForm({ ...form, housekeeper: e.target.value })} className={inputClass} placeholder="Staff name" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={closeModal} className="flex-1 py-3 rounded-xl font-bold border-2 border-gray-200 text-gray-600 hover:border-gray-400 transition-colors">Cancel</button>
                <button
                  onClick={modal === "add" ? handleSaveAdd : handleSaveEdit}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl font-bold bg-black text-white hover:bg-gray-900 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (modal === "add" ? "Add Room" : "Save Changes")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {modal === "delete" && deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={28} className="text-red-600" />
              </div>
              <h2 className="text-2xl font-black text-black mb-2">Delete Room {deleteTarget.id}?</h2>
              <p className="text-gray-500 font-medium mb-6">This will permanently remove the room from Google Sheets. This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={closeModal} className="flex-1 py-3 rounded-xl font-bold border-2 border-gray-200 text-gray-600 hover:border-gray-400 transition-colors">Cancel</button>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-60 flex items-center justify-center"
                >
                  {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
