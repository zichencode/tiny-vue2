import generate from "./generate"
import parserHTML from "./parser"

export const compileToFunction = (template) => {
  // 将模版变成 ast语法树
  let ast = parserHTML(template)
  
  // 代码优化 标记静态节点

  // 代码生成
  let code = generate(ast)

  // 模版引擎的实现原理 通过 new Function + with eg: ejs, jade, handlerbar
  
  // 为什么包装成函数，因为下次更新的时候还是可以再次调用函数 
  // 为什么用with 是因为用户 传的是 {{name}} 这样的，所以外包一层作用域 通过 xx.call(vm) 调用
  let render = new Function(`with(this){return ${code}}`);
  
  return render;

  // 难度排序 1.编译原理 2.响应式原理-依赖收集 3.组件化开发-贯穿了整个流程 4.diff算法
  
}