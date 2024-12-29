/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-13 11:25:44
 * @Description: Coding something
 */

import type {IChild} from './element';
import type {IComputedLike} from './reactive/computed';
import type {IReactive} from './reactive/reactive';
import {useReact} from './reactive/reactive';
import {LinkDomType, traverseChildren} from './utils';

export class Text {
    __ld_type = LinkDomType.Text;
    el: Node;
    constructor (val?: string|number|IReactive|IComputedLike) {
        this.el = document.createTextNode('');
        if (typeof val !== 'undefined') {
            this.text(val);
        }
    }
    text (val: string|number|IReactive|IComputedLike) {
        
        useReact(val, (v) => this.el.textContent = v);
        return this;
    }
    // @ts-ignore
    private __mounted?: (el: Text)=>void;
    mounted (v: (el: Text)=>void) {
        this.__mounted = v;
        return this;
    }
}

export class Frag {
    __ld_type = LinkDomType.Frag;
    el: DocumentFragment;
    children: IChild[] = [];
    constructor () {
        this.el = document.createDocumentFragment();
    }
    append (...doms: IChild[]) {
        traverseChildren(doms, (dom, origin) => {
            this.children.push(origin);
            this.el.appendChild(dom);
        });
        return this;
    }
    // @ts-ignore
    private __mounted?: (el: Frag)=>void;
    mounted (v: (el: Frag)=>void) {
        this.__mounted = (_this) => {
            _this.children.forEach(child => {
                // @ts-ignore
                child.__mounted?.(child);
            });
            v(_this);
        };
        return this;
    }
}