"""
素材处理脚本 - 裁切和缩放游戏素材
支持保持宽高比缩放
"""
import os
from PIL import Image

# 素材配置: (源文件, 目标尺寸, 目标文件名, 拟合模式)
# fit_mode:
#   None/'stretch' - 强制拉伸到目标尺寸（默认，可能变形）
#   'height'       - 按高度缩放，宽度按比例自动计算
#   'width'        - 按宽度缩放，高度按比例自动计算
#   'contain'      - 保持比例，适应框内
#   'cover'        - 保持比例，填满框（可能裁切）
ASSET_CONFIGS = [
    # 角色 - 缩放到 64x64（正方形，可以强制拉伸）
    (
        'assets/images/characters/character/character_cyberpunk_neon_glowing_cyan_ball_character_with_cute_eyes__game_icon_style__tran.png',
        (64, 64),
        'assets/images/processed/player.png',
        None  # 强制拉伸
    ),
    # 平台 - 按高度 20px 缩放，宽度自动（保持比例）
    (
        'assets/images/platforms/ui/ui_cyberpunk_neon_cyan_glowing_game_platform__horizontal_bar__sci-fi_style__game_UI_elemen.png',
        (9999, 20),  # 宽度会被重新计算
        'assets/images/processed/platform_normal.png',
        'height'  # 按高度缩放
    ),
    (
        'assets/images/platforms/ui/ui_cyberpunk_neon_green_glowing_bounce_game_platform_with_spring_effect__horizontal_bar__s.png',
        (9999, 20),
        'assets/images/processed/platform_bounce.png',
        'height'
    ),
    (
        'assets/images/platforms/ui/ui_cyberpunk_neon_purple_glowing_moving_game_platform_with_arrow_indicator__horizontal_bar.png',
        (9999, 20),
        'assets/images/processed/platform_moving.png',
        'height'
    ),
    # 能量球 - 缩放到 32x32（正方形）
    (
        'assets/images/items/item/item_blue_glowing_energy_orb_power-up__neon_style__game_item_icon__circle_with_upward_arro.png',
        (32, 32),
        'assets/images/processed/energy_doubleJump.png',
        None
    ),
    (
        'assets/images/items/item/item_purple_glowing_energy_orb_power-up_with_wings__neon_style__game_item_icon__transparen.png',
        (32, 32),
        'assets/images/processed/energy_flying.png',
        None
    ),
    (
        'assets/images/items/item/item_golden_glowing_energy_orb_power-up_with_shield_symbol__neon_style__game_item_icon__tr.png',
        (32, 32),
        'assets/images/processed/energy_shield.png',
        None
    ),
    (
        'assets/images/items/item/item_red_glowing_energy_orb_power-up_with_lightning_symbol__neon_style__game_item_icon__tr.png',
        (32, 32),
        'assets/images/processed/energy_speedBoost.png',
        None
    ),
    # 障碍物 - 缩放到 40x40（正方形）
    (
        'assets/images/obstacles/ui/ui_red_neon_glowing_spike_obstacle__triangle__game_hazard_element__transparent_background_.png',
        (40, 40),
        'assets/images/processed/spike.png',
        None
    ),
    # 背景 - 缩放到 480x800
    (
        'assets/images/backgrounds/scene/scene_cyberpunk_city_night_background__neon_lights__skyscraper_silhouettes__dark_blue_purp.png',
        (480, 800),
        'assets/images/processed/background.png',
        'cover'  # 填满框，可能裁切
    ),
]

def process_image(src_path, target_size, dst_path, fit_mode=None):
    """处理单个图片: 裁切透明边缘并缩放

    Args:
        src_path: 源文件路径
        target_size: 目标尺寸 (width, height)
        dst_path: 目标文件路径
        fit_mode: 拟合模式
            - None/'stretch': 强制拉伸（默认）
            - 'height': 按高度缩放，宽度自动
            - 'width': 按宽度缩放，高度自动
            - 'contain': 保持比例，适应框内
            - 'cover': 保持比例，填满框（可能裁切）
    """
    print(f"处理: {os.path.basename(src_path)}")

    # 打开图片
    img = Image.open(src_path)

    # 转换为 RGBA 模式
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    # 裁切透明边缘
    alpha = img.split()[-1]
    bbox = alpha.getbbox()
    if bbox:
        img = img.crop(bbox)

    original_width, original_height = img.size
    print(f"  裁切后尺寸: {original_width}x{original_height}")

    target_width, target_height = target_size

    # 计算最终尺寸
    if fit_mode == 'height':
        # 按高度缩放，宽度按比例
        ratio = target_height / original_height
        final_width = int(original_width * ratio)
        final_height = target_height
    elif fit_mode == 'width':
        # 按宽度缩放，高度按比例
        ratio = target_width / original_width
        final_width = target_width
        final_height = int(original_height * ratio)
    elif fit_mode == 'contain':
        # 保持比例，适应框内
        ratio = min(target_width / original_width, target_height / original_height)
        final_width = int(original_width * ratio)
        final_height = int(original_height * ratio)
    elif fit_mode == 'cover':
        # 保持比例，填满框（可能裁切）
        ratio = max(target_width / original_width, target_height / original_height)
        resize_width = int(original_width * ratio)
        resize_height = int(original_height * ratio)
        img = img.resize((resize_width, resize_height), Image.LANCZOS)
        # 居中裁切
        left = (resize_width - target_width) // 2
        top = (resize_height - target_height) // 2
        img = img.crop((left, top, left + target_width, top + target_height))
        final_width, final_height = target_width, target_height
    else:
        # 强制拉伸
        final_width, final_height = target_width, target_height

    # 缩放到最终尺寸（cover 模式已经在上面处理了）
    if fit_mode != 'cover':
        img = img.resize((final_width, final_height), Image.LANCZOS)

    print(f"  最终尺寸: {final_width}x{final_height}")

    # 确保目标目录存在
    os.makedirs(os.path.dirname(dst_path), exist_ok=True)

    # 保存
    img.save(dst_path)
    print(f"  保存到: {dst_path}")

def main():
    # 创建输出目录
    os.makedirs('assets/images/processed', exist_ok=True)

    for config in ASSET_CONFIGS:
        if len(config) == 4:
            src_path, target_size, dst_path, fit_mode = config
        else:
            src_path, target_size, dst_path = config
            fit_mode = None

        if os.path.exists(src_path):
            process_image(src_path, target_size, dst_path, fit_mode)
        else:
            print(f"文件不存在: {src_path}")

    print("\n所有素材处理完成!")

if __name__ == '__main__':
    main()
