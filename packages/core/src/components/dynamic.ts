/*
 * @Author: tackchen
 * @Date: 2025-11-29 03:04:47
 * @Description: Coding something
 */

import { li, tag } from '../element/short';
import type { IComponentProxy, ISlots } from '../element/component';
import { defineComponent, isComponent } from '../element/component';
import { isDomNode, isPureFunc, SharedStatus } from 'link-dom-shared';
import { isReactiveLike, read, watch, type IReactiveLike } from 'link-dom-reactive';
import type { Dom } from '../element/element';
import { Marker } from '../controller/marker';
import { frag } from '../element/text';
import { isDomFrag } from '../utils';

// default 放异步内容、fallback 放加载态）+ 1 个 resolve 事件
type IDynamicProps = {
    is: IReactiveLike<string|Node|Dom|IComponentProxy>;
};

function getSlotContent (is: any, slot: any) {
    const value = read(is);

    if (isDomFrag(value)) {
        return value;
    }

    if (typeof value === 'string' || isDomNode(value)) {
        return tag(value as any)(...slot);
    }
    if (isPureFunc(is)) {
        is = is();
    }
    if (isComponent(is)) {
        return is(...slot);
    }
    return slot;
}

export const Dynamic = defineComponent<IDynamicProps, ISlots>((
    { props, slots }
) => {
    const _isReactive = isReactiveLike(props.is);
    const content = getSlotContent(props.is, slots.default);

    let doms: any = null;
    if (isDomFrag(content)) {
        doms = Array.from(content.children);
    }

    if (!_isReactive || SharedStatus.isSSR) {
        content.onSwitchDoms = (fn: (v: any[], old: any[]|null)=>void, appear?: boolean) => {
            if (appear) {
                fn(doms || [ content.el ], null);
                doms = null;
            }
        };
        return content;
    }
    const marker = new Marker();
    let list: any[];
    content.onSwitchDoms = (fn: (v: any[], old: any[]|null)=>void, appear?: boolean) => {
        if (!list) list = [];
        list.push(fn);
        if (appear) {
            fn(doms || [ content.el ], null);
            doms = null;
        }
    };
    const trigger = (v: any[], old: any[]|null) => {
        list?.forEach(fn => fn(v, old));
    };
    // console.log('isReactive');
    watch((props.is as any), () => {
        // console.log('watch dynamic');
        const content = getSlotContent(props.is, slots.default);
        const list = marker.clear();
        const f = frag(content);
        trigger(Array.from(f.el.children), list);
        marker.replace(f.el);
    });
    return marker.wrapContent(content);
}, {
    name: 'ld-dynamic',
});
