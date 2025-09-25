/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-06 11:04:10
 * @Description: Coding something
 */
import type { IComment, IElement, IFragment, IRenderer, ITextNode } from 'link-dom-shared';
import { RenderStatus, RendererType, defineRenderer, resetRenderer } from 'link-dom-shared';
import { SSRComment, SSRFragment, SSRText } from './base';
import { SSRElement } from './element';
import { dom, LinkDomType, type Frag, type IChild } from 'link-dom';
import { SSR_SIZE } from '../utils';

class Document {
    _body: SSRElement;
    static instance: Document;
    constructor () {
        if (Document.instance) return Document.instance;
        Document.instance = this;
    }
    get body () {
        if (!this._body) {
            this._body = new SSRElement('body');
        }
        return this._body;
    }
    _head: SSRElement;
    get head () {
        if (!this._head) {
            this._head = new SSRElement('head');
        }
        return this._head;
    }
}

export let doc: Document;

const defaultRenderer: IRenderer = {
    type: RendererType.SSR,
    createElement (tag: string = 'div') {
        return new SSRElement(tag);
    },
    querySelector: function (selector: string): IElement<any> | null {
        return doc.body.querySelector(selector);
    },
    querySelectorAll: function (selector: string): IElement<any>[] {
        return doc.body.querySelectorAll(selector);
    },
    createTextNode: function (text?: string | undefined): ITextNode {
        return new SSRText(text || '');
    },
    createComment: function (text?: string | undefined): IComment {
        return new SSRComment(text || '');
    },
    createFragment: function (): IFragment<any> {
        return new SSRFragment();
    },
    addStyle: function (v: any): void {
        doc.head.appendChild(v);
    }
};

export function setRender (name: 'web'|'ssr'|'hydrate') {
    RenderStatus.isHydrating = RenderStatus.isSSR = false;
    if (name === 'web') {
        resetRenderer();
    } else if (name === 'ssr') {
        doc = new Document();
        defineRenderer(defaultRenderer);
        RenderStatus.isSSR = true;
    } else if (name === 'hydrate') {
        doc = document as any;
        defineRenderer(defaultRenderer);
        RenderStatus.isHydrating = true;
    }
}


// 渲染过程 此部分代码在服务端运行
// @ts-ignore
export function ssr <T extends any[]> (comp: (...args: T)=>IChild): (...args: T)=>string  {
    return (...args: T) => {
        setRender('ssr');
        const value = comp(...(args || []));
        const frag = dom.frag;
        let count = 1;
        if (Array.isArray(value)) count = value.length;
        else if (value?.__ld_type === LinkDomType.Frag) count = (value as Frag).children.length;
        frag.append(dom.div.style('display', 'none').attr(SSR_SIZE, count), value);
        // @ts-ignore
        const result = frag.el.toHtml();
        setRender('web');
        return result;
    };
}

// export function ssr (comp: IChild) {
//     const frag = dom.frag;
//     let count = 1;
//     if (Array.isArray(comp)) count = comp.length;
//     else if (comp?.__ld_type === LinkDomType.Frag) count = (comp as Frag).children.length;
//     frag.append(dom.div.style('display', 'none').attr(SSR_SIZE, count), comp);
//     // @ts-ignore
//     return frag.el.toHtml();
// }