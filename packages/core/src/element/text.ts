/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-13 11:25:44
 * @Description: Coding something
 */

import type { IChild } from './element';
import { LinkDomType } from '../utils';
import { KEY_LD_TYPE, SharedStatus, checkHydrateEl } from 'link-dom-shared';
import { BaseNode } from './node';
import { traverseChildren } from './mount';
import type { IReactiveLike } from 'link-dom-reactive';
import type { IDirective } from '../controller';
import { useDirectives } from '../controller/directive';

export class Text extends BaseNode<globalThis.Text> {
    [KEY_LD_TYPE] = LinkDomType.Text;
    constructor (val?: IReactiveLike<string|number|boolean>) {
        super();
        this.el = SharedStatus.Renderer.createTextNode('') as globalThis.Text;
        if (typeof val !== 'undefined') {
            this.text(val);
        }
        checkHydrateEl(this);
        this.__created();
    }
}
export class Comment extends BaseNode<globalThis.Comment> {
    [KEY_LD_TYPE] = LinkDomType.Comment;
    constructor (val?: IReactiveLike<string|number|boolean>) {
        super();
        this.el = SharedStatus.Renderer.createComment('') as globalThis.Comment;
        if (typeof val !== 'undefined') {
            this.text(val);
        }
        checkHydrateEl(this);
        this.__created();
    }
}

export class Frag {
    [KEY_LD_TYPE] = LinkDomType.Frag;
    el: DocumentFragment;

    doms: any[] = [];
    constructor () {
        this.el = SharedStatus.Renderer.createFragment() as any;
        checkHydrateEl(this);
        this.__created();
        this.___created = true;
    }
    append (...doms: IChild[]) {
        traverseChildren(doms, (dom, origin) => {
            if (!this._isMounted) {
                this._children.push(origin);
                this.doms.push(dom);
            }
            this.el.appendChild(dom);
        });
        return this;
    }
    prepend (...doms: IChild[]) {
        traverseChildren(doms, (dom, origin) => {
            if (!this._isMounted) {
                this._children.unshift(origin);
                this.doms.unshift(dom);
            }
            this.el.prepend(dom);
        });
        return this;
    }

    _children: IChild[] = [];
    _isMounted = false;
    ___created = false;
    get children () {
        return this._isMounted ? this.el.children : this._children;
    }
    _mounted: ((el: Frag)=>void)[];
    // @ts-ignore
    __mounted (el: Frag = this) {
        if (this._isMounted) return;
        this._children.forEach(child => {
            child.__mounted?.(child);
        });
        this._mounted?.forEach(fn => fn(el));
        this._isMounted = true;
        this._children = [];
        this.doms = [];
    };
    mounted (v: (el: Frag)=>void) {
        if (!this._mounted) this._mounted = [];
        this._mounted.push(v);
        return this;
    }
    private _created: ((el: DocumentFragment)=>void)[] = [];
    created (v: (el: DocumentFragment)=>void): this {
        if (this.___created) {
            v(this.el);
        } else {
            this._created.push(v);
        }
        return this;
    }
    __created () {
        this._created.forEach(v => v(this.el));
        this._created = [];
    }

    directive (...directives: IDirective[]) {
        useDirectives(() => this.doms, this, directives);
        return this;
    }
}

export function frag (...doms: IChild[]) {
    return new Frag().append(...doms);
}