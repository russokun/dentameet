import React, { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { MapPin } from 'lucide-react'
import { REGIONES_CHILE, getComunasByRegion } from '@/lib/zodSchemas'

const RegionComunaSelector = ({ 
  regionValue, 
  comunaValue, 
  onRegionChange, 
  onComunaChange,
  regionError,
  comunaError,
  regionLabel = "Región *",
  comunaLabel = "Comuna *",
  disabled = false
}) => {
  const [availableComunas, setAvailableComunas] = useState([])

  useEffect(() => {
    if (regionValue) {
      const comunas = getComunasByRegion(regionValue)
      setAvailableComunas(comunas)
      // Si la comuna actual no está en la nueva región, limpiarla
      if (comunaValue && !comunas.includes(comunaValue)) {
        onComunaChange('')
      }
    } else {
      setAvailableComunas([])
      onComunaChange('')
    }
  }, [regionValue, comunaValue, onComunaChange])

  return (
    <>
      <div>
        <Label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="h-4 w-4 inline mr-2" />
          {regionLabel}
        </Label>
        <select
          id="region"
          value={regionValue || ''}
          onChange={(e) => onRegionChange(e.target.value)}
          disabled={disabled}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00C853] focus:border-transparent ${
            regionError ? 'border-red-500' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        >
          <option value="">Selecciona tu región</option>
          {REGIONES_CHILE.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
        {regionError && (
          <p className="text-red-500 text-sm mt-1">{regionError}</p>
        )}
      </div>

      <div>
        <Label htmlFor="comuna" className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="h-4 w-4 inline mr-2" />
          {comunaLabel}
        </Label>
        <select
          id="comuna"
          value={comunaValue || ''}
          onChange={(e) => onComunaChange(e.target.value)}
          disabled={disabled || !regionValue}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00C853] focus:border-transparent ${
            comunaError ? 'border-red-500' : 'border-gray-300'
          } ${(disabled || !regionValue) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        >
          <option value="">
            {regionValue ? 'Selecciona tu comuna' : 'Primero selecciona una región'}
          </option>
          {availableComunas.map(comuna => (
            <option key={comuna} value={comuna}>{comuna}</option>
          ))}
        </select>
        {comunaError && (
          <p className="text-red-500 text-sm mt-1">{comunaError}</p>
        )}
        {!regionValue && !disabled && (
          <p className="text-gray-500 text-sm mt-1">
            Selecciona una región para ver las comunas disponibles
          </p>
        )}
      </div>
    </>
  )
}

export { RegionComunaSelector }
