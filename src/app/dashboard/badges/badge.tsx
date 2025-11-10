'use client';
import MainHeader from "@/components/dashboard/main-header";
import React, { useEffect, useState, useRef } from "react";
import { auth } from "@/lib/firebase-client";
import { toast } from "@/hooks/use-toast";
import type { JournalEntry } from "@/types";
import img5 from '@/images/serenitea/5.jpeg';
import img10 from '@/images/serenitea/10.jpeg';
import img25 from '@/images/serenitea/25.jpeg';
import img50 from '@/images/serenitea/50.jpeg';
import img100 from '@/images/serenitea/100.jpeg';
import img500 from '@/images/serenitea/500.jpeg';

const badgeImages: Record<number, string> = {
  5: img5.src,
  10: img10.src,
  25: img25.src,
  50: img50.src,
  100: img100.src,
  500: img500.src,
};

// UI imports not needed here; inline styles are used for this view
const badgeContainerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)", // 3 columnas
    gridTemplateRows: "repeat(2, auto)", // 2 filas
    gap: 18,
    justifyItems: "center",
};
/**
 * Badges UI
 *
 * - Shows three unique badges (5, 10, 30 days).
 * - A badge is unlocked when user.entriesCount >= requirement OR user.streakDays >= requirement.
 * - Allows uploading a custom icon per badge (persisted in localStorage).
 *
 * Drop-in replacement for $SELECTION_PLACEHOLDER$.
 */

/* Types */
type BadgeSpec = {
    id: string;
    title: string;
    requirement: number;
    description: string;
    defaultColor: string;
};

/* Badge definitions: ahora medallas por número de entradas (en español) */
const BADGES: BadgeSpec[] = [
    { id: "badge-5", title: "5 entradas", requirement: 5, description: "Con pequeños pasos reclamarás esta medalla de 5 entradas", defaultColor: "#a8e6cf" },
    { id: "badge-10", title: "10 entradas", requirement: 10, description: "Con 10 entradas desbloquearás esta medalla", defaultColor: "#b3d9ff" },
    { id: "badge-25", title: "25 entradas", requirement: 25, description: "25 entradas son requeridas para desbloquear esta medalla", defaultColor: "#a8e6cf" },
    { id: "badge-50", title: "50 entradas", requirement: 50, description: "Registra 50 entradas para desbloquear esta medalla", defaultColor: "#b3d9ff" },
    { id: "badge-100", title: "100 entradas", requirement: 100, description: "Alcanza 100 entradas y serás recompensado", defaultColor: "#a8e6cf" },
    { id: "badge-500", title: "500 entradas", requirement: 500, description: "Hito épico: 500 entradas, ¡muy bien hecho!", defaultColor: "#b3d9ff" },
];

/* Helpers */
function createDefaultSvgDataUrl(label: string, bg: string): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="100%" height="100%" fill="${bg}" rx="40"/><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="48" fill="white">${label}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function storageKeyForBadge(id: string) {
    return `serenite:badge:icon:${id}`;
}

/* Badge card component */
function BadgeCard({ spec, icon, unlocked }: { spec: BadgeSpec; icon: string; unlocked: boolean }) {
    return (
        <div
            style={{
                width: 240,
                padding: 18,
                borderRadius: 16,
                boxShadow: "0 6px 18px rgba(16,24,40,0.08)",
                background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,250,250,1))",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                border: "1px solid rgba(0,0,0,0.04)",
            }}
        >
            <div style={{ position: "relative", width: 140, height: 140 }}>
                <img
                    src={icon}
                    alt={`${spec.title} icon`}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 20,
                        filter: unlocked ? "none" : "grayscale(100%) opacity(0.5)",
                        transition: "filter 300ms, transform 250ms",
                        transform: unlocked ? "translateY(-4px) scale(1.02)" : "none",
                        boxShadow: unlocked ? "0 8px 24px rgba(16,185,129,0.12)" : "none",
                    }}
                />
                {!unlocked && (
                    <div
                        aria-hidden
                        style={{
                            position: "absolute",
                            left: 10,
                            top: 10,
                            background: "rgba(0,0,0,0.6)",
                            color: "white",
                            padding: "6px 10px",
                            borderRadius: 10,
                            fontSize: 13,
                        }}
                    >
                        🔒 Bloqueado
                    </div>
                )}
            </div>

            <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{spec.title}</div>
                <div style={{ fontSize: 13, color: "#4b5563", marginTop: 6 }}>{spec.description}</div>
            </div>

            <div style={{ fontSize: 13, color: unlocked ? "hsl(150 50% 25%)" : "#9ca3af", marginTop: 6, fontWeight: 600 }}>
                {unlocked ? "Desbloqueada" : `Requiere ${spec.requirement} entradas`}
            </div>
        </div>
    );
}

