import React from 'react'
import { Helmet } from 'react-helmet'
import { User, Edit, Shield } from 'lucide-react'

const Profile = () => {
  return (
    <>
      <Helmet>
        <title>Mi Perfil - DentaMeet</title>
        <meta name="description" content="Gestiona tu perfil en DentaMeet" />
      </Helmet>

      <main className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-r from-[#1A237E] to-[#00C853] rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <User className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Mi Perfil</h1>
            <p className="text-gray-600 mb-6">
              Actualiza tu información personal y preferencias.
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <Edit className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-orange-800 font-medium">
                🚧 Función en desarrollo
              </p>
              <p className="text-orange-600 text-sm mt-1">
                Esta funcionalidad estará disponible en la Fase 2 del MVP
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default Profile
