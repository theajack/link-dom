/*
 * @Author: tackchen
 * @Date: 2025-11-29 02:15:23
 * @Description: Coding something
 */
/*
| 类别   | 名称                | 作用描述                                                                 | 备注                                                                 |
|--------|---------------------|--------------------------------------------------------------------------|----------------------------------------------------------------------|
| Slot   | `#default`          | 放置需要添加过渡动画的单个元素/组件（仅支持单个根节点）                   | 唯一插槽，必传（无默认内容）                                          |
| Props  | `name`              | 过渡类名前缀（用于自动生成 `xxx-enter` 等过渡类）                         | 可选，默认 `v`（即默认过渡类为 `v-enter` 等）                          |
| Props  | `appear`            | 初始渲染时是否执行过渡动画                                               | 可选，默认 `false`                                                    |
| Props  | `mode`              | 控制进入/离开动画的执行顺序（仅对互斥元素生效，如 `v-if/v-else`）         | 可选，值：`in-out`（先进后出）、`out-in`（先出后进），默认无（同时执行） |
| Props  | `duration`          | 过渡动画时长（毫秒），可统一设置或分别控制进入/离开                       | 可选，格式：`300` 或 `{ enter: 500, leave: 300 }`，默认监听原生事件    |
| Props  | `type`              | 强制指定过渡类型（避免 `transition` 和 `animation` 冲突）                 | 可选，值：`transition`（监听 `transitionend`）、`animation`（监听 `animationend`） |
| Props  | `enter-from-class`  | 进入动画开始时的自定义类名（覆盖 `name-enter-from`）                      | 可选，优先级高于默认过渡类                                            |
| Props  | `enter-active-class`| 进入动画执行中的自定义类名（覆盖 `name-enter-active`）                    | 可选，常配合第三方动画库（如 Animate.css）                            |
| Props  | `enter-to-class`    | 进入动画结束时的自定义类名（覆盖 `name-enter-to`）                        | 可选                                                                  |
| Props  | `leave-from-class`  | 离开动画开始时的自定义类名（覆盖 `name-leave-from`）                      | 可选                                                                  |
| Props  | `leave-active-class`| 离开动画执行中的自定义类名（覆盖 `name-leave-active`）                    | 可选                                                                  |
| Props  | `leave-to-class`    | 离开动画结束时的自定义类名（覆盖 `name-leave-to`）                        | 可选                                                                  |
| Props  | `appear-from-class` | 初始渲染动画开始时的自定义类名（需配合 `appear` 使用）                    | 可选                                                                  |
| Props  | `appear-active-class`| 初始渲染动画执行中的自定义类名（需配合 `appear` 使用）                    | 可选                                                                  |
| Props  | `appear-to-class`   | 初始渲染动画结束时的自定义类名（需配合 `appear` 使用）                    | 可选                                                                  |
| Props  | `persisted`         | 是否保留过渡元素的 DOM 结构（仅隐藏，不销毁）                             | 可选，默认 `false`（Vue 3.2+ 支持）                                   |
| 事件   | `@before-enter`     | 进入动画开始前触发（元素已挂载，动画未开始）                             | 回调参数：`el`（当前元素）                                            |
| 事件   | `@enter`            | 进入动画开始时触发（可手动控制动画，需调用 `done` 回调）                 | 回调参数：`el`、`done`（结束回调，异步动画必用）                       |
| 事件   | `@after-enter`      | 进入动画完全结束后触发（过渡类已移除）                                   | 回调参数：`el`                                                        |
| 事件   | `@enter-cancelled`  | 进入动画被中断时触发（如中途隐藏元素）                                   | 回调参数：`el`（仅支持 CSS 过渡/动画）                                 |
| 事件   | `@before-leave`     | 离开动画开始前触发（元素未卸载，动画未开始）                             | 回调参数：`el`                                                        |
| 事件   | `@leave`            | 离开动画开始时触发（可手动控制动画，需调用 `done` 回调）                 | 回调参数：`el`、`done`（结束回调，异步动画必用）                       |
| 事件   | `@after-leave`      | 离开动画完全结束后触发（元素已卸载，过渡类已移除）                       | 回调参数：`el`                                                        |
| 事件   | `@leave-cancelled`  | 离开动画被中断时触发（如中途显示元素）                                   | 回调参数：`el`（仅支持 CSS 过渡/动画）                                 |
| 事件   | `@before-appear`    | 初始渲染动画开始前触发（需配合 `appear` 使用）                           | 回调参数：`el`                                                        |
| 事件   | `@appear`           | 初始渲染动画开始时触发（需配合 `appear` 使用，可手动控制动画）             | 回调参数：`el`、`done`（结束回调）                                    |
| 事件   | `@after-appear`     | 初始渲染动画完全结束后触发（需配合 `appear` 使用）                       | 回调参数：`el`                                                        |
| 事件   | `@appear-cancelled` | 初始渲染动画被中断时触发（需配合 `appear` 使用）                           | 回调参数：`el`（仅支持 CSS 过渡/动画）                                 |

### 关键补充：
1. 仅支持单个根节点，若需多个元素过渡，需用 `<transition-group>`；
2. 自定义类名（如 `enter-active-class`）优先级高于 `name` 生成的默认类；
3. 若使用 `@enter`/`@leave` 手动控制动画，必须调用 `done` 回调告知结束，否则会一直等待。


| 类别   | 名称                | 作用描述                                                                 | 备注                                                                 |
|--------|---------------------|--------------------------------------------------------------------------|----------------------------------------------------------------------|
| Slot   | `#default`          | 放置需要过渡的多个元素/组件（支持多节点，需为每个节点设置唯一 `key`）     | 唯一插槽，必传（无默认内容），节点需带 `key` 否则过渡异常              |
| Props  | 继承 `<transition>` 所有 Props | 包括 `name`/`appear`/`mode`/`duration`/自定义类名等（同 `<transition>`） | 除 `mode` 外均适用，`mode` 对 `<transition-group>` 无效（多节点不互斥） |
| Props  | `tag`               | 指定渲染的容器标签（默认渲染为 `<span>`）                                 | 可选，例：`tag="div"`、`tag="ul"`，设为 `false` 可禁用容器（Vue3.2+）  |
| Props  | `move-class`        | 元素移动时的自定义类名（覆盖 `name-move`，用于列表排序过渡）              | 可选，配合 `transform` 实现平滑移动，优先级高于默认类                  |
| Props  | `type`              | 强制指定过渡类型（避免 `transition` 和 `animation` 冲突）                 | 可选，值：`transition`/`animation`，同 `<transition>`                  |
| Props  | `duration`          | 过渡时长（支持统一设置或分别控制 `enter/leave/move`）                     | 可选，格式：`300` 或 `{ enter: 500, leave: 300, move: 200 }`           |
| 事件   | 继承 `<transition>` 所有事件 | 包括 `@before-enter`/`@enter`/`@after-leave` 等（同 `<transition>`）       | 事件回调参数均为单个节点 `el`，多节点触发时分别回调                   |
| 事件   | `@move`             | 元素因排序/布局变化发生移动时触发（仅列表排序场景）                       | 回调参数：`el`（移动的元素），需配合 `move-class` 或 CSS `transition`  |

### 关键补充：
1. 核心差异：`<transition>` 仅支持单节点，`<transition-group>` 支持多节点（需唯一 `key`）；
2. 移动过渡：需通过 `move-class` 或默认 `name-move` 类配合 `transform` 属性，才能实现元素移动时的平滑过渡；
3. 容器渲染：默认生成 `<span>` 容器，可通过 `tag` 自定义（如列表用 `tag="ul"`），Vue3.2+ 支持 `tag="false"` 取消容器；
4. 不支持 `mode`：因多节点不互斥，`in-out`/`out-in` 模式无效，默认所有节点过渡独立执行。


    <transition-group
      tag="ul"  <!-- 自定义渲染的容器标签（默认是 span） -->
      name="list"  <!-- 过渡类名前缀（生成 list-xxx 类） -->
      appear  <!-- 初始渲染时执行动画 -->
    >
      <!-- 3. 列表项：必须加唯一 key -->
      <li
        v-for="item in list"
        :key="item.id"  <!-- 用唯一 ID 当 key（禁止用 index） -->
        @click="removeItem(item.id)"
      >
        {{ item.content }}
      </li>
    </transition-group>
*/

