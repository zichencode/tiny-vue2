import { isObject, isType } from "../utils"
import { arrayMethods } from "./array";
import Dep from "./dep";

/**
 * 
 * @param {any} val data 数据
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
    // 给对象和数组的 添加 dep 属性
    this.dep = new Dep(); // 给对象添加一个不存在的属性希望也更新视图 即 $set, todo 先不考虑对象

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

      // 数组如何依赖收集 和 触发更新
    } else {
      // 遍历对象
      this.walk(data)
    }
  }
  // 对数组进行监听
  observeArray(data) {
    data.forEach(item => observe(item))
  }
  /**
   * 循环的函数
   * @param {required} data 用来循环的对象
   */
  walk(data) {
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
    const that = this;
    // 递归监测数据
    const childObj = observe(value);
    // 每个属性都添加一个 dep
    let dep = new Dep();
    
    // 这是一个 闭包函数 -- 模版获取属性要走的 defineProperty
    Object.defineProperty(data, key, {
      get () {
        if (Dep.target) {
          dep.depend() // 收集依赖

          if (childObj) { // childObj.dep 是数组或者对象的 dep
            childObj.dep.depend() // 数组和对象 值 的 收集依赖
            if (Array.isArray(value)) {
              // 可以是 数组嵌套数组的情况
              that.dependArray(value);
            }
          }
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

  /**
   * 数组嵌套进行递归依赖收集
   */
  dependArray(value) { // [{ }, []]
    for (let i = 0; i < value.length; i++) {
      const cur = value[i];
      cur.__ob__ && cur.__ob__.dep.depend(); // 收集
      if (Array.isArray(cur)) { // 递归结束条件
        this.dependArray(cur)
      }
    }
  }
}

/**
 * 1.默认vue在初始化的时候，会对对象每一个属性进行劫持，添加 dep 属性，当取值的时候 会做依赖收集
 * 2.默认还会对属性值 （对象和数组本身 进行 dep 属性的添加）进行依赖收集
 * 3.如果属性变化，触发属性对应的dep去更新
 * 4.如果是数组进行更新，触发数组本身的dep去更新
 * 5.如果取值的时候是数组还要让数组中的对象类型也进行（递归）依赖收集
 * 6.如果数组里面放的是对象，默认对象里的属性是会进行依赖收集的，因为在取值的时候会进行 JSON.stringify 操作
 */