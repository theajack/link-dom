<!--
 * @Author: chenzhongsheng
 * @Date: 2025-09-06 18:16:04
 * @Description: Coding something
-->

- [x] 自定义渲染
- [x] 单向数据流
- [x] ssr 支持
  - [] 静态组件判定
  - [] ssr路由适配
  - [] 水合效率优化 [时间分片]
- [x] 路由支持
  - [] 动态路由
- [x] 异步控制器 ctrl.async();
- [ ] 支持生命周期
- [ ] jsbox 支持iframe沙盒


# BugFix

- [x] 简单值数组 + for 使用时无法响应式更新
- [x] for 中使用到外部ref时，dom被清空掉还是会有内存泄露
- [x] sort style 有bug
- [x] forRef 简单值数组的同步问题
- [ ] 修复 hydrate 中 for、if、show的兼容问题


## 性能优化

- [x] replace all rows
- [x] clear rows *
- [x] remove row
- [ ] for 使用一个模版，先对模版改动，然后对实际dom渲染

## 内存优化

- [x] 内存泄漏
- [x] 内存占用



内存占用问题

全局ref，在数组中依赖时，即便数组移除了，该以来还是会被记录在ref中
目前处理方式是对数组增加一个结构标记，移出时同时清理list，可以规避内存泄露
存在的问题时更多的内存占用和耗时

重新设计：

let a = ref('')

for中:

observe(() => a.value === item.id, ()=>{
  console.log('a change')
})

1. 整体优化：【不是最优方案】

for整体依赖了哪些外部dep 

？？【如何检查内外部依赖】
-- 通过 Proxy [Parent]标记父元素，追溯父元素是否是当前 target即可
-- 只需要对第一个元素进行处理即可？【不一定 有可能有些判断条件在第一个中不会出现】

在删除元素时，对外依赖进行一次移除操作即可

新的问题：if未命中分支命中时，不知道依赖是在这个for里面，也就无法手动回收

2. 重构：【最优方案】

在数组移出时，可以自动清除掉 全局ref中的订阅者（基于WeakMap）【是否可行?】

observe(listener, exe);
收集到listener中的依赖，将exe加入依赖的list中
依赖有改变时 触发该依赖中list的所有exe进行更新







a.value = 3;

如何通知 observe 变更

observe 中订阅a的变更

register(a, ()=>{

});

a.value = 3;

emit(a, a.value);

# 模版模式是否可行

基本原理：for 循环中 仅操作一次，后续所有操作复刻模版操作行为，优化内存占用和耗时