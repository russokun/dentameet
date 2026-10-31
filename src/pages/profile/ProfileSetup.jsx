import React, { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router-dom'
import { User, GraduationCap, Heart, ArrowLeft, ArrowRight, Check, Loader2, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/components/ui/use-toast'
import {
  patientProfileSchema,
  studentProfileSchema,
  dentameeterProfileSchema,
  REGIONES_CHILE,
  getComunasByRegion,
  UNIVERSIDADES,
  ETAPAS_FORMACION,
  TRATAMIENTOS,
  ESPECIALIDADES,
  HORARIOS,
} from '@/lib/zodSchemas'

export const CONSENT_VERSION = '2026-10-31'

const ROLES = [
  { id: 'paciente', title: 'Busco tratamiento', description: 'Quiero atenderme a menor costo en una clínica universitaria.', icon: User, schema: patientProfileSchema },
  { id: 'estudiante', title: 'Estudio odontología', description: 'Necesito pacientes para mis requisitos clínicos.', icon: GraduationCap, schema: studentProfileSchema },
  { id: 'dentameeter', title: 'Las dos cosas', description: 'Estudio odontología y además necesito un tratamiento.', icon: Heart, schema: dentameeterProfileSchema },
]

const STEPS = ['Tu rol', 'Tus datos', 'Tu perfil', 'Último paso']

const fieldClass = (hasError) => (hasError ? 'field field-error' : 'field')

const Field = ({ id, label, hint, error, children }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-bold text-slate-700 mb-1.5">
      {label} {hint && <span className="font-medium text-slate-500">{hint}</span>}
    </label>
    {children}
    {error && <p className="text-sm text-rose-700 mt-1" role="alert">{error}</p>}
  </div>
)

const ChipGroup = ({ legend, description, options, value = [], onToggle, error }) => (
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
            className={`inline-flex items-center gap-1.5 min-h-[40px] rounded-full border px-3.5 text-sm font-semibold transition-colors active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 ${
              selected ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
            }`}
          >
            {selected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
            {option}
          </button>
        )
      })}
    </div>
    {error && <p className="text-sm text-rose-700 mt-2" role="alert">{error}</p>}
  </fieldset>
)

