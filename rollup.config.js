import babel from 'rollup-plugin-babel'; // 编译 es6
import resolve from '@rollup/plugin-node-resolve'; // 按照node方式解析文件路径 - 文件夹中自动寻找index文件
export default {
  input: './src/index.js', // 打包的入口文件
  output: {
    file: 'dist/vue.js', // 打包的出口
    format: 'umd', // 打包的格式， IIFE，ESM，UMD等
    name: 'Vue', // umd 模式下需要配置名字，会讲导入的模块放到window上，如果node中使用 cjs，如果只是打包
    sourcemap: true, // 可以进行源代码调试
  },
  // 插件
  plugins: [
    resolve(),
    babel({
      exclude: 'node_modules/**', // glob写法，不编译的目录
    })
  ]
}