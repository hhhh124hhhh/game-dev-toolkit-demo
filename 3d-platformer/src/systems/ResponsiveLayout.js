/**
 * ResponsiveLayout - 响应式布局系统
 * 处理不同屏幕尺寸下的游戏布局适配
 */

export class ResponsiveLayout {
  constructor(game) {
    this.game = game;
    this.scale = game.scale;
    
    // 基础设计尺寸（参考尺寸）
    this.baseWidth = 800;
    this.baseHeight = 600;
    
    // 当前缩放比例
    this.scaleX = 1;
    this.scaleY = 1;
    
    // 监听尺寸变化
    this.setupResizeListener();
    
    // 初始化
    this.calculateScale();
  }

  /**
   * 设置尺寸变化监听
   */
  setupResizeListener() {
    window.addEventListener('resize', () => {
      this.calculateScale();
    });

    // Phaser 的 scale 事件
    this.scale.on('resize', this.calculateScale, this);
  }

  /**
   * 计算当前缩放比例
   */
  calculateScale() {
    const width = this.scale.width || window.innerWidth;
    const height = this.scale.height || window.innerHeight;
    
    this.scaleX = width / this.baseWidth;
    this.scaleY = height / this.baseHeight;
    
    // 使用较小的缩放比例保持 UI 比例
    this.uniformScale = Math.min(this.scaleX, this.scaleY);
    
    return {
      scaleX: this.scaleX,
      scaleY: this.scaleY,
      uniformScale: this.uniformScale,
      width: width,
      height: height
    };
  }

  /**
   * 将设计坐标转换为屏幕坐标
   * @param {number} x - 设计坐标 X
   * @param {number} y - 设计坐标 Y
   * @returns {Object} - 屏幕坐标 {x, y}
   */
  toScreen(x, y) {
    return {
      x: x * this.scaleX,
      y: y * this.scaleY
    };
  }

  /**
   * 使用统一缩放的坐标转换（保持 UI 比例）
   * @param {number} x - 设计坐标 X
   * @param {number} y - 设计坐标 Y
   * @returns {Object} - 屏幕坐标 {x, y}
   */
  toScreenUniform(x, y) {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    
    return {
      x: centerX + (x - this.baseWidth / 2) * this.uniformScale,
      y: centerY + (y - this.baseHeight / 2) * this.uniformScale
    };
  }

  /**
   * 获取字体大小（根据屏幕尺寸调整）
   * @param {number} baseSize - 基础字体大小
   * @returns {string} - 调整后的字体大小（带单位）
   */
  getFontSize(baseSize) {
    const adjustedSize = Math.round(baseSize * this.uniformScale);
    return `${adjustedSize}px`;
  }

  /**
   * 获取间距（根据屏幕尺寸调整）
   * @param {number} baseSpacing - 基础间距
   * @returns {number} - 调整后的间距
   */
  getSpacing(baseSpacing) {
    return Math.round(baseSpacing * this.uniformScale);
  }

  /**
   * 创建响应式文本配置
   * @param {Object} config - 文本配置
   * @returns {Object} - 响应式文本配置
   */
  createResponsiveText(config) {
    return {
      ...config,
      fontSize: this.getFontSize(parseInt(config.fontSize) || 16),
      x: config.x !== undefined ? this.toScreenUniform(config.x, 0).x : undefined,
      y: config.y !== undefined ? this.toScreenUniform(0, config.y).y : undefined
    };
  }

  /**
   * 销毁并清理
   */
  destroy() {
    window.removeEventListener('resize', this.calculateScale);
    if (this.scale) {
      this.scale.off('resize', this.calculateScale, this);
    }
  }
}

/**
 * 响应式布局混入（用于场景类）
 */
export const ResponsiveMixin = {
  /**
   * 初始化响应式布局
   */
  initResponsive() {
    this.responsive = new ResponsiveLayout(this);
    
    // 响应式字体大小辅助方法
    this.getFontSize = (size) => this.responsive.getFontSize(size);
    this.getSpacing = (spacing) => this.responsive.getSpacing(spacing);
    this.toScreen = (x, y) => this.responsive.toScreen(x, y);
    this.toScreenUniform = (x, y) => this.responsive.toScreenUniform(x, y);
  },

  /**
   * 创建响应式文本
   */
  createResponsiveText(x, y, text, style = {}) {
    const responsiveStyle = {
      ...style,
      fontSize: this.getFontSize(parseInt(style.fontSize) || 16)
    };

    const pos = this.toScreenUniform(x, y);
    return this.add.text(pos.x, pos.y, text, responsiveStyle);
  }
};
