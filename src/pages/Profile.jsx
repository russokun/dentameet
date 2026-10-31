import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { useForm } from 'react-hook-form'
import { Check, Loader2 } from 'lucide-react'
import {
  TRATAMIENTOS,
  ESPECIALIDADES,
  HORARIOS,
  UNIVERSIDADES,
  ETAPAS_FORMACION,
  REGIONES_CHILE,
  getComunasByRegion,
} from '@/lib/zodSchemas'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/components/ui/use-toast'
import PageHeader from '@/components/layout/PageHeader'

const ROLE_LABEL = { paciente: 'Paciente', estudiante: 'Estudiante', dentameeter: 'DentaMeeter' }

// Solo se envían los campos que la persona puede editar (no id, email, role ni fechas)
const EDITABLE = [
  'nombre', 'apellido', 'telefono', 'edad', 'region', 'comuna', 'universidad', 'etapa_formacion',
  'tratamientos_interes', 'especialidades', 'horarios_disponibles', 'descripcion',
]

const fieldClass = (hasError) => (hasError ? 'field field-error' : 'field')

const Field = ({ id, label, hint, error, children }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-bold text-slate-700 mb-1.5">
      {label} {hint && <span className="font-medium text-slate-500">{hint}</span>}
    </label>
    {children}
    {error && <p className="text-sm text-rose-700 mt-1">{error}</p>}
  </div>
)

// Selección múltiple como chips: más fácil de tocar que una grilla de checkboxes
const ChipGroup = ({ legend, description, options, value = [], onToggle }) => (
  <fieldset>
    <legend className="text-sm font-bold text-slate-700">{legend}</legend>
    {description && <p className="text-sm text-slate-600 mt-0.5">{description}</p>}
    <div className="mt-3 flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = value.includes(option)
        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            onClick={() => onToggle(option)}
            className={`inline-flex items-center gap-1.5 min-h-[40px] rounded-full border px-3.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 ${
              selected
                ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
            }`}
          >
            {selected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
            {option}
          </button>
        )
      })}
    </div>
  </fieldset>
)

const Section = ({ title, children }) => (
  <section className="app-card p-5 sm:p-6">
    <h2 className="text-lg font-black text-slate-900 mb-5">{title}</h2>
    <div className="space-y-5">{children}</div>
  </section>
)

