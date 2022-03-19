import Watcher from "./observe/watcher";
import { patch } from "./vdom/patch";


// 数据挂在
export function mountComponent (vm) {
  // 初始化流程
  let updateComponent = () => {
    vm._update(vm._render())
  }
  // 每个组件都有一个 watcher ，称之为渲染watcher
  new Watcher(vm, updateComponent, () => {
    console.log('更新后要做的的事情，调用钩子函数');
  }, true)

}

// 渲染真实dom
export function lifecycleMixin(Vue) {
  Vue.prototype._update = function(vnode) {
    // 采用 先序深度遍历 创建节点 - 遇到节点就创造节点，递归创建
    // 特点 - 组件级更新 不会很耗性能 更新某个区域

    const vm = this;
    vm.$el = patch(vm.$el, vnode); // 将最新的节点挂在 $el 上
    console.log(vm);
    
  }
}