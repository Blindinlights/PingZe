import React, { useState, useEffect } from 'react';
import { Cipai, validatePoem, PoemValidation } from '../logic/prosody-engine.ts';
import { CIPAI_LIST } from '../data/cipai-list.ts';

// 辅助函数：将逻辑类型转换为中文显示
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

  useEffect(() => {
    if (selectedCipai) {
      setValidation(validatePoem(input, selectedCipai));
    }
  }, [input, selectedCipai]);

  const handleCipaiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(e.target.value);
    setSelectedCipai(CIPAI_LIST[idx]);
  };

  // Calculate stats
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
              lineResult.slots.forEach(slot => {
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

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Top Bar: Paper-like card */}
      <div className="bg-paper shadow-sm border border-[#e5e7eb] p-5 rounded-sm flex items-center justify-between">
        <div className="flex items-center space-x-4">
            <label className="font-bold text-[#2b2b2b] tracking-wider text-lg">词牌</label>
            <div className="relative">
                <select 
                className="appearance-none bg-transparent border-b-2 border-[#d6a45e] pr-8 py-1 font-serif text-lg focus:outline-none focus:border-[#c04851] cursor-pointer"
                onChange={handleCipaiChange}
                >
                {CIPAI_LIST.map((c, i) => (
                    <option key={c.name} value={i}>{c.name}</option>
                ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#d6a45e]">
                    ▼
                </div>
            </div>
        </div>

        <div className="text-sm flex items-center space-x-4 opacity-80">
          {validation && Object.entries(validation.rhymeGroups).map(([id, group]) => (
            <span key={id} className="flex items-center space-x-1">
                <span className={`w-2 h-2 rotate-45 ${parseInt(id) % 2 === 0 ? 'bg-[#4e7ca1]' : 'bg-[#c04851]'}`}></span>
                <span className="font-mono text-[#2b2b2b]">
                    {parseInt(id) === 0 ? '主韵' : `韵部${id}`}: {group || '未定'}
                </span>
            </span>
          ))}
          {(!validation || Object.keys(validation.rhymeGroups).length === 0) && <span className="text-gray-400 italic">暂无韵部信息</span>}
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-8">
        {/* Input Pane: Vertical layout, elegant textarea */}
        <div className="md:w-1/3 flex flex-col bg-paper p-1 shadow-sm border border-[#e5e7eb] rounded-sm relative">
             <div className="absolute top-0 left-4 w-[1px] h-full bg-[#e5e7eb] z-0 pointer-events-none"></div>
             <div className="absolute top-0 right-4 w-[1px] h-full bg-[#e5e7eb] z-0 pointer-events-none"></div>
             
             <textarea
                className="flex-1 w-full bg-transparent p-6 resize-none font-serif text-xl leading-loose focus:outline-none z-10 text-[#2b2b2b] placeholder-gray-300"
                style={{ writingMode: 'horizontal-tb', minHeight: '500px' }} // Use style for min-height to allow growth
                placeholder="请输入诗词内容..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
             />
        </div>

        {/* Visualizer Pane: Clean grid */}
        <div className="md:w-2/3 bg-white p-8 rounded-sm shadow-sm border border-[#e5e7eb] relative">
          
          <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-2">
            <h2 className="text-xl font-bold tracking-widest text-[#2b2b2b]">格律校验</h2>
            <div className="text-sm">
                {!hasInput ? (
                    <span className="text-gray-300">待检测</span>
                ) : totalIssues > 0 ? (
                    <span className="text-[#c04851]">
                        共发现 {totalIssues} 处问题：
                        {toneErrors > 0 && ` 平仄${toneErrors}`} 
                        {rhymeErrors > 0 && ` 韵脚${rhymeErrors}`}
                        {overflowCount > 0 && ` 多字${overflowCount}`}
                        {missingCount > 0 && ` 缺字${missingCount}`}
                    </span>
                ) : (
                    <span className="text-[#7f8c5b] flex items-center">
                        <span className="mr-1">◈</span> 格律完美
                    </span>
                )}
            </div>
          </div>
          
          {/* Legend - Minimalist */}
          <div className="flex flex-wrap gap-6 mb-8 text-xs text-gray-500 justify-center">
             <div className="flex items-center"><div className="w-3 h-3 border border-[#7f8c5b] bg-[#f4f6f0] mr-2"></div> 平</div>
             <div className="flex items-center"><div className="w-3 h-3 border border-[#4e7ca1] bg-[#f0f4f8] mr-2"></div> 仄</div>
             <div className="flex items-center"><div className="w-3 h-3 bg-[#c04851] mr-2"></div> 韵误</div>
             <div className="flex items-center">
                <span className="text-[#c04851] text-[10px]">▲</span>
                <span className="text-[#4e7ca1] text-[10px] mr-1">▲</span>
                韵位
             </div>
          </div>
          
          <div className="space-y-8 pl-4">
            {selectedCipai.lines.map((lineSchema, lineIdx) => {
              const lineResult = validation?.lines[lineIdx];
              const slots = lineResult?.slots || [];
              const overflow = lineResult?.overflow || '';

              return (
                <div key={lineIdx} className="flex flex-wrap items-center gap-x-3 gap-y-4">
                  {/* Render Slots */}
                  {lineSchema.pattern.map((slotSchema, slotIdx) => {
                    const slotResult = slots[slotIdx];
                    
                    // Visual State Logic
                    let baseClasses = "w-10 h-10 flex items-center justify-center text-xl cursor-help relative group transition-all duration-200";
                    let borderClass = "border-b border-gray-200"; // Default underline style
                    let textClass = "text-gray-300"; // Default empty color
                    let bgClass = "";
                    let content = "○";
                    let tooltip = `要求：${translateTone(slotSchema.tone)}`;

                    if (slotResult) {
                      content = slotResult.char;
                      textClass = "text-[#2b2b2b]";
                      
                      if (slotResult.isPolyphonic) {
                          tooltip += " | 多音字";
                      }

                      if (slotResult.isToneError) {
                         // Tone Error: Blue hint
                         borderClass = "border border-[#4e7ca1] rounded-sm";
                         bgClass = "bg-[#f0f4f8]";
                         textClass = "text-[#4e7ca1] font-bold";
                         tooltip += ` | 实测：${translateTone(slotResult.actualTone)}`;
                      } else if (slotResult.isRhymeError) {
                         // Rhyme Error: Red fill
                         borderClass = "border border-[#c04851] rounded-sm";
                         bgClass = "bg-[#c04851]";
                         textClass = "text-white";
                         tooltip += ` | 韵脚错误 (韵部 ${slotResult.rhymeGroup})`;
                      } else {
                         // Correct: Simple clean look, maybe green underline check
                         // borderClass = "border-b-2 border-[#7f8c5b]";
                         borderClass = "border border-[#7f8c5b] rounded-sm";
                         bgClass = "bg-[#f4f6f0]";
                         textClass = "text-[#3f4a28]";
                         tooltip += " | 平仄正确";
                      }
                      
                      // Rhyme indicator logic moved to triangle below
                    }

                    return (
                      <div 
                        key={slotIdx}
                        className={`${baseClasses} ${borderClass} ${bgClass} ${textClass}`}
                        title={tooltip}
                      >
                        {content}
                        
                        {/* Polyphonic Dot */}
                        {slotResult?.isPolyphonic && (
                            <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-gray-400 opacity-50"></div>
                        )}

                        {/* Rhyme Triangle Indicator */}
                        {slotSchema.isRhyme && (
                            <div 
                              className={`absolute -bottom-1.5 -right-1.5 text-[10px] transform rotate-0 ${
                                (slotSchema.rhymeId || 0) % 2 === 0 ? 'text-[#4e7ca1]' : 'text-[#c04851]'
                              }`} 
                              title={`韵脚位 (ID: ${slotSchema.rhymeId || 0})`}
                            >
                                ▲
                            </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Overflow Text */}
                  {overflow && (
                    <div className="text-[#c04851] text-sm font-mono opacity-80" title="超出字数">
                       {overflow.split('').map((c, i) => (
                           <span key={i} className="line-through mx-0.5">{c}</span>
                       ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}