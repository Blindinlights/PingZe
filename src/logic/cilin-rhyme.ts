import cilinData from "../data/cilin-rhyme-simple.json" with { type: "json" };

interface CilinData {
  Ping: string[];
  Ze: string[];
}

const data = cilinData as CilinData;

const pingSet = new Set(data.Ping);
const zeSet = new Set(data.Ze);

export type CilinTone = "Ping" | "Ze" | null;

export function getCilinTone(char: string): CilinTone {
  if (pingSet.has(char)) {
    return "Ping";
  }
  if (zeSet.has(char)) {
    return "Ze";
  }
  return null;
}

export function isInCilin(char: string): boolean {
  return pingSet.has(char) || zeSet.has(char);
}
