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
    return slot;
}

export const Dynamic = defineComponent<IDynamicProps, ISlots>((
    { props, slots }
) => {
    const _isReactive = isReactiveLike(props.is);
    const content = getSlotContent(props.is, slots.default);
    if (!_isReactive || SharedStatus.isSSR) return content;
    const marker = new Marker();
    console.log('isReactive');
    watch((props.is as any), () => {
        console.log('watch dynamic');
        const content = getSlotContent(props.is, slots.default);
        marker.clear();
        marker.replace(frag(content).el);
    });
    return marker.wrapContent(content);
});