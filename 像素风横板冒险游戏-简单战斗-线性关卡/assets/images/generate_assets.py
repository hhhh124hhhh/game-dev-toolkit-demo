"""
像素风游戏素材生成器
使用 PIL 程序化生成游戏素材
"""
from PIL import Image, ImageDraw
import os

# 确保输出目录存在
output_dir = os.path.dirname(os.path.abspath(__file__))

def create_player_sprites():
    """创建玩家精灵图（4帧动画：idle, walk, jump, attack）"""
    frame_size = 64
    colors = {
        'body': (0, 255, 136),      # 绿色身体
        'outline': (0, 200, 100),   # 深绿轮廓
        'highlight': (150, 255, 200), # 高光
        'eye': (0, 0, 0),           # 眼睛
        'weapon': (255, 170, 0),    # 武器（橙色）
    }

    animations = {
        'player_idle': [(0, 0), (0, -2), (0, 0), (0, 2)],
        'player_walk': [(0, 0), (2, -1), (0, 0), (-2, -1)],
        'player_jump': [(0, 0), (0, -4), (0, -6), (0, -4)],
        'player_attack': [(0, 0), (4, 0), (6, 0), (2, 0)]
    }

    for anim_name, offsets in animations.items():
        # 创建4帧水平排列的精灵图
        spritesheet = Image.new('RGBA', (frame_size * 4, frame_size), (0, 0, 0, 0))

        for i, (ox, oy) in enumerate(offsets):
            frame = Image.new('RGBA', (frame_size, frame_size), (0, 0, 0, 0))
            draw = ImageDraw.Draw(frame)

            cx, cy = frame_size // 2 + ox, frame_size // 2 + oy
            radius = 18

            # 身体发光效果
            draw.ellipse([cx-radius-3, cy-radius-3, cx+radius+3, cy+radius+3],
                        fill=(*colors['body'], 100))

            # 身体
            draw.ellipse([cx-radius, cy-radius, cx+radius, cy+radius],
                        fill=colors['body'], outline=colors['outline'])

            # 高光
            draw.ellipse([cx-radius//2, cy-radius//2, cx, cy],
                        fill=colors['highlight'])

            # 眼睛
            draw.ellipse([cx+4, cy-4, cx+10, cy+2], fill=colors['eye'])
            draw.ellipse([cx+6, cy-3, cx+8, cy-1], fill=(255, 255, 255))

            # 攻击动画武器
            if anim_name == 'player_attack' and i > 0:
                weapon_x = cx + radius
                weapon_y = cy - 2
                draw.rectangle([weapon_x, weapon_y, weapon_x + 16, weapon_y + 4],
                              fill=colors['weapon'], outline=(200, 100, 0))

            # 粘贴到精灵图
            spritesheet.paste(frame, (i * frame_size, 0))

        # 保存
        filepath = os.path.join(output_dir, f'{anim_name}.png')
        spritesheet.save(filepath)
        print(f'Created: {filepath}')

def create_slime_sprite():
    """创建史莱姆敌人精灵图"""
    width, height = 32, 24
    img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 身体（半圆形）
    body_color = (68, 255, 68)
    draw.ellipse([0, 4, width, height + 8], fill=body_color, outline=(0, 200, 0))

    # 高光
    draw.ellipse([4, 8, 12, 14], fill=(150, 255, 150))

    # 眼睛
    draw.ellipse([8, 10, 12, 14], fill=(0, 0, 0))
    draw.ellipse([20, 10, 24, 14], fill=(0, 0, 0))
    draw.ellipse([9, 11, 11, 13], fill=(255, 255, 255))
    draw.ellipse([21, 11, 23, 13], fill=(255, 255, 255))

    filepath = os.path.join(output_dir, 'slime.png')
    img.save(filepath)
    print(f'Created: {filepath}')

def create_flyer_sprite():
    """创建飞行怪敌人精灵图"""
    width, height = 32, 28
    img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 身体
    body_color = (255, 68, 255)
    draw.ellipse([10, 10, 22, 20], fill=body_color, outline=(200, 0, 200))

    # 翅膀
    wing_color = (255, 100, 255)
    # 左翅膀
    draw.polygon([(10, 14), (0, 8), (0, 20)], fill=wing_color)
    # 右翅膀
    draw.polygon([(22, 14), (32, 8), (32, 20)], fill=wing_color)

    # 眼睛
    draw.ellipse([12, 12, 16, 16], fill=(255, 0, 0))
    draw.ellipse([18, 12, 22, 16], fill=(255, 0, 0))

    filepath = os.path.join(output_dir, 'flyer.png')
    img.save(filepath)
    print(f'Created: {filepath}')

def create_boss_sprite():
    """创建Boss精灵图"""
    width, height = 64, 80
    img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 身体
    body_color = (255, 68, 0)
    draw.rounded_rectangle([12, 28, 52, 76], radius=8, fill=body_color, outline=(200, 50, 0))

    # 头部
    draw.ellipse([16, 8, 48, 40], fill=body_color, outline=(200, 50, 0))

    # 角
    horn_color = (180, 50, 0)
    draw.polygon([(20, 16), (12, 0), (28, 16)], fill=horn_color)
    draw.polygon([(44, 16), (52, 0), (36, 16)], fill=horn_color)

    # 眼睛（愤怒的眼睛）
    draw.rectangle([20, 18, 28, 23], fill=(255, 0, 0))
    draw.rectangle([36, 18, 44, 23], fill=(255, 0, 0))

    # 手臂
    draw.ellipse([4, 36, 16, 52], fill=body_color)
    draw.ellipse([48, 36, 60, 52], fill=body_color)

    filepath = os.path.join(output_dir, 'boss.png')
    img.save(filepath)
    print(f'Created: {filepath}')

def create_coin_sprite():
    """创建金币精灵图"""
    size = 24
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    cx, cy = size // 2, size // 2
    radius = 10

    # 发光效果
    draw.ellipse([cx-radius-2, cy-radius-2, cx+radius+2, cy+radius+2],
                fill=(255, 215, 0, 150))

    # 主体
    draw.ellipse([cx-radius, cy-radius, cx+radius, cy+radius],
                fill=(255, 215, 0), outline=(200, 160, 0))

    # 高光
    draw.ellipse([cx-4, cy-4, cx, cy], fill=(255, 255, 150))

    # 金币符号
    draw.rectangle([cx-2, cy-5, cx+2, cy+5], fill=(200, 160, 0))

    filepath = os.path.join(output_dir, 'coin.png')
    img.save(filepath)
    print(f'Created: {filepath}')

def create_heart_sprite():
    """创建爱心精灵图"""
    size = 24
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    cx, cy = size // 2, size // 2 - 2

    # 心形（用两个圆和三角形组合）
    heart_color = (255, 68, 68)

    # 左圆
    draw.ellipse([cx-8, cy-4, cx, cy+4], fill=heart_color)
    # 右圆
    draw.ellipse([cx, cy-4, cx+8, cy+4], fill=heart_color)
    # 三角形底部
    draw.polygon([(cx-8, cy), (cx+8, cy), (cx, cy+10)], fill=heart_color)

    # 高光
    draw.ellipse([cx-5, cy-2, cx-2, cy+1], fill=(255, 150, 150))

    filepath = os.path.join(output_dir, 'heart.png')
    img.save(filepath)
    print(f'Created: {filepath}')

def create_platform_sprites():
    """创建平台精灵图"""
    # 普通平台
    width, height = 128, 16
    img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    platform_color = (74, 85, 104)
    draw.rounded_rectangle([0, 0, width-1, height-1], radius=4,
                          fill=platform_color, outline=(113, 128, 150))
    # 顶部高光
    draw.rounded_rectangle([2, 2, width-3, 6], radius=2, fill=(100, 116, 139))

    filepath = os.path.join(output_dir, 'platform.png')
    img.save(filepath)
    print(f'Created: {filepath}')

if __name__ == '__main__':
    print('Generating pixel art game assets...')
    print(f'Output directory: {output_dir}')
    print()

    create_player_sprites()
    create_slime_sprite()
    create_flyer_sprite()
    create_boss_sprite()
    create_coin_sprite()
    create_heart_sprite()
    create_platform_sprites()

    print()
    print('All assets generated successfully!')
