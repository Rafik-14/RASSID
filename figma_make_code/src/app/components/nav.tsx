import { createContext, ReactNode, useContext, useState, useCallback } from "react";

export type Screen =
  | "dashboard"
  | "stores"
  | "storeProfile"
  | "history"
  | "newOperation"
  | "newStore"
  | "overdueAlerts"
  | "deliveries"
  | "payments";

type NavState = {
  screen: Screen;
  storeId?: string;
  opType?: "liv" | "pay" | "ret" | "avo";
};

type NavCtx = {
  state: NavState;
  stack: NavState[];
  go: (s: Screen, params?: Partial<NavState>) => void;
  back: () => void;
  setTab: (s: Screen) => void;
};

const Ctx = createContext<NavCtx | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<NavState[]>([{ screen: "dashboard" }]);

  const go = useCallback((s: Screen, params?: Partial<NavState>) => {
    setStack((prev) => [...prev, { screen: s, ...params }]);
  }, []);

  const back = useCallback(() => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const setTab = useCallback((s: Screen) => {
    setStack([{ screen: s }]);
  }, []);

  return (
    <Ctx.Provider value={{ state: stack[stack.length - 1], stack, go, back, setTab }}>
      {children}
    </Ctx.Provider>
  );
}

export function useNav() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("NavProvider missing");
  return ctx;
}
