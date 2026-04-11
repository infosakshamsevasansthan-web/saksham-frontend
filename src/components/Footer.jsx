import React from 'react';
import { motion } from 'framer-motion';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin,
  ArrowRight
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-10 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                S
              </div>
              <span className="text-2xl font-black text-white tracking-tighter tracking-widest">SAKSHAM CITY</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Bharat ka sabse advance City Management System. Hum shehron ko Swachh, Sundar aur Saksham banane ke liye digital kranti la rahe hain.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <motion.a 
                  key={i}
                  whileHover={{ y: -5, color: '#10b981' }}
                  href="#" 
                  className="bg-slate-800 p-3 rounded-xl transition-colors"
                >
                  <Icon size={20} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Hamari Services</h4>
            <ul className="space-y-4">
              {['Door to Door Collection', 'Real-time Staff Tracking', 'Grievance Management', 'Water Connection', 'SWM Analytics'].map((item) => (
                <li key={item}>
                  <a href="#" className="flex items-center gap-2 hover:text-emerald-400 transition-colors group">
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Apps Section */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Download Our Apps</h4>
            <div className="space-y-4">
              <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 hover:border-emerald-500/50 transition-all cursor-pointer group">
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">For Citizens</p>
                <h5 className="text-white font-bold flex items-center justify-between">
                  Nagrik App <ArrowRight size={16} className="text-emerald-500" />
                </h5>
              </div>
              <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 hover:border-emerald-500/50 transition-all cursor-pointer group">
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">For Staff</p>
                <h5 className="text-white font-bold flex items-center justify-between">
                  Saksham Saathi <ArrowRight size={16} className="text-emerald-500" />
                </h5>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="text-emerald-500 shrink-0" size={20} />
                <span>Madhopur Dullam Urf Dhewhan, Kanti, Muzaffarpur, Bihar, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-emerald-500 shrink-0" size={20} />
                <span>+91 9430608992</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-emerald-500 shrink-0" size={20} />
                <span>support@sakshamcity.in</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:row-reverse md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-slate-500">
            © {currentYear} <span className="text-emerald-500 font-bold">Saksham Seva Sansthan</span>. All Rights Reserved.
          </p>
          
          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Swachh Survekshan 2026</a>
          </div>
          
          {/* Subtle Multi-language Hint */}
          <div className="flex items-center gap-2 text-xs bg-slate-800 px-3 py-1 rounded-full">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            System Language: Hindi / English
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;