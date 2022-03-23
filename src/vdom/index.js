// 虚拟dom方法
export function createElement(vm, tag, data={}, ...children) {
  return vnode({vm, tag, data, children, key: data.key})
}

export function createText(vm, text) {
  return vnode({vm, text})
}

// 判断两个节点是否相同，就判断 tag 和key 是否一致
// 注意： vue2 有一个性能问题，就是 递归比对，但是vue3 不是用的递归，是 通过动态节点，标记变化的节点放在数组中，直接去更新 新虚拟dom （block tree）
// 如何知道是不是动态节点，是通过模版编译做的
// 通过 key 去更新我们的节点
export function isSameVnode(newVnode, oldVnode) {
  return (newVnode.tag === oldVnode.tag) && (newVnode.key === oldVnode.key)
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