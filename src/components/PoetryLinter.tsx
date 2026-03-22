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

function getSlotToneClass(slotSchema: SlotSchema) {
  if (slotSchema.tone === "Ping") return "tone-cell--ping";
  if (slotSchema.tone === "Ze") return "tone-cell--ze";
  return "tone-cell--zhong";
}

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
    <div className="flex flex-col gap-8">
      <section
        className={`workspace-panel ${
          isCipaiOpen ? "workspace-panel--dropdown-open" : ""
        }`}
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs tracking-[0.28em] text-[var(--accent-soft)]">
              格律检测
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <h2 className="text-3xl text-[var(--text-primary)] md:text-4xl">
                逐句核验格律结构
              </h2>
              {hasInput && (
                <span
                  className={`status-pill ${
                    isPerfect ? "status-pill--success" : "status-pill--error"
                  }`}
                >
                  {isPerfect ? "检测通过" : `发现 ${totalIssues} 处问题`}
                </span>
              )}
            </div>
          </div>

          <div className="w-full max-w-sm" ref={cipaiRef}>
            <label className="field-label">词牌选择</label>
            <div className="relative mt-3">
              <button
                className="selector-button w-full justify-between"
                onClick={() => setIsCipaiOpen(!isCipaiOpen)}
                type="button"
              >
                <span className="text-left">
                  <span className="block text-lg text-[var(--text-primary)]">
                    {selectedCipai.name}
                  </span>
                </span>
                <svg
                  className={`h-4 w-4 text-[var(--accent)] transition-transform duration-300 ${
                    isCipaiOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isCipaiOpen && (
                <div className="absolute left-0 right-0 top-full z-30 mt-3 max-h-80 overflow-y-auto border border-[var(--line-strong)] bg-[var(--surface-dropdown)] p-2 shadow-[var(--shadow-elevated)] backdrop-blur-md">
                  {CIPAI_LIST.map((cipai) => (
                    <button
                      key={cipai.name}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left transition duration-200 ${
                        selectedCipai.name === cipai.name
                          ? "bg-[var(--surface-tint)] text-[var(--text-primary)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)]"
                      }`}
                      onClick={() => {
                        setSelectedCipai(cipai);
                        setIsCipaiOpen(false);
                      }}
                      type="button"
                    >
                      <span>
                        <span className="block text-base">{cipai.name}</span>
                        <span className="mt-1 block text-xs tracking-[0.14em] text-[var(--text-muted)]">
                          {cipai.lines.length} 句
                        </span>
                      </span>
                      {selectedCipai.name === cipai.name && (
                        <span className="text-[var(--accent)]">当前</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <section className="workspace-panel results-panel">
          <p className="field-label">诗词正文</p>

          <textarea
            className="editor-textarea mt-6"
            placeholder="请输入诗词内容&#10;&#10;例如：&#10;春归何处&#10;寂寞无行路"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <div className="surface-divider"></div>
        </section>

        <section className="workspace-panel">
          <div className="flex flex-col gap-6 border-b border-[var(--line-soft)] pb-6 lg:flex-row lg:items-end lg:justify-between">
            <h3 className="text-2xl text-[var(--text-primary)]">校验结果</h3>

            <div className="flex flex-wrap gap-2 text-sm">
              <span className="data-chip">平仄 {toneErrors}</span>
              <span className="data-chip">押韵 {rhymeErrors}</span>
              <span className="data-chip">定字 {requiredCharErrors}</span>
              <span className="data-chip">缺字 {missingCount}</span>
              <span className="data-chip">多字 {overflowCount}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
            <span className="inline-flex items-center gap-2">
              <span className="tone-cell tone-cell--ping h-9 w-9 text-base">
                平
              </span>
              平声
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="tone-cell tone-cell--ze h-9 w-9 text-base">
                仄
              </span>
              仄声
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="tone-cell tone-cell--zhong h-9 w-9 text-base">
                中
              </span>
              通配
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="tone-cell tone-cell--error h-9 w-9 text-base">
                错
              </span>
              错误位置
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="text-base text-[var(--accent)]">▲</span>
              韵脚位置
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="legend-dot bg-[var(--ze)]"></span>
              多音字
            </span>
          </div>

          <div className="mt-8 space-y-4">
            {selectedCipai.lines.map(
              (lineSchema: LineSchema, lineIdx: number) => {
                const lineResult = validation?.lines[lineIdx];
                const slots = lineResult?.slots || [];

                return (
                  <div key={lineIdx} className="result-row">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {lineSchema.pattern.map(
                          (slotSchema: SlotSchema, slotIdx: number) => {
                            const slotResult = slots[slotIdx];
                            const hasError = !!slotResult &&
                              (slotResult.isToneError ||
                                slotResult.isRhymeError ||
                                slotResult.isRequiredCharError);
                            const content = slotResult?.char ||
                              slotSchema.requiredChar ||
                              translateTone(slotSchema.tone);
                            const tooltipParts = [
                              `第${lineIdx + 1}句`,
                              `第${slotIdx + 1}字`,
                              `要求 ${translateTone(slotSchema.tone)}`,
                            ];

                            if (slotSchema.requiredChar) {
                              tooltipParts.push(
                                `定字 ${slotSchema.requiredChar}`,
                              );
                            }

                            if (slotResult) {
                              tooltipParts.push(
                                `实测 ${slotResult.actualTone}`,
                              );
                              tooltipParts.push(`拼音 ${slotResult.pinyin}`);
                              if (slotResult.rhymeGroup) {
                                tooltipParts.push(
                                  `韵部 ${slotResult.rhymeGroup}`,
                                );
                              }
                              if (slotResult.isPolyphonic) {
                                tooltipParts.push("多音字");
                              }
                              if (slotResult.isToneError) {
                                tooltipParts.push("平仄错误");
                              }
                              if (slotResult.isRhymeError) {
                                tooltipParts.push("韵脚错误");
                              }
                              if (slotResult.isRequiredCharError) {
                                tooltipParts.push("定字错误");
                              }
                            }

                            return (
                              <div
                                key={slotIdx}
                                className={`tone-cell ${
                                  getSlotToneClass(slotSchema)
                                } ${
                                  slotResult
                                    ? "tone-cell--filled"
                                    : "tone-cell--empty"
                                } tone-cell--grid ${
                                  hasError ? "tone-cell--error" : ""
                                }`}
                                title={tooltipParts.join(" | ")}
                              >
                                <span
                                  className={`tone-cell__content ${
                                    slotResult
                                      ? "tone-cell__content--filled"
                                      : ""
                                  }`}
                                >
                                  {content}
                                </span>

                                {slotResult?.isPolyphonic && (
                                  <span className="tone-cell__dot"></span>
                                )}

                                {slotSchema.isRhyme && (
                                  <span className="tone-cell__rhyme">
                                    ▲
                                  </span>
                                )}
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
