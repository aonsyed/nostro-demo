import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { initialState, initialCardTransfers, type DemoState } from "./banking";
import { MotionConfig } from "motion/react";

const STORAGE = "nostro-local-v2";
type DemoContextType = {
  state: DemoState;
  run: (change: (s: DemoState) => DemoState) => Promise<DemoState>;
  reset: () => void;
  notify: (text: string) => void;
  toast: string;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  motionEnabled: boolean;
  setMotionEnabled: (v: boolean) => void;
};
const Context = createContext<DemoContextType | null>(null);
function load(): DemoState {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE) || "null");
    if (
      saved?.version === 1 &&
      Array.isArray(saved.transfers) &&
      Array.isArray(saved.recipients) &&
      saved.account?.id === "demo-usd"
    )
      return saved.card
        ? saved
        : {
            ...saved,
            card: initialState().card,
            transfers: [...initialCardTransfers(), ...saved.transfers],
          };
  } catch {}
  return initialState();
}
export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(load),
    stateRef = useRef(state);
  const [toast, setToast] = useState("");
  const [theme, setThemeState] = useState<"light" | "dark">(() =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );
  const [motionEnabled, setMotionEnabled] = useState(
    () => localStorage.getItem("nostro-motion") !== "off",
  );
  const notify = useCallback((text: string) => setToast(text), []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  const commit = useCallback((next: DemoState) => {
    stateRef.current = next;
    setState(next);
    try {
      localStorage.setItem(STORAGE, JSON.stringify(next));
    } catch {
      setToast("Changes work in this tab, but browser storage is unavailable.");
    }
    return next;
  }, []);
  const run = useCallback(
    async (change: (s: DemoState) => DemoState) => {
      await new Promise((resolve) => setTimeout(resolve, 180));
      return commit(change(stateRef.current));
    },
    [commit],
  );
  const reset = useCallback(() => {
    commit(initialState());
    sessionStorage.removeItem("nostro-send-draft");
    notify("Workspace restored to its starting state.");
  }, [commit, notify]);
  const setTheme = useCallback((next: "light" | "dark") => {
    setThemeState(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("nostro-v2-theme", next);
    } catch {}
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = motionEnabled ? "on" : "off";
    try {
      localStorage.setItem("nostro-motion", motionEnabled ? "on" : "off");
    } catch {}
  }, [motionEnabled]);
  return (
    <Context.Provider
      value={{
        state,
        run,
        reset,
        notify,
        toast,
        theme,
        setTheme,
        motionEnabled,
        setMotionEnabled,
      }}
    >
      <MotionConfig reducedMotion={motionEnabled ? "user" : "always"}>
        {children}
      </MotionConfig>
    </Context.Provider>
  );
}
export function useDemo() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("Demo provider is required.");
  return ctx;
}
