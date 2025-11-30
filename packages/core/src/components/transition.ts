/*
 * @Author: tackchen
 * @Date: 2025-11-29 02:15:23
 * @Description: Coding something
 */

import type { IReactiveLike } from 'link-dom-reactive';
import { read } from 'link-dom-reactive';
import type { ISlots } from '../element/component';
import { defineComponent } from '../element/component';
import { SharedStatus, watiNextFrame, withResolve } from 'link-dom-shared';
import { TransStatus } from '../utils';
import { frag } from '../element/text';

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

  onBeforeAppear: (el: HTMLElement[])=>void;
  onBeforeEnter: (el: HTMLElement[])=>void;
  onBeforeLeave: (el: HTMLElement[])=>void;
  onEnter: (el: HTMLElement[], done: ()=>void)=>void;
  onLeave: (el: HTMLElement[], done: ()=>void)=>void;
  onAppear: (el: HTMLElement[], done: ()=>void)=>void;
  onAfterEnter: ()=>void;
  onAfterLeave: ()=>void;
  onAfterAppear: ()=>void;
  onEnterCancelled: ()=>void;
  onLeaveCancelled: ()=>void; //  (v-show only)
  onAppearCancelled: ()=>void;
}

function onEnterProcess (list: HTMLElement[], props: ITransitionProps, isAppear: boolean) {
    const enterFromClass = isAppear ?
        read(props.appearFromClass) || `${read(props.name)}-appear-from` :
        read(props.enterFromClass) || `${read(props.name)}-enter-from`;
    const onBefore = isAppear ? props.onBeforeAppear : props.onBeforeEnter;
    onBefore?.(list);
    list.forEach(el => {
        el.classList.add(enterFromClass);
    });
}

async function onActiveProcess (list: HTMLElement[], props: ITransitionProps, isAppear: boolean, scope: ITransScope) {
    const enterFromClass = isAppear ?
        read(props.appearFromClass) || `${read(props.name)}-appear-from` :
        read(props.enterFromClass) || `${read(props.name)}-enter-from`;
    const enterActiveClass = isAppear ?
        read(props.appearActiveClass) || `${read(props.name)}-appear-active` :
        read(props.enterActiveClass) || `${read(props.name)}-enter-active`;
    const enterToClass = isAppear ?
        read(props.appearToClass) || `${read(props.name)}-appear-to` :
        read(props.enterToClass) || `${read(props.name)}-enter-to`;

    const onStart = isAppear ? props.onAppear : props.onEnter;
    const onAfter = isAppear ? props.onAfterAppear : props.onAfterEnter;

    const { ready, resolve } = withResolve();

    let count = 0;
    const size = list.length;
    const addCount = () => {
        count ++;
        if (count >= size) {
            onAfter?.();
            resolve();
            console.warn('resolve onActive');
        }
    };

    await watiNextFrame();

    const doneList = list.map(el => {
        el.classList.remove(enterFromClass);
        el.classList.add(enterActiveClass);
        el.classList.add(enterToClass);
        const onEnd = commonProcess(el, props, addCount, () => {
            el.classList.remove(enterActiveClass);
            el.classList.remove(enterToClass);
        });
        return onEnd;
    });
    const done = () => { doneList.forEach(fn => fn()); };
    onStart?.(list, done);
    scope.addToList(done);
    return ready;
}


async function onLeaveProcess (list: HTMLElement[], props: ITransitionProps, scope: ITransScope) {


    const leaveFromClass = read(props.leaveFromClass) || `${read(props.name)}-leave-from`;
    const leaveActiveClass = read(props.leaveActiveClass) || `${read(props.name)}-leave-active`;
    const leaveToClass = read(props.leaveToClass) || `${read(props.name)}-leave-to`;

    const onStart = props.onLeave;
    const onAfter = props.onAfterLeave;

    const { ready, resolve } = withResolve();

    let count = 0;
    const size = list.length;
    const addCount = () => {
        count ++;
        if (count >= size) {
            onAfter?.();
            resolve();
            console.warn('resolve onLeave');
        }
    };

    // 起始阶段
    list.forEach(el => {
        el.classList.add(leaveFromClass);
        el.classList.add(leaveActiveClass);
    });

    await watiNextFrame();

    const doneList = list.map(el => {
        el.classList.remove(leaveFromClass);
        el.classList.add(leaveToClass);
        const onEnd = commonProcess(el, props, addCount, () => {
            el.classList.remove(leaveActiveClass);
            el.classList.remove(leaveToClass);
        });
        return onEnd;
    });
    const done = () => {doneList.forEach(fn => fn());};
    onStart?.(list, done);
    scope.addToList(done);
    return ready;
}

  type ICancelKey = 'onEnterCancelled'|'onAppearCancelled'|'onLeaveCancelled'
