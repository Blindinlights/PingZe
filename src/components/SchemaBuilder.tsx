import { useState } from "react";
import { Cipai, LineSchema, ToneType } from "../logic/prosody-engine.ts";

const formatHints = [
  { token: "平", detail: "平声位" },
  { token: "仄", detail: "仄声位" },
  { token: "中", detail: "可平可仄" },
  { token: "[韵]", detail: "标记韵脚" },
];

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
    <div className="grid gap-8 xl:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="workspace-panel">
        <p className="field-label">制谱说明</p>
        <h2 className="mt-3 text-3xl text-[var(--text-primary)]">
          词牌规则定义
        </h2>
        <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
          把手头的平仄格式整理成统一规则。输入区负责录入，右侧会输出可直接使用的
          JSON 结构。
        </p>

        <div className="surface-divider"></div>

        <div className="space-y-3">
          {formatHints.map((item) => (
            <div
              key={item.token}
              className="flex items-center justify-between border-b border-[var(--line-soft)] pb-3 text-sm text-[var(--text-secondary)]"
            >
              <span className="inline-flex min-w-12 items-center justify-center border border-[var(--line-strong)] bg-[var(--surface-hint)] px-3 py-1 text-[var(--text-primary)]">
                {item.token}
              </span>
              <span>{item.detail}</span>
            </div>
          ))}
        </div>

        <div className="surface-divider"></div>

        <div className="space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
          <p>每行代表一句，支持中文标点或换行分隔。</p>
          <p>若韵脚声调发生切换，系统会自动切分新的 rhymeId。</p>
        </div>
      </aside>

      <section className="workspace-panel">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="field-label">规则生成</p>
              <h3 className="mt-3 text-3xl text-[var(--text-primary)]">
                生成结构化规则
              </h3>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="data-chip">
                名称 {title.trim() || "自定义词牌"}
              </span>
              <span className="data-chip">
                输入 {patternInput.trim().length > 0 ? "已填写" : "待填写"}
              </span>
            </div>
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
                <span className="self-center text-sm text-[var(--text-muted)]">
                  先写平仄，再补 `[韵]` 标记。
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <label className="field-label">JSON 输出</label>
                  <p className="mt-3 text-lg text-[var(--text-primary)]">
                    可直接写入规则文件
                  </p>
                </div>
                <span className="text-sm text-[var(--text-muted)]">
                  只读展示
                </span>
              </div>

              <textarea
                className="schema-output"
                readOnly
                value={generatedSchema}
                placeholder={`{\n  "name": "自定义词牌",\n  "lines": []\n}`}
              />

              <p className="text-sm leading-7 text-[var(--text-secondary)]">
                生成后可将内容写入 [src/data/rules] 目录对应的 JSON 文件，再运行
                `deno task rules` 更新词牌列表。
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
