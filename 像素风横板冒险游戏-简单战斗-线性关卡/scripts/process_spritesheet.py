"""
精灵表专用背景移除工具
只移除纯白色背景，保留角色像素
"""

from PIL import Image
import sys


def process_spritesheet(input_path, output_path=None, white_threshold=250):
    """
    处理精灵表，只移除纯白色背景
    """
    if output_path is None:
        output_path = input_path

    img = Image.open(input_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size

    # 只处理 R=G=B >= white_threshold 的像素（纯白色）
    for x in range(width):
        for y in range(height):
            r, g, b, a = pixels[x, y]

            # 只移除接近纯白的像素（R=G=B 都很高）
            if r >= white_threshold and g >= white_threshold and b >= white_threshold:
                # 检查是否是真正的白色背景（三个通道值非常接近）
                diff = max(abs(r-g), abs(g-b), abs(r-b))
                if diff < 10:  # 三个通道差异很小，认为是灰色/白色背景
                    pixels[x, y] = (r, g, b, 0)

    img.save(output_path, "PNG")
    print(f"Processed: {input_path}")
    return output_path


if __name__ == "__main__":
    files = [
        "assets/images/player_idle.png",
        "assets/images/player_walk.png",
        "assets/images/player_jump.png",
        "assets/images/player_attack.png"
    ]

    for f in files:
        process_spritesheet(f)
        # 验证处理结果
        img = Image.open(f)
        pixels = img.load()
        w, h = img.size
        frame_w = w // 4

        print(f"  Checking frames...")
        for i in range(4):
            # 检查每帧中心区域的像素
            cx = i * frame_w + frame_w // 2
            cy = h // 2
            r, g, b, a = pixels[cx, cy]
            status = "OK" if a > 0 else "TRANSPARENT!"
            print(f"    Frame {i} center ({cx},{cy}): alpha={a} [{status}]")
        print()
