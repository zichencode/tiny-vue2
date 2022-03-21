const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{   xxx  }}  

// 拼接属性
function genProps(attrs) {
  console.log('attrs',attrs);
  let str = '';
  for (let i = 0; i < attrs.length; i++) {
    const ele = attrs[i];
    if (ele.name === 'style') {
      // "color: red; background-color: antiquewhite;"
      let styles = {};
      ele.value.replace(/([^:;]+):([^:;]+)/g,function() {
        styles[arguments[1]] = arguments[2]
      })
      ele.value = styles;
    }
    str += `${ele.name}:${JSON.stringify(ele.value)},`;

  }
  return `{${str.slice(0,-1)}}`
}

// 生成 children [{tag: '', type: 1, children: []}, {}]
function generateChildren(ast) {
  if (!ast.children) {
    return false
  }
  let childrens = ast.children.map(child => genChild(child)).join(',');
  return childrens
};

// 生成每一项
function genChild(child) {
  if (child.type === 1) { // 1表示是元素就递归
    return generate(child)
  } else { // 表示文本
    
    let text = child.text;
    if (!defaultTagRE.test(text)) { // 普通文本的拼接
      return `_v('${text}')`
    }
    // 带表达式的拼接 _v('aa' + _s(name) + 'bb')
    let lastIndex = defaultTagRE.lastIndex = 0;
    let tokens = [], match; 

    while(match = defaultTagRE.exec(text)) {
      let index = match.index;

      if (index > lastIndex) {
        tokens.push(JSON.stringify(text.slice(lastIndex, index)))
      }
      tokens.push(`_s(${match[1]})`);

      // 增加 lastIndex 长度
      lastIndex = index + match[0].length
    }
    // 如果有剩余的普通字符则追加
    if (lastIndex < text.length) {
      tokens.push(JSON.stringify(text.slice(lastIndex)))
    }
    return `_v(${tokens.join('+')})`; // 截取+拼接
  }
}


export default function generate(ast) {
  let children = generateChildren(ast);
  const code = `_c('${ast.tag}', ${ast.attrs.length ? genProps(ast.attrs): 'undefined'}${children ? ` ,${children}` : ''}) `
  return code
}