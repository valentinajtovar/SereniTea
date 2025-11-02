"use client";
import { useState } from "react";

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
                ? "bg-sky-300 scale-125 ring-2 ring-sky-400 animate-pulse-soft text-white"
                : "bg-primary/80 hover:bg-sky-200 hover:scale-110 text-primary-foreground",
            ].join(" ")}
          >
            <span className="text-3xl transition-transform duration-300 ease-out">
              {f.icon}
            </span>
          </button>
        ))}
      </div>

      {/* PANEL DETALLE */}
      <div className="mt-10 mx-auto max-w-2xl">
        {features.map((f, i) => (
          <div
            key={f.title}
            id={`feature-panel-${i}`}
            role="tabpanel"
            aria-hidden={active !== i}
            className={[
              "rounded-xl border border-border/60 bg-white shadow-sm overflow-hidden text-center",
              "transition-all duration-500 ease-out",
              active === i
                ? "max-h-[400px] p-6 opacity-100"
                : "max-h-0 p-0 opacity-0",
            ].join(" ")}
          >
            {active === i && (
              <>
                <h3 className="text-xl font-semibold font-headline text-gray-800">
                  {f.title}
                </h3>
                <p className="mt-2 text-gray-600">{f.description}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
