/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-13 11:25:44
 * @Description: Coding something
 */

import type { IChild } from './element';
import type { IComputedLike, IReactive } from 'link-dom-reactive';
import { useReactive } from './utils';
import { LinkDomType, traverseChildren } from './utils';

export class Text {
    __ld_type = LinkDomType.Text;
    el: globalThis.Text;
    constructor (val?: string|number|boolean|IReactive) {
        this.el = document.createTextNode('');
        if (typeof val !== 'undefined') {
            this.text(val);
        }
    }
    text (val: string|number|boolean|IReactive) {
        useReactive(val, (v) => this.el.textContent = v);
        return this;
    }
    // @ts-ignore
    private __mounted?: (el: Text)=>void;
    mounted (v: (el: Text)=>void) {
        this.__mounted = v;
        return this;
    }
}
export class Comment {
    __ld_type = LinkDomType.Comment;
    el: globalThis.Comment;
    constructor (val?: string|number|IComputedLike) {
        this.el = document.createComment('');
        if (typeof val !== 'undefined') {
            this.text(val);
        }
    }
    text (val: string|number|IComputedLike) {
        useReactive(val, (v) => this.el.textContent = v);
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
    prepend (...doms: IChild[]) {
        traverseChildren(doms, (dom, origin) => {
            this.children.unshift(origin);
            this.el.prepend(dom);
        });
        return this;
    }
    // @ts-ignore
    __mounted?: (el: Frag)=>void;
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
