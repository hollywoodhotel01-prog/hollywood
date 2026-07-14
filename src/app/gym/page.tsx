"use client";

import { motion } from "framer-motion";
import { Dumbbell, Car, Wifi, Clock, ShieldCheck } from "lucide-react";
import PlaceholderImage from "@/components/PlaceholderImage";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function GymPage() {
  return (
    <div className="pt-20 min-h-screen bg-white relative">
      {/* Header */}
      <div className="bg-white py-16 text-center px-4 relative overflow-hidden border-b-2 border-gold/20">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-full bg-gold/10 blur-[100px] rounded-full pointer-events-none" />
         
         <div className="relative z-10 max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-heading font-black text-black mb-4">Gym & Facilities</h1>
            <p className="text-gray-600 text-xl font-medium">
              Maintain your fitness routine and enjoy our complimentary guest amenities.
            </p>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        
        {/* Gym Section */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="bg-white rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-2 border-gray-100 mb-24 relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/20 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 relative z-10">
            <div className="p-10 md:p-16 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-black rounded-xl text-gold shadow-md">
                  <Dumbbell size={28} />
                </div>
                <h2 className="text-4xl font-heading font-black text-black">Fitness Center</h2>
              </div>
              <p className="text-gray-600 mb-8 leading-relaxed text-lg font-medium">
                Stay active during your stay with our fully-equipped fitness center. Whether you prefer cardio workouts or strength training, our gym has everything you need to maintain your health routine.
              </p>
              
              <div className="mb-8 p-6 bg-gray-50 rounded-2xl border-l-4 border-gold">
                <h3 className="font-bold text-black mb-4 text-lg">Equipment Available:</h3>
                <ul className="space-y-3 text-black font-medium">
                  <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-gold"></span>Treadmills & Ellipticals</li>
                  <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-gold"></span>Stationary Bikes</li>
                  <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-gold"></span>Free Weights & Dumbbells</li>
                  <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-gold"></span>Weight Machines</li>
                  <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-gold"></span>Yoga Mats</li>
                </ul>
              </div>

              <div className="flex items-center gap-3 text-lg font-bold text-black bg-gold/20 border border-gold/40 w-fit px-6 py-3 rounded-full shadow-sm">
                <Clock size={20} className="text-gold" />
                <span>Open Daily: 6:00 AM - 10:00 PM</span>
              </div>
            </div>
            <div className="relative min-h-[400px] lg:min-h-full">
              <PlaceholderImage label="Gym Interior & Equipment" className="w-full h-full rounded-none" />
            </div>
          </div>
        </motion.div>

        {/* Other Facilities */}
        <motion.div
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true }}
           variants={fadeIn}
           className="relative"
        >
          <div className="absolute -left-32 top-1/2 w-64 h-64 bg-gold/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="inline-block px-4 py-1.5 bg-gold/10 rounded-full mb-6 border border-gold/20 mx-auto flex w-fit">
              <h2 className="text-sm font-bold text-gold uppercase tracking-widest">More Hotel Facilities</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div className="bg-white p-10 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border-2 border-gray-100 text-center hover:-translate-y-2 hover:border-gold transition-all duration-300 group">
              <div className="w-16 h-16 mx-auto bg-black text-gold rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 group-hover:bg-gold group-hover:text-black transition-all">
                <Car size={32} />
              </div>
              <h3 className="font-black text-xl text-black mb-4">Free Parking</h3>
              <p className="text-gray-600 font-medium">Ample, secure parking space available free of charge for all our guests and event attendees.</p>
            </div>
            
            <div className="bg-white p-10 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border-2 border-gray-100 text-center hover:-translate-y-2 hover:border-gold transition-all duration-300 group">
              <div className="w-16 h-16 mx-auto bg-black text-gold rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 group-hover:bg-gold group-hover:text-black transition-all">
                <Wifi size={32} />
              </div>
              <h3 className="font-black text-xl text-black mb-4">High-Speed Wi-Fi</h3>
              <p className="text-gray-600 font-medium">Stay connected with complimentary high-speed internet access available throughout the property.</p>
            </div>
            
            <div className="bg-white p-10 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border-2 border-gray-100 text-center hover:-translate-y-2 hover:border-gold transition-all duration-300 group">
              <div className="w-16 h-16 mx-auto bg-black text-gold rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 group-hover:bg-gold group-hover:text-black transition-all">
                <ShieldCheck size={32} />
              </div>
              <h3 className="font-black text-xl text-black mb-4">24/7 Security & Reception</h3>
              <p className="text-gray-600 font-medium">Our front desk is always open, and our premises are secured around the clock for your peace of mind.</p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
