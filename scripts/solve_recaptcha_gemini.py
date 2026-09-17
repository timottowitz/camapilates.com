import os, sys, base64, json, urllib.request, re

def solve_recaptcha(image_path, instruction, tile_count=9):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable not set")

    with open(image_path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode("utf-8")

    if tile_count == 16:
        grid_desc = """This challenge is a 4x4 grid of 16 squares (one split image), indexed 0 to 15 as follows:
Row 0 (top):    [ 0,  1,  2,  3]
Row 1:          [ 4,  5,  6,  7]
Row 2:          [ 8,  9, 10, 11]
Row 3 (bottom): [12, 13, 14, 15]

Carefully examine each square (0 through 15). Any square that contains ANY part of the requested object must be included.
Return ONLY a valid JSON array of integers from 0 to 15, for example: [5, 6, 7, 9, 10] or []. If none contain it, return []."""
    else:
        grid_desc = """This challenge is a 3x3 grid of 9 separate image tiles, indexed 0 to 8 as follows:
Row 0 (top):    [0, 1, 2]
Row 1:          [3, 4, 5]
Row 2 (bottom): [6, 7, 8]

Carefully examine each tile (0 through 8). Any tile that contains the requested object must be included.
Return ONLY a valid JSON array of integers from 0 to 8, for example: [1, 6, 8] or []. If none contain it, return []."""

    prompt = f"""You are an expert computer vision assistant solving a Google reCAPTCHA.
Look at this challenge screenshot.

The user instruction is: "{instruction}".

{grid_desc}

Do NOT include explanations or markdown, just the JSON array of numbers."""

    payload = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {"inline_data": {"mime_type": "image/png", "data": img_b64}}
            ]
        }],
        "generationConfig": {"temperature": 0.0}
    }

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        text = data["candidates"][0]["content"]["parts"][0]["text"].strip()

    match = re.search(r"\[[0-9,\s]*\]", text)
    if match:
        return match.group(0)
    return "[]"

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python solve_recaptcha_gemini.py <image_path> <instruction> [tile_count]")
        sys.exit(1)
    
    img_path = sys.argv[1]
    instr = sys.argv[2]
    count = int(sys.argv[3]) if len(sys.argv) > 3 else 9
    result = solve_recaptcha(img_path, instr, count)
    print(result)
