import { useState } from "react";
import { Cipai, LineSchema, ToneType } from "../logic/prosody-engine.ts";

export default function SchemaBuilder() {
  const [title, setTitle] = useState("");
  const [patternInput, setPatternInput] = useState("");
  const [generatedSchema, setGeneratedSchema] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const parsePattern = () => {
    setError(null);
    const normalizedInput = patternInput.replace(
      /[，。；：！？,.;:!?\n]/g,
      "\n",
    );
    const linesStr = normalizedInput.split("\n").filter((l: string) =>
      l.trim() !== ""
    );
    const cipaiLines: LineSchema[] = [];

    let currentRhymeId = 1;
    let lastRhymeTone: ToneType | null = null;

    try {
      linesStr.forEach((lineStr: string) => {
        const pattern: {
          tone: ToneType;
          isRhyme: boolean;
          rhymeId?: number;
        }[] = [];
        const chars = lineStr.trim().split("");

        for (let i = 0; i < chars.length; i++) {
          const char = chars[i];
          let tone: ToneType | null = null;

          if (char === "平") tone = "Ping";
          else if (char === "仄") tone = "Ze";
          else if (char === "通" || char === "中") tone = "Zhong";

          if (tone) {
            let isRhyme = false;
            let rId = undefined;

            if (
              chars[i + 1] === "[" && chars[i + 2] === "韵" &&
              chars[i + 3] === "]"
            ) {
              isRhyme = true;
              i += 3;

              if (tone !== "Zhong") {
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
        lines: cipaiLines,
      };

      setGeneratedSchema(JSON.stringify(schema, null, 2));
    } catch (err) {
      setError("解析出错，请检查格式是否正确。");
      console.error(err);
    }
  };

  return (
    <div>
      <section className="workspace-panel">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <h3 className="text-3xl text-[var(--text-primary)]">制谱工具</h3>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="space-y-6">
              <div>
                <label className="field-label">词牌名称</label>
                <input
                  type="text"
                  className="builder-input mt-3"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如：长相思、浣溪沙、菩萨蛮"
                />
              </div>

              <div>
                <label className="field-label">格律定义</label>
                <textarea
                  className="builder-textarea mt-3"
                  value={patternInput}
                  onChange={(e) => setPatternInput(e.target.value)}
                  placeholder={`请输入格律格式，例如：\n\n平平仄仄平平仄 [韵]\n通仄平平仄 [韵]\n通仄平平平仄仄\n仄平平仄仄平平 [韵]`}
                />
              </div>

              {error && (
                <div className="status-pill status-pill--error inline-flex">
                  {error}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  className="copper-button"
                  onClick={parsePattern}
                  type="button"
                >
                  生成规则数据
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="field-label">JSON 输出</label>

              <textarea
                className="schema-output mt-3"
                readOnly
                value={generatedSchema}
                placeholder={`{\n  "name": "自定义词牌",\n  "lines": []\n}`}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
