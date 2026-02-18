import React, { useState, useEffect, useRef } from 'react';
import { Cipai, validatePoem, PoemValidation } from '../logic/prosody-engine.ts';
import { CIPAI_LIST } from '../data/cipai-list.ts';

const translateTone = (tone: string) => {
  if (tone === 'Ping') return '平';
  if (tone === 'Ze') return '仄';
  if (tone === 'Zhong') return '中';
  return tone;
};

export default function PoetryLinter() {
  const [selectedCipai, setSelectedCipai] = useState<Cipai>(CIPAI_LIST[0]);
  const [input, setInput] = useState('');
  const [validation, setValidation] = useState<PoemValidation | null>(null);
  const [isCipaiOpen, setIsCipaiOpen] = useState(false);
  const cipaiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedCipai) {
      setValidation(validatePoem(input, selectedCipai));
    }
  }, [input, selectedCipai]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cipaiRef.current && !cipaiRef.current.contains(event.target as Node)) {
        setIsCipaiOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  let toneErrors = 0;
  let rhymeErrors = 0;
  let overflowCount = 0;
  let missingCount = 0;

  if (validation) {
      selectedCipai.lines.forEach((lineSchema, idx) => {
          const lineResult = validation.lines[idx];
          const requiredLength = lineSchema.pattern.length;
          
          if (lineResult) {
              if (lineResult.overflow) overflowCount += lineResult.overflow.length;
              const filledCount = lineResult.slots.length;
              if (filledCount < requiredLength) {
                  missingCount += (requiredLength - filledCount);
              }
              lineResult.slots.forEach((slot: any) => {
                  if (slot.isToneError) toneErrors++;
                  if (slot.isRhymeError) rhymeErrors++;
              });
          } else {
              missingCount += requiredLength;
          }
      });
  }
  
  const totalIssues = toneErrors + rhymeErrors + overflowCount + missingCount;
  const hasInput = input.trim().length > 0;
  const isPerfect = hasInput && totalIssues === 0;

  return (
    <div className="flex flex-col h-full space-y-8">
      {/* 顶部控制栏 - 卷轴风格 */}
      <div className="bg-paper shadow-lg rounded-sm relative overflow-hidden">
        {/* 卷轴装饰边 */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#d6a45e] via-[#c04851] to-[#d6a45e]"></div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#d6a45e]/50 to-transparent"></div>
        
        <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* 词牌选择器 */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#d6a45e] to-[#b8863a] flex items-center justify-center shadow-md">
                <span className="text-white text-lg font-bold">词</span>
              </div>
              <label className="font-semibold text-[#1a1a1a] tracking-[0.15em] text-lg">词牌</label>
            </div>
            
            <div className="relative" ref={cipaiRef}>
              <button 
                className="group flex items-center space-x-3 bg-gradient-to-r from-[#faf9f6] to-[#f5f3f0] border border-[#d6a45e]/60 px-8 py-3 rounded-sm hover:border-[#c04851] hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#c04851]/30 min-w-[200px]"
                onClick={() => setIsCipaiOpen(!isCipaiOpen)}
              >
                <span className="font-serif text-xl text-[#1a1a1a] tracking-[0.1em]">{selectedCipai.name}</span>
                <span className={`text-[#d6a45e] transition-transform duration-300 group-hover:text-[#c04851] ${isCipaiOpen ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              
              {isCipaiOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 max-h-96 overflow-y-auto bg-[#faf9f6] border border-[#d6a45e]/40 rounded-sm shadow-2xl z-50 animate-fade-in">
                  <div className="py-2">
                    {CIPAI_LIST.map((cipai, index) => (
                      <button
                        key={cipai.name}
                        className={`w-full text-left px-8 py-3.5 font-serif text-[#1a1a1a] hover:bg-gradient-to-r hover:from-[#f5f3f0] hover:to-[#f0ede6] transition-all duration-200 flex items-center justify-between group ${
                          selectedCipai.name === cipai.name 
                            ? 'bg-gradient-to-r from-[#f0ede6] to-[#ebe7e0] text-[#c04851] font-semibold border-l-4 border-[#c04851]' 
                            : 'border-l-4 border-transparent'
                        }`}
                        onClick={() => {
                          setSelectedCipai(cipai);
                          setIsCipaiOpen(false);
                        }}
                      >
                        <span className="tracking-wide text-lg">{cipai.name}</span>
                        {selectedCipai.name === cipai.name && (
                          <span className="text-[#c04851]">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 韵部信息 */}
          <div className="flex items-center flex-wrap gap-4">
            {validation && Object.entries(validation.rhymeGroups).map(([id, group]) => (
              <div key={id} className="flex items-center space-x-2 bg-[#f5f3f0] px-4 py-2 rounded-sm border border-[#d6a45e]/30">
                <span className={`w-2.5 h-2.5 rotate-45 shadow-sm ${
                  parseInt(id) % 2 === 0 
                    ? 'bg-gradient-to-br from-[#4e7ca1] to-[#3d6a8f]' 
                    : 'bg-gradient-to-br from-[#c04851] to-[#a83841]'
                }`}></span>
                <span className="font-serif text-[#1a1a1a] text-sm">
                  {parseInt(id) === 0 ? (
                    <span className="text-[#c04851] font-semibold">主韵</span>
                  ) : (
                    `韵部${id}`
                  )}: <span className="text-[#2b2b2b]">{group || '未定'}</span>
                </span>
              </div>
            ))}
            {(!validation || Object.keys(validation.rhymeGroups).length === 0) && (
              <span className="text-[#2b2b2b]/40 italic text-sm">请输入诗词以查看韵部</span>
            )}
          </div>
        </div>
      </div>

      {/* 主体内容区 */}
      <div className="flex-1 flex flex-col md:flex-row gap-8">
        {/* 输入区域 - 宣纸风格 */}
        <div className="md:w-1/3 flex flex-col relative">
          <div className="bg-[#faf9f6] shadow-lg rounded-sm overflow-hidden border border-[#e8e4dc] relative min-h-[600px]">
            {/* 竖线装饰 */}
            <div className="absolute top-0 left-8 w-px h-full bg-gradient-to-b from-[#d6a45e]/40 via-[#d6a45e]/20 to-[#d6a45e]/40"></div>
            <div className="absolute top-0 right-8 w-px h-full bg-gradient-to-b from-[#d6a45e]/40 via-[#d6a45e]/20 to-[#d6a45e]/40"></div>
            
            {/* 顶部印章装饰 */}
            <div className="absolute top-4 right-4 w-12 h-12 border-2 border-[#c04851]/20 rounded-sm flex items-center justify-center transform rotate-12 pointer-events-none">
              <span className="text-[#c04851]/40 text-[10px] font-bold tracking-widest">诗词</span>
            </div>
            
            <textarea
              className="w-full h-[600px] bg-transparent p-8 pt-6 resize-none font-serif text-2xl leading-loose focus:outline-none text-[#1a1a1a] placeholder-[#2b2b2b]/30"
              placeholder="请输入诗词内容&#10;&#10;在此挥毫泼墨&#10;书写千古佳句..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          {/* 底部装饰 */}
          <div className="mt-4 flex justify-center">
            <div className="flex items-center space-x-3 text-[#2b2b2b]/40 text-xs tracking-[0.2em]">
              <div className="w-8 h-px bg-gradient-to-r from-transparent to-[#d6a45e]/50"></div>
              <span>输入诗词内容进行格律检测</span>
              <div className="w-8 h-px bg-gradient-to-l from-transparent to-[#d6a45e]/50"></div>
            </div>
          </div>
        </div>

        {/* 校验结果区域 */}
        <div className="md:w-2/3 bg-[#faf9f6] shadow-lg rounded-sm border border-[#e8e4dc] relative overflow-hidden min-h-[600px]">
          {/* 顶部装饰条 */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7f8c5b] via-[#4e7ca1] to-[#7f8c5b]"></div>
          
          <div className="p-8 pt-6">
            {/* 标题和状态 */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8 pb-6 border-b border-[#d6a45e]/20">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-[#7f8c5b] to-[#6a7a4b] flex items-center justify-center shadow-md">
                  <span className="text-white text-xl font-bold">律</span>
                </div>
                <h2 className="text-2xl font-bold tracking-[0.2em] text-[#1a1a1a]">格律校验</h2>
              </div>
              
              <div className="text-base">
                {!hasInput ? (
                  <div className="flex items-center space-x-3 text-[#2b2b2b]/50 bg-[#f5f3f0] px-6 py-3 rounded-sm border border-[#d6a45e]/20">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="tracking-wider">待检测</span>
                  </div>
                ) : isPerfect ? (
                  <div className="flex items-center space-x-3 text-[#7f8c5b] bg-gradient-to-r from-[#f0f6eb] to-[#ebf2e3] px-6 py-3 rounded-sm border border-[#7f8c5b]/30 shadow-sm animate-fade-in">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold tracking-wider text-lg">格律完美</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4 text-[#c04851] bg-gradient-to-r from-[#fef5f6] to-[#fdf0f2] px-6 py-3 rounded-sm border border-[#c04851]/30 shadow-sm animate-fade-in">
                    <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-semibold tracking-wider text-lg">共发现 <strong className="text-xl">{totalIssues}</strong> 处问题</span>
                      {toneErrors > 0 && (
                        <span className="inline-flex items-center px-3 py-1 bg-[#4e7ca1]/10 rounded text-sm">
                          <span className="w-2.5 h-2.5 bg-[#4e7ca1] rounded-sm mr-2"></span>
                          平仄 {toneErrors}
                        </span>
                      )}
                      {rhymeErrors > 0 && (
                        <span className="inline-flex items-center px-3 py-1 bg-[#c04851]/10 rounded text-sm">
                          <span className="w-2.5 h-2.5 bg-[#c04851] rounded-sm mr-2"></span>
                          韵脚 {rhymeErrors}
                        </span>
                      )}
                      {overflowCount > 0 && (
                        <span className="inline-flex items-center px-3 py-1 bg-[#d6a45e]/10 rounded text-sm">
                          多字 {overflowCount}
                        </span>
                      )}
                      {missingCount > 0 && (
                        <span className="inline-flex items-center px-3 py-1 bg-[#2b2b2b]/10 rounded text-sm">
                          缺字 {missingCount}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* 图例 */}
            <div className="flex flex-wrap gap-6 mb-8 text-sm font-medium bg-gradient-to-r from-[#f5f5f0] to-[#f0ede6] p-5 rounded-sm border border-[#d6a45e]/20">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-sm border-2 border-[#7f8c5b] bg-gradient-to-br from-[#f4f6f0] to-[#e8ebe0] flex items-center justify-center text-sm text-[#3f4a28] font-bold shadow-sm">
                  平
                </div>
                <span className="text-[#1a1a1a] tracking-wider">平声</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-sm border-2 border-[#6b5b95] bg-gradient-to-br from-[#f5f3f9] to-[#ebe7f3] flex items-center justify-center text-sm text-[#6b5b95] font-bold shadow-sm">
                  仄
                </div>
                <span className="text-[#1a1a1a] tracking-wider">仄声</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-sm border-2 border-[#c04851] bg-gradient-to-br from-[#f9e3e5] to-[#f3d5d8] flex items-center justify-center text-sm text-[#c04851] font-bold shadow-sm">
                  误
                </div>
                <span className="text-[#1a1a1a] tracking-wider">平仄错误</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-[#c04851] to-[#a83841] flex items-center justify-center text-xs text-white font-bold shadow-sm">
                  错
                </div>
                <span className="text-[#1a1a1a] tracking-wider">韵脚错误</span>
              </div>
              <div className="flex items-center space-x-2 ml-auto">
                <span className="text-[#c04851] text-sm font-bold">▲</span>
                <span className="text-[#4e7ca1] text-sm font-bold">▲</span>
                <span className="text-[#1a1a1a] tracking-wider">韵脚位置</span>
              </div>
            </div>
            
            {/* 格律显示 */}
            <div className="space-y-5">
              {selectedCipai.lines.map((lineSchema: any, lineIdx: number) => {
                const lineResult = validation?.lines[lineIdx];
                const slots = lineResult?.slots || [];
                const overflow = lineResult?.overflow || '';

                return (
                  <div 
                    key={lineIdx} 
                    className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4 rounded-sm hover:bg-gradient-to-r hover:from-[#f5f3f0] hover:to-[#f0ede6] transition-all duration-300 group"
                  >
                    {/* 行号 */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-sm bg-gradient-to-br from-[#d6a45e]/20 to-[#d6a45e]/10 border border-[#d6a45e]/30 flex items-center justify-center">
                      <span className="text-[#d6a45e] font-bold text-sm tracking-wider">{String(lineIdx + 1).padStart(2, '0')}</span>
                    </div>
                    
                    {/* 字符格子 */}
                    {lineSchema.pattern.map((slotSchema: any, slotIdx: number) => {
                      const slotResult = slots[slotIdx];
                      
                      let baseClasses = "w-14 h-14 flex items-center justify-center text-2xl cursor-help relative group/slot font-bold transition-all duration-300 rounded-sm";
                      let borderClass = "border-2 border-[#e5e7eb]";
                      let textClass = "text-[#d1d5db]";
                      let bgClass = "bg-white";
                      let shadowClass = "";
                      let content = "○";
                      let tooltip = `第${lineIdx + 1}句 第${slotIdx + 1}字 | 要求：${translateTone(slotSchema.tone)}`;

                      if (slotSchema.tone === 'Ping') {
                        borderClass = "border-2 border-[#7f8c5b]";
                        bgClass = "bg-gradient-to-br from-[#f4f6f0] to-[#e8ebe0]";
                        textClass = "text-[#7f8c5b]";
                        shadowClass = "shadow-sm";
                      } else if (slotSchema.tone === 'Ze') {
                        borderClass = "border-2 border-[#6b5b95]";
                        bgClass = "bg-gradient-to-br from-[#f5f3f9] to-[#ebe7f3]";
                        textClass = "text-[#6b5b95]";
                        shadowClass = "shadow-sm";
                      }

                      if (slotResult) {
                        content = slotResult.char;
                        textClass = "text-[#1a1a1a]";
                        
                        if (slotResult.isPolyphonic) {
                            tooltip += " | 多音字";
                        }

                        if (slotResult.isToneError) {
                           borderClass = "border-2 border-[#c04851]";
                           bgClass = "bg-gradient-to-br from-[#f9e3e5] to-[#f3d5d8]";
                           textClass = "text-[#c04851]";
                           shadowClass = "shadow-md shadow-[#c04851]/20";
                           tooltip += ` | ❌ 实测：${translateTone(slotResult.actualTone)}`;
                        } else if (slotResult.isRhymeError) {
                           borderClass = "border-2 border-[#c04851]";
                           bgClass = "bg-gradient-to-br from-[#f9e3e5] to-[#f3d5d8]";
                           textClass = "text-[#c04851]";
                           shadowClass = "shadow-md shadow-[#c04851]/20";
                           tooltip += ` | ❌ 韵脚错误`;
                        } else {
                           if (slotSchema.tone === 'Ping') {
                             borderClass = "border-2 border-[#7f8c5b]";
                             bgClass = "bg-gradient-to-br from-[#f4f6f0] to-[#e8ebe0]";
                             textClass = "text-[#3f4a28]";
                           } else if (slotSchema.tone === 'Ze') {
                             borderClass = "border-2 border-[#6b5b95]";
                             bgClass = "bg-gradient-to-br from-[#f5f3f9] to-[#ebe7f3]";
                             textClass = "text-[#5a4a7a]";
                           } else {
                             borderClass = "border-2 border-[#7f8c5b]";
                             bgClass = "bg-gradient-to-br from-[#f4f6f0] to-[#e8ebe0]";
                             textClass = "text-[#3f4a28]";
                           }
                           tooltip += " | ✓ 正确";
                        }
                      }

                      return (
                        <div 
                          key={slotIdx}
                          className={`${baseClasses} ${borderClass} ${bgClass} ${textClass} ${shadowClass} hover:scale-110 hover:shadow-lg`}
                          title={tooltip}
                        >
                          {content}
                          
                          {slotResult?.isPolyphonic && (
                              <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gradient-to-br from-[#6b5b95] to-[#5a4a7a] opacity-70"></div>
                          )}

                          {slotSchema.isRhyme && (
                              <div 
                                className={`absolute -bottom-1.5 -right-1.5 text-sm font-bold transform transition-all duration-300 group-hover/slot:scale-125 ${
                                  (slotSchema.rhymeId || 0) % 2 === 0 
                                    ? 'text-[#4e7ca1] drop-shadow-sm' 
                                    : 'text-[#c04851] drop-shadow-sm'
                                }`} 
                                title={`韵脚位 (韵部：${slotSchema.rhymeId || 0})`}
                              >
                                  ▲
                              </div>
                          )}
                        </div>
                      );
                    })}

                    {overflow && (
                      <div className="inline-flex items-center text-[#c04851] font-semibold bg-gradient-to-r from-[#fef5f6] to-[#fdf0f2] px-4 py-2 rounded-sm border border-[#c04851]/30 shadow-sm" title="超出字数">
                         <span className="text-xs mr-2 font-bold">多</span>
                         {overflow.split('').map((c: string, i: number) => (
                             <span key={i} className="line-through mx-0.5">{c}</span>
                         ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* 底部装饰 */}
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#7f8c5b]/40 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}
