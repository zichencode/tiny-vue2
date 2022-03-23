/**
 * vue 默认支持响应式数据变化（双向绑定）
 * 1. 双向绑定需要能修改（如表单 input）数据变化影响视图，视图变化影响数据
 * 2. 响应式变化，能监控到数据的变化 并更新视图 - 单向的
 * 
 * vue 模式 并不是 mvvm的，vue 只是做视图，渐进式 + 组件化 + 全家桶等
 * 数据是如何变化的，在 vue2 中 通过 Object.defineProperty() 将对象中的原有属性 更改为 set 和 get 的一个属性，这样修改时 会出发set 方法 更新视图
 */

import { compileToFunction } from "./complier";
import { globalAPIMixin } from "./global-api";
import { initMixin } from "./init";
import { lifecycleMixin } from "./lifecycle";
import { renderMixin } from "./render";
import { createEle, patch } from "./vdom/patch";

// 原型模式实现 - 功能通过原型扩展添加
function Vue(options) {
   this._init(options)
}

// 初始化操作
initMixin(Vue)
renderMixin(Vue)
lifecycleMixin(Vue)
globalAPIMixin(Vue)

/** ------测试dom diff------ */
var vm1 = new Vue({
   data() {
      return {name: 'zichen', arr: 'cc'}
   }
})
let render1 = compileToFunction(`<div>{{name}}</div>`);

let oldNode = render1.call(vm1);

let el1 = createEle(oldNode);

document.body.appendChild(el1);

var vm2 = new Vue({
   data() {
      return {name: 'ly', arr: 'cc'}
   }
})
let render2 = compileToFunction(`<div>{{name}}</div>`);

let newNode = render2.call(vm2);

let el2 = createEle(newNode);

setTimeout(() => {
   // document.body.removeChild(el1);
   // document.body.appendChild(el2);
   patch(oldNode, newNode); // 比对两个虚拟dom的节点，只更改需要更新的地方就行
},5000)


export default Vue;

/**
 * 初始化渲染流程 ===================================
 * 1.new Vue 会调用 _init() 方法进行初始化
 * 2.将用户的数据选项 放到 $options上
 * 3.对当前的数据判断有没有 data\watch\props\computed --- initState 方法
 * 4.判断 data 是不是一个函数进行 操作 initData
 * 5. 用 observe 去检测 data 中的数据 和 vm 没有关系，并变成响应式
 * 6.vm 上取值能获取到data中的数据，vm._data = data, 通过代理的方式 让使用者 vm.msg => vm._data.msg
 * 
 * 7.如果更新对象不存在的属性，会导致视图不更新，如果是数组更新索引和长度不会触发更新
 * 8.如果替换成一个新的对象，新对象会被劫持，如果数组的方法 eg: push\unshift\splice新增内容也会被数据劫持
 * 9. 通过__ob__进行标示这个对象 被劫持过，（vue中被监控的对象身上都有一个 __ob__ 属性）
 * 10.如果想改变索引进行响应式，需要使用 $set 方法（其实内部使用的就是 splice 方法）
 * 
 * 如果有 el 则挂在到页面中去 通过原型上的$mount 方法
 * 11.对模版优先级的处理顺序 render > template > outHTML
 * 12.将模版编译成函数 parserHTML 解析模版 > ast语法树，解析语法树生成 code > render 函数
 * 前面只执行一次 
 * 13.通过render函数生成虚拟dom + 真实数据 = 真实dom
 * 14.根据虚拟节点渲染真实节点
 */

/**
 * 更新渲染流程 ===================================
 * 
 */

/**
 * 注：依赖收集的实现
 * 只有根组件的情况
 * 1.vue 里面用到了观察者模式，默认组件渲染的时候，会创建一个watcher，并渲染视图
 * 2.渲染的时候，会取data中的数据，会走每个 属性的get方法，让这个属性的dep纪录watcher 
 * 3.同时让watcher 也去记住dep，dep和watcher 是多对多的关系，因为一个属性对应多个视图，一个视图对应多个数据
 * 4.如果数据发生变化，会通知对应属性的dep，依次通知收集的watcher 去更新
 */