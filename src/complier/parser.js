const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // 匹配标签名的  aa-xxx
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; //  aa:aa-xxx  
const startTagOpen = new RegExp(`^<${qnameCapture}`); //  此正则可以匹配到标签名 匹配到结果的第一个(索引第一个) [1]
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>  [1]
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的

// [1]属性的key   [3] || [4] ||[5] 属性的值  a=1  a='1'  a=""
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的  />    > 
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{   xxx  }}  

// vue3的编译原理比vue2里好很多，没有这么多正则了

// 解析html结构 构建ast树
export default function parserHTML(html) {
  // ast 语法树 描述的是语法
  let stack = []; // 存放标签的结构
  let root = null; // 根节点
  function createElementAST(tag, attrs, parent = null) {
    return {
      tag,
      type: 1, // 标示标签
      parent,
      attrs,
      children: []
    }
  }
  function start({tag, attrs}) {
    let parent = stack[stack.length - 1];
    let element = createElementAST(tag, attrs, parent);
    if (parent) {
      element.parent = parent; // g更新parent的属性指向新的parent
      parent.children.push(element); // 将当前节点挂在父节点上
    }
    // 第一次
    if (root === null) {
      root = element
    }
    stack.push(element)
  }
  function text(str) {
    let parent = stack[stack.length - 1];
    str = str.replace(/\s|\\n\\r/g,'');
    if (str) {
      parent.children.push({
        type: 2,
        text: str
      })
    }
  }
  function end(tagName) {
    let endTag = stack.pop();
    if (endTag.tag != tagName) {
      console.log('标签比配失败');
    }
  }
  // 字符串前进的方法
  function advance(len) {
    html = html.slice(len)
  }
  // 解析标签
  function parseStartTag() {
    const start = html.match(startTagOpen);
    if (!start) return;

    // 生成标签对象
    const match = {
      tag: start[1],
      attrs: []
    }
    // 删除匹配过的标签
    advance(start[0].length)

    // 遍历属性标签
    let end, attrs;
    while (!(end = html.match(startTagClose)) && (attrs = html.match(attribute))) {
      match.attrs.push({
        name: attrs[1],
        value: attrs[3]||attrs[4]||attrs[5],
      })
      advance(attrs[0].length)
    }
    // 剩下是闭合标签
    if (end) {
      advance(end[0].length)
    }

    return match
  }

  // 循环遍历整个html字符串
  while(html) {
    // 解析文本和标签
    let index = html.indexOf('<');
    if (index === 0) {
      // 解析开始标签
      const startTagMatch = parseStartTag();
      if (startTagMatch) {
        start(startTagMatch)
        continue;
      }
      let endMark;
      if (endMark = html.match(endTag)) { // 结束标签
        end(endMark[1]);
        advance(endMark[0].length)
        continue;
      }
    }
    // 解析文本
    if (index > 0) {
      let txt = html.slice(0, index);
      text(txt);
      advance(index)
    }
  }

  return root;
  
}