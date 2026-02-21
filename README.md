# 🎮 Game Dev Toolkit Demo

这是 **游戏开发套件 (Game Development Toolkit) Skill** 的演示项目，展示了使用 Claude Code 游戏开发工具链创建的多个游戏示例。

## 🎯 项目列表

### [Neon Fall 100](./neon-fall-100)
**霓虹坠落 - 100层挑战**

一款创新的平台跳跃游戏，融合了"是男人就下一百层"的经典玩法与赛博朋克霓虹风格。

- **技术栈**: Phaser 3 + Vite
- **特点**:
  - 霓虹视觉效果
  - 渐进式难度
  - 完整的游戏循环
  - 单元测试覆盖

```bash
cd neon-fall-100
npm install
npm run dev
```

### [Pong](./pong)
**经典乒乓球游戏**

经典街机游戏的现代实现，使用 Phaser 3 框架。

- **技术栈**: Phaser 3 + Vite
- **特点**:
  - 双人对战
  - 简洁的视觉设计

```bash
cd pong
npm install
npm run dev
```

### [像素风横板冒险游戏](./像素风横板冒险游戏-简单战斗-线性关卡)
**横版动作冒险 - 平台跳跃**

一款像素风格的横版动作冒险游戏，融合平台跳跃与简单战斗系统。

- **技术栈**: Phaser 3 + Vite + TypeScript
- **特点**:
  - 线性关卡设计
  - 简单战斗系统
  - 完整的场景管理
  - 本地高分存储

```bash
cd 像素风横板冒险游戏-简单战斗-线性关卡
npm install
npm run dev
```

### [Pixel Tower Defense](./pixel-tower-defense)
**像素风塔防游戏**

一款像素风格的塔防游戏，支持单人及多人对战模式。

- **技术栈**: Phaser 3 + Vite + TypeScript + Socket.io
- **特点**:
  - 像素风视觉设计
  - 多人功能预留
  - Vitest 测试框架
  - Express 后端服务

```bash
cd pixel-tower-defense
npm install
npm run dev
```

### [RetroRampage](./RetroRampage)
**Wolfenstein 3D 风格 FPS 教程**

使用 Swift 5 开发的复古 FPS 游戏，基于 Wolfenstein 3D 风格。

- **技术栈**: Swift 5
- **特点**:
  - 完整教程源码
  - 视频教程系列
  - 光线投射渲染

## 🛠️ 技术栈

- **游戏引擎**: [Phaser 3](https://phaser.io/)
- **构建工具**: [Vite](https://vitejs.dev/)
- **开发辅助**: Claude Code + Game Development Toolkit Skill

## 📦 开发工具链

本项目使用以下 Claude Code Skills 开发：

- `game-development-orchestrator` - 游戏开发调度器
- `phaser-gamedev` - Phaser 3 开发指南
- `game-asset-generator` - 游戏素材生成
- `game-audio-generator` - 游戏音频生成
- `game-automation-testing` - 游戏自动化测试

## 🚀 快速开始

1. 克隆仓库
```bash
git clone https://github.com/你的用户名/game-dev-toolkit-demo.git
cd game-dev-toolkit-demo
```

2. 选择一个游戏并运行
```bash
cd neon-fall-100  # 或 cd pong, cd pixel-tower-defense 等
npm install
npm run dev
```

## 📄 许可证

MIT License
