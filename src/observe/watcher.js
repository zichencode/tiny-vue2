import Dep from "./dep";

let id = 0;
export default class Watcher { // dep 放到 watcher 中
  constructor(vm, fn, cb, options) {
    this.vm = vm;
    this.fn = fn;
    this.cb = cb;
    this.options = options;

    this.id = id++; // 标识

    this.depsIds = new Set(); // 收集depid 用作去重
    this.deps = []; // 收集dep

    this.getter = fn; // fn 是页面的渲染逻辑

    this.get(); // 初始化
  }
  addDep(dep) {
    const id = dep.id;
    if (!this.depsIds.has(id)) {
      this.depsIds.add(id);
      this.deps.push(dep);

      // 反向调用 dep上方法 存储 watcher
      dep.addSub(this);
    }
  }
  // 初始化方法
  get() {
    // 每次 new Watcher 的时候 将 类 的 赋值给 Dep
    Dep.target = this; // 利用一个变量将 watcher 传递给 dep
    
    this.getter() // 页面的渲染逻辑 _update(_render)

    // js 单线程 执行渲染完成后 只为空
    Dep.target = null;
  }

  // 更新方法
  update() {
    // 目前是每次 更新都会触发 渲染，所以需要 异步更新处理
    this.get()
  }

}