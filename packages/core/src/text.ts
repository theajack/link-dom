/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-13 11:25:44
 * @Description: Coding something
 */

import type { IChild } from './element';
import { LinkDomType, traverseChildren } from './utils';
import { SharedStatus, checkHydrateEl } from 'link-dom-shared';
import { BaseNode } from './node';
import type { IReactiveLike } from './type';

export class Text extends BaseNode<globalThis.Text> {
    __ld_type = LinkDomType.Text;
    constructor (val?: IReactiveLike<string|number|boolean>) {
        super();
        this.el = SharedStatus.Renderer.createTextNode('') as globalThis.Text;
        if (typeof val !== 'undefined') {
            this.text(val);
        }
        checkHydrateEl(this);
    }
}
export class Comment extends BaseNode<globalThis.Comment> {
    __ld_type = LinkDomType.Comment;
    constructor (val?: IReactiveLike<string|number|boolean>) {
        super();
        this.el = SharedStatus.Renderer.createComment('') as globalThis.Comment;
        if (typeof val !== 'undefined') {
            this.text(val);
        }
        checkHydrateEl(this);
    }
}

export class Frag {
    __ld_type = LinkDomType.Frag;
    el: DocumentFragment;
    constructor () {
        this.el = SharedStatus.Renderer.createFragment() as any;
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
    __mounted = (el: Frag = this) => {
        if (this._isMounted) return;
        this._children.forEach(child => {
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
