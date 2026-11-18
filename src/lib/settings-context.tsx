"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_SETTINGS, type PublicSettings } from "@/lib/settings-types";

const SettingsContext = createContext<PublicSettings>(DEFAULT_SETTINGS);

export function SettingsProvider({ value, children }: { value: PublicSettings; children: ReactNode }) {
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}
