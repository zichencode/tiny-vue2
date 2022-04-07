## 1.什么情况下data 可以返回对象，什么情况下要返回函数？
1. 在根组件时 可以使用对象或者函数，因为根组件 只有一个不会被共享
2. 而子组件只能使用函数，为了防止多个组件共享同一份数据

## 2.vue2 性能不高的原因？
1. 应用了 defineProperty 时 进行了递归操作，所以耗性能，如果层次很深也就很耗性能
2. 优化的原则：
   1. 不要把所有的数据都放在data中，因为所有的 data 数据都加了 get set
   2. 不要写数据的时候层次过深，尽量扁平化数据
   3. 不要频繁获取数据
   4. 如果数据不需要响应式，可以使用 `Object.freeze` 冻结属性

## 3.数组修改时？
- 改数组的长度和索引是不会有响应式反应的

## 4.vue2 特点
1. 无法劫持到不存在的属性，即无法劫持新增不存在的属性，不会更新视图，依赖`Vue.$set`
2. 如果是操作数组的索引，那么不会劫持，也不更新视图。eg: this.arr[0] = 100;
3. 数组的那7个方法都会触发更新

## 5.vue中的生命周期是如何实现的？钩子方法（回调）
1. 同 callHooks方法在适当的时机进行调用触发

## key 用索引会发生什么？为什么最好不要用索引？
1. 如果相同元素发生逆序，会讲所有元素的子元素进行替换
2. 尤其是循环数组key用索引，然后会重新把所有的节点都替换
3. 而如果用固定值，如id，会讲元素进行移动
4. 移动的性能比替换好很多
 
## nextTick原理？
1. 两个参数 fn 和 ctx(this指向)
2. 用一个异步任务，将多个方法维护在一个队列中
3. 把nextTick函数的所有的回调函数用数组收集起来，放到微任务中一次执行
4. 微任务 vue 做了优雅降级处理 从 promise > MutationObserver > setImmediate > setTimeout

## 组件创建流程？
1. Vue.component 注册成为全局组件，内部会自动调用 Vue.extend 方法，返回组件的构造函数
2. 组件初始化的时候，做一次mergeOptions 属性合并，通过链式调用，（自己当前的找不到，去父级上找 ）
3. 内部会对模版进行编译操作 _c('componentName') 做筛选，如果是组件就创建一个组件的虚拟节点，还会判断 Ctor 是不是一个对象，是的话，调用 extend 方法，所有组件都是通过 extend 方法实现的（componentOptions存储着 所有的内容，属性、内容、插槽的实现等）
4. 创建组件的真实节点 new Ctor（）拿到组件的实例，调用组件的 $mount 方法，生成一个 $el，它对应组件模版渲染后的结果
   1. vnode.componentInstance = new Ctor()
   2. vnode.componentInstance.$el = 组件渲染后的结果
5. 将组件的 vnode.componentInstance.$el 插入到父标签中
6. 组件在 new Ctor 时会进行组件的初始化，给组件添加一个独立渲染的 watcher 每个组件都有自己的watcher，更新时 只需要跟新组件组件对应的渲染 watcher （组件渲染时，组件对应的属性会收集自己的渲染watcher）

## 组件更新流程？
1. 组件更新会执行 组件的 prepatch 方法
2. 组件内部 会拿到最新的属性，赋值到原有的 vm._props 属性上，但是vm._props 是响应式的，所以页面更新了

## 组件渲染
1. 先父后子渲染

## 函数式组件
1. 比类式组件性能比较好（也称 无状态组件）
2. 特点：
   1. 没有状态，就不用做属性拦截了
   2. 没有this 也不能通过实例去做些事情了
   3. 不用 new 也就不用创建实例了
   4. 没有生周期，少了很多流程和功能
3. 为啥性能好，主要是因为内部不用创建实例了
4. 函数式组件不能写 template 因为没有 this，需要编译成 with（this）的函数，所以只能用 render 
5. 代码中走的是 `createFunctionalComponent` 方法，创建虚拟节点 后 直接 进行渲染

```js
函数式组件的写法 （可以使用 jsx 语法书写）
<template functional><template>
export default {
   functional: true,
   render(h) {
      return h('div')
   }
}
```

## 异步组件
```js
Vue.component('async-comp', () => new Promise((resolve, reject) => {
   setTimeout(() => {
      resolve({
         template: '<div>async</div>'
      })
   },1000)
}))
```
图片懒加载：先弄一个假的，最后用真的替换。
实现：
1. 类似图片懒加载，先弄个占位符，加载完毕后强制重新渲染 forceRender，并且把组件保存到了 factory.resolved 重新渲染拿到这个组件，做组件的正常挂载逻辑

## 组件通信方式
1. prop
   1. 将 propsData 转成响应式，并通过 proxy(vm, '_props', key) 代理可以通过 this. 直接获取
2. bus
   1. 发布订阅模式，使用 $on 和 $emit
3. emit
   1. 类似 bus
   2. 将事件通过 $on 注册到子组件身上，由$emit 触发
4. provide/inject
   1. provide 注册绑定到 _provide 属性上
   2. inject 就是不停的向上查着 source.$parents, 找到后，定义到当前组件实例上，并改为响应式
5. attrs/listeners
   1. 代表组件的所有属性和方法
6. ref
   1. 在普通节点上，获取的是真实dom
   2. 在组件上，获取的是组件的实例

查看： initInternalComponent 方法初始化参数

### vm._vnode 和 vm.$vnode 区别？
1. vm._vnode 是组件真实要渲染的dom 节点， <button></button>
2. vm.$vnode 是组件节点， <el-button></el-button>
3. vm._vnode.parent === vm.$vnode

### keep-alive
1. 初始化渲染过程
   1. 取当前keep-alive 中第一个组件，拿到后把组件实例缓存起来，超过限制后只会缓存第一个
2. 更新流程
   1. 走的keep-alive 的 diff 比对，两个都是组件，在 updateChildComponent 方法中比对 插槽内容，如果有标记，不会走初始化流程，直接从缓存取出来复用

## 组件的 v-model 和 普通元素上的 v-model 有什么区别？
1. v-model 和 :value + @input 在中文输入上有细微的差别
2. 通过 onCompositionStart 和 onCompositionEnd 两个方法去控制，通过 e.target.composing 属性
3. .sync 事件是在 编译层做的 -- vue3废弃了 