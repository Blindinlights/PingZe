import React, { useState } from 'react';
import { Cipai, LineSchema, ToneType, getPotentialProsody } from '../logic/prosody-engine.ts';

export default function SchemaBuilder() {
  const [title, setTitle] = useState('');
  const [patternInput, setPatternInput] = useState('');
  const [generatedSchema, setGeneratedSchema] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const parsePattern = () => {
    setError(null);
    // Replace punctuation with newlines, then split
    const normalizedInput = patternInput.replace(/[，。；：！？,.;:!?\n]/g, '\n');
    const linesStr = normalizedInput.split('\n').filter(l => l.trim() !== '');
    const cipaiLines: LineSchema[] = [];
    
    // Auto-detect rhyme change logic
    let currentRhymeId = 1;
    let lastRhymeTone: ToneType | null = null;

    try {
        linesStr.forEach((lineStr, lineIdx) => {
            const pattern: { tone: ToneType, isRhyme: boolean, rhymeId?: number }[] = [];
            
            // Regex to match tokens: "平", "仄", "通", "中" optionally followed by "[韵]"
            // We iterate through the string manually to handle the suffix logic correctly and robustly.
            const chars = lineStr.trim().split('');
            
            for (let i = 0; i < chars.length; i++) {
                const char = chars[i];
                let tone: ToneType | null = null;
                
                if (char === '平') tone = 'Ping';
                else if (char === '仄') tone = 'Ze';
                else if (char === '通' || char === '中') tone = 'Zhong';
                
                // If it's a valid tone character
                if (tone) {
                    let isRhyme = false;
                    let rId = undefined;

                    // Check next characters for [韵]
                    // We look ahead.
                    if (chars[i+1] === '[' && chars[i+2] === '韵' && chars[i+3] === ']') {
                        isRhyme = true;
                        i += 3; // Skip the [韵] marker
                        
                        // Rhyme change detection logic
                        if (tone !== 'Zhong') { // Zhong doesn't trigger change usually, or strictly it might? Let's assume explicit Ping/Ze triggers it.
                             if (lastRhymeTone !== null && lastRhymeTone !== tone) {
                                 // Tone changed from last rhyme (Ping->Ze or Ze->Ping)
                                 currentRhymeId++;
                             }
                             lastRhymeTone = tone;
                        }
                        rId = currentRhymeId;
                    }
                    
                    pattern.push({ tone, isRhyme, rhymeId: rId });
                } else {
                    // Ignore other characters (spaces, etc) or throw error?
                    // For robustness, let's ignore spaces/punctuation, but maybe warn on unknown chars?
                    // User might type "，" or "。" which are just visual separators.
                    if (!['[', ']', '韵', ' ', '，', '。'].includes(char)) {
                         // silently ignore or console.log
                    }
                }
            }
            
            if (pattern.length > 0) {
                cipaiLines.push({ pattern });
            }
        });

        if (cipaiLines.length === 0) {
            setError("未检测到有效的格律定义，请输入如“平平仄仄平”的内容。");
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
    <div className="flex flex-col min-h-[600px] space-y-4 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold text-gray-800">词牌规则定义器</h2>
      <p className="text-gray-600">
        请使用以下格式定义格律：
        <span className="font-mono bg-gray-100 px-1 rounded mx-1">平</span>
        <span className="font-mono bg-gray-100 px-1 rounded mx-1">仄</span>
        <span className="font-mono bg-gray-100 px-1 rounded mx-1">通</span> (可平可仄)
        <span className="font-mono bg-gray-100 px-1 rounded mx-1">[韵]</span> (标记韵脚)
      </p>
      
      <div className="flex flex-col space-y-2">
        <label className="font-bold text-gray-700">词牌名称</label>
        <input 
          type="text" 
          className="border border-gray-300 rounded p-2 max-w-md"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="例如：长相思"
        />
      </div>

      <div className="flex flex-col space-y-2 flex-1">
        <label className="font-bold text-gray-700">格律定义</label>
        <textarea 
          className="flex-1 min-h-[300px] border border-gray-300 rounded p-4 font-serif text-xl leading-relaxed resize-y focus:ring-2 focus:ring-indigo-500 outline-none"
          value={patternInput}
          onChange={e => setPatternInput(e.target.value)}
          placeholder={`例如：\n平平仄仄平平仄[韵]\n通仄平平仄[韵]`}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      <div className="py-2">
        <button 
          className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
          onClick={parsePattern}
        >
          生成规则数据
        </button>
      </div>

      {generatedSchema && (
        <div className="mt-6 border-t pt-6">
            <label className="font-bold text-gray-700 flex justify-between">
              <span>生成的规则数据</span>
              <span className="text-xs text-gray-400 font-normal">点击下方框内内容可手动修改</span>
            </label>
            <textarea 
                className="w-full min-h-[200px] mt-2 border border-gray-300 rounded p-4 font-mono text-sm bg-gray-50 resize-y"
                readOnly
                value={generatedSchema}
            />
            <p className="text-sm text-gray-500 mt-2">请将此内容保存至系统配置中以在检测器中使用。</p>
        </div>
      )}
    </div>
  );
}
