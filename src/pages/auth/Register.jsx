import React, { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

// Solo correo y contraseña: el rol, los datos y el consentimiento se piden en el onboarding.
const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { signUp } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, form: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) next.email = "Escribe un correo válido.";
    if (formData.password.length < 8) next.password = "Usa al menos 8 caracteres.";
    if (formData.confirmPassword !== formData.password) next.confirmPassword = "Las contraseñas no coinciden.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signUp(formData.email.trim(), formData.password);
    } catch (err) {
      const msg = String(err?.message || "");
      setErrors({
        form: /already registered|already exists/i.test(msg) ? "Ese correo ya tiene una cuenta. Entra con él."
          : /fetch|network/i.test(msg) ? "No hay conexión con el servidor. Prueba con datos móviles."
          : "No pudimos crear tu cuenta. Revisa tus datos o intenta de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  const field = (name) => `field ${errors[name] ? "field-error" : ""}`;

  return (
    <div className="w-full">
      <h2 className="text-3xl font-black tracking-tight text-slate-900">Crea tu cuenta</h2>
      <p className="mt-1.5 text-slate-600">Es gratis. Después eliges si buscas tratamiento o estudias odontología.</p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
        <div>
          <label htmlFor="reg-email" className="block text-sm font-bold text-slate-700 mb-1.5">Correo</label>
          <input id="reg-email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="tu@correo.cl"
            value={formData.email} onChange={handleInputChange} className={field("email")} aria-invalid={!!errors.email} />
          {errors.email && <p className="text-sm text-rose-700 mt-1">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="reg-password" className="block text-sm font-bold text-slate-700 mb-1.5">Contraseña</label>
          <div className="relative">
            <input id="reg-password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password"
              value={formData.password} onChange={handleInputChange} className={`${field("password")} pr-12`} aria-invalid={!!errors.password} />
            <button type="button" onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 inline-flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900">
              {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
          {errors.password ? <p className="text-sm text-rose-700 mt-1">{errors.password}</p> : <p className="text-sm text-slate-500 mt-1">Mínimo 8 caracteres.</p>}
        </div>
        <div>
          <label htmlFor="reg-confirm" className="block text-sm font-bold text-slate-700 mb-1.5">Repite la contraseña</label>
          <input id="reg-confirm" name="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password"
            value={formData.confirmPassword} onChange={handleInputChange} className={field("confirmPassword")} aria-invalid={!!errors.confirmPassword} />
          {errors.confirmPassword && <p className="text-sm text-rose-700 mt-1">{errors.confirmPassword}</p>}
        </div>

        {errors.form && <p role="alert" className="text-sm font-semibold text-rose-700">{errors.form}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full min-h-[52px] text-base">
          {loading ? <><Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />Creando tu cuenta…</> : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        ¿Ya tienes cuenta?{" "}
        <button type="button" onClick={onSwitchToLogin} className="font-bold text-emerald-700 hover:text-emerald-800 underline-offset-4 hover:underline">
          Entrar
        </button>
      </p>
    </div>
  );
};

export default Register;
