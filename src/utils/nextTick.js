
// vue3 nextTick 用的是 promise vue2里面做了一些兼容处理
// 缓存下来，批处理
// 多个nextTick 是一个 then-------
let callbacks = [];
let waiting = false;
function flushCallbacks() {
  callbacks.forEach(fn => fn());
  callbacks = [];
  waiting = false;
}
export function nextTick(fn) {

  callbacks.push(fn);

  if (!waiting) {
    Promise.resolve().then(flushCallbacks)
    waiting = true;
  }
  
}