/**
 * GameStyles.js - 暗黑金色高级风格 UI 样式配置
 *
 * 设计理念:
 * - 简约克制，避免"AI感"
 * - 深灰背景 + 金色强调 + 白字
 * - 清晰易读，正文用无衬线字体
 * - 优雅交互，微妙悬停效果
 */

// 配色方案 - 暗黑金色高级风格
export const Colors = {
  // 主色调 - 金色系
  gold: 0xd4af37,         // 经典金色
  goldLight: 0xe6c547,    // 亮金（悬停）
  goldDark: 0xb8962f,     // 暗金

  // CSS 格式
  css: {
    gold: '#d4af37',
    goldLight: '#e6c547',
    goldDark: '#b8962f',
  },

  // 背景色
  bg: {
    dark: 0x0d0d0d,       // 最深背景
    panel: 0x1a1a1a,      // 面板背景
    overlay: 0x000000,    // 遮罩
  },

  // CSS 背景色
  bgCss: {
    dark: '#0d0d0d',
    panel: '#1a1a1a',
    overlay: '#000000',
  },

  // 文字色
  text: {
    primary: '#ffffff',    // 主要文字
    secondary: '#cccccc',  // 次要文字
    accent: '#d4af37',     // 强调文字（金色）
    muted: '#888888',      // 弱化文字
    disabled: '#666666',   // 禁用文字
  },

  // UI 元素色
  ui: {
    buttonBg: 0x1a1a1a,
    buttonBgHover: 0x2a2a2a,
    buttonBgActive: 0x3a3a3a,
    buttonBorder: 0xd4af37,
    sliderBg: 0x2a2a2a,
    sliderFill: 0xd4af37,
    toggleOn: 0xd4af37,
    toggleOff: 0x333333,
  }
};

// 字体配置
export const Fonts = {
  // 主字体 (像素风 - 仅用于标题)
  pixel: '"Press Start 2P", monospace',

  // 正文字体 (清晰易读)
  primary: 'Arial, "Microsoft YaHei", sans-serif',

  // 备用字体
  fallback: 'Arial, sans-serif',

  // 字体大小 - 确保清晰可读
  sizes: {
    small: 14,
    normal: 16,
    medium: 18,
    large: 22,
    title: 28,
    hero: 40,
  },

  // 预设样式
  styles: {
    title: {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '28px',
      color: '#ffffff',
    },
    subtitle: {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#d4af37',
    },
    button: {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#ffffff',
    },
    label: {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#ffffff',
    },
    small: {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#cccccc',
    },
  }
};

// 按钮配置
export const ButtonStyles = {
  width: 200,
  height: 48,
  cornerRadius: 4,

  // 颜色
  bg: Colors.ui.buttonBg,
  bgHover: Colors.ui.buttonBgHover,
  bgActive: Colors.ui.buttonBgActive,
  border: Colors.ui.buttonBorder,
  borderHover: Colors.goldLight,

  // 文字
  text: '#ffffff',
  textHover: '#ffffff',
};

// 滑动条配置
export const SliderStyles = {
  width: 180,
  height: 28,
  trackHeight: 10,
  handleSize: 18,
  cornerRadius: 2,

  // 颜色
  trackBg: Colors.ui.sliderBg,
  fill: Colors.ui.sliderFill,
  handle: 0xffffff,
  handleHover: Colors.goldLight,
};

// 开关配置
export const ToggleStyles = {
  width: 56,
  height: 28,
  handleSize: 20,
  cornerRadius: 4,

  // 颜色
  bgOn: Colors.ui.toggleOn,
  bgOff: Colors.ui.toggleOff,
  handle: 0xffffff,
};

// 动画配置 - 简化，去掉花哨效果
export const Animations = {
  fadeIn: 200,
  fadeOut: 150,
  buttonPress: 50,
  hoverTransition: 100,
};

/**
 * UI 工厂类 - 创建统一样式的 UI 组件
 */