/* Main page component */
export default function BadgePage() {
    const [entriesCount, setEntriesCount] = useState(0);
    const [loadingEntries, setLoadingEntries] = useState(true);

    // fallback when useAuth provides nothing
    
    // local state for icons (data URLs)
    const [icons, setIcons] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        for (const b of BADGES) {
            const key = storageKeyForBadge(b.id);
            const stored: string | null = (typeof window !== "undefined") ? localStorage.getItem(key) : null;
            const def: string = createDefaultSvgDataUrl(String(b.requirement), b.defaultColor);
            initial[b.id] = stored ?? def;
        }
        return initial;
    });

        useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (!user) {
          setEntriesCount(0);
          setLoadingEntries(false);
          return;
        }

        try {
          setLoadingEntries(true);
          const token = await user.getIdToken();

          const response = await fetch("/api/journal", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "No se pudieron cargar tus entradas.");
          }

          const data: JournalEntry[] = await response.json();

          // 👇 Aquí obtenemos la cantidad de entradas para logros
          setEntriesCount(data.length);
        } catch (err: any) {
          console.error("Error cargando entradas en logros:", err);
          toast({
            title: "Error",
            description: err.message || "No se pudieron cargar tus entradas del diario.",
            variant: "destructive",
          });
          setEntriesCount(0);
        } finally {
          setLoadingEntries(false);
        }
      });

      return () => unsubscribe();
    }, []);



    useEffect(() => {
        // ensure missing keys (first render on client) are filled
        for (const b of BADGES) {
            const key = storageKeyForBadge(b.id);
            const stored: string | null = localStorage.getItem(key);
            if (stored && icons[b.id] !== stored) {
                setIcons((prev) => ({ ...prev, [b.id]: stored }));
            } else if (!stored && icons[b.id] === undefined) {
                const def: string = createDefaultSvgDataUrl(String(b.requirement), b.defaultColor);
                localStorage.setItem(key, def);
                setIcons((prev) => ({ ...prev, [b.id]: def }));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // track previous unlocked state to congratulate when newly unlocked
    const prevUnlockedRef = useRef<Record<string, boolean>>({});
    const [congrats, setCongrats] = useState<string | null>(null);

    useEffect(() => {
        const nowUnlocked: Record<string, boolean> = {};
        for (const b of BADGES) {
            const isUnlocked = (entriesCount >= b.requirement);
            nowUnlocked[b.id] = isUnlocked;
            const wasUnlocked = !!prevUnlockedRef.current[b.id];
            if (isUnlocked && !wasUnlocked) {
                // newly unlocked
                setCongrats(`¡Felicidades! Has desbloqueado: ${b.title} 🎉`);
                // clear after a few seconds
                setTimeout(() => setCongrats(null), 5000);
            }
        }
        prevUnlockedRef.current = nowUnlocked;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entriesCount]);

    return (
        <div style={{ padding: 20 }}>
            <MainHeader />

            <section style={{ marginTop: 16 }}>
                <h1 style={{ fontWeight: 800, fontSize: 20, color: "#111827", marginBottom: 8 }}>Logros</h1>
                <p style={{ color: "#374151", marginBottom: 12 }}>
                    Las medallas se desbloquean cuando llegues a la cantidad de entradas indicada.
                    Tus estadísticas actuales: <strong>{entriesCount}</strong> entradas.
                </p>

                {congrats && (
                    <div style={{ marginBottom: 12, padding: 12, borderRadius: 10, background: "linear-gradient(90deg,#d1fae5,#bbf7d0)", color: "#065f46", fontWeight: 700 }}>
                        {congrats}
                    </div>
                )}

                <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                    {BADGES.map((b) => {
                        const unlocked = (entriesCount >= b.requirement);
                        const iconSrc = unlocked
  ? badgeImages[b.requirement]
  : icons[b.id] ?? createDefaultSvgDataUrl(String(b.requirement), b.defaultColor);

                        

                        return <BadgeCard key={b.id} spec={b} icon={iconSrc} unlocked={unlocked} />;
                    })}
                </div>
            </section>
        </div>
    );
}  