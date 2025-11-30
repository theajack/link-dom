/*
 * @Author: tackchen
 * @Date: 2025-11-29 03:04:47
 * @Description: Coding something
 */

import { tag } from '../element/short';
import type { IComponentProxy, ISlots } from '../element/component';
import { defineComponent, isComponent } from '../element/component';
import { isDomNode, isPureFunc, SharedStatus } from 'link-dom-shared';
import { isReactiveLike, read, watch, type IReactiveLike } from 'link-dom-reactive';
import type { Dom } from '../element/element';
import { Marker } from '../controller/marker';
import { frag } from '../element/text';
import { filterElement, isDomFrag, TransStatus } from '../utils';
import type { ITransCall } from './trans-base';
import { TransitionProxy } from './trans-base';
import type { ITransScope } from './transition';

// default 放异步内容、fallback 放加载态）+ 1 个 resolve 事件
type IDynamicProps = {
    is: IReactiveLike<string|Node|Dom|IComponentProxy>;
};

function getSlotContent (is: any, slot: any) {
    const value = read(is);

    if (typeof value === 'string' || isDomNode(value)) {
        return tag(value as any)(...slot);
    }
    if (isPureFunc(is)) {
        is = is();
    }
    if (isComponent(is)) {
        return is(...slot);
    }
    return frag(is, slot) as any;
}

export const Dynamic = defineComponent<IDynamicProps, ISlots>((
    { props, slots }
) => {
    const _isReactive = isReactiveLike(props.is);
    const content = getSlotContent(props.is, slots.default);

    let transition: TransitionProxy|null = null;

    let doms: any = null;
    if (isDomFrag(content)) {
        doms = Array.from(content.children);
    }

    const addOnSwitch = (isReactive: boolean) => {
        content.onSwitchDoms = async (fn: ITransCall, trans: ITransScope, showAppear = false) => {
            if (!transition) { transition = new TransitionProxy(trans); }
            // ! 不是动态内容 不用记录到 list中
            if (isReactive) transition.onSwitchDoms(fn);
            if (showAppear) {
                await transition.appear(doms);
                doms = null;
            }
        };
    };

    if (!_isReactive || SharedStatus.isSSR) {
        if (!SharedStatus.isSSR) {
            addOnSwitch(_isReactive);
        }
        return content;
    }
    const marker = new Marker();
    addOnSwitch(_isReactive);

    const switchElement = async () => {
        const content = getSlotContent(props.is, slots.default);
        if (transition) {
            // ! 此处必须要不包含element，因为需要remove掉所有元素
            const list = marker.pick(false, false);
            const remove = async () => {
                await transition!.trigger(filterElement(list), TransStatus.LeaveFrom);
                list.forEach(item => item.remove());
            };
            const add = async () => {
                const f = frag(content);
                const doms = Array.from(f.el.children);
                await transition!.trigger(doms, TransStatus.EnterFrom);
                marker.replace(f.el);
                console.warn('_initElements enter action start');
                await transition!.trigger(doms, TransStatus.EnterActive);
                console.warn('_initElements enter action end');
            };
            await transition!.callSwitchFn(add, remove);
        } else {
            marker.clear();
            const f = frag(content);
            marker.replace(f.el);
        }
    };
    let switchReady: Promise<void> = Promise.resolve();
    // console.log('isReactive');
    watch((props.is as any), async () => {
        // console.log('watch dynamic');
        if (transition) {
            transition.cancel();
            await switchReady;
            console.log('_initReady');
        }
        switchReady = switchElement();
    });
    return marker.wrapContent(content);
}, {
    name: 'ld-dynamic',
});
