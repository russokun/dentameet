import React from 'react'

// Encabezado común de las pantallas de la app: título, contexto y acción principal.
const PageHeader = ({ title, subtitle, actions }) => (
  <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6 lg:mb-8">
    <div className="min-w-0">
      <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 text-balance">{title}</h1>
      {subtitle && <p className="mt-1.5 text-slate-600">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
  </header>
)

export default PageHeader
