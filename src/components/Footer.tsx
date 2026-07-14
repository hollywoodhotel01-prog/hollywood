import Link from "next/link";
import { Hotel, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-8 border-t-4 border-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="bg-white p-1.5 rounded-lg text-black group-hover:bg-gold transition-colors">
                <Hotel size={20} />
              </div>
              <span className="font-heading font-black text-xl tracking-tight text-white">
                Midland Hotel
              </span>
            </Link>
            <p className="text-gray-400 font-medium text-sm leading-relaxed mb-6">
              Experience unparalleled comfort and convenience. Your premium destination in Kayonza for stays, dining, and events.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-black text-lg mb-4 text-gold">Explore</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-gray-400 font-medium hover:text-white transition-colors text-sm">Home</Link></li>
              <li><Link href="/rooms" className="text-gray-400 font-medium hover:text-white transition-colors text-sm">Rooms & Suites</Link></li>
              <li><Link href="/conference" className="text-gray-400 font-medium hover:text-white transition-colors text-sm">Conference & Events</Link></li>
              <li><Link href="/dining" className="text-gray-400 font-medium hover:text-white transition-colors text-sm">Dining & Catering</Link></li>
              <li><Link href="/gym" className="text-gray-400 font-medium hover:text-white transition-colors text-sm">Gym & Facilities</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="font-heading font-black text-lg mb-4 text-gold">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-400 font-medium">
                <div className="bg-white/10 p-1.5 rounded-md mt-0.5">
                  <MapPin className="text-gold shrink-0" size={16} />
                </div>
                <span className="text-sm mt-1">Just minutes away from Kayonza Bus Park,<br/>Kayonza, Rwanda</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 font-medium">
                <div className="bg-white/10 p-1.5 rounded-md">
                  <Phone className="text-gold shrink-0" size={16} />
                </div>
                <span className="text-sm">+250 123 456 789</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 font-medium">
                <div className="bg-white/10 p-1.5 rounded-md">
                  <Mail className="text-gold shrink-0" size={16} />
                </div>
                <span className="text-sm">info@midlandhotel.rw</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t-2 border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 font-medium text-sm">
            &copy; {new Date().getFullYear()} Midland Hotel. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/dashboard" className="text-gray-400 font-bold hover:text-gold transition-colors text-sm bg-white/5 px-4 py-2 rounded-lg border border-white/10">
              Admin Dashboard Demo
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
