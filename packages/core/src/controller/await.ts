/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-13 17:32:04
 * @Description: Coding something
 */
import { LinkDomType } from '../utils';
import { createMarkerNode, removeBetween } from './_marker';
import { Frag } from '../text';
import type { IChild } from '../element';
import { SharedStatus } from 'link-dom-shared';
import type { LifeScope } from '../lifes';
import { setCurrentScope } from '../lifes';

export class AwaitClass {
    __ld_type = LinkDomType.Await;
    __ld_scope: LifeScope;
    _frag: Frag;
    _default: IChild[] = [];
    get el () {
        if (!this._frag) {
            this._frag = new Frag().append(this.start, ...this._default, this.end);
            // @ts-ignore
            this._default = null;
        }
        return this._frag.el;
    }
    start: Node;
    end: Node;
    getMarker () {
        return this.start;
    }
    constructor (
        _promise: Promise<any>,
        _generator: (data: any)=>IChild,
    ) {
        this.start = createMarkerNode();
        if (!SharedStatus.isSSR) {
            _promise.then(data => {
                const scope = this.__ld_scope;
                if (this.end) {
                    scope.beforeUnmount();
                    removeBetween(this.start, this.end, false);
                    // @ts-ignore
                    this.end.remove();
                    scope.unmounted();
                }
                setCurrentScope(scope);
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
    default (...doms: IChild[]) {
        this._default = doms;
        this.end = createMarkerNode();
        return this;
    }
}