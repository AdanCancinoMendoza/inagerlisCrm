"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { getOrganizacionId, getOrganizacionNombre } from "@/services/auth";
import { apiRequest } from "@/services/api";

export interface ColorPalette {
  id: string;
  name: string;
  category: "Clásicos" | "Corporativos" | "Editorial & Lujo" | "Creativos & Frescos";
  description: string;
  hex: string;
  hover: string;
  light: string;
  alpha: string;
  darkBg: string;
  darkBorder: string;
  textOnPrimary: string;
  bgGlobal: string; // Tono de fondo recomendado
  fontId: string; // Fuente recomendada
}

export interface FontOption {
  id: string;
  name: string;
  family: string;
  description: string;
  category: string;
}

export interface BackgroundToneOption {
  id: string;
  name: string;
  hex: string;
  description: string;
  borderPreview: string;
}

export type OrgThemeStatus = "idle" | "saving" | "saved" | "offline" | "error";

/* =======================================================================
   COLECCIÓN DE FUENTES GLOBALES DEL SISTEMA (LETRAS)
======================================================================= */
export const FONT_OPTIONS: FontOption[] = [
  {
    id: "sans",
    name: "Moderna Corporativa",
    family: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    description: "Limpia, sobria y de máxima legibilidad ejecutiva",
    category: "Sans-Serif",
  },
  {
    id: "geometric",
    name: "Geométrica Vanguardista",
    family: '"Plus Jakarta Sans", "Outfit", system-ui, sans-serif',
    description: "Diseño premium contemporáneo con curvas armoniosas",
    category: "Moderna",
  },
  {
    id: "serif",
    name: "Editorial & Alta Gama",
    family: '"Georgia", "Merriweather", "Cambria", serif',
    description: "Carácter distinguido con remates clásicos y calidez",
    category: "Serif de Lujo",
  },
  {
    id: "mono",
    name: "Técnica Minimalista",
    family: '"Space Mono", "JetBrains Mono", monospace',
    description: "Estilo brutalista y alta precisión en cifras y códigos",
    category: "Monoespaciada",
  },
  {
    id: "humanist",
    name: "Dinámica Humanista",
    family: '"Trebuchet MS", "Lucida Grande", sans-serif',
    description: "Estructurada, accesible y de alta energía visual",
    category: "Expresiva",
  },
];

/* =======================================================================
   TONOS DE FONDO GLOBAL (FONDO BLANCO / NEUTRO / CÁLIDO)
======================================================================= */
export const BACKGROUND_TONES: BackgroundToneOption[] = [
  {
    id: "neutral_platino",
    name: "Platino Neutro (Oficial)",
    hex: "#F7F7F7",
    description: "El gris neutro corporativo original de Inagerlis",
    borderPreview: "#E0E0E0",
  },
  {
    id: "pure_white",
    name: "Blanco Nieve Puro",
    hex: "#FFFFFF",
    description: "Luminoso, inmaculado y de máximo contraste visual",
    borderPreview: "#D4D4D4",
  },
  {
    id: "warm_ivory",
    name: "Marfil Cálido / Lino",
    hex: "#FAF6EE",
    description: "Tono de papel fino, cálido y sin fatiga visual",
    borderPreview: "#E8DECA",
  },
  {
    id: "glacier_blue",
    name: "Azul Glaciar",
    hex: "#F0F4F8",
    description: "Claridad fría, tecnológica y serenidad nórdica",
    borderPreview: "#D0DCE8",
  },
  {
    id: "nordic_ash",
    name: "Ceniza Nórdica",
    hex: "#F1F5F9",
    description: "Matiz escandinavo tenue de alta sofisticación",
    borderPreview: "#CBD5E1",
  },
  {
    id: "warm_clay",
    name: "Arcilla Suave",
    hex: "#FAF4EF",
    description: "Calidez terrosa natural y refinamiento artesanal",
    borderPreview: "#E8D9CD",
  },
  {
    id: "mist_lavender",
    name: "Bruma Lavanda",
    hex: "#F6F4FB",
    description: "Toque etéreo, distinguido y relajante",
    borderPreview: "#DDD6FE",
  },
];

