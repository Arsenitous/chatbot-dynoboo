"use client";

import { createContext, useContext } from "react";

type HasAccessFn = (moduleName: string, action?: string) => boolean;

// Default to false so if a component is used outside Provider, it safely blocks access
export const AccessContext = createContext<HasAccessFn>(() => false);

export const useAccess = () => useContext(AccessContext);
