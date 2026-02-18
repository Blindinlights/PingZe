#!/usr/bin/env python3
"""
Convert Cilin_Rhyme.json to a more efficient JSON structure.

Optimizations:
1. Map each character to its rhyme group and tone directly (O(1) lookup)
2. Remove redundant nesting
3. Use compact format without whitespace
"""

import json
from pathlib import Path


# Chinese numeral mapping
CHINESE_NUMERALS = {
    "一": 1,
    "二": 2,
    "三": 3,
    "四": 4,
    "五": 5,
    "六": 6,
    "七": 7,
    "八": 8,
    "九": 9,
    "十": 10,
    "十一": 11,
    "十二": 12,
    "十三": 13,
    "十四": 14,
    "十五": 15,
    "十六": 16,
    "十七": 17,
    "十八": 18,
    "十九": 19,
}


def convert_rhyme_data(input_path: str, output_path: str) -> None:
    """Convert verbose rhyme JSON to efficient lookup format."""

    with open(input_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Create efficient structures
    char_to_info = {}  # character -> [{"group": int, "tone": "Ping"|"Ze"}]
    groups = {}  # group_id -> {"Ping": [...], "Ze": [...]}

    for group_name, tones in data.items():
        # Extract group number from name like "第一部"
        num_str = group_name[1:-1]  # Extract Chinese numeral
        group_id = CHINESE_NUMERALS.get(num_str)
        if group_id is None:
            print(f"Warning: Unknown numeral '{num_str}' in '{group_name}'")
            continue
        groups[group_id] = {"Ping": [], "Ze": []}

        for tone_name, chars in tones.items():
            tone = "Ping" if tone_name == "平声" else "Ze"
            groups[group_id][tone] = chars

            # Map each character to its group and tone
            for char in chars:
                # Handle polyphonic characters (appear in multiple groups/tones)
                if char not in char_to_info:
                    char_to_info[char] = []
                char_to_info[char].append({"g": group_id, "t": tone})

    # Create final optimized structure
    optimized = {"chars": char_to_info, "groups": groups, "count": len(groups)}

    # Write with minimal whitespace for smaller file size
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(optimized, f, ensure_ascii=False, separators=(",", ":"))

    # Also write a pretty-printed version for readability
    pretty_path = output_path.replace(".json", "_pretty.json")
    with open(pretty_path, "w", encoding="utf-8") as f:
        json.dump(optimized, f, ensure_ascii=False, indent=2)

    # Print statistics
    total_chars = len(char_to_info)
    polyphonic = sum(1 for infos in char_to_info.values() if len(infos) > 1)

    print(f"✓ Conversion complete!")
    print(f"  Rhyme groups: {len(groups)}")
    print(f"  Total characters: {total_chars}")
    print(f"  Polyphonic characters: {polyphonic}")
    print(f"  Output files:")
    print(f"    - {output_path} (compact)")
    print(f"    - {pretty_path} (readable)")


if __name__ == "__main__":
    input_file = Path(__file__).parent / "Cilin_Rhyme.json"
    output_file = Path(__file__).parent / "cilin_rhyme_optimized.json"

    convert_rhyme_data(str(input_file), str(output_file))
