

const oldArrayPrototype = Array.prototype;

export const arrayMethods = Object.create(oldArrayPrototype);

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
];
// 重写 数组的7个方法
methodsToPatch.forEach(method => {
  arrayMethods[method] = function(...args) {
    const ob = this.__ob__;
    // 执行数组的方法
    oldArrayPrototype[method].call(this, ...args);
    // 切面后执行自己的操作
    // 对新增的属性进行监听和劫持
    let newList = null;
    switch (method) {
      case 'splice':
        newList = args.slice(2)
        break;
      case 'unshift':
      case 'push':
        newList = args;
      default:
        break;
    }
    // 如果有那么继续监听和劫持新增的属性
    if (newList) {
      
      ob.observeArray(newList)
    }
    ob.dep.notify()
  }
})
