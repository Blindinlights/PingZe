import React, { useState } from 'react';
import { Cipai, LineSchema, ToneType } from '../logic/prosody-engine.ts';

export default function SchemaBuilder() {
  const [title, setTitle] = useState('');
  const [patternInput, setPatternInput] = useState('');
  const [generatedSchema, setGeneratedSchema] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const parsePattern = () => {
    setError(null);
    const normalizedInput = patternInput.replace(/[，。；：！？,.;:!?\n]/g, '\n');
    const linesStr = normalizedInput.split('\n').filter((l: string) => l.trim() !== '');
    const cipaiLines: LineSchema[] = [];
    
    let currentRhymeId = 1;
    let lastRhymeTone: ToneType | null = null;

    try {
        linesStr.forEach((lineStr: string, lineIdx: number) => {
            const pattern: { tone: ToneType, isRhyme: boolean, rhymeId?: number }[] = [];
            const chars = lineStr.trim().split('');
            
            for (let i = 0; i < chars.length; i++) {
                const char = chars[i];
                let tone: ToneType | null = null;
                
                if (char === '平') tone = 'Ping';
                else if (char === '仄') tone = 'Ze';
                else if (char === '通' || char === '中') tone = 'Zhong';
                
                if (tone) {
                    let isRhyme = false;
                    let rId = undefined;

                    if (chars[i+1] === '[' && chars[i+2] === '韵' && chars[i+3] === ']') {
                        isRhyme = true;
                        i += 3;
                        
                        if (tone !== 'Zhong') {
                             if (lastRhymeTone !== null && lastRhymeTone !== tone) {
                                 currentRhymeId++;
                             }
                             lastRhymeTone = tone;
                        }
                        rId = currentRhymeId;
                    }
                    
                    pattern.push({ tone, isRhyme, rhymeId: rId });
                }
            }
            
            if (pattern.length > 0) {
                cipaiLines.push({ pattern });
            }
        });

        if (cipaiLines.length === 0) {
            setError('未检测到有效的格律定义，请输入如"平平仄仄平"的内容。');
            return;
        }

        const schema: Cipai = {
            name: title || "自定义词牌",
            lines: cipaiLines
        };

        setGeneratedSchema(JSON.stringify(schema, null, 2));

    } catch (err) {
        setError("解析出错，请检查格式是否正确。");
        console.error(err);
    }
  };

  return (
    <div className="flex flex-col min-h-[650px] space-y-8 p-8 bg-[#faf9f6] rounded-sm shadow-lg border border-[#e8e4dc] relative overflow-hidden">
      {/* 顶部装饰条 */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#5d4037] via-[#d6a45e] to-[#5d4037]"></div>
      
      {/* 标题区 */}
      <div className="flex items-center space-x-4 pb-6 border-b border-[#d6a45e]/20">
        <div className="w-14 h-14 rounded-sm bg-gradient-to-br from-[#5d4037] to-[#4a332a] flex items-center justify-center shadow-md">
          <span className="text-white text-2xl font-bold">谱</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-[0.2em] text-[#1a1a1a]">词牌规则定义器</h2>
          <p className="text-[#2b2b2b]/60 text-sm mt-1 tracking-wider">自定义词牌格律 · 生成规则数据</p>
        </div>
      </div>

      {/* 说明区域 */}
      <div className="bg-gradient-to-r from-[#f5f3f0] to-[#f0ede6] p-5 rounded-sm border border-[#d6a45e]/30">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-[#d6a45e] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-[#1a1a1a] font-medium mb-3 tracking-wider">请使用以下格式定义格律：</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-sm border border-[#7f8c5b]/30">
                <span className="w-6 h-6 rounded-sm border-2 border-[#7f8c5b] bg-gradient-to-br from-[#f4f6f0] to-[#e8ebe0] flex items-center justify-center text-xs text-[#7f8c5b] font-bold">平</span>
                <span className="text-sm text-[#2b2b2b]">平声</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-sm border border-[#6b5b95]/30">
                <span className="w-6 h-6 rounded-sm border-2 border-[#6b5b95] bg-gradient-to-br from-[#f5f3f9] to-[#ebe7f3] flex items-center justify-center text-xs text-[#6b5b95] font-bold">仄</span>
                <span className="text-sm text-[#2b2b2b]">仄声</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-sm border border-[#d6a45e]/30">
                <span className="w-6 h-6 rounded-sm border-2 border-[#d6a45e] bg-gradient-to-br from-[#faf9f6] to-[#f5f3f0] flex items-center justify-center text-xs text-[#d6a45e] font-bold">通</span>
                <span className="text-sm text-[#2b2b2b]">可平可仄</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-sm border border-[#c04851]/30">
                <span className="text-xs text-[#c04851] font-bold">[韵]</span>
                <span className="text-sm text-[#2b2b2b]">标记韵脚</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 表单区域 */}
      <div className="flex flex-col space-y-6 flex-1">
        <div className="flex flex-col space-y-3">
          <label className="font-semibold text-[#1a1a1a] tracking-wider flex items-center space-x-2">
            <svg className="w-5 h-5 text-[#d6a45e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            <span>词牌名称</span>
          </label>
          <input 
            type="text" 
            className="bg-white border-2 border-[#e5e7eb] rounded-sm px-5 py-3.5 font-serif text-lg focus:outline-none focus:border-[#d6a45e] focus:ring-4 focus:ring-[#d6a45e]/20 transition-all duration-300 text-[#1a1a1a] placeholder-[#2b2b2b]/40"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="例如：长相思、浣溪沙、菩萨蛮"
          />
        </div>

        <div className="flex flex-col space-y-3 flex-1">
          <label className="font-semibold text-[#1a1a1a] tracking-wider flex items-center space-x-2">
            <svg className="w-5 h-5 text-[#7f8c5b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>格律定义</span>
          </label>
          <textarea 
            className="flex-1 min-h-[320px] bg-white border-2 border-[#e5e7eb] rounded-sm p-6 font-serif text-xl leading-relaxed resize-y focus:outline-none focus:border-[#7f8c5b] focus:ring-4 focus:ring-[#7f8c5b]/20 transition-all duration-300 text-[#1a1a1a] placeholder-[#2b2b2b]/40"
            value={patternInput}
            onChange={e => setPatternInput(e.target.value)}
            placeholder={`请输入格律格式，例如：\n\n平平仄仄平平仄 [韵]\n通仄平平仄 [韵]\n通仄平平平仄仄\n仄平平仄仄平平 [韵]`}
          />
          {error && (
            <div className="flex items-center space-x-2 text-[#c04851] bg-gradient-to-r from-[#fef5f6] to-[#fdf0f2] px-4 py-3 rounded-sm border border-[#c04851]/30 animate-fade-in">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        <div className="py-4">
          <button 
            className="group relative inline-flex items-center justify-center space-x-3 bg-gradient-to-r from-[#5d4037] to-[#4a332a] text-white font-semibold py-4 px-10 rounded-sm hover:from-[#6d5047] hover:to-[#5a433a] transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#5d4037]/40 overflow-hidden"
            onClick={parsePattern}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="tracking-[0.15em] text-lg">生成规则数据</span>
          </button>
        </div>
      </div>

      {/* 生成结果 */}
      {generatedSchema && (
        <div className="mt-6 pt-8 border-t-2 border-[#d6a45e]/30 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <label className="font-semibold text-[#1a1a1a] tracking-wider flex items-center space-x-2">
                <svg className="w-5 h-5 text-[#4e7ca1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>生成的规则数据</span>
              </label>
              <span className="text-xs text-[#2b2b2b]/50 flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <span>点击下方框内内容可手动修改</span>
              </span>
            </div>
            <textarea 
                className="w-full min-h-[220px] bg-gradient-to-br from-[#faf9f6] to-[#f5f3f0] border-2 border-[#d6a45e]/40 rounded-sm p-5 font-mono text-sm text-[#1a1a1a] focus:outline-none focus:border-[#d6a45e] focus:ring-4 focus:ring-[#d6a45e]/20 transition-all duration-300 resize-y"
                readOnly
                value={generatedSchema}
            />
            <div className="mt-4 flex items-center space-x-2 text-sm text-[#2b2b2b]/60 bg-[#f5f3f0] px-4 py-3 rounded-sm border border-[#d6a45e]/20">
              <svg className="w-5 h-5 text-[#d6a45e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>请将此内容保存至系统配置中以在检测器中使用</span>
            </div>
        </div>
      )}
      
      {/* 底部装饰角纹 */}
      <div className="absolute bottom-0 right-0 w-24 h-24 pointer-events-none opacity-[0.04]">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M0 100 L30 100 L30 70 L50 70 L50 50 L70 50 L70 30 L100 30 L100 0" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-[#1a1a1a]"/>
        </svg>
      </div>
    </div>
  );
}
