/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-13 17:32:04
 * @Description: Coding something
 */
import { LinkDomType } from '../utils';
import { createMarkerNode } from './_marker';
import { Frag } from '../text';
import type { IChild } from '../element';

export class Await {
    __ld_type = LinkDomType.Await;
    el: any;
    start: Node;
    getMarker () {
        return this.start;
    }
    constructor (
        _promise: Promise<any>,
        _generator: (data: any)=>IChild,
    ) {
        this.start = createMarkerNode();
        this.el = new Frag().append(this.start);
        _promise.then(data => {
            const child = _generator(data);
            const frag = new Frag().append(child);
            frag.__mounted();
            const parent = this.start.parentNode!;
            const next = this.start.nextSibling;
            if (next) {
                parent.insertBefore(frag.el, next);
            } else {
                parent.appendChild(frag.el);
            }
        });
    }
}