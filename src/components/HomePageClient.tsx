"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star, Quote, Sparkles, Users, Dumbbell } from "lucide-react";
import PlaceholderImage from "@/components/PlaceholderImage";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function HomePageClient({ lang, dict }: { lang: string, dict: any }) {
  const featuredRooms = dict.accommodations?.featuredRooms || [];
  const testimonials = dict.reviews?.testimonials || [];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/30 rounded-full blur-[100px] z-10 animate-pulse pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-gold/20 rounded-full blur-[80px] z-10 animate-pulse pointer-events-none" />
        <div className="absolute inset-0 z-0">
          <img src="/hero.png" alt="Hero: Hotel Exterior" className="w-full h-full object-cover rounded-none" />
        </div>
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="text-gold uppercase tracking-[0.2em] text-sm font-bold mb-4 block drop-shadow-md">
              {dict.welcome}
            </span>
            <h1 className="text-5xl md:text-7xl font-heading font-black text-white mb-6 leading-tight drop-shadow-lg whitespace-pre-line">
              {dict.heroTitle}
            </h1>
            {dict.heroSubtitle && (
              <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-medium drop-shadow-md">
                {dict.heroSubtitle}
              </p>
            )}
            <div className={`flex flex-col sm:flex-row gap-6 justify-center items-center ${!dict.heroSubtitle ? 'mt-10' : ''}`}>
              <Link
                href={`/${lang}/book`}
                className="relative group overflow-hidden bg-gold hover:bg-gold-light text-black px-8 py-4 rounded-full font-bold text-lg transition-all shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:shadow-[0_0_30px_rgba(251,191,36,0.8)] hover:-translate-y-1"
              >
                <span className="relative z-10">{dict.bookSuite}</span>
                <div className="absolute inset-0 h-full w-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
              </Link>
              <Link
                href={`/${lang}/contact`}
                className="bg-black/40 hover:bg-black/60 backdrop-blur-md border-2 border-gold text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:-translate-y-1"
              >
                {dict.planEvent}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* === ABOUT / BAR SECTION === */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center">

            {/* Text — left */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="lg:w-1/2 order-2 lg:order-1"
            >
              <div className="inline-block px-4 py-1.5 bg-gray-100 rounded-full mb-6 border border-gray-200">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                  {dict.why?.label || 'Kuki Hitamo Hollywood Hotel'}
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-heading font-black text-black mb-6 leading-tight">
                {dict.why?.titleLine1 || 'Urubuga rwiza kuri'}<br />
                <span className="relative inline-block text-black">
                  {dict.why?.titleLine2 || 'Buri Gikorwa'}
                  <span className="absolute left-0 -bottom-1 w-full h-[3px] bg-amber-400/70 rounded-full" />
                </span>
              </h2>

              <p className="text-gray-900 mb-10 leading-relaxed text-lg font-normal text-justify">
                Proudly located in Rwimiyaga City, Hollywood Hotel stands as
                the finest destination in the Eastern Province. We blend
                timeless elegance with modern luxury — offering meticulously designed suites, world-class amenities,
                and an unmatched level of hospitality that has made us the top choice for travelers across the region.
              </p>

              <Link
                href={`/${lang}/rooms`}
                className="inline-flex items-center gap-3 font-bold text-black border-b-2 border-gray-300 hover:border-black pb-1 transition-colors uppercase tracking-widest text-sm group"
              >
                {dict.why?.exploreSuites || 'Sura Ibyumba Byacu'}
                <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </motion.div>

            {/* Image — right */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 relative order-1 lg:order-2 w-full"
            >
              <img
                src="/bar.png"
                alt="Hollywood Hotel Bar"
                className="w-full aspect-[4/3] object-cover rounded-3xl shadow-xl"
              />
            </motion.div>

          </div>
        </div>
      </section>

      <section className="py-24 bg-white relative overflow-hidden border-t-2 border-gold/15">
        <div className="absolute top-1/3 left-0 w-80 h-80 bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 bg-gold/10 rounded-full mb-4 border border-gold/20">
              <h2 className="text-sm font-bold text-gold uppercase tracking-widest">{dict.accommodations?.label}</h2>
            </div>
            <h3 className="text-4xl md:text-5xl font-heading font-black text-black">
              {dict.accommodations?.title}
            </h3>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto font-medium">
              {dict.accommodations?.description}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {featuredRooms.map((room: any, index: number) => {
              const roomImage = index === 0 ? "/room.png" : index === 1 ? "/bigger.png" : "/biggest.png";
              return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group bg-white rounded-3xl overflow-hidden border border-gray-200 hover:border-gold hover:shadow-[0_20px_40px_rgba(251,191,36,0.15)] transition-all duration-300 flex flex-col"
              >
                <div className="h-64 relative overflow-hidden bg-gray-100">
                  <img src={roomImage} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-4 right-4 bg-gold px-4 py-1.5 rounded-full font-black text-black text-sm shadow-md">
                    ${room.price}/night
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h4 className="text-2xl font-heading font-black text-black mb-3 group-hover:text-gold transition-colors">{room.name}</h4>
                  <p className="text-gray-600 mb-6 flex-1 text-base">{room.description}</p>
                  <div className="flex gap-2 flex-wrap mb-6">
                    {room.amenities.map((amenity: string, i: number) => (
                      <span key={i} className="text-xs font-bold bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg border border-gray-100 group-hover:bg-gold/5 group-hover:border-gold/20 transition-colors">
                        {amenity}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/${lang}/book?room=${encodeURIComponent(room.name)}`}
                    className="w-full text-center bg-black hover:bg-gold hover:text-black text-white py-3.5 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>{dict.accommodations?.reserveNow}</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="lg:w-1/2 order-2 lg:order-1">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-8 shadow-md">
                <Users size={28} className="text-gold" />
              </div>
              <h4 className="text-4xl md:text-5xl font-heading font-black text-black mb-6">Conference Center</h4>
              <p className="text-gray-500 mb-10 text-lg leading-relaxed font-medium">
                Host your events in our state-of-the-art facilities. Designed for productivity and elegance, our versatile spaces accommodate intimate meetings and large corporate gatherings with world-class catering and technology.
              </p>
              <Link href={`/${lang}/conference`} className="inline-flex items-center gap-3 font-bold text-black border-b-2 border-gold pb-1 hover:text-gold transition-colors uppercase tracking-widest text-sm group">
                <span>Explore Spaces</span>
                <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="lg:w-1/2 relative order-1 lg:order-2 w-full">
              <div className="absolute inset-0 bg-gold translate-x-6 translate-y-6 rounded-3xl -z-10 shadow-lg"></div>
              <div className="absolute inset-0 border-2 border-black -translate-x-4 -translate-y-4 rounded-3xl -z-10"></div>
              <img src="/conference.png" alt="Conference Center" className="w-full aspect-[4/3] object-cover rounded-3xl shadow-2xl border-4 border-white" />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white relative overflow-hidden border-t-2 border-gold/15">
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="lg:w-1/2 relative w-full">
              <div className="absolute inset-0 bg-black translate-x-6 translate-y-6 rounded-3xl -z-10 shadow-lg"></div>
              <div className="absolute inset-0 border-2 border-gold -translate-x-4 -translate-y-4 rounded-3xl -z-10"></div>
              <img src="/gym.png" alt="Fitness & Wellness" className="w-full aspect-[4/3] object-cover rounded-3xl shadow-2xl border-4 border-white" />
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="lg:w-1/2">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-8 shadow-md">
                <Dumbbell size={28} className="text-gold" />
              </div>
              <h4 className="text-4xl md:text-5xl font-heading font-black text-black mb-6">Fitness & Wellness</h4>
              <p className="text-gray-500 mb-10 text-lg leading-relaxed font-medium">
                Maintain your wellness routine in our fully-equipped modern gymnasium. Featuring the latest cardiovascular and strength training equipment, alongside dedicated spaces for yoga, stretching, and rejuvenation.
              </p>
              <Link href={`/${lang}/gym`} className="inline-flex items-center gap-3 font-bold text-black border-b-2 border-gold pb-1 hover:text-gold transition-colors uppercase tracking-widest text-sm group">
                <span>View Facilities</span>
                <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* === REVIEWS SECTION === */}
      <section className="relative overflow-hidden py-28">
        {/* Background image with dark overlay */}
        <div className="absolute inset-0 z-0">
          <img src="/biggest.png" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.82)' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400 mb-4 block">
              {dict.reviews?.label || 'Guest Reviews'}
            </span>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-4 leading-tight">
              {dict.reviews?.title || 'What Our Guests Say'}
            </h2>
            {/* Gold divider */}
            <div className="flex items-center justify-center gap-3 mt-5">
              <div className="w-12 h-[1px] bg-amber-400/50" />
              <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
              <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
              <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
              <div className="w-12 h-[1px] bg-amber-400/50" />
            </div>
          </motion.div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t: any, index: number) => {
              const initials = (t.author || 'G').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.12, duration: 0.6 }}
                  className="relative flex flex-col p-7 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(16px)',
                    transition: 'border-color 0.3s, transform 0.3s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(251,191,36,0.35)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  {/* Decorative gold quote */}
                  <span
                    className="absolute top-4 right-5 font-heading font-black leading-none select-none pointer-events-none text-amber-400"
                    style={{ fontSize: '6rem', opacity: 0.08 }}
                  >"</span>

                  {/* Stars */}
                  <div className="flex gap-0.5 mb-5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="#fbbf24" stroke="#fbbf24" />
                    ))}
                  </div>

                  {/* Quote text */}
                  <p className="text-white/75 italic leading-relaxed text-[0.95rem] flex-1 mb-7">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  {/* Author row */}
                  <div className="flex items-center gap-3 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0"
                      style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1.5px solid rgba(251,191,36,0.3)' }}
                    >
                      {initials}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm leading-none mb-0.5">{t.author}</p>
                      <p className="text-white/35 text-[0.7rem] uppercase tracking-widest font-medium">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white relative overflow-hidden border-t-2 border-gold/20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full bg-gold/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="bg-white p-12 md:p-16 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-t-4 border-gold"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-black text-black mb-6">{dict.cta?.title}</h2>
            <p className="text-gray-600 mb-10 text-xl">
              {dict.cta?.description}
            </p>
            <Link
              href={`/${lang}/book`}
              className="group relative inline-flex items-center justify-center bg-black hover:bg-gray-900 text-white px-10 py-5 rounded-full font-bold text-xl transition-all shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(251,191,36,0.3)] overflow-hidden"
            >
              <span className="relative z-10">{dict.cta?.button}</span>
              <div className="absolute inset-0 h-full w-full bg-gold/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
