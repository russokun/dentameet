
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Register from '@/pages/Register';
import Contact from '@/pages/Contact';
import About from '@/pages/About';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Helmet>
          <title>DentaMeet - PacienteFácil | Conectamos estudiantes y pacientes</title>
          <meta name="description" content="Plataforma digital que conecta estudiantes de odontología con pacientes que necesitan tratamientos dentales a bajo costo. Salud bucal accesible para todos." />
          <meta name="keywords" content="odontología, estudiantes, pacientes, tratamientos dentales, bajo costo, salud bucal" />
          <meta property="og:title" content="DentaMeet - PacienteFácil" />
          <meta property="og:description" content="Conectamos estudiantes y pacientes por una salud bucal accesible" />
          <meta property="og:type" content="website" />
        </Helmet>
        
        <Navbar />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/contacto" element={<Contact />} />
            <Route path="/nosotros" element={<About />} />
          </Routes>
        </main>
        
        <Footer />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
