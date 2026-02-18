import React, { useState } from 'react';
import PoetryLinter from './components/PoetryLinter.tsx';
import SchemaBuilder from './components/SchemaBuilder.tsx';

function App() {
  const [activeTab, setActiveTab] = useState<'linter' | 'builder'>('linter');

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 font-serif text-[#2b2b2b]">
      {/* Header - Minimalist */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-[0.2em] mb-4 text-[#2b2b2b] opacity-90" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.05)' }}>
          诗词格律
        </h1>
        <nav className="inline-flex border-b border-[#d1d5db] space-x-8 pb-1">
            <button 
                className={`text-lg tracking-widest pb-1 transition-colors ${
                    activeTab === 'linter' 
                    ? 'border-b-2 border-[#c04851] text-[#c04851]' 
                    : 'text-gray-500 hover:text-[#2b2b2b]'
                }`}
                onClick={() => setActiveTab('linter')}
            >
                检测
            </button>
            <button 
                className={`text-lg tracking-widest pb-1 transition-colors ${
                    activeTab === 'builder' 
                    ? 'border-b-2 border-[#c04851] text-[#c04851]' 
                    : 'text-gray-500 hover:text-[#2b2b2b]'
                }`}
                onClick={() => setActiveTab('builder')}
            >
                制谱
            </button>
        </nav>
      </header>

      <main className="w-full max-w-5xl flex-1">
        {activeTab === 'linter' ? <PoetryLinter /> : <SchemaBuilder />}
      </main>
      
      <footer className="mt-12 text-center text-gray-400 text-xs tracking-widest">
        &copy; {new Date().getFullYear()} 诗词格律检测工具
      </footer>
    </div>
  );
}

export default App;