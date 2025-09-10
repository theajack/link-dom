/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-13 11:25:44
 * @Description: Coding something
 */

import type { IChild } from './element';
import type { IComputedLike, IReactive } from 'link-dom-reactive';
import { useReactive } from './utils';
import { LinkDomType, traverseChildren } from './utils';
import { Renderer, checkHydrateEl } from 'link-dom-shared';

export class Text {
    __ld_type = LinkDomType.Text;
    el: globalThis.Text;
    constructor (val?: string|number|boolean|IReactive) {
        this.el = Renderer.createTextNode('') as globalThis.Text;
        if (typeof val !== 'undefined') {
            this.text(val);
        }
        checkHydrateEl(this);
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
        this.el = Renderer.createComment('') as any;
        if (typeof val !== 'undefined') {
            this.text(val);
        }
        checkHydrateEl(this);
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
    constructor () {
        this.el = Renderer.createFragment() as any;
        checkHydrateEl(this);
    }
    append (...doms: IChild[]) {
        traverseChildren(doms, (dom, origin) => {
            if (!this._isMounted) this._children.push(origin);
            this.el.appendChild(dom);
        });
        return this;
    }
    prepend (...doms: IChild[]) {
        traverseChildren(doms, (dom, origin) => {
            if (!this._isMounted) this._children.unshift(origin);
            this.el.prepend(dom);
        });
        return this;
    }

    _children: IChild[] = [];
    _isMounted = false;
    get children () {
        return this._isMounted ? this.el.children : this._children;
    }
    _mounted?: (el: Frag)=>void;
    // @ts-ignore
    __mounted = (el: Frag) => {
        this._children.forEach(child => {
            // @ts-ignore
            child.__mounted?.(child);
        });
        this._children = [];
        this._mounted?.(el);
        this._isMounted = true;
    };
    mounted (v: (el: Frag)=>void) {
        this._mounted = v;
        return this;
    }
}
