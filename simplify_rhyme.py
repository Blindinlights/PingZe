#!/usr/bin/env -S uv run
# /// script
# requires-python = ">=3.10"
# ///

import json


def simplify_rhyme(input_file: str, output_file: str) -> None:
    """
    精简词林正韵 JSON 结构：
    - 合并同样声调的字（用字符串代替数组）
    - 不分部（将所有部合并）
    """
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    simplified = {"平声": "", "仄声": ""}

    # 遍历所有部，合并字符
    for section in data.values():
        if "平声" in section:
            simplified["平声"] += "".join(section["平声"])
        if "仄声" in section:
            simplified["仄声"] += "".join(section["仄声"])

    # 去重（保持顺序）
    for tone in simplified:
        seen = set()
        unique_chars = []
        for char in simplified[tone]:
            if char not in seen:
                seen.add(char)
                unique_chars.append(char)
        simplified[tone] = "".join(unique_chars)

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(simplified, f, ensure_ascii=False, indent=2)

    print(f"已精简到 {output_file}")
    print(f"平声字数：{len(simplified['平声'])}")
    print(f"仄声字数：{len(simplified['仄声'])}")


if __name__ == "__main__":
    simplify_rhyme("Cilin_Rhyme.json", "Cilin_Rhyme_Simplified.json")
