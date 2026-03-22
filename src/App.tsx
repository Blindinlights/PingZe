import { useEffect, useState } from "react";
import PoetryLinter from "./components/PoetryLinter.tsx";
import SchemaBuilder from "./components/SchemaBuilder.tsx";

type AppTab = "linter" | "builder";
type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "poem-theme-mode";

const tabs: { id: AppTab; label: string }[] = [
  {
    id: "linter",
    label: "格律检测",
  },
  {
    id: "builder",
    label: "制谱工具",
  },
];

function getPreferredTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("linter");
  const [themeMode, setThemeMode] = useState<ThemeMode>(getPreferredTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    document.documentElement.style.colorScheme = themeMode;
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode]);

  return (
    <div className="min-h-screen overflow-x-hidden text-[var(--text-primary)]">
      <div className="ambient-field" aria-hidden="true"></div>

      <div className="relative z-10">
        <header className="px-4 pb-10 pt-6 md:px-8 lg:px-10">
          <div className="mx-auto flex max-w-7xl flex-col gap-10">
            <div className="flex justify-end text-[11px] tracking-[0.28em] text-[var(--text-muted)]">
              <div className="flex items-center gap-3 md:gap-4">
                <button
                  aria-label={`切换到${
                    themeMode === "light" ? "暗色" : "浅色"
                  }主题`}
                  className="theme-toggle"
                  onClick={() =>
                    setThemeMode((current) =>
                      current === "light" ? "dark" : "light"
                    )}
                  type="button"
                >
                  <span className="theme-toggle__track">
                    <span className="theme-toggle__thumb">
                      {themeMode === "light" ? "日" : "夜"}
                    </span>
                  </span>
                  <span className="theme-toggle__label">
                    {themeMode === "light" ? "纸面" : "夜读"}
                  </span>
                </button>
              </div>
            </div>

            <div className="max-w-4xl">
              <div>
                <p className="reveal-up text-sm tracking-[0.3em] text-[var(--accent-soft)]">
                  诗词校验与制谱
                </p>
                <h1 className="hero-title reveal-up-delay-1 mt-4">
                  诗词格律
                </h1>

                <nav className="reveal-up-delay-3 mt-8 flex flex-wrap gap-3">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`tab-button ${
                        activeTab === tab.id ? "is-active" : ""
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                      type="button"
                    >
                      <span className="text-left">
                        <span className="block text-base font-semibold tracking-[0.18em]">
                          {tab.label}
                        </span>
                      </span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 pb-16 md:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl animate-fade-in">
            {activeTab === "linter" ? <PoetryLinter /> : <SchemaBuilder />}
          </div>
        </main>

        <footer className="px-4 pb-8 md:px-8 lg:px-10">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-[var(--line-soft)] pt-6 text-sm text-[var(--text-muted)] md:flex-row md:items-center md:justify-between">
            <p>诗词格律工作台</p>
            <p>© {new Date().getFullYear()} 校验、制谱与结构化整理</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
