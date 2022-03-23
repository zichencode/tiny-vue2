import Watcher from "./observe/watcher";
import { nextTick } from "./utils/nextTick";
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
    console.log('---------挂载节点：内部----------');
    // 初次加载 直接根据虚拟节点渲染成真实dom，替换原来的节点
    // 以后更新时 生成新的 虚拟dom 后 这里需要做一些优化 虚拟dom 对比 优化
    vm.$el = patch(vm.$el, vnode); // 将最新的节点挂在 $el 上
      
    console.log('---------mounted：内部生命周期----------');
    
  }

  // 挂载nexttick 方法
  Vue.prototype.$nextTick = nextTick
}

// 调用生命周期的钩子的统一调用函数
export function callHook(vm, hook) {
  let handler = vm.$options[hook]
  handler && handler.forEach(fn => fn.call(vm)); // 钩子函数的this永远指向实例
}