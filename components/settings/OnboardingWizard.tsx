"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/icons";
import { SCHOOL_PRESETS, getPreset } from "@/lib/school-presets";
import { applyOnboarding } from "@/app/(app)/settings/structure/actions";

type Step = "preset" | "sections" | "salones";

/** Asistente para armar la estructura de un colegio nuevo:
 *  país (plantilla) → qué secciones tiene → cuántos salones por sección. */
export function OnboardingWizard() {
  const [step, setStep] = useState<Step>("preset");
  const [presetId, setPresetId] = useState<string>("");
  const [levels, setLevels] = useState<string[]>([]);
  const [salones, setSalones] = useState<Record<string, number>>({});
  const [pending, start] = useTransition();

  const preset = getPreset(presetId);

  function choosePreset(id: string) {
    const p = getPreset(id);
    if (!p) return;
    setPresetId(id);
    setLevels(p.levels.map((l) => l.name)); // todas marcadas por defecto
    setSalones(Object.fromEntries(p.levels.map((l) => [l.name, 1])));
    setStep("sections");
  }
  function toggleLevel(name: string) {
    setLevels((ls) => (ls.includes(name) ? ls.filter((n) => n !== name) : [...ls, name]));
  }
  function setCount(name: string, n: number) {
    setSalones((s) => ({ ...s, [name]: Math.max(1, Math.min(12, Math.floor(n) || 1)) }));
  }
  function finish() {
    start(async () => {
      await applyOnboarding({ presetId, levels, salones });
    });
  }

  return (
    <div className="rounded-[1.75rem] border border-ink/8 bg-white p-6 shadow-card sm:p-8">
      <div className="mb-5 flex items-center gap-2">
        {(["preset", "sections", "salones"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className={`grid h-6 w-6 place-items-center rounded-full text-xs font-700 ${
                step === s ? "bg-brand text-white" : "bg-mist text-ink/40"
              }`}
            >
              {i + 1}
            </span>
            {i < 2 ? <span className="h-px w-6 bg-ink/10" /> : null}
          </div>
        ))}
      </div>

      {/* Paso 1: país / plantilla */}
      {step === "preset" ? (
        <>
          <h2 className="font-display text-lg font-700 text-ink">¿De qué país es el colegio?</h2>
          <p className="mt-1 text-sm font-500 text-ink/60">
            Elegí una plantilla para empezar. Después podés ajustar todo a mano.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {SCHOOL_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => choosePreset(p.id)}
                className="flex h-full flex-col items-start gap-1 rounded-2xl border border-ink/10 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-card"
              >
                <span className="inline-flex items-center gap-1.5 text-sm font-700 text-ink">
                  <Icon name="GraduationCap" className="h-4 w-4 text-brand" />
                  {p.label}
                </span>
                <span className="text-xs font-600 text-ink/50">{p.description}</span>
              </button>
            ))}
          </div>
        </>
      ) : null}

      {/* Paso 2: secciones */}
      {step === "sections" && preset ? (
        <>
          <h2 className="font-display text-lg font-700 text-ink">¿Qué secciones tiene?</h2>
          <p className="mt-1 text-sm font-500 text-ink/60">
            Destildá las que no correspondan a tu colegio.
          </p>
          <div className="mt-5 flex flex-col gap-1 rounded-xl border border-ink/10 p-2">
            {preset.levels.map((lv) => (
              <label
                key={lv.name}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 hover:bg-mist"
              >
                <input
                  type="checkbox"
                  checked={levels.includes(lv.name)}
                  onChange={() => toggleLevel(lv.name)}
                  className="h-4 w-4 accent-brand"
                />
                <span className="text-sm font-700 text-ink">{lv.name}</span>
                <span className="text-xs font-500 text-ink/45">
                  {lv.grades.length} grado{lv.grades.length > 1 ? "s" : ""}
                </span>
              </label>
            ))}
          </div>
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => setStep("preset")}
              className="rounded-full px-4 py-2 text-sm font-700 text-ink/55 hover:text-ink"
            >
              Atrás
            </button>
            <button
              type="button"
              disabled={levels.length === 0}
              onClick={() => setStep("salones")}
              className="rounded-full bg-ink px-4 py-2 text-sm font-700 text-white transition-colors hover:bg-navy-deep disabled:opacity-40"
            >
              Continuar
            </button>
          </div>
        </>
      ) : null}

      {/* Paso 3: salones por sección */}
      {step === "salones" && preset ? (
        <>
          <h2 className="font-display text-lg font-700 text-ink">¿Cuántos salones por año?</h2>
          <p className="mt-1 text-sm font-500 text-ink/60">
            Cantidad de salones por grado en cada sección (mínimo 1). Después podés ajustar cada
            grado por dentro, por si algún año tiene más o menos.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            {preset.levels
              .filter((lv) => levels.includes(lv.name))
              .map((lv) => (
                <div
                  key={lv.name}
                  className="flex items-center justify-between rounded-xl border border-ink/8 bg-mist/40 px-4 py-2.5"
                >
                  <span className="text-sm font-700 text-ink">{lv.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCount(lv.name, (salones[lv.name] ?? 1) - 1)}
                      className="grid h-7 w-7 place-items-center rounded-lg bg-white text-ink/60 hover:text-ink"
                    >
                      –
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={salones[lv.name] ?? 1}
                      onChange={(e) => setCount(lv.name, Number(e.target.value))}
                      className="w-12 rounded-lg border border-ink/12 bg-white py-1 text-center text-sm font-700 text-ink outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setCount(lv.name, (salones[lv.name] ?? 1) + 1)}
                      className="grid h-7 w-7 place-items-center rounded-lg bg-white text-ink/60 hover:text-ink"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
          </div>
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => setStep("sections")}
              className="rounded-full px-4 py-2 text-sm font-700 text-ink/55 hover:text-ink"
            >
              Atrás
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={finish}
              className="inline-flex items-center gap-2 rounded-full bg-cta px-5 py-2 text-sm font-700 text-white shadow-soft transition-colors hover:bg-cta-deep disabled:opacity-60"
            >
              <Icon name="Check" className="h-4 w-4" />
              {pending ? "Creando…" : "Crear estructura"}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
