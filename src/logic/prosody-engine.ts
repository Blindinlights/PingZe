import { pinyin } from "pinyin-pro";
import { getRhymeGroup } from "./rhyme-map.ts";
import { getCilinTone } from "./cilin-rhyme.ts";

export type ToneType = "Ping" | "Ze" | "Zhong"; // Zhong means allowed both

type DefiniteTone = "Ping" | "Ze";

export interface SlotSchema {
  tone: ToneType;
  isRhyme: boolean;
  rhymeId?: number; // 韵部 ID，用于支持换韵
  requiredChar?: string; // 定字/叠字：强制要求该位置必须是此字
}

export interface LineSchema {
  pattern: SlotSchema[];
  requirement?: "Antithesis"; // 对偶/对仗要求（提示性）
  repeatLineId?: number; // 叠句：表示该句是重复引用的某一句（索引）
}

export interface Cipai {
  name: string;
  lines: LineSchema[];
}

export interface ValidationResult {
  char: string;
  expectedTone: ToneType;
  actualTone: DefiniteTone;
  isToneError: boolean;
  isRequiredCharError: boolean;
  isRhymePosition: boolean;
  isRhymeError: boolean;
  isPolyphonic: boolean;
  rhymeGroup: string | null;
  rhymeId: number;
  pinyin: string;
}

export interface LineValidationResult {
  slots: ValidationResult[];
  overflow: string;
  missingCount: number;
}

export interface PoemValidation {
  lines: LineValidationResult[];
  rhymeGroups: Record<number, string | null>; // 记录每个 ID 对应的实际韵部
}

interface ProsodyCandidate {
  tone: DefiniteTone;
  rhymeGroup: string | null;
  pinyin: string;
}

interface PinyinInfo {
  num: number;
  final: string;
  initial: string;
  pinyin: string;
}

function isPinyinInfoArray(value: unknown): value is PinyinInfo[] {
  if (!Array.isArray(value)) return false;
  if (value.length === 0) return false;
  return value.every((v) => {
    if (typeof v !== "object" || v === null) return false;
    const rec = v as Record<string, unknown>;
    return typeof rec.num === "number" &&
      typeof rec.final === "string" &&
      typeof rec.initial === "string" &&
      typeof rec.pinyin === "string";
  });
}

function stripTones(str: string): string {
  return str.normalize("NFD").replace(/[\u0300\u0301\u0304\u030c]/g, "")
    .normalize("NFC");
}

function getPotentialProsody(char: string): ProsodyCandidate[] {
  // Step 1: Try Cilin Rhyme first (classical rhyme system)
  const cilinTone = getCilinTone(char);

  if (cilinTone) {
    // Character found in Cilin, use it as primary source
    // Still get pinyin info for rhyme group calculation
    const items = pinyin(char, { multiple: true, type: "all" }) as unknown;
    const pinyinInfo = isPinyinInfoArray(items) ? items[0] : null;

    const rhymeGroup = pinyinInfo
      ? getRhymeGroup(stripTones(pinyinInfo.final), pinyinInfo.initial)
      : null;
    const pinyinStr = pinyinInfo?.pinyin || "?";

    return [{
      tone: cilinTone,
      rhymeGroup,
      pinyin: pinyinStr,
    }];
  }

  // Step 2: Fallback to modern pinyin-based detection
  const items = pinyin(char, { multiple: true, type: "all" }) as unknown;

  if (!isPinyinInfoArray(items)) {
    // Fallback for unknown chars
    return [{ tone: "Ze", rhymeGroup: null, pinyin: "?" }];
  }

  return items.map((item) => {
    let tone: DefiniteTone = "Ping";
    // 1, 2 -> Ping; 3, 4 -> Ze;
    // Treat neutral (5/0) as Ze for safety
    if (item.num === 3 || item.num === 4 || item.num === 0 || item.num === 5) {
      tone = "Ze";
    }

    const strippedFinal = stripTones(item.final);

    return {
      tone,
      rhymeGroup: getRhymeGroup(strippedFinal, item.initial),
      pinyin: item.pinyin,
    };
  });
}

// Helper: Pre-process input lines
// 1. Replace punctuation with newlines
// 2. Split by newline
// 3. Filter empty lines
function processInputLines(input: string): string[] {
  // Regex for punctuation (Chinese & English)
  // ，。！？；：、  , . ! ? ; :
  const normalized = input.replace(/[，。！？；：、,.\!?;:]/g, "\n");
  return normalized.split("\n").map((l) => l.trim()).filter((l) =>
    l.length > 0
  );
}

