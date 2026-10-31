import React, { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { ShieldAlert, X } from 'lucide-react'
import { MatchService } from '@/services/matchService'
import { toast } from '@/components/ui/use-toast'
import SegmentedControl from '@/components/ui/SegmentedControl'

const REASONS = [
  { value: 'perfil_falso', label: 'Perfil falso o suplantación' },
  { value: 'acoso', label: 'Acoso o trato inapropiado' },
  { value: 'no_asistio', label: 'No se presentó a la cita' },
  { value: 'cobro_indebido', label: 'Pidió dinero por fuera de la clínica' },
  { value: 'atencion_fuera_de_clinica', label: 'Propuso atender fuera de la clínica universitaria' },
  { value: 'otro', label: 'Otro motivo' },
]

// Reportar o bloquear: en ambos casos la otra persona desaparece de tu mazo y se corta el match.
const SafetyDialog = ({ person, onDone, trigger }) => {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState('report')
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [sending, setSending] = useState(false)
  const name = person?.nombre || 'esta persona'

  const reset = () => { setMode('report'); setReason(''); setDetails('') }

  const submit = async (e) => {
    e.preventDefault()
    if (mode === 'report' && !reason) return
    setSending(true)
    try {
      if (mode === 'report') await MatchService.reportUser(person.id, reason, details)
      else await MatchService.blockUser(person.id)
      toast({
        variant: 'success',
        title: mode === 'report' ? 'Reporte enviado' : `Bloqueaste a ${name}`,
        description: mode === 'report' ? `Lo revisaremos. Ya no verás a ${name}.` : 'Ya no aparecerá en tu mazo ni podrá contactarte por la app.',
      })
      setOpen(false)
      reset()
      onDone?.()
    } catch {
      toast({ title: 'No se pudo completar', description: 'Intenta de nuevo en un momento.', variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[150] bg-slate-950/50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed z-[160] inset-x-4 bottom-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[440px] rounded-3xl bg-white p-6 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                <ShieldAlert className="h-5 w-5" aria-hidden="true" />
              </span>
              <Dialog.Title className="text-lg font-black text-slate-900">¿Qué pasó con {name}?</Dialog.Title>
            </div>
            <Dialog.Close className="h-11 w-11 -mr-2 -mt-2 inline-flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100" aria-label="Cerrar">
              <X className="h-5 w-5" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="mt-2 text-sm text-slate-600">
            En ambos casos deja de aparecer en tu mazo, se deshace el match y se cancelan las citas pendientes.
          </Dialog.Description>

          <SegmentedControl
            label="Acción"
            className="mt-5 w-full"
            value={mode}
            onChange={setMode}
            options={[{ value: 'report', label: 'Reportar' }, { value: 'block', label: 'Solo bloquear' }]}
          />

          <form onSubmit={submit} className="mt-5 space-y-4">
            {mode === 'report' ? (
              <>
                <fieldset className="space-y-2">
                  <legend className="text-sm font-bold text-slate-700 mb-1">Motivo</legend>
                  {REASONS.map((r) => (
                    <label key={r.value} className={`flex items-center gap-3 min-h-[44px] rounded-xl border px-3 cursor-pointer transition-colors ${reason === r.value ? 'border-rose-400 bg-rose-50' : 'border-slate-200 hover:border-slate-300'}`}>
                      <input type="radio" name="reason" value={r.value} checked={reason === r.value} onChange={() => setReason(r.value)} className="h-4 w-4 text-rose-600 focus:ring-rose-500" />
                      <span className="text-sm text-slate-800">{r.label}</span>
                    </label>
                  ))}
                </fieldset>
                <div>
                  <label htmlFor="report-details" className="block text-sm font-bold text-slate-700 mb-1.5">
                    Detalles <span className="font-medium text-slate-500">(opcional)</span>
                  </label>
                  <textarea
                    id="report-details"
                    rows={3}
                    maxLength={1000}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="field resize-none"
                  />
                </div>
              </>
            ) : (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                No le avisaremos a {name}. Si fue grave, mejor repórtalo para que podamos revisarlo.
              </p>
            )}
            <button
              type="submit"
              disabled={sending || (mode === 'report' && !reason)}
              className="btn-danger w-full"
            >
              {sending ? 'Enviando…' : mode === 'report' ? 'Enviar reporte' : `Bloquear a ${name}`}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default SafetyDialog
