// Simplified rhyme groups based on Zhonghua Xinyun (Modern Standard)
// This maps the 'final' (yunmu) from pinyin-pro to a Group ID.

export const RHYME_GROUPS: Record<string, string> = {
  // A Group (a, ia, ua)
  'a': 'A', 'ia': 'A', 'ua': 'A',
  
  // O/E Group (o, e, uo)
  'o': 'B', 'e': 'B', 'uo': 'B', 
  
  // I/Ü Group (i, ü, er - er is special but often grouped loosely or separately, putting in C for now)
  'i': 'C', 'ü': 'C',
  
  // AI/UI Group (ai, uai)
  'ai': 'D', 'uai': 'D',
  
  // EI/UI Group (ei, ui)
  'ei': 'E', 'ui': 'E',
  
  // AO/IAO Group (ao, iao)
  'ao': 'F', 'iao': 'F',
  
  // OU/IU Group (ou, iu)
  'ou': 'G', 'iu': 'G',
  
  // AN/IAN/UAN/ÜAN Group
  'an': 'H', 'ian': 'H', 'uan': 'H', 'üan': 'H',
  
  // EN/IN/UN/ÜN Group
  'en': 'I', 'in': 'I', 'un': 'I', 'ün': 'I',
  
  // ANG/IANG/UANG Group
  'ang': 'J', 'iang': 'J', 'uang': 'J',
  
  // ENG/ING/ONG/IONG Group
  'eng': 'K', 'ing': 'K', 'ong': 'K', 'iong': 'K',

  // U Group (u) - Typically Wu
  'u': 'L',
};

export function getRhymeGroup(final: string, initial?: string): string | null {
  // Handle special case: j, q, x, y + u => ü (Group C)
  if (final === 'u' && initial && ['j', 'q', 'x', 'y'].includes(initial)) {
    return 'C';
  }
  return RHYME_GROUPS[final] || null;
}