// Helper: Infer rhyme groups by looking at all rhyme positions globally
function inferRhymeGroups(
  inputLines: string[],
  cipai: Cipai,
): Record<number, string | null> {
  const groups: Record<number, string | null> = {};

  // Group characters by rhymeId
  const rhymeCharMap: Record<number, string[]> = {};

  const resolveLineIndex = (idx: number): number => {
    const repeatOf = cipai.lines[idx]?.repeatLineId;
    return typeof repeatOf === "number" && repeatOf >= 0 ? repeatOf : idx;
  };

  cipai.lines.forEach((line, i) => {
    const resolvedIndex = resolveLineIndex(i);
    const text = inputLines[resolvedIndex];
    if (!text) return;
    const chars = text.replace(/[^一-鿿]/g, "").split("");

    line.pattern.forEach((slot, j) => {
      if (slot.isRhyme && j < chars.length) {
        const rid = slot.rhymeId || 0; // Default to 0 for main rhyme
        if (!rhymeCharMap[rid]) rhymeCharMap[rid] = [];
        rhymeCharMap[rid].push(chars[j]);
      }
    });
  });

  // For each rhymeId, find the majority rhyme group
  Object.keys(rhymeCharMap).forEach((key) => {
    const rid = Number(key);
    const chars = rhymeCharMap[rid];
    const voteMap: Record<string, number> = {};

    chars.forEach((char) => {
      const cands = getPotentialProsody(char);
      // We collect UNIQUE rhyme groups for this char to avoid voting twice for same group if polyphonic
      const uniqueGroups = new Set(
        cands.map((c) => c.rhymeGroup).filter((g) => g !== null),
      );
      uniqueGroups.forEach((g) => {
        voteMap[g!] = (voteMap[g!] || 0) + 1;
      });
    });

    // Find max
    let bestGroup: string | null = null;
    let maxCount = -1;

    Object.entries(voteMap).forEach(([g, count]) => {
      if (count > maxCount) {
        maxCount = count;
        bestGroup = g;
      }
    });

    groups[rid] = bestGroup;
  });

  return groups;
}

export function validatePoem(input: string, cipai: Cipai): PoemValidation {
  const inputLines = processInputLines(input);

  // Step 1: Infer Rhyme Groups Globally
  const rhymeGroups = inferRhymeGroups(inputLines, cipai);

  const resultLines: LineValidationResult[] = [];

  for (let i = 0; i < cipai.lines.length; i++) {
    const lineSchema = cipai.lines[i];
    const resolvedIndex = typeof lineSchema.repeatLineId === "number" &&
        lineSchema.repeatLineId >= 0
      ? lineSchema.repeatLineId
      : i;
    const userLineRaw = inputLines[resolvedIndex] || "";
    const chars = userLineRaw.replace(/[^一-鿿]/g, "").split("");
    const slots: ValidationResult[] = [];

    for (let j = 0; j < lineSchema.pattern.length; j++) {
      const slotSchema = lineSchema.pattern[j];

      if (j >= chars.length) break;

      const char = chars[j];
      const candidates = getPotentialProsody(char);
      const rId = slotSchema.rhymeId || 0;

      // OPTIMISTIC MATCHING LOGIC
      let bestCandidate = candidates[0];
      let matched = false;

      // 1. Try to match BOTH Tone and Rhyme (using Inferred Group)
      for (const cand of candidates) {
        const toneMatch = slotSchema.tone === "Zhong" ||
          slotSchema.tone === cand.tone;
        let rhymeMatch = true;

        if (slotSchema.isRhyme) {
          const targetGroup = rhymeGroups[rId];
          if (targetGroup) {
            if (cand.rhymeGroup !== targetGroup) rhymeMatch = false;
          }
        }

        if (toneMatch && rhymeMatch) {
          bestCandidate = cand;
          matched = true;
          break;
        }
      }

      // 2. Fallback: Tone Match Only (if rhyme failed)
      if (!matched) {
        for (const cand of candidates) {
          if (slotSchema.tone === "Zhong" || slotSchema.tone === cand.tone) {
            bestCandidate = cand;
            break;
          }
        }
      }

      const analysis = bestCandidate;

      const isRequiredCharError = typeof slotSchema.requiredChar === "string" &&
        slotSchema.requiredChar.length > 0 &&
        char !== slotSchema.requiredChar;

      // Tone Check
      let isToneError = false;
      if (slotSchema.tone !== "Zhong" && slotSchema.tone !== analysis.tone) {
        isToneError = true;
      }

      // Rhyme Check
      let isRhymeError = false;
      if (slotSchema.isRhyme) {
        const targetGroup = rhymeGroups[rId];
        // If we have a target group, check against it
        if (targetGroup) {
          if (analysis.rhymeGroup !== targetGroup) {
            isRhymeError = true;
          }
        }
      }

      slots.push({
        char,
        expectedTone: slotSchema.tone,
        actualTone: analysis.tone,
        isToneError,
        isRequiredCharError,
        isRhymePosition: slotSchema.isRhyme,
        isRhymeError,
        isPolyphonic: candidates.length > 1,
        rhymeGroup: analysis.rhymeGroup,
        rhymeId: rId,
        pinyin: analysis.pinyin,
      });
    }

    let overflow = "";
    if (chars.length > lineSchema.pattern.length) {
      overflow = chars.slice(lineSchema.pattern.length).join("");
    }

    const missingCount = Math.max(0, lineSchema.pattern.length - slots.length);

    resultLines.push({ slots, overflow, missingCount });
  }

  return {
    lines: resultLines,
    rhymeGroups,
  };
}
