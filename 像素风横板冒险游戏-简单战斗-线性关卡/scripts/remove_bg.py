"""
智能白色背景移除工具 - 专为像素风格游戏素材优化
Smart white background removal for pixel art game assets
"""

import os
import sys
from pathlib import Path
from PIL import Image


def remove_white_bg(input_path, output_path=None, tolerance=240, edge_softness=15):
    """
    移除白色背景，保留边缘细节

    Args:
        input_path: 输入图片路径
        output_path: 输出图片路径（可选，默认覆盖）
        tolerance: 白色阈值 (0-255)，越高越严格
        edge_softness: 边缘柔化程度
    """
    if output_path is None:
        output_path = input_path

    img = Image.open(input_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size

    # 第一步：检测白色背景
    for x in range(width):
        for y in range(height):
            r, g, b, a = pixels[x, y]

            # 计算亮度
            brightness = (r + g + b) / 3

            # 检测接近白色的像素
            if r >= tolerance and g >= tolerance and b >= tolerance:
                # 纯白 -> 完全透明
                pixels[x, y] = (r, g, b, 0)
            elif r >= tolerance - edge_softness and g >= tolerance - edge_softness and b >= tolerance - edge_softness:
                # 接近白色 -> 半透明（边缘抗锯齿）
                factor = (min(r, g, b) - (tolerance - edge_softness)) / edge_softness
                new_alpha = int(255 * (1 - factor))
                pixels[x, y] = (r, g, b, new_alpha)

    # 第二步：优化边缘（移除孤立的半透明像素）
    for x in range(1, width - 1):
        for y in range(1, height - 1):
            r, g, b, a = pixels[x, y]

            # 如果当前像素是半透明的
            if 0 < a < 255:
                # 检查周围8个像素
                neighbors = []
                for dx in [-1, 0, 1]:
                    for dy in [-1, 0, 1]:
                        if dx == 0 and dy == 0:
                            continue
                        neighbors.append(pixels[x + dx, y + dy][3])

                # 如果周围都是透明或不透明，说明是噪点
                transparent_count = sum(1 for n in neighbors if n < 128)
                opaque_count = sum(1 for n in neighbors if n >= 128)

                if transparent_count >= 6:
                    # 周围大多是透明的，把它也变透明
                    pixels[x, y] = (r, g, b, 0)
                elif opaque_count >= 6:
                    # 周围大多是不透明的，把它变不透明
                    pixels[x, y] = (r, g, b, 255)

    img.save(output_path, "PNG")
    return output_path


def batch_process(input_dir, output_dir=None, file_patterns=None):
    """批量处理目录下的图片"""
    if output_dir is None:
        output_dir = input_dir

    if file_patterns is None:
        file_patterns = ["*.png", "*.PNG"]

    input_path = Path(input_dir)
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # 收集所有文件
    files = []
    for pattern in file_patterns:
        files.extend(input_path.glob(pattern))

    print(f"Found {len(files)} files to process")

    for f in files:
        try:
            out_file = output_path / f.name
            print(f"Processing: {f.name}")
            remove_white_bg(str(f), str(out_file))
            print(f"  -> Saved: {out_file}")
        except Exception as e:
            print(f"  Error: {e}")

    print(f"\nDone! Processed {len(files)} files")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  Single file: python remove_bg.py input.png [output.png]")
        print("  Batch:       python remove_bg.py --batch input_dir/ [output_dir/]")
        sys.exit(1)

    if sys.argv[1] == "--batch":
        input_dir = sys.argv[2] if len(sys.argv) > 2 else "."
        output_dir = sys.argv[3] if len(sys.argv) > 3 else None
        batch_process(input_dir, output_dir)
    else:
        input_file = sys.argv[1]
        output_file = sys.argv[2] if len(sys.argv) > 2 else None
        remove_white_bg(input_file, output_file)
        print(f"Done: {output_file or input_file}")