const Profile = () => {
  const { profile, updateProfile } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    watch,
    setValue,
    reset,
  } = useForm({ defaultValues: profile || {} })

  useEffect(() => {
    if (profile) reset(profile)
  }, [profile, reset])

  const values = watch()
  const role = profile?.role || 'paciente'
  const isStudent = role === 'estudiante' || role === 'dentameeter'
  const isPatient = role === 'paciente' || role === 'dentameeter'
  const comunas = getComunasByRegion(values.region)

  const toggle = (field, option) => {
    const current = values[field] || []
    setValue(field, current.includes(option) ? current.filter((v) => v !== option) : [...current, option], { shouldDirty: true })
  }

  const onSubmit = async (data) => {
    const payload = Object.fromEntries(EDITABLE.filter((k) => k in data).map((k) => [k, data[k]]))
    if (Number.isNaN(payload.edad)) payload.edad = null
    try {
      await updateProfile(payload)
      toast({ variant: 'success', title: 'Perfil guardado', description: 'Tus cambios ya se ven en tus matches.' })
    } catch {
      toast({ title: 'No se pudo guardar', description: 'Revisa tu conexión e intenta de nuevo.', variant: 'destructive' })
    }
  }

  if (!profile) return null

  return (
    <>
      <Helmet>
        <title>Mi perfil | DentaMeet</title>
      </Helmet>

      <PageHeader
        title="Mi perfil"
        subtitle={`${ROLE_LABEL[role] || 'Usuario'} · ${profile.email || ''}`}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6 pb-24 lg:pb-0" noValidate>
        <Section title="Datos personales">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="nombre" label="Nombre" error={errors.nombre?.message}>
              <input id="nombre" autoComplete="given-name" {...register('nombre', { required: 'Escribe tu nombre' })} className={fieldClass(errors.nombre)} />
            </Field>
            <Field id="apellido" label="Apellido" error={errors.apellido?.message}>
              <input id="apellido" autoComplete="family-name" {...register('apellido')} className={fieldClass(errors.apellido)} />
            </Field>
            <Field id="telefono" label="WhatsApp" hint="(solo lo ve tu match)" error={errors.telefono?.message}>
              <input
                id="telefono"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="9 1234 5678"
                {...register('telefono', { pattern: { value: /^[\d\s+]{8,15}$/, message: 'Escribe un número válido, por ejemplo 9 1234 5678' } })}
                className={fieldClass(errors.telefono)}
              />
            </Field>
            <Field id="edad" label="Edad" error={errors.edad?.message}>
              <input
                id="edad"
                type="number"
                inputMode="numeric"
                min={18}
                max={100}
                {...register('edad', { valueAsNumber: true, min: { value: 18, message: 'Debes ser mayor de 18 años' }, max: { value: 100, message: 'Edad no válida' } })}
                className={fieldClass(errors.edad)}
              />
            </Field>
            <Field id="region" label="Región">
              <select
                id="region"
                {...register('region', { onChange: () => setValue('comuna', '', { shouldDirty: true }) })}
                className={fieldClass(false)}
              >
                <option value="">Elige tu región</option>
                {REGIONES_CHILE.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field id="comuna" label="Comuna">
              <select id="comuna" {...register('comuna')} disabled={!values.region} className={`${fieldClass(false)} disabled:bg-slate-50 disabled:text-slate-500`}>
                <option value="">{values.region ? 'Elige tu comuna' : 'Primero elige la región'}</option>
                {comunas.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
        </Section>

        {isStudent && (
          <Section title="Formación">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="universidad" label="Universidad">
                <select id="universidad" {...register('universidad')} className={fieldClass(false)}>
                  <option value="">Elige tu universidad</option>
                  {UNIVERSIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </Field>
              <Field id="etapa_formacion" label="Etapa de formación">
                <select id="etapa_formacion" {...register('etapa_formacion')} className={fieldClass(false)}>
                  <option value="">Elige tu etapa</option>
                  {ETAPAS_FORMACION.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </Field>
            </div>
            <ChipGroup
              legend="Especialidades que trabajas"
              description="Te mostramos pacientes que buscan estos tratamientos."
              options={ESPECIALIDADES}
              value={values.especialidades}
              onToggle={(o) => toggle('especialidades', o)}
            />
          </Section>
        )}

        {isPatient && (
          <Section title="Lo que buscas">
            <ChipGroup
              legend="Tratamientos de interés"
              description="Elige todos los que necesites."
              options={TRATAMIENTOS}
              value={values.tratamientos_interes}
              onToggle={(o) => toggle('tratamientos_interes', o)}
            />
          </Section>
        )}

        <Section title="Disponibilidad y presentación">
          <ChipGroup
            legend="Horarios disponibles"
            options={HORARIOS}
            value={values.horarios_disponibles}
            onToggle={(o) => toggle('horarios_disponibles', o)}
          />
          <Field id="descripcion" label="Sobre ti" hint="(opcional)">
            <textarea
              id="descripcion"
              rows={4}
              maxLength={400}
              placeholder={isStudent ? 'Ej. Estoy en 5.º año y me faltan 3 endodoncias para cerrar el ramo clínico.' : 'Ej. Tengo una molestia en una muela y busco atención accesible.'}
              {...register('descripcion')}
              className={`${fieldClass(false)} resize-none`}
            />
            <p className="mt-1 text-xs text-slate-500 text-right tabular-nums">{(values.descripcion || '').length}/400</p>
          </Field>
        </Section>

        {/* Guardar: fijo sobre la barra inferior en móvil, al final del formulario en escritorio */}
        <div className="fixed inset-x-0 bottom-[calc(60px+env(safe-area-inset-bottom))] z-[80] border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 py-3 lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <div className="max-w-3xl mx-auto flex items-center justify-end gap-3">
            {isDirty && <span className="text-sm text-slate-600 hidden sm:inline">Tienes cambios sin guardar</span>}
            <button type="submit" disabled={isSubmitting || !isDirty} className="btn-primary w-full sm:w-auto">
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />Guardando…</> : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </form>
    </>
  )
}

export default Profile
