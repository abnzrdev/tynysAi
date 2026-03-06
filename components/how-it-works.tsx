"use client";

import { motion } from "framer-motion";
import { BellRing, BrainCircuit, Radio, Wind } from "lucide-react";

type Dictionary = {
  howItWorks?: string;
};

const steps = [
  { id: "01", title: "Sense", detail: "CO2, PM2.5, PM10 every minute", Icon: Wind },
  { id: "02", title: "Stream", detail: "Data sync through MQTT + cloud", Icon: Radio },
  { id: "03", title: "Predict", detail: "Model flags upcoming risk", Icon: BrainCircuit },
  { id: "04", title: "Alert", detail: "Teams get route-level AQI alerts", Icon: BellRing },
];

export function HowItWorks({ dict }: { dict: Dictionary }) {
  const heading = dict?.howItWorks ?? "How it Works";

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="relative z-20 px-4 pb-20 pt-12 sm:px-6 lg:px-8 lg:pb-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <motion.h2
            id="how-it-works-heading"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="text-3xl font-semibold leading-tight text-zinc-100 md:text-5xl"
          >
            {heading}
          </motion.h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-300">
            From sensing to action in minutes, with field-validated hardware and prediction.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-cyan-400/20 bg-slate-900/65 p-6 md:p-8"
        >
          <div className="grid gap-4 md:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-[0.12em] text-cyan-300">{step.id}</span>
                  <step.Icon className="h-5 w-5 text-cyan-200" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-100">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-300">{step.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 text-center sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-4">
              <p className="text-2xl font-semibold text-zinc-100">99.8%</p>
              <p className="text-sm text-slate-400">Sensor uptime</p>
            </div>
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-4">
              <p className="text-2xl font-semibold text-zinc-100">91.25%</p>
              <p className="text-sm text-slate-400">XGBoost accuracy</p>
            </div>
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-4">
              <p className="text-2xl font-semibold text-zinc-100">&lt;60s</p>
              <p className="text-sm text-slate-400">Alert latency</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-cyan-400/25 bg-cyan-950/20 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300">Qingping Benchmarked</p>
            <p className="mt-2 text-sm text-slate-200">
              Bench-calibrated alongside <span className="font-semibold text-zinc-100">Qingping Air Quality Monitor Gen 2</span>.
            </p>
            <div className="mt-3 grid gap-2 text-xs text-slate-300 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-slate-700/80 bg-slate-950/50 px-3 py-2">PM2.5 R2: <span className="font-semibold text-zinc-100">0.89-0.95</span></div>
              <div className="rounded-lg border border-slate-700/80 bg-slate-950/50 px-3 py-2">Data recovery: <span className="font-semibold text-zinc-100">100%</span></div>
              <div className="rounded-lg border border-slate-700/80 bg-slate-950/50 px-3 py-2">Intra-model var: <span className="font-semibold text-zinc-100">~0.43 ug/m3</span></div>
              <div className="rounded-lg border border-slate-700/80 bg-slate-950/50 px-3 py-2">PM2.5 MAE: <span className="font-semibold text-zinc-100">0.9-2.0 ug/m3</span></div>
            </div>
            <p className="mt-3 text-[11px] text-slate-400">Source: Sensors 2025, 25(14), 4521 (MDPI); values cited from the study discussion of Qingping/SCAQMD field evaluation.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HowItWorks;
