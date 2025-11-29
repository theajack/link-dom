/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-13 17:32:04
 * @Description: Coding something
 */
import { LinkDomType } from '../utils';
import { createMarkerNode, removeBetween } from './marker';
import { Frag } from '../element/text';
import type { IChild } from '../element/element';
import { KEY_LD_TYPE, KEY_SCOPE, SharedStatus } from 'link-dom-shared';
import type { LifeScope } from '../element/lifes';
import { setCurrentScope } from '../element/lifes';
import { isComponent, type IComponentProxy } from '../element/component';

export class AwaitClass {
    [KEY_LD_TYPE] = LinkDomType.Await;
    [KEY_SCOPE]: LifeScope;
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
        _promise: Promise<any>|IComponentProxy,
        _generator: (data: any)=>IChild,
    ) {
        this.start = createMarkerNode();
        if (!SharedStatus.isSSR) {
            if (isComponent(_promise)) {
                // @ts-ignore
                _promise = _promise.el;
            }
            _promise.then(data => {
                const scope = this[KEY_SCOPE];
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