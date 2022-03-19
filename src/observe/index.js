import { isObject, isType } from "../utils"
import { arrayMethods } from "./array";
import Dep from "./dep";

/**
 * 
 * @param {*} val data 数据
 */
export const observe = (data) => {
  // 如果要监听的数据不是对象直接返回
  if (!isObject(data)) return;

  if (data.__ob__) {
    return; // 标示一个属性已经被监测了，不需要重复监测
  }

  // 对对象进行监测 最外层必须是对象

  // 如果当前属性已经被监测过，那么后续就不需要进行监测了。 用类来实现，我观测过就加一个标示，说明观测过了，在观测的时候可以先监测是否监测过，如果有就直接跳过
  return new Observer(data)
}

class Observer {
  constructor(data) {
    // 给劫持的data对象 添加一个自定义属性，方便调研 观察者对象
    Object.defineProperty(data, '__ob__', {
      value: this,
      enumerable: false, // 标示这个属性不能被枚举出来，不被循环
    })
    if (Array.isArray(data)) {
      // 是数组的话
      data.__proto__ = arrayMethods;
      // 如果数组中还是有数组或者对象 继续代理
      this.observeArray(data)
    } else {
      // 遍历对象
      this.walk(data)
    }
  }
  observeArray(data) {
    data.forEach(item => observe(item))
  }
  /**
   * 循环的函数
   * @param {required} data 用来循环的对象
   */
  walk(data) {
    console.log('data====', data);
    
    Object.keys(data).forEach(key => { // 使用defineProperty 重新定义
      this.defineReactive(data, key, data[key]) 
    })
  }
  /**
   * 对对象进行重新定义
   * 这也是 vue2 慢的主要原因，在这个方法上
   * @param {required} data 要定义属性的对象
   * @param {*} key 要定义或修改的属性的名称
   * @param {*} value 要定义或修改的属性描述符
   */
  defineReactive(data, key, value) { // data里定义变量，变成响应式属性执行的方法
    // 递归监测数据
    observe(value);

    // 每个属性都添加一个 dep
    let dep = new Dep();
    
    // 这是一个 闭包函数 -- 模版获取属性要走的 defineProperty
    Object.defineProperty(data, key, {
      get () {
        if (Dep.target) {
          dep.depend() // 收集依赖
        }
        return value // 会向上查找
        // 不用 data[key] 的原因是会造成死循环
      },
      set (newVal) {
        if (newVal === value) {
          return 
        }
        // 如果新赋值的属性也是对象呢，需要继续监听-劫持
        observe(newVal)
        value = newVal;
        dep.notify() // 通知执行 更新
      }
    })
  }
}