import { isSameVnode } from ".";
import { isObject } from "../utils";


export function patch(oldNode, vnode) {
  if (!oldNode) { // 组件的挂载流程
    // 组件生成真实dom
    return createEle(vnode)
  }
  const isRealElement = oldNode.nodeType;
  if (isRealElement) { // 判断老节点是不是真实节点，判断是初次渲染还是dom diff
    // 创建的新节点放在老节点的后面，然后删除老节点
    // 创建新节点
    const el = createEle(vnode);

    oldNode.parentNode.insertBefore(el, oldNode.nextSibling); // 插入到原先真实el的后面
    oldNode.parentNode.removeChild(oldNode); // 在删除原先真实节点

    return el; // 返回最新dom
  } else {
    // 进入了更新节点上，进行 dom diff
    // 条件 1.同层下进行对比，同层下判断 标签名和key 是否一致 来判断是否复用

    if(!isSameVnode(vnode, oldNode)) {
      // 如果不是同一个节点的话，直接替换
      return oldNode.el.parentNode.replaceChild(createEle(vnode), oldNode.el);
    }

    // 同一个节点的逻辑
    let el = vnode.el = oldNode.el; // 复用节点

    // 1.判断是不是都是文本
    if (!oldNode.tag) { // 说明是文本
      if (oldNode.text !== vnode.text) {
        return el.textContent = vnode.text
      }
    }

    // 2.相同元素 更新不同的属性
    // 新旧属性做diff
    updateProperties(vnode, oldNode.data);

    // 3.然后判断子节点
    let newChildren = vnode.children || [];
    let oldChildren = oldNode.children || [];

    if (oldChildren.length && newChildren.length === 0) {
      // 新节点没有子节点，老节点有，那么直接干掉
      el.innerHTML = '';
    } else if(newChildren.length && oldChildren.length === 0) {
      // 新节点有子节点，老节点没有的情况
      newChildren.forEach(child => el.appendChild(createEle(child)))
    } else {
      // 新老节点 都有子节点时
      updateChildren(el, newChildren, oldChildren)
    }

    return el;
  }
}
// dom-diff 核心算法
function updateChildren(el, newChildren, oldChildren) {
  console.log(el, newChildren, oldChildren);
  // vue2 在内部做了优化，尽可能提升性能，实在不行在暴力比对
  // 列表中 新增和删除的情况
  // 采用双指针的方式去比对
  // 新节点的双指针
  let newStartIndex = 0;
  let newEndIndex = newChildren.length - 1;
  let newStartVnode = newChildren[newStartIndex];
  let newEndVnode = newChildren[newEndIndex];

  // 老节点的双指针
  let oldStartIndex = 0;
  let oldEndIndex = oldChildren.length - 1;
  let oldStartVnode = oldChildren[oldStartIndex];
  let oldEndVnode = oldChildren[oldEndIndex];

  // 当前如果是乱序比对的话-建立老节点的key-index映射关系
  function mapKeyToIndex(oldChildren) {
    const map = {};
    oldChildren.forEach((item, i) => {
      map[item.key] = i
    })
    return map
  }

  let mapping = mapKeyToIndex(oldChildren)


  // 判断那个先比对完成
  while(newStartIndex <= newEndIndex && oldStartIndex <= oldEndIndex) {
    if (!oldStartVnode) { // 如果是 undefined 跳过
      oldStartVnode = oldChildren[++oldStartIndex];
    } else if (!oldEndVnode) {// 如果是 undefined 跳过
      oldEndVnode = oldChildren[--oldEndIndex];
    } else if (isSameVnode(oldStartVnode, newStartVnode)) {
      // 开头头指针相同的话
      patch(oldStartVnode, newStartVnode); // 会递归比较子节点和属性等
      newStartVnode = newChildren[++newStartIndex];
      oldStartVnode = oldChildren[++oldStartIndex];
    } else if(isSameVnode(oldEndVnode, newEndVnode)) {
      patch(oldEndVnode, newEndVnode); // 会递归比较子节点和属性等
      newEndVnode = newChildren[--newEndIndex];
      oldEndVnode = oldChildren[--oldEndIndex];
    } else if(isSameVnode(oldStartVnode, newEndVnode)) {
      // 头尾相互交换
      patch(oldStartVnode, newEndVnode);
      // 将老节点的头部往尾部移动插入
      el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
      // 然后改变指针
      oldStartVnode = oldChildren[++oldStartIndex];
      newEndVnode = newChildren[--newEndIndex];
    } else if(isSameVnode(oldEndVnode, newStartVnode)) { // 尾部-》头部
      // 头尾相互交换
      patch(oldEndVnode, newStartVnode);
      // 将老节点的头部往尾部移动插入
      el.insertBefore(oldEndVnode.el, oldStartVnode.el);
      // 然后改变指针
      oldEndVnode = oldChildren[--oldEndIndex];
      newStartVnode = newChildren[++newStartIndex];
    } else {
      // 乱序的情况处理
      let moveIndex = mapping[newStartVnode.key];
      if (moveIndex === undefined) {
        // 没有的直接插入到开头
        // 新节点没有 el 真实dom 
        el.insertBefore(createEle(newStartVnode),oldStartVnode.el)
      } else {
        // 有 表名是需要复用的
        let moveVnode = oldChildren[moveIndex];
        el.insertBefore(moveVnode.el, oldStartVnode.el)
        // 比对要移动和新开始指针的新节点属性
        patch(moveVnode, newStartVnode);
        // 原先的位置只为 undefined
        oldChildren[moveIndex] = undefined;
      }
      // 移动新节点指针
      newStartVnode = newChildren[++newStartIndex];
    }
  }
  // 比对完后判断
  if (newStartIndex <= newEndIndex) { 
    // 表示新的节点比较多
    // 标示-用来判断向前追加还是向后追加
    let anchor = newChildren[newEndIndex + 1] === null ? null : newChildren[newEndIndex + 1].el;
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      el.insertBefore(createEle(newChildren[i]), anchor)
    }
  }

  // 老的节点 多余的子节点直接删除
  if (oldStartIndex <= oldEndIndex) {
    for(let i = oldStartIndex; i <= oldEndIndex; i++) {
      let child = oldChildren[i]; // child 可能是undefined
      child && el.removeChild(child.el); // 删除老节点的真实元素
    }
  }

  
}

