/*
 * @Author: tackchen
 * @Date: 2025-11-29 03:04:47
 * @Description: Coding something
 */

import { Await } from '../element/short';
import type { ISlots } from '../element/component';
import { defineComponent, isComponent } from '../element/component';
import { parseFuncWrap } from 'link-dom-shared';

// default 放异步内容、fallback 放加载态）+ 1 个 resolve 事件
type ISuspenseProps = {
    resolve: () => void;
};
type ISuspenseSlots = ISlots<'fallback'>

export const Suspense = defineComponent<ISuspenseProps, ISuspenseSlots>((
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