import { create } from "zustand";

export type AppMode = "teacher" | "student";
export type ActiveTool = "select" | "rectangle" | "circle" | "polygon" | "freedraw";

interface UiState {
  mode: AppMode;
  darkMode: boolean;
  activeTool: ActiveTool;
  propertiesPanelOpen: boolean;
  selectedHotspotId: string | null;
  zoom: number; // 1 = 100%
  showGrid: boolean;
  showGuidelines: boolean;

  setMode: (mode: AppMode) => void;
  toggleDarkMode: () => void;
  setActiveTool: (tool: ActiveTool) => void;
  setPropertiesPanelOpen: (open: boolean) => void;
  selectHotspot: (id: string | null) => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  toggleGuidelines: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  mode: "teacher",
  darkMode: false,
  activeTool: "select",
  propertiesPanelOpen: true,
  selectedHotspotId: null,
  zoom: 1,
  showGrid: false,
  showGuidelines: true,

  setMode: (mode) => set({ mode }),
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
  setActiveTool: (activeTool) => set({ activeTool }),
  setPropertiesPanelOpen: (propertiesPanelOpen) => set({ propertiesPanelOpen }),
  selectHotspot: (selectedHotspotId) => set({ selectedHotspotId }),
  setZoom: (zoom) => set({ zoom: Math.min(4, Math.max(0.1, zoom)) }),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  toggleGuidelines: () => set((s) => ({ showGuidelines: !s.showGuidelines }))
}));
