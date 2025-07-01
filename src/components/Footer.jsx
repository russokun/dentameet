
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#1A237E] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative">
                <Heart className="h-8 w-8 text-[#00C853]" fill="currentColor" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div>
                <span className="text-xl font-bold">DentaMeet</span>
                <span className="text-sm text-[#00C853] block leading-none">PacienteFácil</span>
              </div>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Conectamos estudiantes de odontología con pacientes que necesitan tratamientos dentales a bajo costo. 
              Facilitamos el acceso a la salud bucal y apoyamos la formación clínica.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-[#00C853] transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#00C853] transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#00C853] transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <span className="text-lg font-semibold mb-4 block">Enlaces Rápidos</span>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-[#00C853] transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/registro" className="text-gray-300 hover:text-[#00C853] transition-colors">
                  Registro
                </Link>
              </li>
              <li>
                <Link to="/nosotros" className="text-gray-300 hover:text-[#00C853] transition-colors">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-gray-300 hover:text-[#00C853] transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <span className="text-lg font-semibold mb-4 block">Contacto</span>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-[#00C853]" />
                <span className="text-gray-300 text-sm">info@dentameet.cl</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-[#00C853]" />
                <span className="text-gray-300 text-sm">+56 9 1234 5678</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-[#00C853]" />
                <span className="text-gray-300 text-sm">Santiago, Chile</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300 text-sm">
            © 2024 DentaMeet - PacienteFácil. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
