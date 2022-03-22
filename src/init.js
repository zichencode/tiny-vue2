import { compileToFunction } from "./complier";
import { callHook, mountComponent } from "./lifecycle";
import { initState } from "./state";
import { mergeOptions } from "./utils/merge-options";

export function initMixin(Vue) {

  Vue.prototype._init = function(options) {
    // 赋值为 vm 代表 this
    const vm = this;
    
    // 将全局的options 和 用户传来 options 合并
    vm.$options = mergeOptions(vm.constructor.options, options); // 将用户的选项挂在vm上，方便后续使用

    // 初始化数据
    initState(vm)

    // 挂在前
    console.log('---------beforeCreate：内部生命周期----------');
    callHook(vm, 'beforeCreate')
    console.log('---------created：内部生命周期----------');
    callHook(vm, 'created')

    if (vm.$options.el) {
      console.log('开始挂载了');
      this.$mount(vm.$options.el)
      callHook(vm, 'mounted')

      // 数据劫持后的操作
      // 数据变了，就需要更新视图 diff算法 更新需要更新的地方
      // 操作字符串 性能不高 每次都要重写替换模版

      // Vue 中 html 都写着 template 中 而 jsx 更灵活 

      // template -> ast语法树 -> 描述成一个树结构 -> 代码重组为 js 语法
      // 使用了 模版编译原理 （把 template模版编译成 render 函数 -> 虚拟dom -> diff算法比对虚拟dom）
      // ast -> render -> vnode -> 生成真实的dom
      //        更新再次调用render  -> vnode -> 新旧虚拟dom对比 -> 更新真实dom
    }
  }
  // new Vue({el: '#app'}) ; new Vue({}).$mount('#app')
  Vue.prototype.$mount = function(el) {
    const vm = this;
    if (typeof el === 'string') {
      el = document.querySelector(el)
    }
    vm.$el = el; // 页面中的真实dom元素

    // 模版编译中 render 的优先级是最高的，如果有就直接用 不用在生成 render 函数了
    if(!vm.$options.render) {
      // render 不存在的找 template 
      if (!vm.$options.template) {
        vm.$options.template = el.outerHTML;
      }
      
      // 最后都挂在render上
      vm.$options.render = compileToFunction(vm.$options.template);

      console.log('---------beforeMount：内部生命周期----------');
      callHook(vm, 'beforeMount')

      // 加载生命周期
      mountComponent(vm)
    }
  }
}