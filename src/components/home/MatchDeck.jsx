import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { Heart, X, MapPin, Clock, GraduationCap, RotateCcw } from "lucide-react";

// Casos de ejemplo para mostrar la mecánica del match. No son personas reales (la tarjeta lo dice).
const CASES = [
  {
    id: "endo",
    treatment: "Endodoncia",
    comuna: "Ñuñoa",
    when: "Tardes",
    note: "Molestia en una muela hace semanas.",
    student: { initials: "MG", name: "Matías", detail: "5.º año · Universidad de Chile", need: "Le faltan 3 endodoncias para su ramo" },
  },
  {
    id: "limpieza",
    treatment: "Limpieza dental",
    comuna: "Viña del Mar",
    when: "Sábados",
    note: "Hace dos años que no voy al dentista.",
    student: { initials: "VM", name: "Valentina", detail: "4.º año · Universidad de Valparaíso", need: "Necesita pacientes de periodoncia" },
  },
  {
    id: "protesis",
    treatment: "Prótesis removible",
    comuna: "Concepción",
    when: "Mañanas",
    note: "Me faltan dos piezas y quiero volver a masticar bien.",
    student: { initials: "DS", name: "Diego", detail: "6.º año · Universidad de Concepción", need: "Último requisito de prótesis" },
  },
];

const SWIPE = 110;

const exitVariants = {
  exit: (dir) => ({
    x: dir === "pass" ? -380 : 380,
    rotate: dir === "pass" ? -16 : 16,
    opacity: 0,
    transition: { duration: 0.28, ease: [0.4, 0, 1, 1] },
  }),
  exitReduced: { opacity: 0, transition: { duration: 0.15 } },
};

const CaseCard = ({ item, onDecide, top, reduce, hint }) => {
  const x = useMotionValue(0);

  // Pista única: la tarjeta se asoma hacia el lado del match para enseñar el gesto
  useEffect(() => {
    if (!hint || reduce) return;
    const controls = animate(x, [0, 28, -10, 0], { delay: 1.6, duration: 1.1, ease: "easeInOut" });
    return () => controls.stop();
  }, [hint, reduce, x]);

  const rotate = useTransform(x, [-220, 220], [-12, 12]);
  const likeOpacity = useTransform(x, [20, SWIPE], [0, 1]);
  const passOpacity = useTransform(x, [-SWIPE, -20], [1, 0]);

  return (
    <motion.article
      aria-label={`Caso de ejemplo: ${item.treatment} en ${item.comuna}`}
      className={`absolute inset-0 rounded-[1.75rem] bg-white text-slate-900 p-6 flex flex-col select-none ${
        top ? "cursor-grab active:cursor-grabbing touch-pan-y" : "pointer-events-none"
      }`}
      style={{
        x: top ? x : 0,
        rotate: top ? rotate : 0,
        boxShadow: "0 30px 60px -24px rgba(2,6,23,0.55), 0 8px 20px -12px rgba(2,6,23,0.35)",
      }}
      initial={reduce ? false : { scale: 0.94, y: 18, opacity: 0 }}
      animate={{ scale: top ? 1 : 0.94, y: top ? 0 : 16, opacity: top ? 1 : 0.85 }}
      variants={exitVariants}
      exit={reduce ? "exitReduced" : "exit"}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      drag={top ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.85}
      onDragEnd={(_, info) => {
        if (info.offset.x > SWIPE || info.velocity.x > 650) onDecide("like");
        else if (info.offset.x < -SWIPE || info.velocity.x < -650) onDecide("pass");
      }}
    >
      {top && (
        <>
          <motion.span
            style={{ opacity: likeOpacity }}
            className="absolute top-5 left-5 rounded-full bg-emerald-500 px-3 py-1 text-sm font-black text-slate-950"
            aria-hidden="true"
          >
            Match
          </motion.span>
          <motion.span
            style={{ opacity: passOpacity }}
            className="absolute top-5 right-5 rounded-full bg-slate-900 px-3 py-1 text-sm font-black text-white"
            aria-hidden="true"
          >
            Pasar
          </motion.span>
        </>
      )}

      <p className="text-sm font-semibold text-slate-500">Caso de ejemplo</p>
      <h3 className="mt-4 text-[2rem] leading-[1.02] font-black tracking-tight">{item.treatment}</h3>
      <p className="mt-3 text-base leading-snug text-slate-700">“{item.note}”</p>
      <dl className="mt-auto grid grid-cols-2 gap-3 pt-5 text-sm">
        <div className="rounded-2xl bg-slate-100 px-3 py-2.5">
          <dt className="sr-only">Comuna</dt>
          <dd className="flex items-center gap-1.5 font-bold"><MapPin className="h-4 w-4 text-emerald-700" aria-hidden="true" />{item.comuna}</dd>
        </div>
        <div className="rounded-2xl bg-slate-100 px-3 py-2.5">
          <dt className="sr-only">Disponibilidad</dt>
          <dd className="flex items-center gap-1.5 font-bold"><Clock className="h-4 w-4 text-emerald-700" aria-hidden="true" />{item.when}</dd>
        </div>
      </dl>
    </motion.article>
  );
};

