import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  GraduationCap, 
  Phone, 
  MapPin, 
  Loader, 
  ArrowRight,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Label } from "../../components/ui/label";
import { toast } from "../../components/ui/use-toast";

const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    apellido: "",
    telefono: "",
    role: "paciente",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.nombre) {
      toast({
        title: "Campos Incompletos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error de Contraseña",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      });
      return false;
    }
    if (formData.password.length < 6) {
      toast({
        title: "Seguridad Baja",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signUp(formData.email, formData.password, {
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono,
        role: formData.role,
      });
    } catch (error) {
      console.error("❌ Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">
          Crea tu cuenta.
        </h2>
        <p className="text-slate-500 font-medium">
          Únete a la red dental más grande de Chile.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Selector */}
        <div className="space-y-3">
          <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
            Tipo de Perfil
          </Label>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: "paciente", label: "Paciente", icon: User },
              { id: "estudiante", label: "Estudiante", icon: GraduationCap },
            ].map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, role: role.id }))}
                className={`relative p-6 rounded-2xl border-2 transition-all overflow-hidden group ${
                  formData.role === role.id
                    ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-lg shadow-emerald-500/10"
                    : "border-slate-100 bg-white text-slate-500 hover:border-emerald-200"
                }`}
                disabled={loading}
              >
                <role.icon className={`h-8 w-8 mx-auto mb-3 transition-transform ${formData.role === role.id ? "scale-110 text-emerald-600" : "group-hover:scale-110"}`} />
                <span className="text-sm font-black uppercase tracking-tight">{role.label}</span>
                {formData.role === role.id && (
                  <div className="absolute top-2 right-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nombre</Label>
            <input
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleInputChange}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
              placeholder="Ej. Juan"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Apellido</Label>
            <input
              name="apellido"
              type="text"
              value={formData.apellido}
              onChange={handleInputChange}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
              placeholder="Ej. Pérez"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Correo Electrónico</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
              placeholder="tu@email.com"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
                placeholder="••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-500"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Confirmar</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
                placeholder="••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-500"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-premium-accent w-full py-5 text-xl group disabled:opacity-50"
        >
          {loading ? (
            <Loader className="h-6 w-6 animate-spin mx-auto" />
          ) : (
            <span className="flex items-center justify-center">
              Registrarme
              <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </button>

        <div className="text-center pt-8 border-t border-slate-50">
          <p className="text-slate-500 font-medium">
            ¿Ya eres parte de DentaMeet?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-emerald-600 hover:text-emerald-700 font-black transition-colors"
              disabled={loading}
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </form>
    </motion.div>
  );
};

export default Register;
