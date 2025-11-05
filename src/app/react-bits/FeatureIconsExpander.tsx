"use client";
import { useState } from "react";
import FadeContent from "./Float";

type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

export default function FeatureIconsExpander({ features }: { features: Feature[] }) {
  const [active, setActive] = useState(0);

  return (
    <div className="mt-16">
      {/* ICONOS */}
      <div
        role="tablist"
        aria-label="Características de SereniTea"
        className="grid grid-cols-3 sm:grid-cols-6 gap-6 justify-items-center"
      >
        {features.map((f, i) => (
          <button
            key={f.title}
            role="tab"
            aria-selected={active === i}
            aria-controls={`feature-panel-${i}`}
            onClick={() => setActive(i)}
            title={f.title}
            className={[
              "group h-20 w-20 rounded-full flex items-center justify-center transition-all duration-300 ease-out",
              "shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
              active === i
                ? "bg-sky-200 scale-125 ring-2 ring-sky-400 animate-pulse-soft text-white"
                : "bg-primary/80 hover:bg-sky-100 hover:scale-110 text-primary-foreground",
            ].join(" ")}
          >
            <span className="text-3xl transition-transform duration-300 ease-out">
              {f.icon}
            </span>
          </button>
        ))}
      </div>

      {/* PANEL DETALLE (contenedor fijo) */}
      <div className="mt-10 mx-auto max-w-2xl">
        <div
          className={[
            "rounded-xl border border-border/60 bg-white shadow-sm overflow-hidden text-center",
            "transition-all duration-500 ease-out",
            "min-h-[180px] flex flex-col items-center justify-center p-6",
          ].join(" ")}
        >
          <FadeContent
            key={active} // activa animación cuando cambia la selección
            blur={false}
            duration={700}
            easing="ease-out"
            initialOpacity={0}
            className="w-full"
          >
            <h3 className="text-xl font-semibold font-headline text-gray-800">
              {features[active].title}
            </h3>
            <p className="mt-2 text-gray-600">{features[active].description}</p>
          </FadeContent>
        </div>
      </div>
    </div>
  );
}
