import React from 'react'
import { Helmet } from 'react-helmet'
import { Star, Award, ThumbsUp, Users } from 'lucide-react'

const Feedback = () => {
  return (
    <>
      <Helmet>
        <title>Feedback - DentaMeet</title>
        <meta name="description" content="Sistema de reviews y calificaciones entre usuarios de DentaMeet" />
      </Helmet>

      <main className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-r from-[#1A237E] to-[#00C853] rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Star className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Feedback & Reviews</h1>
            <p className="text-gray-600 mb-6">
              Califica y deja reviews después de tus citas. Ayuda a construir confianza en la comunidad DentaMeet.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <Award className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-yellow-800 font-medium">
                🚧 Función en desarrollo
              </p>
              <p className="text-yellow-600 text-sm mt-1">
                Sistema de reviews y calificaciones disponible en Fase 2
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-center space-x-2 text-sm text-yellow-700">
                  <ThumbsUp className="w-4 h-4" />
                  <span>Reviews bidireccionales post-cita</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-yellow-700">
                  <Star className="w-4 h-4" />
                  <span>Sistema de calificaciones 1-5 estrellas</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-yellow-700">
                  <Users className="w-4 h-4" />
                  <span>Reputación y confianza comunitaria</span>
                </div>
              </div>
            </div>
            <div className="mt-6 text-xs text-gray-500">
              <p>💬 Para comunicación usaremos WhatsApp</p>
              <p>⭐ Feedback solo para reviews post-atención</p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default Feedback
