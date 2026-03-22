import { useEffect, useState } from "react";
import PoetryLinter from "./components/PoetryLinter.tsx";
import SchemaBuilder from "./components/SchemaBuilder.tsx";
import { CIPAI_LIST } from "./data/cipai-list.ts";

type AppTab = "linter" | "builder";
type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "poem-theme-mode";

const tabs: { id: AppTab; label: string; detail: string }[] = [
  {
    id: "linter",
    label: "格律检测",
    detail: "逐句核验平仄、韵脚与字数",
  },
  {
    id: "builder",
    label: "制谱工具",
    detail: "把平仄格式整理成规则 JSON",
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
            <div className="flex items-center justify-between text-[11px] tracking-[0.28em] text-[var(--text-muted)]">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-[var(--line-strong)]"></span>
                <span>词律工作台</span>
              </div>
              <div className="flex items-center gap-3 md:gap-4">
                <span className="hidden md:inline">
                  平仄 · 韵脚 · 词牌规则
                </span>
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

            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_320px] lg:items-end">
              <div className="max-w-4xl">
                <p className="reveal-up text-sm tracking-[0.3em] text-[var(--accent-soft)]">
                  诗词校验与制谱
                </p>
                <h1 className="hero-title reveal-up-delay-1 mt-4">
                  诗词格律
                </h1>
                <p className="reveal-up-delay-2 mt-6 max-w-2xl text-base leading-8 text-[var(--text-secondary)] md:text-lg">
                  用更安静的纸面视图核对词牌结构、平仄走势与押韵结果。
                  输入诗句即可实时检查，也可以把新词牌整理成系统规则。
                </p>

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
                        <span className="mt-1 block text-xs tracking-[0.12em] text-[var(--text-muted)]">
                          {tab.detail}
                        </span>
                      </span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="reveal-up-delay-2 flex flex-col gap-5 border-l border-[var(--line-soft)] pl-0 lg:pl-8">
                <div className="space-y-2">
                  <p className="text-xs tracking-[0.24em] text-[var(--text-muted)]">
                    当前收录
                  </p>
                  <p className="text-2xl text-[var(--text-primary)]">
                    {CIPAI_LIST.length}
                    <span className="ml-2 text-sm tracking-[0.18em] text-[var(--text-muted)]">
                      个预置词牌
                    </span>
                  </p>
                </div>

                <div className="space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
                  <p>实时推断韵部，逐字标出平仄、押韵和缺漏位置。</p>
                  <p>规则编辑器可直接把手写格律转换为 JSON 数据。</p>
                </div>

                <div className="space-y-2 text-sm leading-7 text-[var(--text-muted)]">
                  <p>支持实时校验与换韵判断。</p>
                  <p>适合录入、校对与规则整理。</p>
                </div>
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
