
import React from 'react';
import { Helmet } from 'react-helmet';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <>
      <Helmet>
  <title>DentaMeet - PacienteFacil | Tinder Dental</title>
  <meta name="description" content="Plataforma Digital que conecta estudiantes de odonto y pacientes para tratamientos accesibles y de calidad. ¡Encuentra tu match dental fácil!" />
        <meta name="keywords" content="Dentameet, Tinder Dental, Paciente Fácil, odontología, estudiantes, pacientes, tratamientos dentales, salud bucal, citas dentales" />
        <meta property="og:title" content="Dentameet - Tinder Dental" />
        <meta property="og:description" content="Conectamos estudiantes y pacientes por una salud bucal accesible y tratamientos de calidad." />
        <meta property="og:type" content="website" />
      </Helmet>
      <AppRouter />
    </>
  );
}

export default App;
