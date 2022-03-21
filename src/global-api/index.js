import { mergeOptions } from "../utils/merge-options";

export function globalAPIMixin(Vue) {
  // 全局属性
  Vue.options = {};

  // 全局的mixin
  Vue.mixin = function(options) {
    this.options = mergeOptions(this.options, options);
    return this;
  }
}