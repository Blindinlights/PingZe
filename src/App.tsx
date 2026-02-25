import { useState } from "react";
import PoetryLinter from "./components/PoetryLinter.tsx";
import SchemaBuilder from "./components/SchemaBuilder.tsx";

function App() {
  const [activeTab, setActiveTab] = useState<"linter" | "builder">("linter");

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 font-serif text-[#1a1a1a] relative overflow-x-hidden">
      {/* 背景装饰 - 山水意境 */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-[#7f8c5b] to-transparent rounded-full blur-3xl">
        </div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-t from-[#4e7ca1] to-transparent rounded-full blur-3xl">
        </div>
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-gradient-to-b from-[#d6a45e] to-transparent rounded-full blur-2xl">
        </div>
      </div>

      {/* 顶部装饰线 */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d6a45e] to-transparent opacity-60">
      </div>

      <header className="mb-12 text-center relative z-10">
        {/* 印章装饰 */}
        <div className="absolute -top-4 right-0 md:right-20 w-16 h-16 border-2 border-[#c04851]/30 rounded-sm flex items-center justify-center transform rotate-6 opacity-40">
          <span className="text-[#c04851] text-xs font-bold tracking-[0.5em] writing-vertical">
            格律
          </span>
        </div>

        {/* 主标题 */}
        <div className="relative inline-block">
          <div className="absolute -inset-8 bg-gradient-to-r from-[#d6a45e]/10 via-[#c04851]/5 to-[#d6a45e]/10 rounded-full blur-xl">
          </div>
          <h1
            className="text-6xl md:text-7xl font-black tracking-[0.5em] text-[#1a1a1a] relative"
            style={{ textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
          >
            诗词格律
          </h1>
          {/* 标题下装饰 */}
          <div className="flex items-center justify-center space-x-4 mt-6">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#d6a45e]">
            </div>
            <div className="w-2 h-2 rotate-45 bg-[#d6a45e]"></div>
            <div className="w-32 h-px bg-gradient-to-r from-[#d6a45e] via-[#c04851] to-[#d6a45e]">
            </div>
            <div className="w-2 h-2 rotate-45 bg-[#d6a45e]"></div>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#d6a45e]">
            </div>
          </div>
        </div>

        {/* 副标题 */}
        <p className="mt-6 text-lg text-[#2b2b2b]/70 tracking-[0.3em] font-light">
          传承千年文脉 · 品味诗词之美
        </p>

        {/* 导航标签 */}
        <nav className="mt-10 inline-flex items-center space-x-2 p-1.5 bg-[#f0ede6]/80 backdrop-blur-sm rounded-sm border border-[#d6a45e]/30 shadow-md">
          <button
            className={`px-10 py-3 text-base tracking-[0.2em] transition-all duration-300 ease-out relative group ${
              activeTab === "linter"
                ? "text-[#1a1a1a] font-semibold"
                : "text-[#2b2b2b]/60 hover:text-[#1a1a1a]"
            }`}
            onClick={() => setActiveTab("linter")}
            type="button"
          >
            {activeTab === "linter" && (
              <>
                <span className="absolute inset-0 bg-gradient-to-b from-[#d6a45e]/20 to-transparent rounded-sm animate-scale-in">
                </span>
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-[#c04851] to-transparent animate-fade-in">
                </span>
              </>
            )}
            <span className="relative z-10 group-hover:scale-105 transition-transform duration-300">
              格律检测
            </span>
          </button>

          <div className="w-px h-6 bg-[#d6a45e]/30"></div>

          <button
            className={`px-10 py-3 text-base tracking-[0.2em] transition-all duration-300 ease-out relative group ${
              activeTab === "builder"
                ? "text-[#1a1a1a] font-semibold"
                : "text-[#2b2b2b]/60 hover:text-[#1a1a1a]"
            }`}
            onClick={() => setActiveTab("builder")}
            type="button"
          >
            {activeTab === "builder" && (
              <>
                <span className="absolute inset-0 bg-gradient-to-b from-[#d6a45e]/20 to-transparent rounded-sm animate-scale-in">
                </span>
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-[#c04851] to-transparent animate-fade-in">
                </span>
              </>
            )}
            <span className="relative z-10 group-hover:scale-105 transition-transform duration-300">
              制谱工具
            </span>
          </button>
        </nav>
      </header>

      <main className="w-full max-w-7xl flex-1 relative z-10">
        <div className="animate-fade-in">
          {activeTab === "linter" ? <PoetryLinter /> : <SchemaBuilder />}
        </div>
      </main>

      {/* 页脚 */}
      <footer className="mt-16 text-center relative z-10">
        <div className="flex items-center justify-center space-x-6 text-[#2b2b2b]/40 text-xs tracking-[0.25em]">
          <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#d6a45e]/50">
          </div>
          <span className="font-light">
            © {new Date().getFullYear()} 诗词格律检测工具
          </span>
          <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#d6a45e]/50">
          </div>
        </div>
        <div className="mt-3 text-[#2b2b2b]/30 text-[10px] tracking-[0.3em] font-light">
          以科技传承文化 · 用代码诠释诗意
        </div>
      </footer>

      {/* 底部装饰角纹 */}
      <div className="fixed bottom-0 left-0 w-32 h-32 pointer-events-none opacity-[0.04]">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d="M0 100 L30 100 L30 70 L50 70 L50 50 L70 50 L70 30 L100 30 L100 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-[#1a1a1a]"
          />
        </svg>
      </div>
      <div className="fixed bottom-0 right-0 w-32 h-32 pointer-events-none opacity-[0.04] transform scale-x-[-1]">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d="M0 100 L30 100 L30 70 L50 70 L50 50 L70 50 L70 30 L100 30 L100 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-[#1a1a1a]"
          />
        </svg>
      </div>
    </div>
  );
}

export default App;
