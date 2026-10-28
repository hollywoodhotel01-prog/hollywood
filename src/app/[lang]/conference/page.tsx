"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import {
  Wifi,
  Tv,
  Mic,
  CheckCircle2,
  Sparkles,
  Wind,
  AlertCircle,
  Heart,
  PartyPopper,
  Users,
  Music,
  Utensils,
  Calendar,
  Tent,
  ArrowRight,
  ShieldCheck,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useHotel, ConferenceBooking } from "@/context/HotelContext";

const VENUE_TENT = "Big Wedding & Party Tent (Outdoor Marquee)";
const VENUE_HALL = "Indoor Executive Conference Hall";
const VENUE_BOTH = "Combined Venue (Hall + Garden Tent)";

const INITIAL_FORM = {
  contactName: "",
  phone: "",
  venue: VENUE_TENT,
  eventType: "Wedding Reception & Ceremony",
  guests: "",
  date: "",
  paymentMethod: "Mobile Money",
  requirements: "",
};

export default function ConferencePage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const isRw = lang === "rw";

  const { addConferenceBooking } = useHotel();
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<ConferenceBooking | null>(null);
  const [confirmedVenue, setConfirmedVenue] = useState<string>("");
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [activeVenueIndex, setActiveVenueIndex] = useState(0);

  const formRef = useRef<HTMLDivElement>(null);
  const venuesScrollRef = useRef<HTMLDivElement>(null);

  const scrollToVenue = (index: number) => {
    setActiveVenueIndex(index);
    if (venuesScrollRef.current) {
      const container = venuesScrollRef.current;
      const cards = container.querySelectorAll(".venue-card-item");
      if (cards[index]) {
        (cards[index] as HTMLElement).scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  };

  const handleVenueScroll = () => {
    if (!venuesScrollRef.current) return;
    const container = venuesScrollRef.current;
    const cards = container.querySelectorAll(".venue-card-item");
    const containerCenter = container.scrollLeft + container.offsetWidth / 2;

    let closestIndex = 0;
    let minDistance = Infinity;

    cards.forEach((card, idx) => {
      const el = card as HTMLElement;
      const cardCenter = el.offsetLeft + el.offsetWidth / 2;
      const distance = Math.abs(containerCenter - cardCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx;
      }
    });

    if (closestIndex !== activeVenueIndex) {
      setActiveVenueIndex(closestIndex);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const handleSelectVenue = (venueName: string, eventTypeHint?: string) => {
    setFormData((prev) => ({
      ...prev,
      venue: venueName,
      eventType: eventTypeHint || prev.eventType,
    }));
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    setErrorMessage("");
    try {
      const guests = parseInt(formData.guests, 10) || 0;
      const venuePrefix = formData.venue ? `[Venue: ${formData.venue}]` : "";
      const fullRequirements = [venuePrefix, formData.requirements.trim()]
        .filter(Boolean)
        .join(" ");

      const saved = await addConferenceBooking({
        contactName: formData.contactName.trim(),
        phone: formData.phone.trim(),
        eventType: `${formData.eventType} · ${formData.venue.split(" (")[0]}`,
        guests: guests,
        date: formData.date,
        paymentMethod: formData.paymentMethod || "Mobile Money",
        paymentStatus: "Not Yet Paid",
        requirements: fullRequirements,
      });

      setConfirmedVenue(formData.venue);
      setConfirmedBooking(saved);
      setFormData(INITIAL_FORM);
      setFormStatus("success");
    } catch (err: any) {
      setErrorMessage(err?.message || "Could not submit your booking request. Please try again.");
      setFormStatus("error");
    }
  };

  const inputClass =
    "w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium";

  const tentFeatures = [
    { icon: Heart, label: isRw ? "Ibirori by'Ubukwe n'Abageni" : "Weddings, Receptions & Bridal Parties" },
    { icon: PartyPopper, label: isRw ? "Isabukuru & Ibirori by'Ubwoko Bwose" : "Birthdays, Galas & Celebration Parties" },
    { icon: Sparkles, label: isRw ? "Umutako w'Ihema & Itara rya Fairy Lights" : "Canopy Draping & Ambient Fairy Lights" },
    { icon: Users, label: isRw ? "Ubushobozi: Abashyitsi 500+" : "High Capacity: Accommodates 500+ Guests" },
    { icon: Music, label: isRw ? "Urubyiniro, DJ & Ibyuma by'Amajwi" : "Sound System, DJ Booth & Staging" },
    { icon: Utensils, label: isRw ? "Amafunguro n'Ibinyobwa by'Akarusho" : "Full Buffet Banqueting & Outside Catering" },
  ];

  const hallFeatures = [
    { icon: Tv, label: isRw ? "Smart Screens 4K & Porojegiteri" : "Smart 4K Screens & Digital Presentations" },
    { icon: Wifi, label: isRw ? "Interineti Yihuta ya Fiber & Wi-Fi" : "High-Speed Enterprise Fiber Wi-Fi" },
    { icon: Mic, label: isRw ? "Ibyuma by'Amajwi & Mikoro za Wireless" : "Acoustic Audio System & Wireless Mics" },
    { icon: Wind, label: isRw ? "A/C yo Gukonjesha & Intebe Ziteguye Neza" : "Full Climate Control & Ergonomic Seating" },
    { icon: Building2, label: isRw ? "Inama z'Ubucuruzi & Amahugurwa" : "Corporate Seminars, Retreats & Workshops" },
    { icon: ShieldCheck, label: isRw ? "Umutekano & Aho Imidoka Ziparika Hahagije" : "24/7 Security & Spacious Parking" },
  ];

  return (
    <div className="pt-20 min-h-screen bg-white relative">
      {/* Hero Header */}
      <div className="bg-white py-16 lg:py-20 text-center px-4 relative overflow-hidden border-b border-gray-100">
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-neutral-100 text-neutral-800 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-neutral-200">
            <Sparkles size={13} className="text-amber-600" />
            <span>{isRw ? "Hollywood Hotel Rwimiyaga · Ahantu h'Ibirori" : "Hollywood Hotel Rwimiyaga · Event Venues"}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-black text-black mb-5 tracking-tight">
            {isRw ? "Inama, Ubukwe n'Ibirori Byose" : "Conferences, Weddings & Grand Events"}
          </h1>
          <p className="text-gray-600 text-base sm:text-lg font-normal max-w-3xl mx-auto leading-relaxed">
            {isRw
              ? "Ukeneye gutegura ubukwe bw'inzozi mu ihema rinini (Big Tent) ryiteguye neza mu busitani cyangwa inama zikomeye z'ubucuruzi muri salle igezweho? Hollywood Hotel ibafitiye ibyiza kurusha ahandi hose."
              : "From fairytale weddings and lively celebration parties under our grand outdoor marquee tent, to high-level corporate symposiums in our state-of-the-art conference hall — we provide the perfect venue for every memorable occasion."}
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <button
              onClick={() => handleSelectVenue(VENUE_TENT, "Wedding Reception & Ceremony")}
              className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm group cursor-pointer"
            >
              <Tent size={16} />
              <span>{isRw ? "Ihema ry'Ubukwe n'Ibirori (Big Tent)" : "Big Wedding & Party Tent"}</span>
              <ArrowRight size={15} />
            </button>
            <button
              onClick={() => handleSelectVenue(VENUE_HALL, "Corporate Meeting")}
              className="inline-flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-black px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-xs group cursor-pointer"
            >
              <Building2 size={16} />
              <span>{isRw ? "Salle y'Inama (Conference Hall)" : "Indoor Conference Hall"}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10 space-y-12 lg:space-y-20">
        
        {/* Mobile Horizontal View Header & Venue Selector */}
        <div className="lg:hidden mb-4 relative z-20">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={13} className="text-gold" />
              <span>{isRw ? "Tembereza Aho Kwakirira Ibirori" : "Swipe Venues Horizontally"}</span>
            </span>
            <span className="text-xs font-black text-black bg-gold/20 px-2.5 py-0.5 rounded-full border border-gold/40">
              {activeVenueIndex + 1} of 2
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              type="button"
              onClick={() => scrollToVenue(0)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeVenueIndex === 0
                  ? "bg-black text-white border-2 border-gold shadow-md scale-[1.02]"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-gold/40"
              }`}
            >
              <Tent size={14} className={activeVenueIndex === 0 ? "text-gold" : "text-gray-400"} />
              <span>01. {isRw ? "Ihema ry'Ubukwe (Tent)" : "Wedding & Party Tent"}</span>
              <span className="text-[10px] ml-1 bg-gold/30 text-black px-1.5 py-0.5 rounded font-black">500+</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToVenue(1)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeVenueIndex === 1
                  ? "bg-black text-white border-2 border-gold shadow-md scale-[1.02]"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-gold/40"
              }`}
            >
              <Building2 size={14} className={activeVenueIndex === 1 ? "text-gold" : "text-gray-400"} />
              <span>02. {isRw ? "Salle y'Inama (Hall)" : "Indoor Conference Hall"}</span>
              <span className="text-[10px] ml-1 bg-gray-200 text-black px-1.5 py-0.5 rounded font-black">150+</span>
            </button>
          </div>
        </div>

        <div
          ref={venuesScrollRef}
          onScroll={handleVenueScroll}
          className="flex lg:grid overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none gap-4 sm:gap-6 lg:gap-20 pb-6 lg:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 lg:grid-cols-1 no-scrollbar scroll-smooth"
        >
          {/* ===================== VENUE 1: THE BIG WEDDING & PARTY TENT ===================== */}
          <section className="venue-card-item bg-white rounded-3xl lg:rounded-[2.5rem] p-5 sm:p-8 lg:p-12 border border-gray-200 shadow-sm relative overflow-hidden w-[88vw] max-w-[440px] lg:w-full lg:max-w-none shrink-0 snap-center">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Image Column - 100% clean without word overlays */}
              <div className="lg:col-span-6 relative">
                <div className="overflow-hidden rounded-2xl sm:rounded-3xl shadow-md aspect-[16/10] sm:aspect-[4/3] bg-gray-100">
                  <img
                    src="/weed.webp"
                    alt="Hollywood Hotel Big Wedding & Party Marquee Tent"
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* Details Column */}
              <div className="lg:col-span-6 flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-900 bg-rose-50 border border-rose-200/80 px-3 py-1 rounded-full">
                    <Heart size={13} className="text-rose-500 fill-rose-500" />
                    <span>{isRw ? "Ihema ry'Ubukwe n'Ibirori" : "Weddings & Party Marquee"}</span>
                  </span>
                  <span className="inline-flex items-center text-xs font-bold text-neutral-800 bg-neutral-100 border border-neutral-200 px-3 py-1 rounded-full">
                    {isRw ? "Abantu 500+" : "Up to 500+ Guests"}
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-lg w-fit mb-2.5 sm:mb-3 border border-amber-200/60">
                  <Tent size={14} />
                  <span>{isRw ? "Ihema Rinini ryo mu Busitani" : "Grand Outdoor Garden Marquee"}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-black mb-3 sm:mb-4 leading-tight">
                  {isRw ? "Ihema Rinini ry'Ubukwe n'Ibirori" : "Big Marquee Tent for Weddings & Parties"}
                </h2>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed font-normal mb-5 sm:mb-6">
                  {isRw
                    ? "Iri hema rinini riri mu busitani bwiza bwa Hollywood Hotel ryubatswe by'umwihariko kugira ngo ryakire ibirori by'ubukwe (Wedding), kwiyakira k'abageni, isabukuru y'amavuko, n'ibirori binyuranye by'umuryango cyangwa inshuti. Rifite umutako mwiza cyane w'imyenda, itara rya fairy lights, inzira y'abageni irabagirana, n'umwanya uhagije wo kubyina no gufata amafunguro."
                    : "Specifically designed and styled for fairytale weddings, joyous wedding receptions, milestone birthdays, anniversary galas, and festive celebration parties. Our grand high-peak marquee tent is situated on our manicured green lawns, featuring an illuminated ceremonial aisle walkway, romantic draped canopy, fairy light evening illumination, and abundant room for dining and dancing."}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mb-6 sm:mb-8">
                  {tentFeatures.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 sm:gap-3 text-black font-semibold p-2.5 sm:p-3 rounded-xl bg-gray-50 border border-gray-100 shadow-xs"
                    >
                      <div className="bg-amber-100 p-1.5 rounded-lg text-amber-900 shrink-0">
                        <item.icon size={15} strokeWidth={2.2} />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-gray-800">{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <button
                    onClick={() => handleSelectVenue(VENUE_TENT, "Wedding Reception & Ceremony")}
                    className="bg-black hover:bg-neutral-800 text-white px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2 group"
                  >
                    <span>{isRw ? "Hitamo Iri Hema ry'Ubukwe" : "Book This Wedding & Party Tent"}</span>
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <div className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                    <Check size={15} className="text-green-600" />
                    <span>{isRw ? "Inzira y'abageni n'amatara biteganyijwe" : "Draped walkway & lights included"}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ===================== VENUE 2: INDOOR CONFERENCE HALL ===================== */}
          <section className="venue-card-item bg-white rounded-3xl lg:rounded-[2.5rem] p-5 sm:p-8 lg:p-12 border border-gray-200 shadow-sm relative overflow-hidden w-[88vw] max-w-[440px] lg:w-full lg:max-w-none shrink-0 snap-center">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Details Column */}
              <div className="lg:col-span-6 order-2 lg:order-1 flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200/80 px-3 py-1 rounded-full">
                    <Building2 size={13} className="text-blue-600" />
                    <span>{isRw ? "Salle y'Inama" : "Indoor Conference Hall"}</span>
                  </span>
                  <span className="inline-flex items-center text-xs font-bold text-neutral-800 bg-neutral-100 border border-neutral-200 px-3 py-1 rounded-full">
                    {isRw ? "Abantu 150+" : "Up to 150+ Guests"}
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 bg-gray-100 px-3 py-1 rounded-lg w-fit mb-2.5 sm:mb-3">
                  <Building2 size={14} />
                  <span>{isRw ? "Salle yo Muri Hotel Iteguye Neza" : "Indoor Climate-Controlled Hall"}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-black mb-3 sm:mb-4 leading-tight">
                  {isRw ? "Salle Igezweho y'Inama n'Amahugurwa" : "Modern Indoor Conference & Meeting Hall"}
                </h2>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed font-normal mb-5 sm:mb-6">
                  {isRw
                    ? "Icyumba kigezweho cyo kubarizamo inama zikomeye z'ubucuruzi, amahugurwa, inama z'ubuyobozi, n'ibiganiro by'ubumenyi. Cyateguwe mu buryo butuma abitabira bakora mu ituze, gifite interineti ya fiber yihuta, ibyuma bifata amajwi n'amashusho, n'intebe ziteguye neza mu buryo bwose mukeneye."
                    : "A distraction-free, air-conditioned corporate environment engineered for productive conferences, executive seminars, board meetings, workshops, and private business sessions. Outfitted with high-speed fiber internet, Smart presentation displays, studio audio, and flexible seating arrangements."}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mb-6 sm:mb-8">
                  {hallFeatures.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 sm:gap-3 text-black font-semibold p-2.5 sm:p-3 rounded-xl bg-gray-50 border border-gray-100 shadow-xs"
                    >
                      <div className="bg-neutral-200 p-1.5 rounded-lg text-black shrink-0">
                        <item.icon size={15} strokeWidth={2.2} />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-gray-800">{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <button
                    onClick={() => handleSelectVenue(VENUE_HALL, "Corporate Meeting")}
                    className="bg-black hover:bg-neutral-800 text-white px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2 group"
                  >
                    <span>{isRw ? "Hitamo Salle y'Inama" : "Book Conference Hall"}</span>
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <div className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                    <Check size={15} className="text-green-600" />
                    <span>{isRw ? "Porojegiteri & Wi-Fi byose birimo" : "Smart displays & Wi-Fi included"}</span>
                  </div>
                </div>
              </div>

              {/* Image Column - 100% clean without word overlays */}
              <div className="lg:col-span-6 order-1 lg:order-2 relative">
                <div className="overflow-hidden rounded-2xl sm:rounded-3xl shadow-md aspect-[16/10] sm:aspect-[4/3] bg-gray-100">
                  <img
                    src="/salle.webp"
                    alt="Hollywood Hotel Modern Conference Hall"
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Mobile Horizontal View Navigation Controls */}
        <div className="lg:hidden flex items-center justify-between mt-2 mb-6 px-2 relative z-20">
          <button
            type="button"
            onClick={() => scrollToVenue(0)}
            disabled={activeVenueIndex === 0}
            className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-800 disabled:opacity-30 disabled:pointer-events-none shadow-sm flex items-center gap-1 active:scale-95 transition-all"
          >
            <ChevronLeft size={16} />
            <span>Prev Venue</span>
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {[0, 1].map((idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToVenue(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  activeVenueIndex === idx ? "w-7 bg-gold" : "w-2.5 bg-gray-300"
                }`}
                aria-label={`Go to venue ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollToVenue(1)}
            disabled={activeVenueIndex === 1}
            className="px-3.5 py-2 rounded-xl bg-black text-white text-xs font-bold disabled:opacity-30 disabled:pointer-events-none shadow-sm flex items-center gap-1 hover:bg-gold hover:text-black active:scale-95 transition-all"
          >
            <span>Next Venue</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* ===================== BOOKING FORM SECTION ===================== */}
        <div ref={formRef} id="booking-form" className="scroll-mt-28">
          <div className="bg-white rounded-3xl lg:rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.06)] border-2 border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-gold via-amber-400 to-black"></div>

            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <span className="text-xs font-bold uppercase tracking-widest text-gold bg-black px-4 py-1.5 rounded-full inline-block mb-3">
                  {isRw ? "Saba Umwanya W'Ibirori" : "Reservation Request"}
                </span>
                <h3 className="text-3xl sm:text-4xl font-heading font-black text-black mb-3">
                  {isRw ? "Fata Umwanya w'Ihema ry'Ubukwe cyangwa Salle y'Inama" : "Reserve Your Event Venue or Conference Hall"}
                </h3>
                <p className="text-gray-600 font-medium text-base">
                  {isRw
                    ? "Uzuza iyi fomu maze ikipe ya Hollywood Hotel ihite iguhamagara igufashe gutegura ibirori cyangwa inama yawe mu buryo bunoze."
                    : "Fill out the reservation details below and our event coordinators will contact you promptly to finalize setups, catering, and schedule."}
                </p>
              </div>

              {formStatus === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 text-green-900 p-8 sm:p-10 rounded-2xl text-center border-2 border-green-200"
                >
                  <CheckCircle2 className="mx-auto mb-4 text-green-600" size={60} />
                  <h4 className="text-2xl sm:text-3xl font-black mb-2">
                    {isRw ? "Ubusabe Bwakiriwe Neza!" : "Booking Request Received!"}
                  </h4>
                  <p className="text-gray-700 mb-6 font-medium text-base">
                    {isRw
                      ? "Ubusabe bwanyu bwo gufata umwanya bwanditswe neza muri sisitemu. Ikipe yacu irabahamagara vuba cyane ngo musoze gahunda."
                      : "Your event reservation request has been successfully recorded in our management system. Our team will contact you shortly to confirm your booking."}
                  </p>
                  
                  {confirmedBooking && (
                    <div className="bg-white rounded-2xl p-6 mb-8 text-left border border-green-200 space-y-3 text-sm shadow-sm">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                        <span className="text-gray-500 font-bold uppercase text-xs">Reference ID</span>
                        <span className="font-black text-black bg-gold/30 px-3 py-1 rounded-md text-sm">
                          {confirmedBooking.id}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-500">Selected Venue</span>
                        <span className="font-bold text-black text-right">{confirmedVenue || confirmedBooking.eventType}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-500">Contact Person</span>
                        <span className="font-bold text-black">{confirmedBooking.contactName}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-500">Phone Number</span>
                        <span className="font-bold text-black">{confirmedBooking.phone}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-500">Event Details</span>
                        <span className="font-bold text-black">{confirmedBooking.eventType}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-500">Date &amp; Expected Guests</span>
                        <span className="font-bold text-black">
                          {confirmedBooking.date} · {confirmedBooking.guests} guests
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-500">Payment Preference</span>
                        <span className="font-bold text-black">{confirmedBooking.paymentMethod || "Mobile Money"}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-gray-500">Status</span>
                        <span className="font-bold text-xs uppercase px-2.5 py-1 rounded bg-amber-100 text-amber-800">
                          {confirmedBooking.status || "Pending"}
                        </span>
                      </div>
                      {confirmedBooking.requirements && (
                        <div className="pt-2.5 border-t border-gray-100 text-xs text-gray-600">
                          <span className="font-bold text-gray-800 block mb-1">Requirements &amp; Setup Notes:</span>
                          <p className="italic bg-gray-50 p-2.5 rounded-lg">{confirmedBooking.requirements}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setConfirmedBooking(null);
                      setFormStatus("idle");
                    }}
                    className="px-8 py-3 bg-black hover:bg-gold hover:text-black text-white rounded-xl text-sm font-bold transition-all shadow-md"
                  >
                    {isRw ? "Tegura Ikindi Gikorwa" : "Book another event"}
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {formStatus === "error" && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold flex items-center gap-2.5">
                      <AlertCircle size={18} className="shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Venue Selector Radios/Cards */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2.5">
                      {isRw ? "Hitamo Ahantu / Space Wifuza *" : "Select Venue / Space *"}
                    </label>
                    <div className="flex sm:grid overflow-x-auto sm:overflow-visible snap-x snap-mandatory sm:snap-none gap-3 pb-2 sm:pb-0 -mx-1 px-1 sm:mx-0 sm:px-0 no-scrollbar">
                      {[
                        {
                          id: VENUE_TENT,
                          title: isRw ? "Ihema ry'Ubukwe (Big Tent)" : "Big Wedding & Party Tent",
                          badge: isRw ? "Abantu 500+" : "Up to 500+ Guests",
                          icon: Tent,
                        },
                        {
                          id: VENUE_HALL,
                          title: isRw ? "Salle y'Inama (Hall)" : "Indoor Conference Hall",
                          badge: isRw ? "Abantu 150+" : "Up to 150+ Guests",
                          icon: Building2,
                        },
                        {
                          id: VENUE_BOTH,
                          title: isRw ? "Ihema + Salle (Byose)" : "Both Spaces (Hall + Tent)",
                          badge: isRw ? "Ibirori Bihambaye" : "Mega Celebrations",
                          icon: Sparkles,
                        },
                      ].map((item) => {
                        const isSelected = formData.venue === item.id;
                        const Icon = item.icon;
                        return (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() => setFormData({ ...formData, venue: item.id })}
                            className={`p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between w-[76vw] max-w-[280px] sm:w-auto sm:max-w-none shrink-0 snap-center ${
                              isSelected
                                ? "border-gold bg-amber-50/50 shadow-sm"
                                : "border-gray-200 bg-gray-50/60 hover:border-gray-300 hover:bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div
                                className={`p-2 rounded-xl ${
                                  isSelected ? "bg-black text-gold" : "bg-white text-gray-600 border border-gray-200"
                                }`}
                              >
                                <Icon size={18} />
                              </div>
                              <span
                                className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                                  isSelected ? "bg-gold text-black" : "bg-gray-200 text-gray-700"
                                }`}
                              >
                                {item.badge}
                              </span>
                            </div>
                            <span className="font-black text-sm text-black">{item.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {isRw ? "Amazina Yombi *" : "Full Name *"}
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Jean-Paul Habimana"
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {isRw ? "Nimero ya Telefone *" : "Phone Number *"}
                      </label>
                      <input
                        required
                        type="tel"
                        placeholder="+250 78... / +250 72..."
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Event Type & Guests */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {isRw ? "Ubwoko bw'Ibirori *" : "Event Type *"}
                      </label>
                      <select
                        required
                        value={formData.eventType}
                        onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                        className={`${inputClass} appearance-none cursor-pointer`}
                      >
                        <option value="Wedding Reception & Ceremony">Wedding Reception &amp; Ceremony</option>
                        <option value="Birthday & Celebration Party">Birthday &amp; Celebration Party</option>
                        <option value="Anniversary / Family Gala">Anniversary / Family Gala</option>
                        <option value="Corporate Conference / Meeting">Corporate Conference / Meeting</option>
                        <option value="Training / Workshop Seminar">Training / Workshop Seminar</option>
                        <option value="Banquet & Dinner Reception">Banquet &amp; Dinner Reception</option>
                        <option value="Other Social Event">Other Social Event</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {isRw ? "Igenekerezo ry'Abashyitsi *" : "Estimated Number of Guests *"}
                      </label>
                      <input
                        required
                        type="number"
                        min="1"
                        max="800"
                        placeholder="e.g. 150 (up to 500+)"
                        value={formData.guests}
                        onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Date & Payment */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {isRw ? "Itariki y'Ibirori *" : "Event Date *"}
                      </label>
                      <input
                        required
                        type="date"
                        min={today}
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {isRw ? "Uburyo bwo Kwishyura Wifuza" : "Preferred Payment Method"}
                      </label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        className={`${inputClass} appearance-none cursor-pointer`}
                      >
                        <option value="Mobile Money">Mobile Money (MTN MoMo / Airtel)</option>
                        <option value="Cash">Cash on Arrival</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Credit / Debit Card">Credit / Debit Card</option>
                      </select>
                    </div>
                  </div>

                  {/* Special Requirements */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {isRw ? "Ibyo Wifuza By'Umwihariko / Ibikoresho" : "Special Requirements / Setup Requests"}
                    </label>
                    <textarea
                      rows={3}
                      placeholder={
                        isRw
                          ? "Umutako w'abageni, amatara ya fairy lights, urubyiniro na DJ, porojegiteri, mikoro, amafunguro n'ibinyobwa..."
                          : "Wedding aisle decor, canopy fairy lights, DJ & sound setup, bridal stage, projectors, buffet catering, coffee break..."
                      }
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      className={`${inputClass} resize-none`}
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={formStatus === "submitting"}
                    className="w-full bg-black hover:bg-gold hover:text-black text-white py-4 rounded-xl font-bold text-lg transition-all shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_30px_rgba(251,191,36,0.3)] disabled:opacity-70 flex justify-center items-center group relative overflow-hidden cursor-pointer"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {formStatus === "submitting" ? (
                        <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <>
                          <span>{isRw ? "Ohereza Ubusabe bwo Gufata Umwanya" : "Submit Reservation Request"}</span>
                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
