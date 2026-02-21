/**
 * Simple State Machine
 * 简单状态机 - 用于管理实体状态
 */

export class StateMachine {
  constructor(initialState, states = {}) {
    this.currentState = initialState;
    this.states = states;
    this.previousState = null;
  }

  /**
   * 添加状态
   */
  addState(name, callbacks) {
    this.states[name] = callbacks;
  }

  /**
   * 切换状态
   */
  setState(newState, ...args) {
    if (newState === this.currentState) return false;

    // 调用旧状态的退出回调
    const prevStateConfig = this.states[this.currentState];
    if (prevStateConfig?.onExit) {
      prevStateConfig.onExit();
    }

    this.previousState = this.currentState;
    this.currentState = newState;

    // 调用新状态的进入回调
    const newStateConfig = this.states[newState];
    if (newStateConfig?.onEnter) {
      newStateConfig.onEnter(...args);
    }

    return true;
  }

  /**
   * 更新当前状态
   */
  update(time, delta) {
    const stateConfig = this.states[this.currentState];
    if (stateConfig?.onUpdate) {
      stateConfig.onUpdate(time, delta);
    }
  }

  /**
   * 检查是否在指定状态
   */
  isState(state) {
    return this.currentState === state;
  }

  /**
   * 获取当前状态
   */
  getState() {
    return this.currentState;
  }

  /**
   * 获取上一个状态
   */
  getPreviousState() {
    return this.previousState;
  }
}
