"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BedDouble, Utensils, Users, Dumbbell, MapPin, Coffee, ArrowRight, CheckCircle2, Star, Quote } from "lucide-react";
import PlaceholderImage from "@/components/PlaceholderImage";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const featuredRooms = [
  {
    name: "Standard Room",
    price: 80,
    description: "Perfect for solo travelers or short stays. Clean, cozy, and fully equipped.",
    amenities: ["Free Wi-Fi", "Smart TV", "Hot Water"],
  },
  {
    name: "Deluxe Room",
    price: 120,
    description: "Spacious comfort with premium seating area. Ideal for couples and business travelers.",
    amenities: ["Air Conditioning", "Coffee Maker", "Free Wi-Fi"],
  },
  {
    name: "Midland Suite",
    price: 300,
    description: "Our finest accommodation featuring separate living areas and luxury amenities.",
    amenities: ["All Meals Included", "Climate Control", "Minibar"],
  },
];

const testimonials = [
  {
    quote: "Exceptional service! The staff was incredibly welcoming, and the rooms were spotless. Perfectly located near Kayonza Bus Park.",
    author: "Jean-Paul R.",
    role: "Business Traveler",
  },
  {
    quote: "Midland Hotel is our go-to choice for hosting business training. The conference halls are equipped with everything we need and catering is top-tier.",
    author: "Marie Claire U.",
    role: "NGO Coordinator",
  },
  {
    quote: "Very comfortable stay. The gym facilities are excellent and the food in the restaurant was delicious. Highly recommend!",
    author: "David K.",
    role: "International Tourist",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Simple dark overlay to ensure text readability while keeping the image clear */}
        <div className="absolute inset-0 bg-black/40 z-10" />
        
        {/* Yellow glowing orb accent */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/30 rounded-full blur-[100px] z-10 animate-pulse pointer-events-none" />

        <div className="absolute inset-0 z-0">
          <PlaceholderImage label="Hero: Hotel Exterior" className="w-full h-full rounded-none" />
        </div>
        
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-gold uppercase tracking-[0.2em] text-sm font-bold mb-4 block drop-shadow-md">
              Welcome to Kayonza
            </span>
            <h1 className="text-5xl md:text-7xl font-heading font-black text-white mb-6 leading-tight drop-shadow-lg">
              Midland Hotel
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-medium drop-shadow-md">
              Experience unmatched comfort and professional service. Whether you are staying the night, hosting an event, or passing through, we make every moment memorable.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/book"
                className="relative group overflow-hidden bg-gold hover:bg-gold-light text-black px-8 py-4 rounded-full font-bold text-lg transition-all shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:shadow-[0_0_30px_rgba(251,191,36,0.8)] hover:-translate-y-1"
              >
                <span className="relative z-10">Book a Room</span>
                <div className="absolute inset-0 h-full w-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
              </Link>
              <Link
                href="/conference"
                className="bg-black/40 hover:bg-black/60 backdrop-blur-md border-2 border-gold text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:-translate-y-1"
              >
                Plan an Event
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-20 bg-white relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-[80px] -translate-y-1/2 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
          >
            {[
              { icon: BedDouble, label: "Rooms & Suites", href: "/rooms" },
              { icon: Users, label: "Conference Halls", href: "/conference" },
              { icon: Utensils, label: "Fine Dining", href: "/dining" },
              { icon: Coffee, label: "Outside Catering", href: "/dining" },
              { icon: Dumbbell, label: "Fitness Center", href: "/gym" },
              { icon: MapPin, label: "Prime Location", href: "/contact" },
            ].map((item, index) => (
              <motion.div key={index} variants={fadeIn}>
                <Link href={item.href} className="group flex flex-col items-center text-center p-6 rounded-3xl bg-white border border-gray-100 hover:border-gold hover:shadow-[0_8px_30px_rgba(251,191,36,0.15)] transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center mb-4 text-gold group-hover:scale-110 group-hover:bg-gold group-hover:text-black transition-all duration-300 shadow-md">
                    <item.icon size={28} strokeWidth={2} />
                  </div>
                  <h3 className="font-bold text-black text-sm">{item.label}</h3>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Yellow decorative accents */}
        <div className="absolute -left-20 top-20 w-72 h-72 border-[40px] border-gold/10 rounded-full pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-1/3 h-full bg-gradient-to-l from-gold/5 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <div className="inline-block px-4 py-1.5 bg-gold/10 rounded-full mb-6 border border-gold/20">
                <h2 className="text-sm font-bold text-gold uppercase tracking-widest">Why Choose Us</h2>
              </div>
              <h3 className="text-4xl md:text-5xl font-heading font-black text-black mb-6 leading-tight">
                Your Comfort is Our <span className="text-gold underline decoration-8 underline-offset-4">Priority</span>
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                Located just minutes from the busy Kayonza Bus Park, Midland Hotel offers a peaceful retreat for travelers and a professional environment for business events. We blend warm Rwandan hospitality with modern amenities to ensure your stay is perfect.
              </p>
              
              <ul className="space-y-5 mb-10">
                {[
                  "Clean, spacious, and well-equipped rooms",
                  "Modern conference facilities for any event size",
                  "Delicious local and international cuisine",
                  "Highly accessible location in Kayonza"
                ].map((text, i) => (
                  <li key={i} className="flex items-center gap-4 text-black font-medium p-3 rounded-xl hover:bg-gold/5 transition-colors">
                    <div className="bg-gold p-1 rounded-full text-black shadow-sm shrink-0">
                      <CheckCircle2 size={20} strokeWidth={2.5} />
                    </div>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/rooms" className="group inline-flex items-center gap-3 font-bold text-black border-b-2 border-gold pb-1 hover:text-gold transition-colors text-lg">
                Explore our rooms 
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gold translate-x-6 translate-y-6 rounded-3xl -z-10 shadow-lg"></div>
              <div className="absolute inset-0 border-2 border-black -translate-x-4 -translate-y-4 rounded-3xl -z-10"></div>
              <PlaceholderImage label="Lobby / Reception Area" className="w-full aspect-[4/3] rounded-3xl shadow-2xl border-4 border-white" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Rooms & Suites Section */}
      <section className="py-24 bg-white relative overflow-hidden border-t-2 border-gold/15">
        <div className="absolute top-1/3 left-0 w-80 h-80 bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 bg-gold/10 rounded-full mb-4 border border-gold/20">
              <h2 className="text-sm font-bold text-gold uppercase tracking-widest">Our Accommodations</h2>
            </div>
            <h3 className="text-4xl md:text-5xl font-heading font-black text-black">
              Featured Rooms & Suites
            </h3>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto font-medium">
              Explore our most popular rooms selected for premium comfort and state-of-the-art hospitality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {featuredRooms.map((room, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group bg-white rounded-3xl overflow-hidden border border-gray-200 hover:border-gold hover:shadow-[0_20px_40px_rgba(251,191,36,0.15)] transition-all duration-300 flex flex-col"
              >
                <div className="h-64 relative overflow-hidden">
                  <PlaceholderImage label={`Photo: ${room.name}`} className="w-full h-full rounded-none group-hover:scale-105 transition-transform duration-750" />
                  <div className="absolute top-4 right-4 bg-gold px-4 py-1.5 rounded-full font-black text-black text-sm shadow-md">
                    ${room.price}/night
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h4 className="text-2xl font-heading font-black text-black mb-3 group-hover:text-gold transition-colors">{room.name}</h4>
                  <p className="text-gray-600 mb-6 flex-1 text-base">{room.description}</p>
                  
                  <div className="flex gap-2 flex-wrap mb-6">
                    {room.amenities.map((amenity, i) => (
                      <span key={i} className="text-xs font-bold bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg border border-gray-100 group-hover:bg-gold/5 group-hover:border-gold/20 transition-colors">
                        {amenity}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/book?room=${encodeURIComponent(room.name)}`}
                    className="w-full text-center bg-black hover:bg-gold hover:text-black text-white py-3.5 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>Reserve Room</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Guest Testimonials Section */}
      <section className="py-24 bg-white relative overflow-hidden border-t-2 border-gold/15">
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 bg-gold/10 rounded-full mb-4 border border-gold/20">
              <h2 className="text-sm font-bold text-gold uppercase tracking-widest">Reviews</h2>
            </div>
            <h3 className="text-4xl md:text-5xl font-heading font-black text-black">
              What Our Guests Say
            </h3>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto font-medium">
              We take pride in providing our guests with unforgettable experiences. Here are reviews from some of our visitors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white p-8 rounded-3xl border border-gray-200 hover:border-gold hover:shadow-[0_15px_30px_rgba(0,0,0,0.03)] transition-all duration-300 relative flex flex-col justify-between group"
              >
                <div className="absolute top-8 right-8 text-gold/15 group-hover:text-gold/30 transition-colors">
                  <Quote size={48} strokeWidth={2.5} />
                </div>

                <div className="mb-6">
                  {/* Star Rating */}
                  <div className="flex gap-1 mb-5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={18} fill="#fbbf24" stroke="#fbbf24" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic leading-relaxed text-base font-medium">
                    "{t.quote}"
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h5 className="font-bold text-black text-lg">{t.author}</h5>
                  <p className="text-sm text-gray-500 font-medium mt-0.5">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
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
            <h2 className="text-4xl md:text-5xl font-heading font-black text-black mb-6">Ready to Experience Midland?</h2>
            <p className="text-gray-600 mb-10 text-xl">
              Book your room today and enjoy the best hospitality in Kayonza.
            </p>
            <Link
              href="/book"
              className="group relative inline-flex items-center justify-center bg-black hover:bg-gray-900 text-white px-10 py-5 rounded-full font-bold text-xl transition-all shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(251,191,36,0.3)] overflow-hidden"
            >
              <span className="relative z-10">Book Your Stay Now</span>
              <div className="absolute inset-0 h-full w-full bg-gold/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
