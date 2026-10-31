import React, { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const Login = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Escribe tu correo y tu contraseña.");
      return;
    }
    setLoading(true);
    try {
      await signIn(formData.email.trim(), formData.password);
    } catch (err) {
      const msg = String(err?.message || "");
      setError(
        /not confirmed/i.test(msg) ? "Confirma tu correo antes de entrar: revisa el enlace que te enviamos."
        : /fetch|network/i.test(msg) ? "No hay conexión con el servidor. Prueba con datos móviles."
        : "Correo o contraseña incorrectos."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-3xl font-black tracking-tight text-slate-900">Hola de nuevo</h2>
      <p className="mt-1.5 text-slate-600">Entra para ver tus matches y tus citas.</p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
        <div>
          <label htmlFor="login-email" className="block text-sm font-bold text-slate-700 mb-1.5">Correo</label>
          <input
            id="login-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="tu@correo.cl"
            className={`field ${error ? "field-error" : ""}`}
            aria-invalid={!!error}
          />
        </div>
        <div>
          <label htmlFor="login-password" className="block text-sm font-bold text-slate-700 mb-1.5">Contraseña</label>
          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={formData.password}
              onChange={handleInputChange}
              className={`field pr-12 ${error ? "field-error" : ""}`}
              aria-invalid={!!error}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 inline-flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {error && <p role="alert" className="text-sm font-semibold text-rose-700">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full min-h-[52px] text-base">
          {loading ? <><Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />Entrando…</> : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        ¿Primera vez en DentaMeet?{" "}
        <button type="button" onClick={onSwitchToRegister} className="font-bold text-emerald-700 hover:text-emerald-800 underline-offset-4 hover:underline">
          Crea tu cuenta
        </button>
      </p>
    </div>
  );
};

export default Login;
