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
      <div className="bg-paper shadow-md border-l-4 border-[#d6a45e] p-5 rounded-sm flex items-center justify-between">
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
                style={{ writingMode: 'horizontal-tb', minHeight: '500px' }}
                placeholder="请输入诗词内容..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
             />
        </div>

        {/* Visualizer Pane: Enhanced visibility */}
        <div className="md:w-2/3 bg-white p-8 rounded-sm shadow-md border-l-4 border-[#7f8c5b] relative">
          
          <div className="flex justify-between items-end mb-8 border-b-2 border-gray-100 pb-3">
            <h2 className="text-2xl font-bold tracking-widest text-[#2b2b2b]">格律校验</h2>
            <div className="text-base font-medium">
                {!hasInput ? (
                    <span className="text-gray-400">待检测</span>
                ) : totalIssues > 0 ? (
                    <span className="text-[#c04851] bg-red-50 px-4 py-2 rounded-sm border border-red-200">
                        ⚠ 共发现 <strong className="text-lg">{totalIssues}</strong> 处问题
                        {toneErrors > 0 && <span className="ml-3 inline-flex items-center"><span className="w-3 h-3 bg-[#4e7ca1] mr-1"></span>平仄 {toneErrors}</span>} 
                        {rhymeErrors > 0 && <span className="ml-3 inline-flex items-center"><span className="w-3 h-3 bg-[#c04851] mr-1"></span>韵脚 {rhymeErrors}</span>}
                        {overflowCount > 0 && <span className="ml-3">多字 {overflowCount}</span>}
                        {missingCount > 0 && <span className="ml-3">缺字 {missingCount}</span>}
                    </span>
                ) : (
                    <span className="text-[#7f8c5b] bg-green-50 px-4 py-2 rounded-sm border border-green-200 flex items-center font-bold">
                        <span className="mr-2 text-lg">✓</span> 格律完美
                    </span>
                )}
            </div>
          </div>
          
          {/* Legend - Enhanced visibility */}
          <div className="flex flex-wrap gap-8 mb-8 text-sm font-medium bg-gray-50 p-4 rounded-sm border border-gray-200">
             <div className="flex items-center"><div className="w-4 h-4 border-2 border-[#7f8c5b] bg-[#f4f6f0] mr-2 flex items-center justify-center text-xs text-[#3f4a28]">平</div> 平声</div>
             <div className="flex items-center"><div className="w-4 h-4 border-2 border-[#6b5b95] bg-[#f5f3f9] mr-2 flex items-center justify-center text-xs text-[#6b5b95]">仄</div> 仄声</div>
             <div className="flex items-center"><div className="w-4 h-4 border-2 border-[#c04851] bg-[#f9e3e5] mr-2 flex items-center justify-center text-xs text-[#c04851]">误</div> 平仄错误</div>
             <div className="flex items-center"><div className="w-4 h-4 bg-[#c04851] mr-2 flex items-center justify-center text-xs text-white">错</div> 韵脚错误</div>
             <div className="flex items-center">
                <span className="text-[#c04851] text-xs font-bold mr-1">▲</span>
                <span className="text-[#6b5b95] text-xs font-bold mr-2">▲</span>
                韵脚位置
             </div>
          </div>
          
          <div className="space-y-6 pl-2">
            {selectedCipai.lines.map((lineSchema, lineIdx) => {
              const lineResult = validation?.lines[lineIdx];
              const slots = lineResult?.slots || [];
              const overflow = lineResult?.overflow || '';

              return (
                <div key={lineIdx} className="flex flex-wrap items-center gap-x-4 gap-y-3 p-3 rounded-sm hover:bg-gray-50 transition-colors">
                  <span className="text-gray-400 text-sm w-6 flex-shrink-0">{lineIdx + 1}</span>
                  
                  {/* Render Slots */}
                  {lineSchema.pattern.map((slotSchema, slotIdx) => {
                    const slotResult = slots[slotIdx];
                    
                    let baseClasses = "w-12 h-12 flex items-center justify-center text-2xl cursor-help relative group transition-all duration-200 font-bold";
                    let borderClass = "border-2 border-gray-200";
                    let textClass = "text-gray-300";
                    let bgClass = "bg-white";
                    let content = "○";
                    let tooltip = `第${lineIdx + 1}句 第${slotIdx + 1}字 | 要求：${translateTone(slotSchema.tone)}`;

                    // 根据格律要求设置背景色（即使没有填字也显示）
                    if (slotSchema.tone === 'Ping') {
                      borderClass = "border-2 border-[#7f8c5b]";
                      bgClass = "bg-[#f4f6f0]";
                      textClass = "text-[#7f8c5b]";
                    } else if (slotSchema.tone === 'Ze') {
                      borderClass = "border-2 border-[#6b5b95]";
                      bgClass = "bg-[#f5f3f9]";
                      textClass = "text-[#6b5b95]";
                    }
                    // 'Zhong' 保持灰色边框，无背景色

                    if (slotResult) {
                      content = slotResult.char;
                      textClass = "text-[#2b2b2b]";
                      
                      if (slotResult.isPolyphonic) {
                          tooltip += " | 多音字";
                      }

                      if (slotResult.isToneError) {
                         borderClass = "border-2 border-[#c04851]";
                         bgClass = "bg-[#f9e3e5]";
                         textClass = "text-[#c04851]";
                         tooltip += ` | ❌ 实测：${translateTone(slotResult.actualTone)}`;
                      } else if (slotResult.isRhymeError) {
                         borderClass = "border-2 border-[#c04851]";
                         bgClass = "bg-[#f9e3e5]";
                         textClass = "text-[#c04851]";
                         tooltip += ` | ❌ 韵脚错误 (韵部 ${slotResult.rhymeGroup})`;
                      } else {
                         // 正确填字：根据实际格律显示对应颜色
                         if (slotSchema.tone === 'Ping') {
                           borderClass = "border-2 border-[#7f8c5b]";
                           bgClass = "bg-[#f4f6f0]";
                           textClass = "text-[#3f4a28]";
                         } else if (slotSchema.tone === 'Ze') {
                           borderClass = "border-2 border-[#6b5b95]";
                           bgClass = "bg-[#f5f3f9]";
                           textClass = "text-[#5a4a7a]";
                         } else {
                           borderClass = "border-2 border-[#7f8c5b]";
                           bgClass = "bg-[#f4f6f0]";
                           textClass = "text-[#3f4a28]";
                         }
                         tooltip += " | ✓ 正确";
                      }
                    }

                    return (
                      <div 
                        key={slotIdx}
                        className={`${baseClasses} ${borderClass} ${bgClass} ${textClass} hover:scale-110 hover:shadow-md`}
                        title={tooltip}
                      >
                        {content}
                        
                        {slotResult?.isPolyphonic && (
                            <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-gray-400 opacity-60"></div>
                        )}

                        {slotSchema.isRhyme && (
                            <div 
                              className={`absolute -bottom-2 -right-2 text-xs font-bold transform rotate-0 ${
                                (slotSchema.rhymeId || 0) % 2 === 0 ? 'text-[#6b5b95]' : 'text-[#c04851]'
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
                    <div className="text-[#c04851] text-base font-bold opacity-90 bg-red-50 px-2 py-1 rounded border border-red-200" title="超出字数">
                       <span className="text-xs mr-1">多</span>
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