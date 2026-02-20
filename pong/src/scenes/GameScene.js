// Pong 游戏场景
export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })
  }

  preload() {
    // 加载素材
  }

  create() {
    // 游戏设置
    this.scorePlayer = 0
    this.scoreComputer = 0

    // 创建球拍
    this.player = this.add.rectangle(50, 300, 20, 100, 0xffffff)
    this.computer = this.add.rectangle(750, 300, 20, 100, 0xffffff)

    // 创建球
    this.ball = this.add.circle(400, 300, 10, 0xffffff)

    // 启用物理
    this.physics.add.existing(this.player, true)
    this.physics.add.existing(this.computer, true)
    this.physics.add.existing(this.ball)

    // 球的初始速度
    this.ball.body.setVelocity(200, 150)
    this.ball.body.setCollideWorldBounds(true)
    this.ball.body.setBounce(1, 1)

    // 碰撞检测
    this.physics.add.collider(this.ball, this.player, this.hitPaddle, null, this)
    this.physics.add.collider(this.ball, this.computer, this.hitPaddle, null, this)

    // 分数显示
    this.scoreText = this.add.text(400, 50, '0 - 0', {
      fontSize: '48px',
      fill: '#ffffff'
    }).setOrigin(0.5)

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys()
  }

  update() {
    // 玩家控制
    if (this.cursors.up.isDown && this.player.y > 50) {
      this.player.y -= 5
    }
    if (this.cursors.down.isDown && this.player.y < 550) {
      this.player.y += 5
    }
    this.player.body.updateFromGameObject()

    // 电脑AI
    if (this.computer.y < this.ball.y && this.computer.y < 550) {
      this.computer.y += 3
    } else if (this.computer.y > this.ball.y && this.computer.y > 50) {
      this.computer.y -= 3
    }
    this.computer.body.updateFromGameObject()

    // 检查得分
    if (this.ball.x < 10) {
      this.scoreComputer++
      this.resetBall()
    }
    if (this.ball.x > 790) {
      this.scorePlayer++
      this.resetBall()
    }

    this.scoreText.setText(`${this.scorePlayer} - ${this.scoreComputer}`)
  }

  hitPaddle(ball, paddle) {
    let diff = ball.y - paddle.y
    ball.body.setVelocityY(ball.body.velocity.y + diff * 2)
  }

  resetBall() {
    this.ball.setPosition(400, 300)
    this.ball.body.setVelocity(
      Phaser.Math.Between(-200, 200),
      Phaser.Math.Between(-150, 150)
    )
  }
}
