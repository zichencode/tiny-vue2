// 虚拟dom方法
export function createElement(vm, tag, data={}, ...children) {
  return vnode({vm, tag, data, children, key: data.key})
}

export function createText(vm, text) {
  return vnode({vm, text})
}

// 对象用来描述节点的
function vnode({vm, tag, data, children, key, text}) {
  return {vm, tag, data, children, key, text}
}
/**
 * vnode 是一个对象 用来描述节点的 和 ast 很像
 * 区别：ast是描述语法的，并没有用户选择的逻辑，只是语法解析出来的内容
 * vnode 是描述dom 结构的，可以自己去扩展属性
 */