// 创建组件 真实节点
function createEleComponent(vnode) {
  let i = vnode.data;
  if ((i = i.hook) && (i = i.init)) {
    i(vnode)
  }
  if (vnode.componentInstance) {
    return true
  }
}

// 虚拟节点的实现 和 如何将虚拟节点渲染成真实节点的
export function createEle(vnode) {
  let {tag, data, children, text, vm} = vnode;
  // 让虚拟节点和真实节点做一个映射关系，后续虚拟节点更新了 可以跟踪到真实节点，并更新真实dom
  if (typeof tag === 'string') { // 标签
    if (createEleComponent(vnode)) { // 如果是组件的话
      return vnode.componentInstance.$el; // 真实的节点
    }
    vnode.el = document.createElement(tag);
    // 更新属性
    updateProperties(vnode, data);
    // 遍历子代
    children.forEach(child => {
      vnode.el.appendChild(createEle(child)) // 创建组件或者元素的功能
    });
  } else { // 文本
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}

// 给元素添加属性
function updateProperties(vnode, oldProps = {}) {
  const newProps = vnode.data || {};
  const el = vnode.el;

  // 两个对象对比差异，通过两次for循环去比对

  let newStyles = newProps.style || {};
  let oldStyles = oldProps.style || {};

  for (const key in oldStyles) {
    if (!newStyles[key]) {
      el.style[key] = ''; // 删除掉在新样式对象没有的老对象属性
    }
  }

  for (const key in newProps) { // 把新属性都放到 元素dom上
    if (key === 'style') {
      for (const key in newStyles) {
        el.style[key] = newStyles[key]
      }
    } else {
      el.setAttribute(key, newProps[key])
    }
  }

  for (const key in oldProps) {
    if (!newProps[key]) { // 如果新属性对象里面不存在的话直接移除
      el.removeAttribute(key)
    }
  }


  // for (const key in props) {
  //   let value = props[key];
    
  //   if (isObject(value)) { // 处理style
  //     let str = '';
  //     for (const k in value) {
  //       let val = value[k];
  //       str += `${k}:${val};`
  //     }
  //     value = str
  //   }
  //   el.setAttribute(key, value)
  // }
}