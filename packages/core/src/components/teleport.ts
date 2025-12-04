/*
 * @Author: tackchen
 * @Date: 2025-11-29 02:15:17
 * @Description: Coding something
 */
import type { Dom } from '../element/element';
import type { ISlots } from '../element/component';
import { defineComponent } from '../element/component';
import { createMarkerNode, Marker } from '../controller/marker';
import { Frag } from '../element/text';
import { KEY_LD_TYPE, SharedStatus } from 'link-dom-shared';
import type { IReactiveLike } from 'link-dom-reactive';
import { watch, read, readFn, isStatic, isReactiveLike } from 'link-dom-reactive';

interface ITeleportProps {
    to: IReactiveLike<string | Dom | HTMLElement>;
    disabled: IReactiveLike<boolean>;
}

async function getTarget (to: ITeleportProps['to']): Promise<Element|null> {
    to = read(to);
    if (typeof to === 'string') {
        return document.querySelector(to);
    }
    if (typeof to[KEY_LD_TYPE] === 'number') {
        // @ts-ignore
        return to.el;
    }
    return to as HTMLElement;
}

export const Teleport = defineComponent<ITeleportProps, ISlots>(({
    props, slots, mounted
}) => {

    const _isStatic: boolean = isStatic(props.disabled);
    // console.log('isStatic Teleport', _isStatic);
    const frag = new Frag();

    const marker = new Marker();
    const origin = createMarkerNode('origin');
    frag.append(...marker.wrapContent(slots.default), origin);
    if (SharedStatus.isSSR) {
        return frag;
    }

    const moveToTarget = async () => {
        if (read(props.disabled)) return;
        const target = await getTarget(props.to);
        if (!target) return;
        const list = marker.clear(true);
        list.forEach((item) => {
            target?.appendChild(item);
        });
    };
    if (isReactiveLike(props.to)) {
        watch(props.to, moveToTarget);
    }
    if (!_isStatic) {
        const moveBack = () => {
            if (origin.parentElement) {
                const list = marker.clear(true);
                list.forEach((item) => {
                    origin.parentElement?.insertBefore(item, origin);
                });
            }
        };
        watch(readFn(props.disabled), (v) => {
            if (v) {
                moveBack();
            } else {
                moveToTarget();
            }
        });
    }
    mounted(async () => {
        await moveToTarget();
        if (_isStatic) {
            origin.remove();
            marker.destroy();
        }
    });
    return frag;

}, {
    name: 'ld-teleport',
    defaultProps: {
        disabled: false,
    }
});