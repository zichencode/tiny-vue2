import { isObject } from "./utils";
import { createElement, createText } from "./vdom";


export function renderMixin(Vue) {
  Vue.prototype._c = function() { // 创建元素节点 createElement
    const vm = this;
    return createElement(vm, ...arguments)
  }
  Vue.prototype._v = function(text) { // 创建文本的虚拟节点
    const vm = this;
    return createText(vm, text)
  }
  Vue.prototype._s = function(data) { // JSON.stringify
    if (isObject(data)) return JSON.stringify(data);
    return data;
  }
  Vue.prototype._render = function() {
    const vm = this;
    const {render} = vm.$options;
    // console.log(render.toString());
    
    const vnode = render.call(vm); // 调用执行
    return vnode
  }
}