export class UIFactory {
  /**
   * 创建简约按钮
   */
  static createButton(scene, x, y, text, callback, options = {}) {
    const width = options.width || ButtonStyles.width;
    const height = options.height || ButtonStyles.height;
    const style = options.style || 'primary'; // primary, secondary

    // 根据样式选择边框颜色
    const borderColor = style === 'secondary' ? 0x666666 : ButtonStyles.border;
    const borderHover = style === 'secondary' ? 0x888888 : ButtonStyles.borderHover;

    // 按钮背景
    const bg = scene.add.rectangle(0, 0, width, height, ButtonStyles.bg, 1);
    bg.setStrokeStyle(2, borderColor);

    // 按钮文字 - 使用清晰字体
    const label = scene.add.text(0, 0, text, {
      fontFamily: Fonts.primary,
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // 容器
    const container = scene.add.container(x, y, [bg, label]);
    container.bg = bg;
    container.label = label;

    // 交互
    bg.setInteractive({ useHandCursor: true });

    // 悬停效果 - 简洁微妙
    bg.on('pointerover', () => {
      bg.setFillStyle(ButtonStyles.bgHover, 1);
      bg.setStrokeStyle(2, borderHover);
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(ButtonStyles.bg, 1);
      bg.setStrokeStyle(2, borderColor);
    });

    // 点击效果
    bg.on('pointerdown', () => {
      scene.tweens.add({
        targets: container,
        scale: 0.97,
        duration: Animations.buttonPress,
        yoyo: true,
        onComplete: callback
      });
    });

    return container;
  }

  /**
   * 创建简约滑动条
   */
  static createSlider(scene, x, y, label, value, min, max, onChange) {
    const container = scene.add.container(x, y);

    // 标签 - 清晰字体
    const labelText = scene.add.text(0, 0, label, {
      fontFamily: Fonts.primary,
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0, 0.5);
    container.add(labelText);

    // 滑动条轨道
    const trackX = 130;
    const track = scene.add.rectangle(trackX, 0, SliderStyles.width, SliderStyles.trackHeight, SliderStyles.trackBg, 1);
    container.add(track);

    // 填充条
    const fillWidth = ((value - min) / (max - min)) * SliderStyles.width;
    const fill = scene.add.rectangle(
      trackX - SliderStyles.width / 2 + fillWidth / 2,
      0,
      fillWidth,
      SliderStyles.trackHeight - 2,
      SliderStyles.fill,
      1
    );
    container.add(fill);

    // 滑块手柄
    const handleX = trackX - SliderStyles.width / 2 + fillWidth;
    const handle = scene.add.rectangle(handleX, 0, SliderStyles.handleSize, SliderStyles.handleSize, SliderStyles.handle);
    handle.setStrokeStyle(2, SliderStyles.fill);
    container.add(handle);

    // 数值显示
    const valueText = scene.add.text(trackX + SliderStyles.width / 2 + 15, 0, Math.round(value * 100) + '%', {
      fontFamily: Fonts.primary,
      fontSize: '14px',
      color: '#d4af37',
    }).setOrigin(0, 0.5);
    container.add(valueText);

    // 交互
    const hitArea = scene.add.rectangle(trackX, 0, SliderStyles.width + 20, 30, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    container.add(hitArea);

    let isDragging = false;

    const updateSlider = (pointerX) => {
      const startX = x + trackX - SliderStyles.width / 2;
      let newValue = (pointerX - startX) / SliderStyles.width;
      newValue = Phaser.Math.Clamp(newValue, 0, 1);
      const actualValue = min + newValue * (max - min);

      // 更新视觉
      const newFillWidth = newValue * SliderStyles.width;
      fill.setSize(newFillWidth, SliderStyles.trackHeight - 2);
      fill.setPosition(trackX - SliderStyles.width / 2 + newFillWidth / 2, 0);
      handle.setPosition(trackX - SliderStyles.width / 2 + newFillWidth, 0);
      valueText.setText(Math.round(actualValue * 100) + '%');

      if (onChange) onChange(actualValue);
    };

    hitArea.on('pointerdown', (pointer) => {
      isDragging = true;
      updateSlider(pointer.x);
    });

    hitArea.on('pointermove', (pointer) => {
      if (isDragging) {
        updateSlider(pointer.x);
      }
    });

    scene.input.on('pointerup', () => {
      isDragging = false;
    });

    return container;
  }

  /**
   * 创建简约开关
   */
  static createToggle(scene, x, y, label, value, onChange) {
    const container = scene.add.container(x, y);

    // 标签
    const labelText = scene.add.text(0, 0, label, {
      fontFamily: Fonts.primary,
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0, 0.5);
    container.add(labelText);

    // 开关背景
    const toggleX = 180;
    const bg = scene.add.rectangle(toggleX, 0, ToggleStyles.width, ToggleStyles.height,
      value ? ToggleStyles.bgOn : ToggleStyles.bgOff, 1);
    bg.setStrokeStyle(2, value ? Colors.gold : 0x555555);
    container.add(bg);

    // 开关手柄
    const handleX = value ? toggleX + 12 : toggleX - 12;
    const handle = scene.add.rectangle(handleX, 0, ToggleStyles.handleSize - 4, ToggleStyles.handleSize - 4,
      ToggleStyles.handle);
    container.add(handle);

    // 状态指示
    const statusText = scene.add.text(toggleX + ToggleStyles.width / 2 + 15, 0, value ? '开' : '关', {
      fontFamily: Fonts.primary,
      fontSize: '14px',
      color: value ? '#d4af37' : '#888888',
    }).setOrigin(0, 0.5);
    container.add(statusText);

    // 交互
    bg.setInteractive({ useHandCursor: true });

    bg.on('pointerdown', () => {
      const newValue = !value;
      value = newValue;

      // 更新视觉
      bg.setFillStyle(newValue ? ToggleStyles.bgOn : ToggleStyles.bgOff);
      bg.setStrokeStyle(2, newValue ? Colors.gold : 0x555555);
      statusText.setText(newValue ? '开' : '关');
      statusText.setColor(newValue ? '#d4af37' : '#888888');

      scene.tweens.add({
        targets: handle,
        x: newValue ? toggleX + 12 : toggleX - 12,
        duration: 100,
      });

      if (onChange) onChange(newValue);
    });

    return container;
  }

  /**
   * 创建简洁背景
   */
  static createSimpleBackground(scene, width, height) {
    // 纯色背景
    const bg = scene.add.rectangle(width / 2, height / 2, width, height, Colors.bg.dark, 1);

    // 可选：添加微妙的顶部渐变
    const topGradient = scene.add.rectangle(width / 2, 60, width, 120, Colors.bg.panel, 0.3);

    return { bg, topGradient };
  }
}

/**
 * 创建场景背景 - 简化版
 */
export function createSceneBackground(scene, width, height) {
  // 纯色背景
  const bg = scene.add.rectangle(width / 2, height / 2, width, height, Colors.bg.dark, 1);

  // 微妙的顶部渐变效果
  const topGradient = scene.add.rectangle(width / 2, 50, width, 100, Colors.bg.panel, 0.5);

  return bg;
}

/**
 * 简单的按钮悬停效果
 */
export function applyButtonHover(scene, button) {
  button.bg.on('pointerover', () => {
    button.bg.setFillStyle(ButtonStyles.bgHover, 1);
  });

  button.bg.on('pointerout', () => {
    button.bg.setFillStyle(ButtonStyles.bg, 1);
  });
}

// 导出默认配置
export default {
  Colors,
  Fonts,
  ButtonStyles,
  SliderStyles,
  ToggleStyles,
  Animations,
  UIFactory,
  createSceneBackground,
  applyButtonHover,
};
