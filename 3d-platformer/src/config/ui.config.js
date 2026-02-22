/**
 * ui.config.js - UI 配置系统
 * 统一管理和主题化所有 UI 元素
 */

export const UI_CONFIG = {
  // 主题颜色
  colors: {
    primary: '#ff6600',      // 主色调（玩家颜色）
    secondary: '#00ff88',    // 次要色（平台颜色）
    accent: '#ffdd00',         // 强调色（金币颜色）
    background: '#1a1a2e',     // 背景色
    text: {
      primary: '#ffffff',      // 主文本
      secondary: '#888888',    // 次要文本
      accent: '#ffdd00'        // 强调文本
    },
    states: {
      success: '#00ff00',      // 成功状态
      warning: '#ffaa00',      // 警告状态
      danger: '#ff4444',       // 危险状态
      info: '#00aaff'          // 信息状态
    }
  },

  // 字体配置
  fonts: {
    family: {
      primary: 'Arial, Microsoft YaHei, sans-serif',
      mono: 'Consolas, Monaco, monospace'
    },
    sizes: {
      xs: '12px',
      sm: '14px',
      md: '18px',
      lg: '24px',
      xl: '32px',
      xxl: '48px'
    },
    weights: {
      normal: 400,
      medium: 500,
      bold: 700
    }
  },

  // 间距系统
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },

  // UI 元素样式
  components: {
    // 文本样式
    text: {
      score: {
        fontSize: '24px',
        fill: '#ffffff',
        fontFamily: 'Arial, Microsoft YaHei, sans-serif',
        fontStyle: 'bold'
      },
      coins: {
        fontSize: '18px',
        fill: '#ffdd00',
        fontFamily: 'Arial, Microsoft YaHei, sans-serif'
      },
      help: {
        fontSize: '14px',
        fill: '#888888',
        fontFamily: 'Arial, Microsoft YaHei, sans-serif'
      },
      title: {
        fontSize: '48px',
        fill: '#ff4444',
        fontFamily: 'Arial, Microsoft YaHei, sans-serif',
        fontStyle: 'bold'
      }
    },

    // 按钮样式
    button: {
      primary: {
        backgroundColor: '#ff6600',
        color: '#ffffff',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '18px',
        fontWeight: 'bold',
        hover: {
          backgroundColor: '#ff8833',
          transform: 'scale(1.05)'
        },
        active: {
          backgroundColor: '#cc5500',
          transform: 'scale(0.95)'
        }
      }
    },

    // 面板样式
    panel: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: '12px',
      padding: '24px',
      border: '2px solid rgba(255, 255, 255, 0.1)'
    }
  },

  // 动画配置
  animations: {
    durations: {
      fast: 100,
      normal: 300,
      slow: 500,
      verySlow: 1000
    },
    easings: {
      linear: 'Linear',
      easeIn: 'Power2.easeIn',
      easeOut: 'Power2.easeOut',
      easeInOut: 'Power2.easeInOut',
      bounce: 'Bounce.easeOut',
      elastic: 'Elastic.easeOut'
    }
  },

  // 响应式断点
  breakpoints: {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    wide: 1440
  }
};

// 主题切换函数
export function applyTheme(themeName) {
  const themes = {
    default: UI_CONFIG,
    dark: {
      ...UI_CONFIG,
      colors: {
        ...UI_CONFIG.colors,
        background: '#0a0a0f',
        text: {
          ...UI_CONFIG.colors.text,
          primary: '#e0e0e0'
        }
      }
    },
    light: {
      ...UI_CONFIG,
      colors: {
        ...UI_CONFIG.colors,
        background: '#f5f5f5',
        text: {
          ...UI_CONFIG.colors.text,
          primary: '#333333'
        }
      }
    }
  };

  return themes[themeName] || UI_CONFIG;
}

// 工具函数：创建样式对象
export function createStyle(styleConfig) {
  return {
    fontFamily: styleConfig.fontFamily || UI_CONFIG.fonts.family.primary,
    fontSize: styleConfig.fontSize || UI_CONFIG.fonts.sizes.md,
    color: styleConfig.fill || UI_CONFIG.colors.text.primary,
    fontStyle: styleConfig.fontStyle || 'normal',
    fontWeight: styleConfig.fontWeight || UI_CONFIG.fonts.weights.normal
  };
}

// 工具函数：创建文本配置
export function createTextConfig(text, styleName, options = {}) {
  const style = UI_CONFIG.components.text[styleName] || UI_CONFIG.components.text.help;
  
  return {
    text,
    style: {
      ...style,
      ...options
    }
  };
}
