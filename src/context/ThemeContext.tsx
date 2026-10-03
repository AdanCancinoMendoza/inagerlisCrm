"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface ColorPalette {
  id: string;
  name: string;
  hex: string;
  hover: string;
  light: string;
  alpha: string;
  darkBg: string;
  darkBorder: string;
  textOnPrimary: string;
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: "gold",
    name: "Dorado Prestige",
    hex: "#D8A814",
    hover: "#B88E0E",
    light: "#FEF8E7",
    alpha: "rgba(216, 168, 20, 0.15)",
    darkBg: "#050505",
    darkBorder: "#262626",
    textOnPrimary: "#FFFFFF",
  },
  {
    id: "sapphire",
    name: "Zafiro Corporate",
    hex: "#2563EB",
    hover: "#1D4ED8",
    light: "#EFF6FF",
    alpha: "rgba(37, 99, 235, 0.15)",
    darkBg: "#0F172A",
    darkBorder: "#1E293B",
    textOnPrimary: "#FFFFFF",
  },
  {
    id: "emerald",
    name: "Esmeralda Pro",
    hex: "#059669",
    hover: "#047857",
    light: "#ECFDF5",
    alpha: "rgba(5, 150, 105, 0.15)",
    darkBg: "#062C22",
    darkBorder: "#0F4C3A",
    textOnPrimary: "#FFFFFF",
  },
  {
    id: "purple",
    name: "Púrpura Imperial",
    hex: "#7C3AED",
    hover: "#6D28D9",
    light: "#F5F3FF",
    alpha: "rgba(124, 58, 237, 0.15)",
    darkBg: "#1E1035",
    darkBorder: "#3B1C6B",
    textOnPrimary: "#FFFFFF",
  },
  {
    id: "ruby",
    name: "Rojo Rubí",
    hex: "#E11D48",
    hover: "#BE123C",
    light: "#FFF1F2",
    alpha: "rgba(225, 29, 72, 0.15)",
    darkBg: "#2A080C",
    darkBorder: "#4A151C",
    textOnPrimary: "#FFFFFF",
  },
  {
    id: "amber",
    name: "Ámbar Fuego",
    hex: "#D97706",
    hover: "#B45309",
    light: "#FFFBEB",
    alpha: "rgba(217, 119, 6, 0.15)",
    darkBg: "#241203",
    darkBorder: "#42230B",
    textOnPrimary: "#FFFFFF",
  },
];

interface ThemeContextType {
  activePalette: ColorPalette;
  setPalette: (paletteId: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  activePalette: COLOR_PALETTES[0],
  setPalette: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [activePalette, setActivePalette] = useState<ColorPalette>(COLOR_PALETTES[0]);

  const applyPalette = (palette: ColorPalette) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.style.setProperty("--primary", palette.hex);
    root.style.setProperty("--primary-hover", palette.hover);
    root.style.setProperty("--primary-light", palette.light);
    root.style.setProperty("--primary-alpha", palette.alpha);
    root.style.setProperty("--primary-text", palette.textOnPrimary);
    root.style.setProperty("--dark-bg", palette.darkBg);
    root.style.setProperty("--dark-border", palette.darkBorder);
    root.style.setProperty("--gold", palette.hex);
    root.style.setProperty("--gold-hover", palette.hover);
  };

  useEffect(() => {
    const saved = localStorage.getItem("crm_color_palette");
    if (saved) {
      const found = COLOR_PALETTES.find((p) => p.id === saved);
      if (found) {
        setActivePalette(found);
        applyPalette(found);
      }
    } else {
      applyPalette(COLOR_PALETTES[0]);
    }
  }, []);

  const changePalette = (paletteId: string) => {
    const found = COLOR_PALETTES.find((p) => p.id === paletteId);
    if (found) {
      setActivePalette(found);
      localStorage.setItem("crm_color_palette", paletteId);
      applyPalette(found);
    }
  };

  return (
    <ThemeContext.Provider value={{ activePalette, setPalette: changePalette }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
