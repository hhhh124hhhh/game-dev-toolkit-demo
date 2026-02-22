# 🎮 Game Dev Toolkit Demo

**游戏开发套件 (Game Development Toolkit) Skill 的完整演示仓库**

包含 11 个不同类型的游戏项目，全面展示 Claude Code 游戏开发工具链的能力。

## 📊 项目统计

| 统计项 | 数量 |
|--------|------|
| 游戏项目 | 11 个 |
| 游戏引擎 | Phaser 3, Three.js |
| 编程语言 | JavaScript, Swift 5 |
| 测试框架 | Jest, Vitest |

## 🎯 游戏项目

### 平台跳跃类

#### [Neon Fall 100](./neon-fall-100)
**霓虹坠落 - 100层挑战**

融合"是男人就下一百层"经典玩法与赛博朋克霓虹风格的平台跳跃游戏。

- **技术栈**: Phaser 3 + Vite
- **特点**: 霓虹视觉效果、渐进式难度、单元测试覆盖

```bash
cd neon-fall-100 && npm install && npm run dev
```

#### [像素风横板冒险游戏](./像素风横板冒险游戏-简单战斗-线性关卡)
**横版动作冒险 - 平台跳跃**

像素风格的横版动作冒险游戏，融合平台跳跃与简单战斗系统。

- **技术栈**: Phaser 3 + Vite
- **特点**: 线性关卡设计、战斗系统、场景管理、本地存储

```bash
cd 像素风横板冒险游戏-简单战斗-线性关卡 && npm install && npm run dev
```

#### [3D Platformer](./3d-platformer)
**3D 平台跳跃游戏**

使用 Three.js 开发的 3D 平台跳跃游戏。

- **技术栈**: Three.js + Vite
- **特点**: 3D 玩家控制、相机系统、视觉特效

```bash
cd 3d-platformer && npm install && npm run dev
```

### 策略类

#### [Pixel Tower Defense](./pixel-tower-defense)
**像素风塔防游戏**

像素风格的塔防游戏，支持单人及多人对战模式。

- **技术栈**: Phaser 3 + Socket.io + Express
- **特点**: 多人功能预留、波次管理、经济系统

```bash
cd pixel-tower-defense && npm install && npm run dev
```

#### [Card Battle](./card-battle)
**卡牌对战游戏**

回合制卡牌对战游戏，包含牌组管理和卡牌效果系统。

- **技术栈**: Phaser 3 + Vite
- **特点**: 卡牌效果系统、回合管理、敌人 AI

```bash
cd card-battle && npm install && npm run dev
```

### 休闲类

#### [Match 3 Game](./match-3-game)
**三消游戏**

经典三消益智游戏。

- **技术栈**: Phaser 3 + Vite
- **特点**: 匹配检测、消除动画、计分系统

```bash
cd match-3-game && npm install && npm run dev
```

#### [Breakout](./breakout)
**打砖块游戏**

经典打砖块街机游戏。

- **技术栈**: Phaser 3 + Vite
- **特点**: 物理碰撞、关卡系统、计分

```bash
cd breakout && npm install && npm run dev
```

#### [Pong](./pong)
**经典乒乓球游戏**

经典街机乒乓球游戏的现代实现。

- **技术栈**: Phaser 3 + Vite
- **特点**: 双人对战、简洁视觉设计

```bash
cd pong && npm install && npm run dev
```

### 动作类

#### [Space Shooter](./space-shooter)
**太空射击游戏**

纵向卷轴太空射击游戏。

- **技术栈**: Phaser 3 + Vite
- **特点**: 子弹池系统、敌人波次、Boss 战

```bash
cd space-shooter && npm install && npm run dev
```

#### [Shadow Forest](./shadow-forest)
**暗影森林**

横版动作冒险游戏，探索神秘的暗影森林。

- **技术栈**: Phaser 3 + Vite + Vitest
- **特点**: 战斗系统、HUD 界面、暂停菜单

```bash
cd shadow-forest && npm install && npm run dev
```

### 教程项目

#### [RetroRampage](./RetroRampage)
**Wolfenstein 3D 风格 FPS 教程**

使用 Swift 5 开发的复古 FPS 游戏，基于 Wolfenstein 3D 风格。

- **技术栈**: Swift 5
- **特点**: 完整教程源码、视频教程系列、光线投射渲染

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| **游戏引擎** | [Phaser 3](https://phaser.io/), [Three.js](https://threejs.org/) |
| **构建工具** | [Vite](https://vitejs.dev/) |
| **后端服务** | Express, Socket.io |
| **测试框架** | Jest, Vitest |
| **编程语言** | JavaScript (ES6+), Swift 5 |

## 📦 开发工具链

本项目使用以下 Claude Code Skills 开发：

| Skill | 用途 |
|-------|------|
| `game-development-orchestrator` | 游戏开发调度器 - 全自动开发工作流 |
| `phaser-gamedev` | Phaser 3 开发指南和最佳实践 |
| `game-asset-generator` | 游戏素材生成（角色、场景、UI） |
| `game-audio-generator` | 游戏音频生成（音效、背景音乐） |
| `game-automation-testing` | 游戏自动化测试 |

## 🚀 快速开始

1. **克隆仓库**
```bash
git clone https://github.com/hhhh124hhhh/game-dev-toolkit-demo.git
cd game-dev-toolkit-demo
```

2. **选择并运行游戏**
```bash
cd <游戏目录>  # 例如: cd neon-fall-100
npm install
npm run dev
```

3. **运行测试**（如果该游戏有测试）
```bash
npm test
```

## 📄 许可证

MIT License

---

**由 Claude Code + Game Development Toolkit Skill 开发**
