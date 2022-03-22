
let strats = {}; // 存放所有的策略

let lifeCycle = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted'
]

lifeCycle.forEach((hook) => {
  strats[hook] = function(parentVal, childVal) { // 父子合并的策略
    if (childVal) {
      if (parentVal) {
        return parentVal.concat(childVal)
      } else {
        return Array.isArray(childVal) ? childVal : [childVal]
      }
    } else {
      return parentVal
    }
  }
})

export function mergeOptions(parentVal, childVal) {
  const opts = {};

  for (const k in parentVal) {
    merge(k, parentVal[k])
  }
  for (const k in childVal) {
    merge(k, childVal[k])
  }
  function merge(key, val) {
    let hook = strats[key];
    if (hook) {
      opts[key] = hook(parentVal[key], childVal[key])
    } else {
      opts[key] = val
    }
  }
  return opts;
}
// mergeOptions({ a: 1, b: 1}, {b: 222, c: 222}) 


// function mergeOptions1(parentVal, childVal) {
//   const opts = {};

//   for (const k in parentVal) {
//     opts[k] = parentVal[k];
//   }

//   for (const k in childVal) {
//     const element = childVal[k];
//     if (parentVal.hasOwnProperty(k)) {
//       opts[k] = [opts[k], element];
//     } else {
//       opts[k] = childVal[k];
//     }
//   }
//   return opts;
// }

// mergeOptions1({ b: 2}, {b: 222, c: 111}) // { b: [ 2, 222 ], c: 111 }