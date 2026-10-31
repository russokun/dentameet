import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Instagram, Linkedin } from 'lucide-react';
import { SOCIAL_LINKS, WHATSAPP_DISPLAY, whatsappUrl } from '@/lib/contact';

const TikTokIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.04-.1z"/>
  </svg>
);

const socials = [
  { icon: Instagram, href: SOCIAL_LINKS.instagram, label: "Instagram" },
  { icon: TikTokIcon, href: SOCIAL_LINKS.tiktok, label: "TikTok" },
  { icon: Linkedin, href: SOCIAL_LINKS.linkedin, label: "LinkedIn" }
];

const links = [
  { name: "Inicio", path: "/" },
  { name: "Nosotros", path: "/about" },
  { name: "Preguntas frecuentes", path: "/contact#faq" },
  { name: "Contacto", path: "/contact" },
  { name: "Unirse", path: "/auth" }
];

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-white relative overflow-hidden border-t border-white/5">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" aria-hidden="true"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24">

          {/* Brand Identity */}
          <div className="md:col-span-5">
            <Link to="/" className="inline-flex items-center space-x-3 mb-8 group">
              <img src="/logonb.png" alt="" className="h-12 w-12 object-contain" />
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight leading-none">DentaMeet</span>
                <span className="text-xs text-emerald-400 font-bold tracking-widest uppercase mt-1">PacienteFácil</span>
              </div>
            </Link>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed max-w-md">
              Conectamos a pacientes que buscan tratamientos dentales accesibles con estudiantes de odontología que atienden con supervisión docente.
            </p>
            <div className="flex gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`DentaMeet en ${social.label}`}
                  className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-500 transition-all group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/40"
                >
                  <social.icon className="h-5 w-5 text-slate-300 group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="md:col-span-3" aria-label="Pie de página">
            <h2 className="text-sm font-bold text-emerald-400 mb-6">Plataforma</h2>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-slate-300 hover:text-white transition-colors inline-flex py-1">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact & Support */}
          <div className="md:col-span-4">
            <h2 className="text-sm font-bold text-emerald-400 mb-6">Contacto</h2>
            <div className="space-y-3">
              <a
                href={whatsappUrl("Hola DentaMeet, tengo una consulta:")}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 hover:border-emerald-500/40 transition-all group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/40"
              >
                <span className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-slate-400 text-xs font-semibold">WhatsApp</span>
                  <span className="block text-white font-medium">{WHATSAPP_DISPLAY}</span>
                </span>
              </a>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                <span className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-slate-400 text-xs font-semibold">Base del equipo</span>
                  <span className="block text-white font-medium">Viña del Mar, Valparaíso</span>
                </span>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 mt-12 pt-8">
          <p className="text-slate-400 text-sm font-medium">
            © {new Date().getFullYear()} DentaMeet-PacienteFácil
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
