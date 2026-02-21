"""
游戏音效生成器 - 使用 Python 标准库
"""
import wave
import struct
import math
import os
import random

# 确保输出目录存在
output_dir = os.path.dirname(os.path.abspath(__file__))

def write_wav(filename, sample_rate, samples):
    """写入 WAV 文件"""
    filepath = os.path.join(output_dir, filename)
    n_channels = 1
    sampwidth = 2  # 16-bit
    n_frames = len(samples)
    comptype = 'NONE'
    compname = 'not compressed'

    with wave.open(filepath, 'w') as wav_file:
        wav_file.setparams((n_channels, sampwidth, sample_rate, n_frames, comptype, compname))
        for sample in samples:
            # 归一化并转换为 16-bit
            s = max(-32768, min(32767, int(sample * 32767)))
            wav_file.writeframes(struct.pack('<h', s))

    print(f'Created: {filepath}')

def generate_jump():
    """跳跃音效 - 上升的音调"""
    sr = 44100
    duration = 0.2
    n_samples = int(sr * duration)
    samples = []

    for i in range(n_samples):
        t = i / sr
        # 上升频率
        freq = 300 + 400 * (t / duration) ** 2
        sample = math.sin(2 * math.pi * freq * t) * 0.5
        # 包络
        envelope = math.exp(-t * 10)
        samples.append(sample * envelope)

    write_wav('jump.wav', sr, samples)

def generate_attack():
    """攻击音效 - 快速的挥砍声"""
    sr = 44100
    duration = 0.15
    n_samples = int(sr * duration)
    samples = []

    random.seed(42)  # 可重复的噪声
    for i in range(n_samples):
        t = i / sr
        # 白噪声
        noise = random.uniform(-1, 1)
        # 调制
        freq_mod = 1000 * math.exp(-t * 20)
        sample = noise * math.sin(2 * math.pi * freq_mod * t) * 0.3
        # 包络
        envelope = math.exp(-t * 15)
        samples.append(sample * envelope)

    write_wav('attack.wav', sr, samples)

def generate_hit():
    """命中音效 - 短促的冲击声"""
    sr = 44100
    duration = 0.1
    n_samples = int(sr * duration)
    samples = []

    random.seed(43)
    for i in range(n_samples):
        t = i / sr
        # 低频冲击
        freq = 150 * math.exp(-t * 20)
        sample = math.sin(2 * math.pi * freq * t) * 0.8
        # 添加噪声
        noise = random.uniform(-1, 1) * 0.2
        # 包络
        envelope = math.exp(-t * 25)
        samples.append((sample + noise) * envelope)

    write_wav('hit.wav', sr, samples)

def generate_coin():
    """金币音效 - 清脆的金属声"""
    sr = 44100
    duration = 0.3
    n_samples = int(sr * duration)
    samples = []

    for i in range(n_samples):
        t = i / sr
        # 双音调（谐波）
        freq1 = 800
        freq2 = 1200
        sample = math.sin(2 * math.pi * freq1 * t) * 0.4
        sample += math.sin(2 * math.pi * freq2 * t) * 0.3
        # 包络
        envelope = math.exp(-t * 8)
        samples.append(sample * envelope)

    write_wav('coin.wav', sr, samples)

def generate_heal():
    """回血音效 - 温和的上升音"""
    sr = 44100
    duration = 0.4
    n_samples = int(sr * duration)
    samples = []

    for i in range(n_samples):
        t = i / sr
        # 上升的和弦
        freq1 = 400 + 200 * (t / duration)
        freq2 = freq1 * 1.5
        sample = math.sin(2 * math.pi * freq1 * t) * 0.3
        sample += math.sin(2 * math.pi * freq2 * t) * 0.2
        # 包络
        envelope = math.sin(math.pi * t / duration)
        samples.append(sample * envelope)

    write_wav('heal.wav', sr, samples)

def generate_hurt():
    """受伤音效 - 低沉的撞击声"""
    sr = 44100
    duration = 0.25
    n_samples = int(sr * duration)
    samples = []

    random.seed(44)
    for i in range(n_samples):
        t = i / sr
        # 低频振动
        freq = 100
        sample = math.sin(2 * math.pi * freq * t) * 0.6
        # 添加噪声
        noise = random.uniform(-1, 1) * 0.3 * math.exp(-t * 10)
        # 包络
        envelope = math.exp(-t * 8)
        samples.append((sample + noise) * envelope)

    write_wav('hurt.wav', sr, samples)

def generate_death():
    """死亡音效 - 下降的悲伤音"""
    sr = 44100
    duration = 0.6
    n_samples = int(sr * duration)
    samples = []

    for i in range(n_samples):
        t = i / sr
        # 下降频率
        freq = 400 * math.exp(-t * 2)
        sample = math.sin(2 * math.pi * freq * t) * 0.5
        # 添加低频
        low_freq = 80
        sample += math.sin(2 * math.pi * low_freq * t) * 0.3
        # 包络
        envelope = math.exp(-t * 3)
        samples.append(sample * envelope)

    write_wav('death.wav', sr, samples)

def generate_menu_select():
    """菜单选择音效 - 清脆的点击声"""
    sr = 44100
    duration = 0.1
    n_samples = int(sr * duration)
    samples = []

    for i in range(n_samples):
        t = i / sr
        # 短促的高频音
        freq = 600
        sample = math.sin(2 * math.pi * freq * t) * 0.4
        sample += math.sin(2 * math.pi * freq * 2 * t) * 0.2
        # 包络
        envelope = math.exp(-t * 20)
        samples.append(sample * envelope)

    write_wav('menu_select.wav', sr, samples)

if __name__ == '__main__':
    print('Generating game audio...')
    print(f'Output directory: {output_dir}')
    print()

    generate_jump()
    generate_attack()
    generate_hit()
    generate_coin()
    generate_heal()
    generate_hurt()
    generate_death()
    generate_menu_select()

    print()
    print('All audio files generated successfully!')
