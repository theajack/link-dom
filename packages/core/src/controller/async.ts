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
    constructor (
        _promise: Promise<any>,
        _generator: (data: any)=>IChild,
    ) {
        this.el = createMarkerNode();
        _promise.then(data => {
            const child = _generator(data);
            const frag = new Frag().append(child);
            this.el.replaceWith(frag.el);
        });
    }
}