/* =======================================================================
   GALERÍA VARIADA DE 18 TEMAS COMPLETOS PERSONALIZADOS
======================================================================= */
export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: "gold",
    name: "Dorado Prestige",
    category: "Clásicos",
    description: "La identidad icónica de Inagerlis. Soberbia y presencia de alta gama.",
    hex: "#D8A814",
    hover: "#B88E0E",
    light: "#FEF8E7",
    alpha: "rgba(216, 168, 20, 0.15)",
    darkBg: "#050505",
    darkBorder: "#262626",
    textOnPrimary: "#FFFFFF",
    bgGlobal: "#F7F7F7",
    fontId: "sans",
  },
  {
    id: "obsidian",
    name: "Obsidiana Monocromo",
    category: "Clásicos",
    description: "Minimalismo absoluto. Alto contraste en blanco, negro y estética sobria.",
    hex: "#050505",
    hover: "#222222",
    light: "#F0F0F0",
    alpha: "rgba(5, 5, 5, 0.12)",
    darkBg: "#0A0A0A",
    darkBorder: "#2A2A2A",
    textOnPrimary: "#FFFFFF",
    bgGlobal: "#FFFFFF",
    fontId: "mono",
  },
  {
    id: "nordic",
    name: "Nórdico Platino",
    category: "Corporativos",
    description: "Líneas limpias escandinavas, tonos de pizarra y geometría sobria.",
    hex: "#334155",
    hover: "#1E293B",
    light: "#F1F5F9",
    alpha: "rgba(51, 65, 85, 0.15)",
    darkBg: "#0F172A",
    darkBorder: "#1E293B",
    textOnPrimary: "#FFFFFF",
    bgGlobal: "#F1F5F9",
    fontId: "geometric",
  },
  {
    id: "sapphire",
    name: "Zafiro Ejecutivo",
    category: "Corporativos",
    description: "Solidez, confianza y precisión bancaria e institucional internacional.",
    hex: "#2563EB",
    hover: "#1D4ED8",
    light: "#EFF6FF",
    alpha: "rgba(37, 99, 235, 0.15)",
    darkBg: "#0F172A",
    darkBorder: "#1E293B",
    textOnPrimary: "#FFFFFF",
    bgGlobal: "#F0F4F8",
    fontId: "sans",
  },
  {
    id: "cobalt",
    name: "Azul Medianoche",
    category: "Corporativos",
    description: "Profundidad marina, autoridad y serenidad tecnológica de vanguardia.",
    hex: "#1E3A8A",
    hover: "#172554",
    light: "#EEF2FF",
    alpha: "rgba(30, 58, 138, 0.15)",
    darkBg: "#0A0F1D",
    darkBorder: "#1B2A4A",
    textOnPrimary: "#FFFFFF",
    bgGlobal: "#F4F6FB",
    fontId: "geometric",
  },
  {
    id: "indigo",
    name: "Índigo Profundo",
    category: "Corporativos",
    description: "Equilibrio entre seriedad corporativa y vanguardia creativa.",
    hex: "#4338CA",
    hover: "#3730A3",
    light: "#EEF2FF",
    alpha: "rgba(67, 56, 202, 0.15)",
    darkBg: "#1E1B4B",
    darkBorder: "#312E81",
    textOnPrimary: "#FFFFFF",
    bgGlobal: "#F0F4F8",
    fontId: "geometric",
  },
  {
    id: "ivory",
    name: "Marfil & Borgoña",
    category: "Editorial & Lujo",
    description: "Atmósfera de alta costura, fondo cálido de papel lino y tipografía con remates.",
    hex: "#9F1239",
    hover: "#881337",
    light: "#FFF1F2",
    alpha: "rgba(159, 18, 57, 0.15)",
    darkBg: "#2A0811",
    darkBorder: "#4A1220",
    textOnPrimary: "#FFFFFF",
    bgGlobal: "#FAF6EE",
    fontId: "serif",
  },
  {
    id: "terracotta",
    name: "Cobre Terracota",
    category: "Editorial & Lujo",
    description: "Elegancia orgánica y calidez artesanal inspirada en talleres de autor.",
    hex: "#C2410C",
    hover: "#9A3412",
    light: "#FFF7ED",
    alpha: "rgba(194, 65, 12, 0.15)",
    darkBg: "#2A1108",
    darkBorder: "#4D2214",
    textOnPrimary: "#FFFFFF",
    bgGlobal: "#FAF4EF",
    fontId: "humanist",
  },
  {
    id: "amethyst",
    name: "Amatista Imperial",
    category: "Editorial & Lujo",
    description: "Distinción artística, misterio sofisticado y estilo de joyería fina.",
    hex: "#7C3AED",
    hover: "#6D28D9",
    light: "#F5F3FF",
    alpha: "rgba(124, 58, 237, 0.15)",
    darkBg: "#1E1035",
    darkBorder: "#3B1C6B",
    textOnPrimary: "#FFFFFF",
    bgGlobal: "#F6F4FB",
    fontId: "geometric",
  },
  {
    id: "amber",
    name: "Ámbar Tostado",
    category: "Clásicos",
    description: "Tono maderoso y gastronómico con carácter de atelier y biblioteca clásica.",
    hex: "#D97706",
    hover: "#B45309",
    light: "#FFFBEB",
    alpha: "rgba(217, 119, 6, 0.15)",
    darkBg: "#241203",
    darkBorder: "#42230B",
    textOnPrimary: "#FFFFFF",
    bgGlobal: "#FAF6EE",
    fontId: "serif",
  },
  {
    id: "emerald",
    name: "Esmeralda Boutique",
    category: "Creativos & Frescos",
    description: "Vitalidad natural, armonía botánica y serenidad para negocios saludables.",
    hex: "#059669",
    hover: "#047857",
    light: "#ECFDF5",
    alpha: "rgba(5, 150, 105, 0.15)",
    darkBg: "#062C22",
    darkBorder: "#0F4C3A",
    textOnPrimary: "#FFFFFF",
    bgGlobal: "#F3F7F4",
    fontId: "geometric",
  },
  {
    id: "olive",
    name: "Olivo Mediterráneo",
    category: "Creativos & Frescos",
    description: "Elegancia natural tenue, matices verdes terrosos y calma orgánica.",
    hex: "#4D7C0F",
    hover: "#3F6212",
    light: "#F7FEE7",
    alpha: "rgba(77, 124, 15, 0.15)",
    darkBg: "#1A2E05",
    darkBorder: "#365314",
    textOnPrimary: "#FFFFFF",
    bgGlobal: "#FAF6EE",
    fontId: "sans",
  },
  {
    id: "caribbean",
    name: "Turquesa Riviera",
    category: "Creativos & Frescos",
    description: "Claridad oceánica, frescura costera y agilidad para negocios activos.",
    hex: "#0D9488",
    hover: "#0F766E",
    light: "#F0FDFA",
    alpha: "rgba(13, 148, 136, 0.15)",
    darkBg: "#082F2C",
    darkBorder: "#114B47",
    textOnPrimary: "#FFFFFF",
    bgGlobal: "#F0F9F8",
    fontId: "sans",
  },
  {
    id: "rose",
    name: "Cuarzo Rosa",
    category: "Creativos & Frescos",
    description: "Audacia refinada, estética de diseño editorial contemporáneo y moda.",
    hex: "#DB2777",
    hover: "#BE185D",
    light: "#FDF2F8",
    alpha: "rgba(219, 39, 119, 0.15)",
    darkBg: "#2B091B",
    darkBorder: "#4E1433",
    textOnPrimary: "#FFFFFF",
    bgGlobal: "#FAF6EE",
    fontId: "sans",
  },
  {
    id: "crimson",
    name: "Carmesí Dinastía",
    category: "Editorial & Lujo",
    description: "Fuerza visual contundente, elegancia oriental y carácter decidido.",
    hex: "#DC2626",
    hover: "#B91C1C",
    light: "#FEF2F2",
    alpha: "rgba(220, 38, 38, 0.15)",
    darkBg: "#450A0A",
    darkBorder: "#7F1D1D",
    textOnPrimary: "#FFFFFF",
    bgGlobal: "#FAF4EF",
    fontId: "sans",
  },
  {
    id: "cyber",
    name: "Tokio Neón",
    category: "Creativos & Frescos",
    description: "Energía cian vibrante inspirada en interfaces futuristas e iluminación nocturna.",
    hex: "#0284C7",
    hover: "#0369A1",
    light: "#F0F9FF",
    alpha: "rgba(2, 132, 199, 0.15)",
    darkBg: "#082F49",
    darkBorder: "#0C4A6E",
    textOnPrimary: "#FFFFFF",
    bgGlobal: "#FFFFFF",
    fontId: "mono",
  },
  {
    id: "titanium",
    name: "Titanio Grafito",
    category: "Corporativos",
    description: "Precisión de ingeniería, aleación mate y neutralidad técnica impecable.",
    hex: "#475569",
    hover: "#334155",
    light: "#F8FAFC",
    alpha: "rgba(71, 85, 105, 0.15)",
    darkBg: "#1E293B",
    darkBorder: "#334155",
    textOnPrimary: "#FFFFFF",
    bgGlobal: "#F8FAFC",
    fontId: "mono",
  },
  {
    id: "minimal_snow",
    name: "Minimalista Nieve",
    category: "Clásicos",
    description: "Blanco absoluto ultra luminoso con líneas y tipografía en negro carbón.",
    hex: "#18181B",
    hover: "#27272A",
    light: "#FAFAFA",
    alpha: "rgba(24, 24, 27, 0.12)",
    darkBg: "#09090B",
    darkBorder: "#27272A",
    textOnPrimary: "#FFFFFF",
    bgGlobal: "#FFFFFF",
    fontId: "sans",
  },
];

