import { nextTick } from "../utils/nextTick";

let queue = [];
let hasObj = {};

let pending = false; // 标示的状态

function flushSchedulerQueue() {
  // 异步 统一执行 并清空队列
  queue.forEach(watcher => watcher.run());
  pending = false;
  queue = [];
  hasObj = {};
}
export function queueWatcher(watcher) {
  let id = watcher.id;
  // 去重的方式
  if (hasObj[id] === undefined) {
    hasObj[id] = true;
    queue.push(watcher);

    if (!pending) { // 为了保证 nextTick 只执行一次
      pending = true;
      nextTick(flushSchedulerQueue);
    }
  }
}