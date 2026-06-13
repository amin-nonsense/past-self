export type PastSelf = {
  places: string[];      // 好きな場所・よくいた場所
  things: string[];      // 好きなもの・ハマってたもの
  people: string[];      // 家族・友達・苦手な人
  habits: string[];      // 口癖・よくやってたこと
  emotions: string[];    // 嬉しかった・つらかった記憶
  selfImage: string[];   // 自分がどんな子だったか
};

export type MonthlyPresent = {
  fragments: string[];
  patterns: string[];
  feelings: string[];
};

export type HistoryEntry = {
  role: "user" | "assistant";
  content: string;
  timestamp: string; // ISO 8601
};

export type AppData = {
  pastSelf: PastSelf;
  presentSelf: Record<string, MonthlyPresent>;
  history: HistoryEntry[];
  letterCount: number;
};

const KEY = "past-self-data";

export function getYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function loadData(): AppData {
  if (typeof window === "undefined") return defaultData();
  const raw = localStorage.getItem(KEY);
  if (!raw) return defaultData();
  try {
    return JSON.parse(raw) as AppData;
  } catch {
    return defaultData();
  }
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function addFragment(data: AppData, fragment: string): AppData {
  const ym = getYearMonth();
  const month = data.presentSelf[ym] ?? { fragments: [], patterns: [], feelings: [] };
  return {
    ...data,
    presentSelf: {
      ...data.presentSelf,
      [ym]: {
        ...month,
        fragments: [...month.fragments, fragment],
      },
    },
  };
}

export function mergePastSelf(base: PastSelf, updates: Partial<PastSelf>): PastSelf {
  return {
    places: [...new Set([...base.places, ...(updates.places ?? [])])],
    things: [...new Set([...base.things, ...(updates.things ?? [])])],
    people: [...new Set([...base.people, ...(updates.people ?? [])])],
    habits: [...new Set([...base.habits, ...(updates.habits ?? [])])],
    emotions: [...new Set([...base.emotions, ...(updates.emotions ?? [])])],
    selfImage: [...new Set([...base.selfImage, ...(updates.selfImage ?? [])])],
  };
}

export function defaultPastSelf(): PastSelf {
  return { places: [], things: [], people: [], habits: [], emotions: [], selfImage: [] };
}

function defaultData(): AppData {
  return {
    pastSelf: defaultPastSelf(),
    presentSelf: {},
    history: [],
    letterCount: 0,
  };
}
