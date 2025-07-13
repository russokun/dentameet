
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import AppRouter from '@/routes/AppRouter';

function App() {
  return (
    <AuthProvider>
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
          
          <AppRouter />
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
