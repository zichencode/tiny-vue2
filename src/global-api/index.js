import { isObject } from "../utils";
import { mergeOptions } from "../utils/merge-options";

export function globalAPIMixin(Vue) {
  // 全局属性
  Vue.options = {};
  Vue.options._base = Vue;

  // 全局的mixin
  Vue.mixin = function(options) {
    // 合并用户的参数
    this.options = mergeOptions(this.options, options);
    
    return this;
  }

  // 全局的 extend
  // 通过使用 Vue.extend 的方法 产生一个子类，new 子类的时候会执行初始化的代码
  Vue.extend = function(opt) {  
    
    const Super = this;
    const Sub = function(options) {
      this._init(options) // 使用构造函数的时候 初始化
    }

    // function create(parentPrototype) {
    //   function Fn(){};
    //   Fn.prototype = parentPrototype;
    //   return new Fn()
    // }

    Sub.prototype = Object.create(Super.prototype); // 继承原型的方法
    Sub.prototype.constructor = Sub; // 将构造函数原型的指向 本身的构造函数

    // 合并
    Sub.options = mergeOptions(Super.options, opt); // 为了让子类 拿到定义 Vue 定义的全局组件

    Sub.mixin = Vue.mixin;
    // ... 
    return Sub;
  }

  // 创建一个存放全局组件的对象
  Vue.options.components = {};

  // 全局的component
  Vue.component = function(id, definition) {  
    
    const name = definition.name || id;
    definition.name = name;

    if (isObject(definition)) { // 如果是对象的话，将对象转化成类
      definition = Vue.extend(definition) // 返回对象的子类 - 继承自vue
    }

    Vue.options.components[name] = definition;
    
    console.log('Vue.options.components', Vue.options.components);
    
    return this;
  }
}