import type { IReactiveLike } from 'link-dom-reactive';
import type { ISlots } from '../element/component';
import { defineComponent, isComponent } from '../element/component';
import { parseFuncWrap } from 'link-dom-shared';


// default 放异步内容、fallback 放加载态）+ 1 个 resolve 事件
export interface ITrasitionProps {
  /**
   * 用于自动生成过渡 CSS class 名。
   * 例如 `name: 'fade'` 将自动扩展为 `.fade-enter`、
   * `.fade-enter-active` 等。
   */
  name: IReactiveLike<string>;
  /**
   * 是否应用 CSS 过渡 class。
   * 默认：true
   */
  css: IReactiveLike<boolean>;
  /**
   * 指定要等待的过渡事件类型
   * 来确定过渡结束的时间。
   * 默认情况下会自动检测
   * 持续时间较长的类型。
   */
  type: IReactiveLike<'transition' | 'animation'>
  /**
   * 显式指定过渡的持续时间。
   * 默认情况下是等待过渡效果的根元素的第一个 `transitionend`
   * 或`animationend`事件。
   */
  duration: IReactiveLike<number | { enter: number; leave: number }>
  /**
   * 控制离开/进入过渡的时序。
   * 默认情况下是同时的。
   */
  mode: IReactiveLike<'in-out' | 'out-in' | 'default'>
  /**
   * 是否对初始渲染使用过渡。
   * 默认：false
   */
  appear: IReactiveLike<boolean>;

  /**
   * 用于自定义过渡 class 的 prop。
   * 在模板中使用短横线命名，例如：enter-from-class="xxx"
   */
  enterFromClass: IReactiveLike<string>;
  enterActiveClass: IReactiveLike<string>;
  enterToClass: IReactiveLike<string>;
  appearFromClass: IReactiveLike<string>;
  appearActiveClass: IReactiveLike<string>;
  appearToClass: IReactiveLike<string>;
  leaveFromClass: IReactiveLike<string>;
  leaveActiveClass: IReactiveLike<string>;
  leaveToClass: IReactiveLike<string>;

  onBeforeEnter: ()=>void;
  onBeforeLeave: ()=>void;
  onEnter: ()=>void;
  onLeave: ()=>void;
  onAppear: ()=>void;
  onAfterEnter: ()=>void;
  onAfterLeave: ()=>void;
  onAfterAppear: ()=>void;
  onEnterCancelled: ()=>void;
  onLeaveCancelled: ()=>void; //  (v-show only)
  onAppearCancelled: ()=>void;
};


export const Transition = defineComponent<ITrasitionProps, ISlots>((
    { props, slots }
) => {
    const ready = Promise.all(slots.default.map(slot => {
        return isComponent(slot) ? slot.el : slot;
    }));
    ready.then(() => {
        props.resolve?.();
    });
    const target = Await(ready, (v) => v);
    if (slots.fallback) {
        target.default(() => parseFuncWrap(slots.fallback));
    }
    return target;
});