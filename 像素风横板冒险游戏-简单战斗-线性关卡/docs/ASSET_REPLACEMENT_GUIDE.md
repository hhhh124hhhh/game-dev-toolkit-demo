# 免费素材替换指南

## 问题背景

AI 生成的精灵图素材存在**动画帧不连贯**的问题，导致玩家动画切换时卡顿。

解决方案：使用专业像素画师制作的免费素材。

---

## 推荐素材来源

### 方案 A: CraftPix.net - Free Simple Platformer Game Kit ⭐ 最推荐

**下载地址**: https://craftpix.net/freebies/free-simple-platformer-game-kit-pixel-art/

**优点**:
- 完全免费，支持商用
- 多个角色可选（西装男、狐狸、机器人）
- 动画完整：idle, walk, run, jump, fall, attack, hit
- PNG 格式，透明背景

**使用步骤**:
1. 访问链接，点击 "Free Download"
2. 解压下载的 ZIP 文件
3. 找到角色文件夹（如 `Character/Man in business suit/`）
4. 提取动画帧并合成精灵图

---

### 方案 B: CraftPix.net - Free Tiny Pixel Hero with Melee Attacks

**下载地址**: https://craftpix.net/freebies/free-tiny-pixel-hero-sprites-with-melee-attacks/

**优点**:
- 专门的战士角色
- 包含近战攻击动画
- 像素风格一致

---

### 方案 C: Kenney.nl - Platformer Art: Pixel Edition (CC0)

**下载地址**: https://opengameart.org/content/platformer-art-pixel-edition

**优点**:
- CC0 协议，无需署名
- 380+ 素材
- 包含角色、敌人、道具

**缺点**:
- 角色动画帧需要自己从大图中切分
- 角色较小（可能需要调整碰撞盒）

---

## 素材替换步骤

### Step 1: 下载素材

选择上述任一方案下载素材包。

### Step 2: 准备精灵图

当前项目需要 4 张精灵图，每张 4 帧：

| 文件名 | 帧尺寸 | 帧数 | 用途 |
|--------|--------|------|------|
| `player_idle.png` | 64x64 | 4 | 待机动画 |
| `player_walk.png` | 64x64 | 4 | 行走动画 |
| `player_jump.png` | 64x64 | 4 | 跳跃动画 |
| `player_attack.png` | 64x64 | 4 | 攻击动画 |

**精灵图格式**: 水平排列 4 帧，总尺寸 256x64

```
| 帧0 | 帧1 | 帧2 | 帧3 |
| 64px| 64px| 64px| 64px|
```

### Step 3: 使用工具合成精灵图

**推荐工具**:
- [Aseprite](https://www.aseprite.org/) ($20, 专业级)
- [Piskel](https://www.piskelapp.com/) (免费在线工具)
- [Adobe Photoshop](https://www.adobe.com/products/photoshop.html)
- GIMP (免费)

**使用 Piskel 合成**:
1. 打开 https://www.piskelapp.com/
2. 导入下载的动画帧
3. 调整画布尺寸为 64x64
4. 导出为 PNG 精灵图

### Step 4: 替换素材

将新精灵图复制到项目目录：

```
d:/游戏开发/像素风横板冒险游戏-简单战斗-线性关卡/assets/images/
├── player_idle.png      (替换)
├── player_walk.png      (替换)
├── player_jump.png      (替换)
└── player_attack.png    (替换)
```

### Step 5: 调整帧尺寸（如需要）

如果新素材帧尺寸不是 64x64，需要更新 BootScene.js：

```javascript
// src/scenes/BootScene.js
this.load.spritesheet('player_idle', 'assets/images/player_idle.png', {
  frameWidth: 64,    // 修改为实际帧宽度
  frameHeight: 64    // 修改为实际帧高度
});
```

---

## 临时方案：使用占位符模式

如果暂时没有合适的素材，可以切换到占位符模式：

```javascript
// src/scenes/BootScene.js 第 15 行
const useRealAssets = false;  // 改为 false
```

占位符模式使用 Phaser.Graphics 绘制简单图形，虽然没有精美画面，但动画流畅。

---

## 其他免费素材网站

| 网站 | 网址 | 特点 |
|------|------|------|
| itch.io | https://itch.io/game-assets/free/tag-sprites | 独立游戏素材 |
| OpenGameArt.org | https://opengameart.org/ | 开源游戏素材 |
| Kenney.nl | https://kenney.nl/assets | CC0 协议素材 |
| GameArt2D | https://www.gameart2d.com/freebies.html | 2D 游戏素材 |
| CraftPix.net | https://craftpix.net/freebies/ | 免费素材专区 |

---

## 注意事项

1. **授权检查**: 下载前确认素材授权（CC0、免费商用等）
2. **尺寸一致**: 确保所有动画帧尺寸一致
3. **帧数匹配**: 当前项目配置为 4 帧动画
4. **透明背景**: 精灵图需要透明背景（PNG 格式）
5. **备份原素材**: 替换前备份原有素材

---

**创建日期**: 2026-02-21
**问题类型**: 动画素材不连贯
**解决方案**: 使用专业像素画师素材替代 AI 生成素材
