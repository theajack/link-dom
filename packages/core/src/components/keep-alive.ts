/*
 * @Author: tackchen
 * @Date: 2025-11-29 03:14:06
 * @Description: Coding something
 */
// <component>	Slot	#default	接收被动态渲染的组件内容（通过 is 指定）	唯一插槽，可选（组件无默认内容时可不传）
// Props	is	指定要渲染的组件（组件对象 / 组件名 / HTML 标签名）	必传，例：:is="AsyncComponent"、is="div"、:is="currentComp"
// 事件	-	无内置事件，触发的是被渲染组件自身的事件（如 @click 直接绑定到组件）	事件传递、作用域与普通组件一致
// <keep-alive>	Slot	#default	放置需要缓存的组件（仅支持单个根节点）	唯一插槽，必传
// Props	include	仅缓存指定组件（组件名数组 / 正则 / 字符串）	可选，例：include="Home,User"、`:include="/Home	User/"`
// Props	exclude	不缓存指定组件（格式同 include）	可选，优先级高于 include
// Props	max	最大缓存组件数量（超出时销毁最早缓存的组件）	可选，例：max="3"（Vue 3.2+ 支持）
// 事件	@activate	组件被激活（从缓存中取出显示）时触发	回调参数：cachedInstance（被激活的组件实例）
// 事件	@deactivate	组件被缓存（隐藏）时触发