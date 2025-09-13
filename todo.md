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


# BugFix

- [x] 简单值数组 + for 使用时无法响应式更新
- [x] for 中使用到外部ref时，dom被清空掉还是会有内存泄露
- [ ] sort style 有bug


## 性能优化

- [ ] replace all rows
- [ ] clear rows *
- [ ] remove row
- [ ] for 使用一个模版，先对模版改动，然后对实际dom渲染

## 内存优化

- [x] 内存泄漏
- [ ] 内存占用