interface ThemeContextType {
  activePalette: ColorPalette;
  setPalette: (paletteId: string) => void;
  customBg: string;
  setCustomBg: (bgHex: string) => void;
  customFontId: string;
  setCustomFontId: (fontId: string) => void;
  resetToDefault: () => void;
  themeMode: "light" | "dark";
  isDarkMode: boolean;
  toggleThemeMode: () => void;
  setThemeMode: (mode: "light" | "dark") => void;

  // Persistencia en base de datos para la organización
  isSavingOrg: boolean;
  orgThemeStatus: OrgThemeStatus;
  organizacionNombre: string | null;
  organizacionId: string | null;
  saveCurrentThemeToOrg: () => Promise<boolean>;
}

const ThemeContext = createContext<ThemeContextType>({
  activePalette: COLOR_PALETTES[0],
  setPalette: () => {},
  customBg: "#F7F7F7",
  setCustomBg: () => {},
  customFontId: "sans",
  setCustomFontId: () => {},
  resetToDefault: () => {},
  themeMode: "light",
  isDarkMode: false,
  toggleThemeMode: () => {},
  setThemeMode: () => {},
  isSavingOrg: false,
  orgThemeStatus: "idle",
  organizacionNombre: null,
  organizacionId: null,
  saveCurrentThemeToOrg: async () => false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [activePalette, setActivePalette] = useState<ColorPalette>(COLOR_PALETTES[0]);
  const [customBg, setCustomBgState] = useState<string>("#F7F7F7");
  const [customFontId, setCustomFontIdState] = useState<string>("sans");
  const [themeMode, setThemeModeState] = useState<"light" | "dark">("light");

  const [isSavingOrg, setIsSavingOrg] = useState<boolean>(false);
  const [orgThemeStatus, setOrgThemeStatus] = useState<OrgThemeStatus>("idle");
  const [organizacionNombre, setOrganizacionNombre] = useState<string | null>(null);
  const [organizacionId, setOrganizacionId] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const applyThemeToDOM = (
    palette: ColorPalette,
    bgHex: string,
    fontOptionId: string
  ) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    // Colores primarios y acentos
    root.style.setProperty("--primary", palette.hex);
    root.style.setProperty("--primary-hover", palette.hover);
    root.style.setProperty("--primary-light", palette.light);
    root.style.setProperty("--primary-alpha", palette.alpha);
    root.style.setProperty("--primary-text", palette.textOnPrimary);
    root.style.setProperty("--dark-bg", palette.darkBg);
    root.style.setProperty("--dark-border", palette.darkBorder);
    root.style.setProperty("--gold", palette.hex);
    root.style.setProperty("--gold-hover", palette.hover);

    // Fondo global
    root.style.setProperty("--theme-bg", bgHex);
    root.style.setProperty("--background", bgHex);

    // Tipografía global
    const foundFont = FONT_OPTIONS.find((f) => f.id === fontOptionId) || FONT_OPTIONS[0];
    root.style.setProperty("--theme-font", foundFont.family);
  };

  /**
   * Persiste la configuración del tema en la base de datos de la Organización
   * (con soporte Offline-First: guarda en localStorage y encola si no hay red)
   */
  const persistThemeToBackend = useCallback(
    async (palette: ColorPalette, bgHex: string, fontId: string) => {
      const orgId = getOrganizacionId();
      if (!orgId) return;

      setIsSavingOrg(true);
      setOrgThemeStatus("saving");

      const themePayload = {
        temaId: palette.id,
        colorPrimario: palette.hex,
        colorSecundario: palette.darkBg,
        fondoPersonalizado: bgHex,
        tipografia: fontId,
        configuracionTema: {
          paletteId: palette.id,
          paletteName: palette.name,
          hex: palette.hex,
          darkBg: palette.darkBg,
          bgGlobal: bgHex,
          fontId: fontId,
          updatedAt: new Date().toISOString(),
        },
      };

      // 1. Guardar de inmediato en cache local offline de la organización
      if (typeof window !== "undefined") {
        localStorage.setItem(`inagerlis_org_theme_${orgId}`, JSON.stringify(themePayload));
      }

      // 2. Persistir en la base de datos de la Organización
      try {
        await apiRequest(`/organizaciones/${orgId}`, {
          method: "PUT",
          body: JSON.stringify(themePayload),
        });

        setOrgThemeStatus("saved");
        if (typeof window !== "undefined") {
          localStorage.removeItem(`inagerlis_offline_theme_queue_${orgId}`);
        }
      } catch (err) {
        console.warn("Backend no disponible para persistir tema, encolado offline:", err);
        setOrgThemeStatus("offline");
        if (typeof window !== "undefined") {
          localStorage.setItem(
            `inagerlis_offline_theme_queue_${orgId}`,
            JSON.stringify({ ...themePayload, queuedAt: Date.now() })
          );
        }
      } finally {
        setIsSavingOrg(false);
      }
    },
    []
  );

  /**
   * Sincroniza cambios pendientes en cola offline al restablecerse la conexión
   */
  const syncOfflineQueue = useCallback(async () => {
    const orgId = getOrganizacionId();
    if (!orgId || typeof window === "undefined" || !navigator.onLine) return;

    const queuedRaw = localStorage.getItem(`inagerlis_offline_theme_queue_${orgId}`);
    if (!queuedRaw) return;

    try {
      const queuedData = JSON.parse(queuedRaw);
      await apiRequest(`/organizaciones/${orgId}`, {
        method: "PUT",
        body: JSON.stringify(queuedData),
      });
      localStorage.removeItem(`inagerlis_offline_theme_queue_${orgId}`);
      setOrgThemeStatus("saved");
    } catch (err) {
      console.warn("Reintento de sincronización offline de tema fallido:", err);
    }
  }, []);

  // Carga inicial y restauración de preferencias
  useEffect(() => {
    const currentOrgId = getOrganizacionId();
    const currentOrgNombre = getOrganizacionNombre();
    setOrganizacionId(currentOrgId);
    setOrganizacionNombre(currentOrgNombre);

    // 1. Restaurar paleta guardada localmente
    let initialPalette = COLOR_PALETTES[0];
    const savedPalette = localStorage.getItem("crm_color_palette");
    if (savedPalette) {
      const found = COLOR_PALETTES.find((p) => p.id === savedPalette);
      if (found) initialPalette = found;
    }
    setActivePalette(initialPalette);

    // 2. Restaurar fondo global guardado localmente
    let initialBg = initialPalette.bgGlobal || "#F7F7F7";
    const savedBg = localStorage.getItem("crm_custom_bg");
    if (savedBg) {
      initialBg = savedBg;
    }
    setCustomBgState(initialBg);

    // 3. Restaurar fuente guardada localmente
    let initialFontId = initialPalette.fontId || "sans";
    const savedFont = localStorage.getItem("crm_custom_font_id");
    if (savedFont) {
      initialFontId = savedFont;
    }
    setCustomFontIdState(initialFontId);

    // Aplicar de inmediato al DOM
    applyThemeToDOM(initialPalette, initialBg, initialFontId);

    // Estilo corporativo: modo claro siempre activo
    setThemeModeState("light");
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", "light");
      document.documentElement.classList.remove("dark");
    }

    // 4. Si hay organización activa, cargar sus preferencias registradas en la base de datos
    if (currentOrgId && typeof window !== "undefined") {
      // Verificar si hay cache offline específico de la org
      const cachedOrgTheme = localStorage.getItem(`inagerlis_org_theme_${currentOrgId}`);
      if (cachedOrgTheme) {
        try {
          const parsed = JSON.parse(cachedOrgTheme);
          if (parsed.temaId) {
            const foundP = COLOR_PALETTES.find((p) => p.id === parsed.temaId);
            if (foundP) {
              initialPalette = foundP;
              setActivePalette(foundP);
            }
          }
          if (parsed.fondoPersonalizado) {
            initialBg = parsed.fondoPersonalizado;
            setCustomBgState(parsed.fondoPersonalizado);
          }
          if (parsed.tipografia) {
            initialFontId = parsed.tipografia;
            setCustomFontIdState(parsed.tipografia);
          }
          applyThemeToDOM(initialPalette, initialBg, initialFontId);
        } catch {}
      }

      // Consultar backend para sincronizar si hay conexión
      if (navigator.onLine) {
        apiRequest<any>(`/organizaciones/${currentOrgId}`)
          .then((org) => {
            if (org) {
              if (org.nombre && !currentOrgNombre) {
                setOrganizacionNombre(org.nombre);
              }
              let updatedPalette = initialPalette;
              let updatedBg = initialBg;
              let updatedFont = initialFontId;

              if (org.temaId) {
                const foundP = COLOR_PALETTES.find((p) => p.id === org.temaId);
                if (foundP) {
                  updatedPalette = foundP;
                  setActivePalette(foundP);
                  localStorage.setItem("crm_color_palette", foundP.id);
                }
              }
              if (org.fondoPersonalizado) {
                updatedBg = org.fondoPersonalizado;
                setCustomBgState(org.fondoPersonalizado);
                localStorage.setItem("crm_custom_bg", org.fondoPersonalizado);
              }
              if (org.tipografia) {
                updatedFont = org.tipografia;
                setCustomFontIdState(org.tipografia);
                localStorage.setItem("crm_custom_font_id", org.tipografia);
              }

              applyThemeToDOM(updatedPalette, updatedBg, updatedFont);
              setOrgThemeStatus("saved");
            }
          })
          .catch((err) => {
            console.warn("No se pudo cargar tema de la organización desde el servidor, usando cache local:", err);
          });
      }
    }

    // Escuchar eventos de red para sincronización automática
    const handleOnline = () => {
      syncOfflineQueue();
    };
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [syncOfflineQueue]);

  // Cambiar tema completo (aplica color, fondo y tipografía predefinidos del tema)
  const changePalette = (paletteId: string) => {
    const found = COLOR_PALETTES.find((p) => p.id === paletteId);
    if (!found) return;

    setActivePalette(found);
    setCustomBgState(found.bgGlobal);
    setCustomFontIdState(found.fontId);

    if (typeof window !== "undefined") {
      localStorage.setItem("crm_color_palette", paletteId);
      localStorage.setItem("crm_custom_bg", found.bgGlobal);
      localStorage.setItem("crm_custom_font_id", found.fontId);
    }

    applyThemeToDOM(found, found.bgGlobal, found.fontId);

    // Auto-persistir en la organización con debounce suave de 300ms
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      persistThemeToBackend(found, found.bgGlobal, found.fontId);
    }, 300);
  };

  // Cambiar solo el fondo global de forma granular
  const changeCustomBg = (bgHex: string) => {
    setCustomBgState(bgHex);
    if (typeof window !== "undefined") {
      localStorage.setItem("crm_custom_bg", bgHex);
    }
    applyThemeToDOM(activePalette, bgHex, customFontId);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      persistThemeToBackend(activePalette, bgHex, customFontId);
    }, 300);
  };

  // Cambiar solo la tipografía global de forma granular
  const changeCustomFont = (fontId: string) => {
    setCustomFontIdState(fontId);
    if (typeof window !== "undefined") {
      localStorage.setItem("crm_custom_font_id", fontId);
    }
    applyThemeToDOM(activePalette, customBg, fontId);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      persistThemeToBackend(activePalette, customBg, fontId);
    }, 300);
  };

  // Guardar explícitamente en la base de datos de la organización
  const saveCurrentThemeToOrg = async (): Promise<boolean> => {
    await persistThemeToBackend(activePalette, customBg, customFontId);
    return true;
  };

  // Restaurar al tema oficial Inagerlis Prestige
  const resetToDefault = () => {
    changePalette("gold");
  };

  const changeThemeMode = (mode: "light" | "dark") => {
    setThemeModeState(mode);
  };

  const toggleThemeMode = () => {
    setThemeModeState("light");
  };

  return (
    <ThemeContext.Provider
      value={{
        activePalette,
        setPalette: changePalette,
        customBg,
        setCustomBg: changeCustomBg,
        customFontId,
        setCustomFontId: changeCustomFont,
        resetToDefault,
        themeMode,
        isDarkMode: false,
        toggleThemeMode,
        setThemeMode: changeThemeMode,
        isSavingOrg,
        orgThemeStatus,
        organizacionNombre,
        organizacionId,
        saveCurrentThemeToOrg,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
