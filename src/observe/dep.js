let id = 0;
export default class Dep { // 吧watcher 放到 dep 中
  constructor() {
    
    this.subs = [];
    this.id = id++;
  }

  // 收集方法
  depend() {
    // 需要去重
    /**
     *  ---- [Watcher] 0
        ---- (2) [Watcher, Watcher] 0
     */
    // this.subs.push(Dep.target) // 将 watcher 收集起来 ，watcher也要收集dep
    console.log('----', this.id);
    
    Dep.target.addDep(this); // 调用watcher的 addDep方法
    
  }

  // 将 watcher 收集起来
  addSub(watcher) {
    
    this.subs.push(watcher)
    console.log('this.sub', this.subs);
    
  }

  // 更新方法
  notify() {
    
    this.subs.forEach(watcher => watcher.update())
  }
}

Dep.target = null; // 用一个全局变量 window.target, 静态属性