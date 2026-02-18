import React, { useState } from 'react';
import PoetryLinter from './components/PoetryLinter.tsx';
import SchemaBuilder from './components/SchemaBuilder.tsx';

function App() {
  const [activeTab, setActiveTab] = useState<'linter' | 'builder'>('linter');

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 font-serif text-[#2b2b2b] bg-gradient-to-b from-[#f5f5f0] to-[#e8e8e3]">
      {/* Header - Enhanced with traditional aesthetics */}
      <header className="mb-8 text-center relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -mt-4 text-6xl opacity-5 pointer-events-none">❖</div>
        <h1 className="text-5xl font-bold tracking-[0.3em] mb-6 text-[#2b2b2b] relative" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.1)' }}>
          诗词格律
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#d6a45e] to-transparent mx-auto mb-4"></div>
        <nav className="inline-flex border-b-2 border-[#d1d5db] space-x-12 pb-1 relative">
            <button 
                className={`text-lg tracking-widest pb-2 transition-all duration-300 relative ${
                    activeTab === 'linter' 
                    ? 'text-[#c04851] font-bold' 
                    : 'text-gray-500 hover:text-[#2b2b2b]'
                }`}
                onClick={() => setActiveTab('linter')}
            >
                格律检测
                {activeTab === 'linter' && (
                    <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-[#c04851]"></span>
                )}
            </button>
            <button 
                className={`text-lg tracking-widest pb-2 transition-all duration-300 relative ${
                    activeTab === 'builder' 
                    ? 'text-[#c04851] font-bold' 
                    : 'text-gray-500 hover:text-[#2b2b2b]'
                }`}
                onClick={() => setActiveTab('builder')}
            >
                制谱工具
                {activeTab === 'builder' && (
                    <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-[#c04851]"></span>
                )}
            </button>
        </nav>
      </header>

      <main className="w-full max-w-6xl flex-1">
        {activeTab === 'linter' ? <PoetryLinter /> : <SchemaBuilder />}
      </main>
      
      <footer className="mt-12 text-center text-gray-400 text-xs tracking-widest flex items-center">
        <span className="w-8 h-px bg-gray-300 mr-3"></span>
        &copy; {new Date().getFullYear()} 诗词格律检测工具
        <span className="w-8 h-px bg-gray-300 ml-3"></span>
      </footer>
    </div>
  );
}

export default App;