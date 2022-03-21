import { isObject } from "../utils";


export function patch(el, vnode) {
  // 创建的新节点放在老节点的后面，然后删除老节点
  // 创建新节点
  const dom = createEle(vnode);

  el.parentNode.insertBefore(dom, el.nextSibling); // 插入到原先真实dom的后面
  el.parentNode.removeChild(el); // 在删除原先真实节点

  return dom; // 返回最新dom
  
}

// 虚拟节点的实现 和 如何将虚拟节点渲染成真实节点的
function createEle(vnode) {
  let {tag, data, children, text, vm} = vnode;
  // 让虚拟节点和真实节点做一个映射关系，后续虚拟节点更新了 可以跟踪到真实节点，并更新真实dom
  if (typeof tag === 'string') { // 标签
    vnode.el = document.createElement(tag);
    // 更新属性
    updateProperties(vnode.el, data);
    // 遍历子代
    children.forEach(child => {
      vnode.el.appendChild(createEle(child))
    });
  } else { // 文本
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}

// 给元素添加属性
function updateProperties(el, props = {}) {
  for (const key in props) {
    let value = props[key];
    
    if (isObject(value)) { // 处理style
      let str = '';
      for (const k in value) {
        let val = value[k];
        str += `${k}:${val};`
      }
      value = str
    }
    el.setAttribute(key, value)
  }
}