export function createTransScope (props: ITransitionProps) {
    const set = new Set<ICancelKey>([]);
    return {
        __list: [] as any[],
        addToList (fn: ()=>void) {
            this.__list.push(fn);
        },
        cancel () {
            console.log('resolve cance', this.__list.length);
            this.__list.forEach(fn => fn());
            this.__list = [];
            set.forEach(key => {
                console.warn('resolve canceled', key);
                props[key]?.();
            });
        },
        done () {
            this.__list = [];
        },
        collectSet (name: ICancelKey) {
            set.add(name);
            return () => {set.delete(name);};
        },
        // 返回值为推断 mode 的类型
        getMode ()  {
            return read(props.mode);
        }
    };
}

export type ITransScope = ReturnType<typeof createTransScope>;

export const Transition = defineComponent<ITransitionProps, ISlots>((
    { props, slots }
) => {
    if (SharedStatus.isSSR) {
        return slots.default;
    }

    if (!slots.default?.length) return [];

    const scope = createTransScope(props);

    const _frag = frag(...slots.default);

    const children = _frag.children as any[];
    for (const item of children) {
        item.onSwitchDoms?.(async (list: HTMLElement[]|null, status: TransStatus, isAppear: boolean) => {
            console.log('onSwitchDoms', list, status, isAppear);
            // const isAppear = !prevList;
            if (!list?.length) return;
            if (status === TransStatus.EnterFrom) {
                if (isAppear) await watiNextFrame();
                onEnterProcess(list, props, isAppear);
            } else if (status === TransStatus.EnterActive) {
                const clear = scope.collectSet(isAppear ? 'onAppearCancelled' : 'onEnterCancelled');
                await onActiveProcess(list, props, isAppear, scope);
                clear();
            } else if (status === TransStatus.LeaveFrom) {
                const clear = scope.collectSet('onLeaveCancelled');
                await onLeaveProcess(list, props, scope);
                clear();
            }
        }, scope, !!read(props.appear));
    }
    return _frag;
}, {
    name: 'ld-transition',
    defaultProps: {
        name: 'ld',
        mode: 'default',
        css: true,
    }
});


function commonProcess (el: HTMLElement, props: ITransitionProps, addCount: ()=>void, clearClass: ()=>void) {
    const clear: any[] = [ clearClass ];
    const type = read(props.type);

    const onEnd = () => {
        clear.forEach(fn => fn());
        addCount();
        console.warn('onEnd');
    };

    let count = 0;
    let size = 0;
    const onStart = () => {
        size++;
    };
    const addEndCount = () => {
        count ++;
        if (count >= size) onEnd();
    };

    const duration = read(props.duration);
    if (typeof duration === 'number') {
        const timer = setTimeout(onEnd, duration);
        clear.push(() => clearTimeout(timer));
    }
    const css = read(props.css);
    if (css) {
        if (type !== 'animation') {
            el.addEventListener('transitionstart', onStart, { once: true });
            el.addEventListener('transitionend', addEndCount, { once: true });
            clear.push(() => {
                el.removeEventListener('transitionend', addEndCount);
                el.removeEventListener('transitionstart', onStart);
            });
        }
        if (type !== 'transition') {
            el.addEventListener('animationstart', onStart, { once: true });
            el.addEventListener('animationend', addEndCount, { once: true });
            clear.push(() => {
                el.removeEventListener('animationend', addEndCount);
                el.removeEventListener('animationstart', onStart);
            });
        }
    }

    return onEnd;
}
