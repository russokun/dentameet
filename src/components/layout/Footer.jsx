import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Instagram, Linkedin, Sparkles } from 'lucide-react';

const TikTokIcon = ({ className }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.04-.1z"/>
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-white relative overflow-hidden border-t border-white/5">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24">
          
          {/* Brand Identity */}
          <div className="md:col-span-5">
            <Link to="/" className="flex items-center space-x-3 mb-8 group">
              <div className="relative">
                <div className="w-14 h-14 flex items-center justify-center">
                  <img src="/logonb.png" alt="DentaMeet" className="h-12 w-12 object-contain" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight leading-none">DentaMeet</span>
                <span className="text-xs text-emerald-500 font-bold tracking-widest uppercase mt-1">PacienteFácil</span>
              </div>
            </Link>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-md">
              Democratizando la salud bucal a través de la tecnología. Conectamos el talento odontológico con la comunidad para un cuidado más humano y accesible.
            </p>
            <div className="flex space-x-5">
              {[
                { icon: Instagram, href: "https://www.instagram.com/pacientefacil/" },
                { icon: TikTokIcon, href: "https://www.tiktok.com/@dentameet_pacientefacil" },
                { icon: Linkedin, href: "https://www.linkedin.com/company/pacientef%C3%A1cil/" }
              ].map((social, idx) => (
                <a 
                  key={idx}
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-500 transition-all group"
                >
                  <social.icon className="h-5 w-5 text-slate-400 group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3">
            <span className="text-sm font-black uppercase tracking-[0.2em] text-emerald-500 mb-8 block">Plataforma</span>
            <ul className="space-y-4">
              {[
                { name: "Explorar Inicio", path: "/" },
                { name: "Sobre Nosotros", path: "/about" },
                { name: "Preguntas Frecuentes", path: "/contact#faq" },
                { name: "Unirse a la Red", path: "/auth" }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className="text-slate-400 hover:text-white transition-colors flex items-center group">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="md:col-span-4">
            <span className="text-sm font-black uppercase tracking-[0.2em] text-emerald-500 mb-8 block">Soporte y Contacto</span>
            <div className="space-y-4">
              <a 
                href="mailto:contacto@dentameet.net?subject=Contacto%20desde%20la%20Web%20-%20DentaMeet&body=Hola%20equipo%20de%20DentaMeet%20%F0%9F%A6%B7%2C%0A%0AEstoy%20interesado%20en%20comunicarme%20con%20ustedes.%20Mis%20datos%20son%20los%20siguientes%3A%0A%F0%9F%91%A4%20Nombre%3A%0A%F0%9F%93%A7%20Correo%3A%0A%F0%9F%92%AC%20Motivo%20de%20consulta%3A%0A%0AQuedo%20atento%20a%20su%20respuesta.%0ASaludos."
                className="glass-card-light p-5 rounded-2xl bg-white/5 border-white/5 backdrop-blur-md flex items-center space-x-4 hover:bg-white/10 hover:border-emerald-500/30 transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <div className="text-slate-500 text-[10px] font-black uppercase tracking-wider">Email Oficial</div>
                  <div className="text-white font-medium text-sm">contacto@dentameet.net</div>
                </div>
              </a>

              <a 
                href="https://wa.me/56957384302?text=Hola%20DentaMeet%20%F0%9F%A6%B7%2C%20estoy%20interesado%20en%20comunicarme%20con%20ustedes.%20%F0%9F%93%A9%20Mis%20datos%20son%3A%0A%0A%F0%9F%91%A4%20Nombre%3A%0A%F0%9F%93%A7%20Correo%3A%0A%F0%9F%92%AC%20Motivo%20de%20consulta%3A"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card-light p-5 rounded-2xl bg-white/5 border-white/5 backdrop-blur-md flex items-center space-x-4 hover:bg-white/10 hover:border-emerald-500/30 transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <div className="text-slate-500 text-[10px] font-black uppercase tracking-wider">WhatsApp Soporte</div>
                  <div className="text-white font-medium text-sm">+56 9 5738 4302</div>
                </div>
              </a>

              <div className="glass-card-light p-5 rounded-2xl bg-white/5 border-white/5 backdrop-blur-md flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <div className="text-slate-500 text-[10px] font-black uppercase tracking-wider">Ubicación Central</div>
                  <div className="text-white font-medium text-sm">Viña del Mar, Valparaíso</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-sm font-medium">
            © {new Date().getFullYear()} DentaMeet-Pacientefacil. Innovación en Salud Dental.
          </p>
          <div className="flex items-center gap-8 text-sm text-slate-500">
            <Link to="/terms" className="hover:text-white transition-colors">Términos</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
