
import React from 'react';
import { Helmet } from 'react-helmet';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <>
      <Helmet>
        <title>DentaMeet - PacienteFácil | Conectamos estudiantes y pacientes</title>
        <meta name="description" content="Plataforma digital que conecta estudiantes de odontología con pacientes que necesitan tratamientos dentales a bajo costo. Salud bucal accesible para todos." />
        <meta name="keywords" content="odontología, estudiantes, pacientes, tratamientos dentales, bajo costo, salud bucal" />
        <meta property="og:title" content="DentaMeet - PacienteFácil" />
        <meta property="og:description" content="Conectamos estudiantes y pacientes por una salud bucal accesible" />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <AppRouter />
    </>
  );
}

export default App;
