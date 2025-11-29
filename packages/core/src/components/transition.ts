/*
 * @Author: tackchen
 * @Date: 2025-11-29 02:15:23
 * @Description: Coding something
 */

import type { IReactiveLike } from 'link-dom-reactive';
import { read, watch } from 'link-dom-reactive';
import type { ISlots } from '../element/component';
import { defineComponent } from '../element/component';
import { parseFuncWrap, SharedStatus } from 'link-dom-shared';
import { Frag } from '../element/text';
import type { Dom } from '../element/element';

// default 放异步内容、fallback 放加载态）+ 1 个 resolve 事件
export interface ITransitionProps {
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
  onEnter: (el: HTMLElement, done: ()=>void)=>void;
  onLeave: (el: HTMLElement, done: ()=>void)=>void;
  onAppear: (el: HTMLElement, done: ()=>void)=>void;
  onAfterEnter: ()=>void;
  onAfterLeave: ()=>void;
  onAfterAppear: ()=>void;
  onEnterCancelled: ()=>void;
  onLeaveCancelled: ()=>void; //  (v-show only)
  onAppearCancelled: ()=>void;
}

class TransitionManager {
}

export const Transition = defineComponent<ITransitionProps, ISlots>((
    { props, slots }
) => {
    if (SharedStatus.isSSR) {
        return slots.default;
    }


    return slots.default;
});