const MatchResult = ({ item, onNext, reduce }) => (
  <motion.div
    key={`match-${item.id}`}
    role="status"
    className="absolute inset-0 rounded-[1.75rem] bg-emerald-400 text-slate-950 p-6 flex flex-col"
    style={{ boxShadow: "0 30px 60px -24px rgba(2,6,23,0.55)" }}
    initial={reduce ? { opacity: 0 } : { scale: 0.9, opacity: 0, rotate: -2 }}
    animate={{ scale: 1, opacity: 1, rotate: 0 }}
    exit={{ opacity: 0, scale: 0.96 }}
    transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 380, damping: 26 }}
  >
    <p className="text-sm font-bold">¡Es un match!</p>
    <div className="mt-5 flex items-center">
      <span className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-[0_6px_16px_-8px_rgba(2,6,23,0.5)]">
        <Heart className="h-7 w-7 text-emerald-600" fill="currentColor" aria-hidden="true" />
      </span>
      <span className="-ml-3 h-16 w-16 rounded-full bg-slate-950 text-white flex items-center justify-center text-xl font-black ring-4 ring-emerald-400">
        {item.student.initials}
      </span>
    </div>
    <p className="mt-5 text-[1.65rem] leading-[1.05] font-black tracking-tight">
      Tu {item.treatment.toLowerCase()} con {item.student.name}.
    </p>
    <p className="mt-2 flex items-start gap-1.5 text-sm font-semibold">
      <GraduationCap className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
      {item.student.detail}
    </p>
    <p className="mt-1 text-sm">{item.student.need}.</p>
    <button
      type="button"
      onClick={onNext}
      className="mt-auto inline-flex items-center justify-center gap-2 min-h-[48px] rounded-full bg-slate-950 text-white font-bold hover:bg-slate-800 active:scale-[0.98] transition-[background-color,transform] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-950/30"
    >
      <RotateCcw className="h-4 w-4" aria-hidden="true" />
      Ver otro caso
    </button>
  </motion.div>
);

// Mazo de casos: la mecánica de DentaMeet en la primera pantalla. Se desliza o se usan los botones.
const MatchDeck = () => {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [matched, setMatched] = useState(null);
  const [hinted, setHinted] = useState(false);
  const [lastDir, setLastDir] = useState("like");
  const timer = useRef(null);

  const current = CASES[index % CASES.length];
  const next = CASES[(index + 1) % CASES.length];

  const advance = () => {
    setMatched(null);
    setIndex((i) => i + 1);
  };

  const decide = (choice) => {
    setHinted(true);
    setLastDir(choice);
    if (choice === "like") setMatched(current);
    else advance();
  };

  // Tras un match, el siguiente caso llega solo
  useEffect(() => {
    if (!matched) return;
    timer.current = setTimeout(advance, 4200);
    return () => clearTimeout(timer.current);
  }, [matched]);

  return (
    <div className="w-full max-w-[340px] mx-auto">
      <div className="relative h-[292px]">
        <AnimatePresence initial={false} custom={lastDir}>
          {matched ? (
            <MatchResult key={`m-${index}`} item={matched} onNext={advance} reduce={reduce} />
          ) : (
            [
              <CaseCard key={`c-${index + 1}`} item={next} top={false} reduce={reduce} onDecide={() => {}} />,
              <CaseCard key={`c-${index}`} item={current} top onDecide={decide} reduce={reduce} hint={!hinted && index === 0} />,
            ]
          )}
        </AnimatePresence>
      </div>

      {/* Controles en una cápsula oscura: se leen sobre el verde y sobre el azul noche */}
      <div className="mt-5 flex flex-col items-center gap-2.5">
        <div className="flex items-center gap-3 rounded-full bg-slate-950 p-2 shadow-[0_12px_30px_-12px_rgba(2,6,23,0.6)]" aria-hidden={!!matched}>
          <button
            type="button"
            onClick={() => decide("pass")}
            disabled={!!matched}
            aria-label="Pasar este caso"
            className="h-12 w-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 active:scale-95 transition-[background-color,transform] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => decide("like")}
            disabled={!!matched}
            aria-label="Hacer match con este caso"
            className="h-12 w-12 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center hover:bg-emerald-300 active:scale-95 transition-[background-color,transform] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/50"
          >
            <Heart className="h-6 w-6" fill="currentColor" aria-hidden="true" />
          </button>
        </div>
        <p className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-200">Desliza la tarjeta o usa los botones</p>
      </div>
    </div>
  );
};

export default MatchDeck;
