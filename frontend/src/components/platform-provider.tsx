"use client";

/**
 * 平台 Context Provider
 * 管理当前选中平台，所有子组件通过 usePlatform() 获取
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { PlatformType } from "@/types/platform";

interface PlatformContextValue {
  platform: PlatformType;
  setPlatform: (p: PlatformType) => void;
}

const PlatformContext = createContext<PlatformContextValue>({
  platform: "shopee",
  setPlatform: () => {},
});

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [platform, setPlatform] = useState<PlatformType>("shopee");

  const handleSetPlatform = useCallback((p: PlatformType) => {
    setPlatform(p);
  }, []);

  return (
    <PlatformContext.Provider value={{ platform, setPlatform: handleSetPlatform }}>
      {children}
    </PlatformContext.Provider>
  );
}

/** 获取当前平台 Hook */
export function usePlatform() {
  return useContext(PlatformContext);
}