const ProfileSetup = () => {
  const { user, updateProfile } = useAuth()
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [role, setRole] = useState('')
  const [consent, setConsent] = useState(false)
  const [consentError, setConsentError] = useState('')
  const [chipErrors, setChipErrors] = useState({})

  const roleData = ROLES.find((r) => r.id === role)
  const isStudent = role === 'estudiante' || role === 'dentameeter'
  const isPatient = role === 'paciente' || role === 'dentameeter'

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: roleData ? zodResolver(roleData.schema) : undefined,
    defaultValues: { tratamientos_interes: [], especialidades: [], horarios_disponibles: [] },
    shouldUnregister: false,
  })

  const values = watch()
  const comunas = useMemo(() => getComunasByRegion(values.region), [values.region])

  const toggle = (field, option) => {
    const current = values[field] || []
    setValue(field, current.includes(option) ? current.filter((v) => v !== option) : [...current, option])
    setChipErrors((e) => ({ ...e, [field]: undefined }))
  }

  const go = (to) => {
    setDirection(to > step ? 1 : -1)
    setStep(to)
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  const next = async () => {
    if (step === 1) {
      const ok = await trigger(['nombre', 'apellido', 'telefono', 'edad', 'region', 'comuna'])
      if (!ok) return
    }
    if (step === 2) {
      const errs = {}
      if (isPatient && !(values.tratamientos_interes || []).length) errs.tratamientos_interes = 'Elige al menos un tratamiento.'
      if (isStudent && !(values.especialidades || []).length) errs.especialidades = 'Elige al menos una especialidad.'
      const ok = isStudent ? await trigger(['universidad', 'etapa_formacion']) : true
      setChipErrors(errs)
      if (!ok || Object.keys(errs).length) return
    }
    go(step + 1)
  }

  const onSubmit = async (data) => {
    if (!consent) {
      setConsentError('Necesitamos tu autorización para usar tus datos y mostrarte matches.')
      return
    }
    try {
      await updateProfile({
        ...data,
        role,
        email: user.email,
        onboarding_completed: true,
        consentimiento_at: new Date().toISOString(),
        consentimiento_version: CONSENT_VERSION,
      })
      toast({ variant: 'success', title: '¡Listo! Tu perfil está creado', description: 'Ya puedes empezar a descubrir.' })
      navigate('/matches')
    } catch {
      toast({ title: 'No se pudo guardar tu perfil', description: 'Revisa tu conexión e intenta de nuevo.', variant: 'destructive' })
    }
  }

  const slide = {
    enter: (d) => (reduce ? { opacity: 0 } : { opacity: 0, x: d * 32 }),
    center: { opacity: 1, x: 0 },
    exit: (d) => (reduce ? { opacity: 0 } : { opacity: 0, x: d * -32 }),
  }

  return (
    <>
      <Helmet>
        <title>Crea tu perfil | DentaMeet</title>
      </Helmet>

      <div className="max-w-2xl mx-auto">
        {/* Progreso */}
        <nav aria-label="Progreso" className="mb-8">
          <p className="text-sm font-semibold text-slate-600 mb-3">
            Paso {step + 1} de {STEPS.length} · {STEPS[step]}
          </p>
          <ol className="grid grid-cols-4 gap-2">
            {STEPS.map((label, i) => (
              <li key={label} className="h-1.5 rounded-full bg-slate-200 overflow-hidden" aria-current={i === step ? 'step' : undefined}>
                <span className="sr-only">{label}</span>
                <motion.span
                  className="block h-full rounded-full bg-emerald-400"
                  initial={false}
                  animate={{ width: i <= step ? '100%' : '0%' }}
                  transition={{ duration: reduce ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                />
              </li>
            ))}
          </ol>
        </nav>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.section
              key={step}
              custom={direction}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="app-card p-6 sm:p-8"
            >
              {step === 0 && (
                <>
                  <h1 className="text-3xl font-black tracking-tight text-slate-900">¿Qué te trae a DentaMeet?</h1>
                  <p className="mt-2 text-slate-600">Puedes cambiarlo después desde tu perfil.</p>
                  <div className="mt-6 grid gap-3" role="radiogroup" aria-label="Rol">
                    {ROLES.map(({ id, title, description, icon: Icon }) => {
                      const selected = role === id
                      return (
                        <button
                          key={id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => setRole(id)}
                          className={`flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 ${
                            selected ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${selected ? 'bg-emerald-400 text-slate-950' : 'bg-slate-100 text-slate-700'}`}>
                            <Icon className="h-6 w-6" aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-black text-slate-900">{title}</span>
                            <span className="block text-sm text-slate-600">{description}</span>
                          </span>
                          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${selected ? 'border-emerald-400 bg-emerald-400 text-slate-950' : 'border-slate-300'}`}>
                            {selected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <h1 className="text-3xl font-black tracking-tight text-slate-900">Tus datos</h1>
                  <p className="mt-2 text-slate-600">Tu WhatsApp solo lo ve la persona con la que hagas match.</p>
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field id="nombre" label="Nombre" error={errors.nombre?.message}>
                      <input id="nombre" autoComplete="given-name" {...register('nombre')} className={fieldClass(errors.nombre)} />
                    </Field>
                    <Field id="apellido" label="Apellido" error={errors.apellido?.message}>
                      <input id="apellido" autoComplete="family-name" {...register('apellido')} className={fieldClass(errors.apellido)} />
                    </Field>
                    <Field id="telefono" label="WhatsApp" error={errors.telefono?.message}>
                      <input id="telefono" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="9 1234 5678" {...register('telefono')} className={fieldClass(errors.telefono)} />
                    </Field>
                    <Field id="edad" label="Edad" error={errors.edad?.message}>
                      <input id="edad" type="number" inputMode="numeric" min={18} max={100} {...register('edad', { valueAsNumber: true })} className={fieldClass(errors.edad)} />
                    </Field>
                    <Field id="region" label="Región" error={errors.region?.message}>
                      <select id="region" {...register('region', { onChange: () => setValue('comuna', '') })} className={fieldClass(errors.region)}>
                        <option value="">Elige tu región</option>
                        {REGIONES_CHILE.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </Field>
                    <Field id="comuna" label="Comuna" error={errors.comuna?.message}>
                      <select id="comuna" {...register('comuna')} disabled={!values.region} className={`${fieldClass(errors.comuna)} disabled:bg-slate-50 disabled:text-slate-500`}>
                        <option value="">{values.region ? 'Elige tu comuna' : 'Primero elige la región'}</option>
                        {comunas.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </Field>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h1 className="text-3xl font-black tracking-tight text-slate-900">{isStudent ? 'Tu formación' : 'Lo que buscas'}</h1>
                  <p className="mt-2 text-slate-600">Con esto armamos tu mazo: te mostramos primero a quien calza contigo.</p>
                  <div className="mt-6 space-y-6">
                    {isStudent && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Field id="universidad" label="Universidad" error={errors.universidad?.message}>
                            <select id="universidad" {...register('universidad')} className={fieldClass(errors.universidad)}>
                              <option value="">Elige tu universidad</option>
                              {UNIVERSIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
                            </select>
                          </Field>
                          <Field id="etapa_formacion" label="Etapa de formación" error={errors.etapa_formacion?.message}>
                            <select id="etapa_formacion" {...register('etapa_formacion')} className={fieldClass(errors.etapa_formacion)}>
                              <option value="">Elige tu etapa</option>
                              {ETAPAS_FORMACION.map((e) => <option key={e} value={e}>{e}</option>)}
                            </select>
                          </Field>
                        </div>
                        <ChipGroup
                          legend="Especialidades que trabajas"
                          description="Te mostraremos pacientes que buscan estos tratamientos."
                          options={ESPECIALIDADES}
                          value={values.especialidades}
                          onToggle={(o) => toggle('especialidades', o)}
                          error={chipErrors.especialidades}
                        />
                      </>
                    )}
                    {isPatient && (
                      <ChipGroup
                        legend={isStudent ? 'Tratamientos que necesitas' : 'Tratamientos que necesitas'}
                        description="Elige todos los que apliquen."
                        options={TRATAMIENTOS}
                        value={values.tratamientos_interes}
                        onToggle={(o) => toggle('tratamientos_interes', o)}
                        error={chipErrors.tratamientos_interes}
                      />
                    )}
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h1 className="text-3xl font-black tracking-tight text-slate-900">Último paso</h1>
                  <p className="mt-2 text-slate-600">Tus horarios ayudan a que el match termine en una cita.</p>
                  <div className="mt-6 space-y-6">
                    <ChipGroup
                      legend="Horarios disponibles"
                      options={HORARIOS}
                      value={values.horarios_disponibles}
                      onToggle={(o) => toggle('horarios_disponibles', o)}
                    />
                    <Field id="descripcion" label="Cuéntanos un poco" hint="(opcional)">
                      <textarea
                        id="descripcion"
                        rows={3}
                        maxLength={400}
                        placeholder={isStudent ? 'Ej. Estoy en 5.º año y me faltan 3 endodoncias para cerrar el ramo.' : 'Ej. Tengo una molestia en una muela hace semanas.'}
                        {...register('descripcion')}
                        className={`${fieldClass(false)} resize-none`}
                      />
                    </Field>

                    <div className={`rounded-2xl border-2 p-4 ${consentError ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={consent}
                          onChange={(e) => { setConsent(e.target.checked); setConsentError('') }}
                          className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-400 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-slate-800 leading-relaxed">
                          <span className="inline-flex items-center gap-1.5 font-bold text-slate-900">
                            <ShieldCheck className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                            Autorizo el uso de mis datos
                          </span>{' '}
                          incluidos los tratamientos que busco o trabajo, solo para mostrarme matches en DentaMeet. Mi teléfono se comparte únicamente con quien haga match conmigo, y puedo retirar esta autorización eliminando mi cuenta.
                        </span>
                      </label>
                      {consentError && <p className="mt-2 text-sm text-rose-700" role="alert">{consentError}</p>}
                    </div>
                  </div>
                </>
              )}
            </motion.section>
          </AnimatePresence>

          {/* Navegación */}
          <div className="mt-6 flex items-center justify-between gap-3">
            {step > 0 ? (
              <button type="button" onClick={() => go(step - 1)} className="btn-secondary">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Atrás
              </button>
            ) : <span />}
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={next} disabled={step === 0 && !role} className="btn-primary min-w-[140px]">
                Continuar
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <button type="submit" disabled={isSubmitting} className="btn-primary min-w-[160px]">
                {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />Guardando…</> : 'Crear mi perfil'}
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  )
}

export default ProfileSetup
