import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  settings: "onevox.settings.v1",
  history: "onevox.history.v1",
  phrases: "onevox.phrases.v1",
};

export type FontScale = "normal" | "large" | "xlarge";

export type Settings = {
  voiceId: string;
  voiceName: string;
  fontScale: FontScale;
  autoInterpret: boolean; // auto-rewrite typed text before speaking
};

export type HistoryItem = {
  id: string;
  text: string;
  createdAt: number;
  source: "teclado" | "gravar" | "frases";
};

export type Phrase = {
  id: string;
  text: string;
  category: PhraseCategory;
};

export type PhraseCategory = "saude" | "necessidades" | "social" | "emergencia";

const DEFAULT_SETTINGS: Settings = {
  voiceId: "GMafEIaeEWpGsrYrVqCX", // Roberto Dias
  voiceName: "Roberto Dias",
  fontScale: "normal",
  autoInterpret: false,
};

export const DEFAULT_PHRASES: Phrase[] = [
  { id: "p1", text: "Sim, por favor.", category: "necessidades" },
  { id: "p2", text: "Não, obrigado.", category: "necessidades" },
  { id: "p3", text: "Estou com sede.", category: "necessidades" },
  { id: "p4", text: "Estou com fome.", category: "necessidades" },
  { id: "p5", text: "Preciso ir ao banheiro.", category: "necessidades" },
  { id: "p6", text: "Estou com dor.", category: "saude" },
  { id: "p7", text: "Preciso do meu remédio.", category: "saude" },
  { id: "p8", text: "Pode chamar o médico?", category: "saude" },
  { id: "p9", text: "Estou cansado, quero descansar.", category: "saude" },
  { id: "p10", text: "Olá, tudo bem?", category: "social" },
  { id: "p11", text: "Obrigado por estar aqui.", category: "social" },
  { id: "p12", text: "Eu te amo.", category: "social" },
  { id: "p13", text: "Pode repetir, por favor?", category: "social" },
  { id: "p14", text: "Preciso de ajuda agora!", category: "emergencia" },
  { id: "p15", text: "Chame uma ambulância!", category: "emergencia" },
  { id: "p16", text: "Estou me sentindo mal.", category: "emergencia" },
];

type StoreValue = {
  ready: boolean;
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  history: HistoryItem[];
  addHistory: (item: Omit<HistoryItem, "id" | "createdAt">) => void;
  clearHistory: () => void;
  phrases: Phrase[];
  addPhrase: (text: string, category: PhraseCategory) => void;
  removePhrase: (id: string) => void;
  fontSizeFor: (base: number) => number;
};

const StoreContext = createContext<StoreValue | null>(null);

const FONT_MULTIPLIER: Record<FontScale, number> = {
  normal: 1,
  large: 1.15,
  xlarge: 1.3,
};

export function OneVoxStoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [phrases, setPhrases] = useState<Phrase[]>(DEFAULT_PHRASES);

  // Load persisted state once.
  useEffect(() => {
    (async () => {
      try {
        const [s, h, p] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.settings),
          AsyncStorage.getItem(STORAGE_KEYS.history),
          AsyncStorage.getItem(STORAGE_KEYS.phrases),
        ]);
        if (s) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(s) });
        if (h) setHistory(JSON.parse(h));
        if (p) setPhrases(JSON.parse(p));
      } catch (e) {
        console.warn("[OneVoxStore] load failed", e);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const addHistory = useCallback((item: Omit<HistoryItem, "id" | "createdAt">) => {
    setHistory((prev) => {
      const next: HistoryItem[] = [
        { ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, createdAt: Date.now() },
        ...prev,
      ].slice(0, 100);
      AsyncStorage.setItem(STORAGE_KEYS.history, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    AsyncStorage.setItem(STORAGE_KEYS.history, JSON.stringify([])).catch(() => {});
  }, []);

  const addPhrase = useCallback((text: string, category: PhraseCategory) => {
    setPhrases((prev) => {
      const next: Phrase[] = [
        ...prev,
        { id: `p-${Date.now()}`, text: text.trim(), category },
      ];
      AsyncStorage.setItem(STORAGE_KEYS.phrases, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const removePhrase = useCallback((id: string) => {
    setPhrases((prev) => {
      const next = prev.filter((p) => p.id !== id);
      AsyncStorage.setItem(STORAGE_KEYS.phrases, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const fontSizeFor = useCallback(
    (base: number) => Math.round(base * FONT_MULTIPLIER[settings.fontScale]),
    [settings.fontScale],
  );

  const value = useMemo<StoreValue>(
    () => ({
      ready,
      settings,
      updateSettings,
      history,
      addHistory,
      clearHistory,
      phrases,
      addPhrase,
      removePhrase,
      fontSizeFor,
    }),
    [ready, settings, updateSettings, history, addHistory, clearHistory, phrases, addPhrase, removePhrase, fontSizeFor],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useOneVox(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useOneVox must be used within OneVoxStoreProvider");
  return ctx;
}
