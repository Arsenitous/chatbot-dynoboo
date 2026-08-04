import { useState, useMemo } from "react";

export type SortConfig = { key: string; direction: "asc" | "desc" } | null;

export function useSort<T>(items: T[], defaultConfig: SortConfig = null) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(defaultConfig);

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedItems = useMemo(() => {
    if (!sortConfig) return items;
    
    return [...items].sort((a, b) => {
      const { key, direction } = sortConfig;
      let valA: any = a[key as keyof T];
      let valB: any = b[key as keyof T];

      // Handling string comparisons case-insensitively
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      // Handling null/undefined
      if (valA === null || valA === undefined) valA = "";
      if (valB === null || valB === undefined) valB = "";

      if (valA < valB) return direction === "asc" ? -1 : 1;
      if (valA > valB) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [items, sortConfig]);

  return { sortedItems, handleSort, sortConfig };
}
