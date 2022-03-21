

export function mergeOptions(parentVal, childVal) {
  const opts = {};

  for (const k in parentVal) {
    const element = parentVal[k];
    opts[k] = element;
  }
  for (const k in childVal) {
    const element = childVal[k];
    if (parentVal.hasOwnProperty(k)) {
      opts[k] = element;
    }
  }
  console.log(opts);
  
  return opts;
}

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
//   console.log(opts);
  
//   return opts;
// }

// mergeOptions1({ b: 2}, {b: 222, c: 111}) // { b: [ 2, 222 ], c: 111 }