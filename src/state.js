import { observe } from "./observe";
import { isType } from "./utils";

export function initState(vm) {
  console.log('---------initData：内部初始化数据----------');

  const opts = vm.$options;

  if (opts.data) {
    initData(vm)
  }
}

function initData(vm) {
  let data = vm.$options.data;
  // 如果用户传递的是个函数则取函数返回值，如果是对象则就使用对象，仅限于根组件
  if (isType(data, 'function')) {
    data = data.call(vm)
  }

  vm._data = data;

  // 先循环把 要取用的数据 从 _data 中取用 eg: vm.msg
  for (const key in data) {
    proxy(vm, key, '_data') // 代理vm 中的取值和设置值
  }

  // 需要将data 变成响应式 依靠Object.defineproperty 重写data属性
  // 观察数据
  observe(data);
}

// 代理-映射函数,随取随用 懒代理
function proxy(vm, key, source) {
  Object.defineProperty(vm, key, {
    get () {
      return vm[source][key]
    },
    set (newVal) {
      vm[source][key] = newVal
    }
  })
}
