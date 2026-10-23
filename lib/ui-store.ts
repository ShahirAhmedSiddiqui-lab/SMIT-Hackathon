import { create } from "zustand";

export type ToolId = "leave" | "corrections" | "holidays" | "audit" | "payroll" | "analytics" | "ai";

type UiState = {
  activeSection: string;
  activeTool: ToolId | null;
  mobileSidebarOpen: boolean;
  setActiveSection: (section: string) => void;
  setActiveTool: (tool: ToolId | null) => void;
  toggleMobileSidebar: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  activeSection: "Dashboard",
  activeTool: null,
  mobileSidebarOpen: false,
  setActiveSection: (activeSection) => set({ activeSection }),
  setActiveTool: (activeTool) => set({ activeTool }),
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
}));
