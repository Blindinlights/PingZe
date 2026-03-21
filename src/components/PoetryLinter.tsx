import { useEffect, useRef, useState } from "react";
import {
  Cipai,
  LineSchema,
  PoemValidation,
  SlotSchema,
  validatePoem,
  ValidationResult,
} from "../logic/prosody-engine.ts";
import { CIPAI_LIST } from "../data/cipai-list.ts";

const translateTone = (tone: string) => {
  if (tone === "Ping") return "平";
  if (tone === "Ze") return "仄";
  if (tone === "Zhong") return "中";
  return tone;
};

export default function PoetryLinter() {
  const [selectedCipai, setSelectedCipai] = useState<Cipai>(CIPAI_LIST[0]);
  const [input, setInput] = useState("");
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
      if (
        cipaiRef.current && !cipaiRef.current.contains(event.target as Node)
      ) {
        setIsCipaiOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  let toneErrors = 0;
  let rhymeErrors = 0;
  let overflowCount = 0;
  let missingCount = 0;
  let requiredCharErrors = 0;

  if (validation) {
    selectedCipai.lines.forEach((lineSchema: LineSchema, idx: number) => {
      const lineResult = validation.lines[idx];
      const requiredLength = lineSchema.pattern.length;

      if (lineResult) {
        if (lineResult.overflow) overflowCount += lineResult.overflow.length;
        missingCount += lineResult.missingCount;
        lineResult.slots.forEach((slot: ValidationResult) => {
          if (slot.isToneError) toneErrors++;
          if (slot.isRhymeError) rhymeErrors++;
          if (slot.isRequiredCharError) requiredCharErrors++;
        });
      } else {
        missingCount += requiredLength;
      }
    });
  }

  const totalIssues = toneErrors + rhymeErrors + overflowCount + missingCount +
    requiredCharErrors;
  const hasInput = input.trim().length > 0;
  const isPerfect = hasInput && totalIssues === 0;

  return (
    <div className="flex flex-col h-full space-y-8">
      {/* 顶部控制栏 - 卷轴风格 */}
      <div className="bg-paper shadow-lg rounded-sm relative z-20">
        {/* 卷轴装饰边 */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#C6A46A] via-[#CC5855] to-[#C6A46A]">
        </div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#C6A46A]/50 to-transparent">
        </div>

        <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* 词牌选择器 */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#C6A46A] to-[#A88952] flex items-center justify-center shadow-md">
                <span className="text-white text-lg font-bold">词</span>
              </div>
              <label className="font-semibold text-[#2C363F] tracking-[0.15em] text-lg">
                词牌
              </label>
            </div>

            <div className="relative" ref={cipaiRef}>
              <button
                className="group flex items-center space-x-3 bg-gradient-to-r from-[#FAF9F7] to-[#F2EFE9] border border-[#C6A46A]/60 px-8 py-3 rounded-sm hover:border-[#CC5855] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-[#CC5855]/30 min-w-[200px]"
                onClick={() => setIsCipaiOpen(!isCipaiOpen)}
                type="button"
              >
                <span className="font-serif text-xl text-[#2C363F] tracking-[0.1em]">
                  {selectedCipai.name}
                </span>
                <span
                  className={`text-[#C6A46A] transition-transform duration-300 group-hover:text-[#CC5855] ${
                    isCipaiOpen ? "rotate-180" : ""
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </button>

              {isCipaiOpen && (
                <div className="absolute top-full left-0 mt-3 w-72 max-h-96 overflow-y-auto bg-[#FAF9F7]/95 backdrop-blur-md border border-[#C6A46A]/40 rounded-sm shadow-[0_8px_32px_rgba(214,164,94,0.2)] z-50 animate-scale-in ring-1 ring-white/50">
                  <div className="py-2">
                    {CIPAI_LIST.map((cipai) => (
                      <button
                        key={cipai.name}
                        className={`w-full text-left px-8 py-3.5 font-serif text-[#2C363F] hover:bg-gradient-to-r hover:from-[#F2EFE9] hover:to-[#EFEBE5] transition-all duration-200 ease-out active:scale-[0.98] flex items-center justify-between group ${
                          selectedCipai.name === cipai.name
                            ? "bg-gradient-to-r from-[#EFEBE5] to-[#ebe7e0] text-[#CC5855] font-semibold border-l-4 border-[#CC5855]"
                            : "border-l-4 border-transparent"
                        }`}
                        onClick={() => {
                          setSelectedCipai(cipai);
                          setIsCipaiOpen(false);
                        }}
                        type="button"
                      >
                        <span className="tracking-wide text-lg">
                          {cipai.name}
                        </span>
                        {selectedCipai.name === cipai.name && (
                          <span className="text-[#CC5855]">
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
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
            {validation &&
              Object.entries(validation.rhymeGroups).map(([id, group]) => (
                <div
                  key={id}
                  className="flex items-center space-x-2 bg-[#F2EFE9] px-4 py-2 rounded-sm border border-[#C6A46A]/30"
                >
                  <span
                    className={`w-2.5 h-2.5 rotate-45 shadow-sm ${
                      parseInt(id) % 2 === 0
                        ? "bg-gradient-to-br from-[#6286A0] to-[#4D6D85]"
                        : "bg-gradient-to-br from-[#CC5855] to-[#B24744]"
                    }`}
                  >
                  </span>
                  <span className="font-serif text-[#2C363F] text-sm">
                    {parseInt(id) === 0
                      ? (
                        <span className="text-[#CC5855] font-semibold">
                          主韵
                        </span>
                      )
                      : (
                        `韵部${id}`
                      )}:{" "}
                    <span className="text-[#475569]">{group || "未定"}</span>
                  </span>
                </div>
              ))}
            {(!validation ||
              Object.keys(validation.rhymeGroups).length === 0) && (
              <span className="text-[#475569]/40 italic text-sm">
                请输入诗词以查看韵部
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 主体内容区 */}
      <div className="flex-1 flex flex-col md:flex-row gap-8">
        {/* 输入区域 - 宣纸风格 */}
        <div className="md:w-1/3 flex flex-col relative">
          <div className="bg-[#FAF9F7] shadow-lg rounded-sm overflow-hidden border border-[#E6E1D8] relative min-h-[600px]">
            {/* 竖线装饰 */}
            <div className="absolute top-0 left-8 w-px h-full bg-gradient-to-b from-[#C6A46A]/40 via-[#C6A46A]/20 to-[#C6A46A]/40">
            </div>
            <div className="absolute top-0 right-8 w-px h-full bg-gradient-to-b from-[#C6A46A]/40 via-[#C6A46A]/20 to-[#C6A46A]/40">
            </div>

            {/* 顶部印章装饰 */}
            <div className="absolute top-4 right-4 w-12 h-12 border-2 border-[#CC5855]/20 rounded-sm flex items-center justify-center transform rotate-12 pointer-events-none">
              <span className="text-[#CC5855]/40 text-[10px] font-bold tracking-widest">
                诗词
              </span>
            </div>

            <textarea
              className="w-full h-[600px] bg-transparent p-10 pt-10 resize-none font-serif text-2xl leading-[2.5] tracking-widest focus:outline-none text-[#2C363F] placeholder-[#475569]/30"
              placeholder="请输入诗词内容&#10;&#10;在此挥毫泼墨&#10;书写千古佳句..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          {/* 底部装饰 */}
          <div className="mt-4 flex justify-center">
            <div className="flex items-center space-x-3 text-[#475569]/40 text-xs tracking-[0.2em]">
              <div className="w-8 h-px bg-gradient-to-r from-transparent to-[#C6A46A]/50">
              </div>
              <span>输入诗词内容进行格律检测</span>
              <div className="w-8 h-px bg-gradient-to-l from-transparent to-[#C6A46A]/50">
              </div>
            </div>
          </div>
        </div>

        {/* 校验结果区域 */}
        <div className="md:w-2/3 bg-[#FAF9F7] shadow-lg rounded-sm border border-[#E6E1D8] relative overflow-hidden min-h-[600px]">
          {/* 顶部装饰条 */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#698B6F] via-[#6286A0] to-[#698B6F]">
          </div>

          <div className="p-8 pt-6">
            {/* 标题和状态 */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8 pb-6 border-b border-[#C6A46A]/20">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-[#698B6F] to-[#55735A] flex items-center justify-center shadow-md">
                  <span className="text-white text-xl font-bold">律</span>
                </div>
                <h2 className="text-2xl font-bold tracking-[0.2em] text-[#2C363F]">
                  格律校验
                </h2>
              </div>

              <div className="text-base">
                {!hasInput
                  ? (
                    <div className="flex items-center space-x-3 text-[#475569]/50 bg-[#F2EFE9] px-6 py-3 rounded-sm border border-[#C6A46A]/20">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      <span className="tracking-wider">待检测</span>
                    </div>
                  )
                  : isPerfect
                  ? (
                    <div className="flex items-center space-x-3 text-[#698B6F] bg-gradient-to-r from-[#f0f6eb] to-[#ebf2e3] px-6 py-3 rounded-sm border border-[#698B6F]/30 shadow-sm animate-fade-in-up">
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-semibold tracking-wider text-lg">
                        格律完美
                      </span>
                    </div>
                  )
                  : (
                    <div className="flex items-center space-x-4 text-[#CC5855] bg-gradient-to-r from-[#fef5f6] to-[#fdf0f2] px-6 py-3 rounded-sm border border-[#CC5855]/30 shadow-sm animate-fade-in-up">
                      <svg
                        className="w-6 h-6 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-semibold tracking-wider text-lg">
                          共发现{" "}
                          <strong className="text-xl">{totalIssues}</strong>
                          {" "}
                          处问题
                        </span>
                        {toneErrors > 0 && (
                          <span className="inline-flex items-center px-3 py-1 bg-[#6286A0]/10 rounded text-sm">
                            <span className="w-2.5 h-2.5 bg-[#6286A0] rounded-sm mr-2">
                            </span>
                            平仄 {toneErrors}
                          </span>
                        )}
                        {rhymeErrors > 0 && (
                          <span className="inline-flex items-center px-3 py-1 bg-[#CC5855]/10 rounded text-sm">
                            <span className="w-2.5 h-2.5 bg-[#CC5855] rounded-sm mr-2">
                            </span>
                            韵脚 {rhymeErrors}
                          </span>
                        )}
                        {overflowCount > 0 && (
                          <span className="inline-flex items-center px-3 py-1 bg-[#C6A46A]/10 rounded text-sm">
                            多字 {overflowCount}
                          </span>
                        )}
                        {missingCount > 0 && (
                          <span className="inline-flex items-center px-3 py-1 bg-[#475569]/10 rounded text-sm">
                            缺字 {missingCount}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* 图例 */}
            <div className="flex flex-wrap gap-6 mb-8 text-sm font-medium bg-gradient-to-r from-[#f5f5f0] to-[#EFEBE5] p-5 rounded-sm border border-[#C6A46A]/20">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-sm border-2 border-[#698B6F] bg-gradient-to-br from-[#f4f6f0] to-[#e8ebe0] flex items-center justify-center text-sm text-[#3f4a28] font-bold shadow-sm">
                  平
                </div>
                <span className="text-[#2C363F] tracking-wider">平声</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-sm border-2 border-[#6B7094] bg-gradient-to-br from-[#f5f3f9] to-[#ebe7f3] flex items-center justify-center text-sm text-[#6B7094] font-bold shadow-sm">
                  仄
                </div>
                <span className="text-[#2C363F] tracking-wider">仄声</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-sm border-2 border-[#CC5855] bg-gradient-to-br from-[#f9e3e5] to-[#f3d5d8] flex items-center justify-center text-sm text-[#CC5855] font-bold shadow-sm">
                  误
                </div>
                <span className="text-[#2C363F] tracking-wider">平仄错误</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-[#CC5855] to-[#B24744] flex items-center justify-center text-xs text-white font-bold shadow-sm">
                  错
                </div>
                <span className="text-[#2C363F] tracking-wider">韵脚错误</span>
              </div>
              <div className="flex items-center space-x-2 ml-auto">
                <span className="text-[#CC5855] text-sm font-bold">▲</span>
                <span className="text-[#6286A0] text-sm font-bold">▲</span>
                <span className="text-[#2C363F] tracking-wider">韵脚位置</span>
              </div>
            </div>

            {/* 格律显示 */}
            <div className="space-y-5">
              {selectedCipai.lines.map(
                (lineSchema: LineSchema, lineIdx: number) => {
                  const lineResult = validation?.lines[lineIdx];
                  const slots = lineResult?.slots || [];
                  const overflow = lineResult?.overflow || "";

                  return (
                    <div
                      key={lineIdx}
                      className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4 rounded-sm hover:bg-gradient-to-r hover:from-[#F2EFE9] hover:to-[#EFEBE5] transition-all duration-200 ease-out group"
                    >
                      {/* 行号 */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-sm bg-gradient-to-br from-[#C6A46A]/20 to-[#C6A46A]/10 border border-[#C6A46A]/30 flex items-center justify-center transition-all duration-200 ease-out group-hover:scale-105">
                        <span className="text-[#C6A46A] font-bold text-sm tracking-wider">
                          {String(lineIdx + 1).padStart(2, "0")}
                        </span>
                      </div>

                      {/* 字符格子 */}
                      {lineSchema.pattern.map(
                        (slotSchema: SlotSchema, slotIdx: number) => {
                          const slotResult = slots[slotIdx];

                          const baseClasses =
                            "w-14 h-14 flex items-center justify-center text-2xl cursor-help relative group/slot font-bold transition-all duration-300 ease-out rounded-sm";
                          let borderClass = "border-2 border-[#e5e7eb]";
                          let textClass = "text-[#d1d5db]";
                          let bgClass = "bg-white";
                          let shadowClass = "";
                          let content = "○";
                          let tooltip = `第${lineIdx + 1}句 第${
                            slotIdx + 1
                          }字 | 要求：${translateTone(slotSchema.tone)}`;

                          if (slotSchema.tone === "Ping") {
                            borderClass = "border-2 border-[#698B6F]";
                            bgClass =
                              "bg-gradient-to-br from-[#f4f6f0] to-[#e8ebe0]";
                            textClass = "text-[#698B6F]";
                            shadowClass = "shadow-sm";
                          } else if (slotSchema.tone === "Ze") {
                            borderClass = "border-2 border-[#6B7094]";
                            bgClass =
                              "bg-gradient-to-br from-[#f5f3f9] to-[#ebe7f3]";
                            textClass = "text-[#6B7094]";
                            shadowClass = "shadow-sm";
                          }

                          if (slotResult) {
                            content = slotResult.char;
                            textClass = "text-[#2C363F]";

                            if (slotResult.isPolyphonic) {
                              tooltip += " | 多音字";
                            }

                            if (slotResult.isToneError) {
                              borderClass = "border-2 border-[#CC5855]";
                              bgClass =
                                "bg-gradient-to-br from-[#fdf0f2] to-[#f9e3e5] animate-pulse";
                              textClass = "text-[#CC5855]";
                              shadowClass = "shadow-[0_0_12px_rgba(192,72,81,0.3)]";
                              tooltip += ` | ❌ 实测：${
                                translateTone(slotResult.actualTone)
                              }`;
                            } else if (slotResult.isRhymeError) {
                              borderClass = "border-2 border-[#CC5855]";
                              bgClass =
                                "bg-gradient-to-br from-[#fdf0f2] to-[#f9e3e5] animate-pulse";
                              textClass = "text-[#CC5855]";
                              shadowClass = "shadow-[0_0_12px_rgba(192,72,81,0.3)]";
                              tooltip += ` | ❌ 韵脚错误`;
                            } else {
                              if (slotSchema.tone === "Ping") {
                                borderClass = "border-2 border-[#698B6F]";
                                bgClass =
                                  "bg-gradient-to-br from-[#f4f6f0] to-[#e8ebe0]";
                                textClass = "text-[#3f4a28]";
                              } else if (slotSchema.tone === "Ze") {
                                borderClass = "border-2 border-[#6B7094]";
                                bgClass =
                                  "bg-gradient-to-br from-[#f5f3f9] to-[#ebe7f3]";
                                textClass = "text-[#565A7C]";
                              } else {
                                borderClass = "border-2 border-[#698B6F]";
                                bgClass =
                                  "bg-gradient-to-br from-[#f4f6f0] to-[#e8ebe0]";
                                textClass = "text-[#3f4a28]";
                              }
                              tooltip += " | ✓ 正确";
                            }
                          }

                          return (
                            <div
                              key={slotIdx}
                              className={`${baseClasses} ${borderClass} ${bgClass} ${textClass} ${shadowClass} hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(214,164,94,0.2)] active:translate-y-0`}
                              title={tooltip}
                            >
                              {content}

                              {slotResult?.isPolyphonic && (
                                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gradient-to-br from-[#6B7094] to-[#565A7C] opacity-70">
                                </div>
                              )}

                              {slotSchema.isRhyme && (
                                <div
                                  className={`absolute -bottom-1.5 -right-1.5 text-sm font-bold transform transition-all duration-200 ease-out group-hover/slot:scale-125 group-hover/slot:animate-pulse ${
                                    (slotSchema.rhymeId || 0) % 2 === 0
                                      ? "text-[#6286A0] drop-shadow-sm"
                                      : "text-[#CC5855] drop-shadow-sm"
                                  }`}
                                  title={`韵脚位 (韵部：${
                                    slotSchema.rhymeId || 0
                                  })`}
                                >
                                  ▲
                                </div>
                              )}
                            </div>
                          );
                        },
                      )}

                      {overflow && (
                        <div
                          className="inline-flex items-center text-[#CC5855] font-semibold bg-gradient-to-r from-[#fef5f6] to-[#fdf0f2] px-4 py-2 rounded-sm border border-[#CC5855]/30 shadow-sm"
                          title="超出字数"
                        >
                          <span className="text-xs mr-2 font-bold">多</span>
                          {overflow.split("").map((c: string, i: number) => (
                            <span key={i} className="line-through mx-0.5">
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                },
              )}
            </div>
          </div>

          {/* 底部装饰 */}
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#698B6F]/40 to-transparent">
          </div>
        </div>
      </div>
    </div>
  );
}
