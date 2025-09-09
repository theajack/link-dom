/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-06 11:04:10
 * @Description: Coding something
 */
import type { IComment, IElement, IFragment, ITextNode } from 'link-dom-shared';
import { defineRenderer, isWeb, resetRenderer } from 'link-dom-shared';
import { SSRComment, SSRElement, SSRFragment, SSRText } from './ssr-el';
import { dom, LinkDomType, type Dom, type Frag, type IChild } from 'link-dom';
import { SSR_ATTR, SSR_SIZE, getSSRId } from './utils';

class Document {
    _body: SSRElement;
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

export let document: Document;

const defaultRenderer = {
    createElement (tag: string = 'div') {
        return new SSRElement(tag);
    },
    querySelector: function (selector: string): IElement<any> | null {
        return document.body.querySelector(selector);
    },
    querySelectorAll: function (selector: string): IElement<any>[] {
        return document.body.querySelectorAll(selector);
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
        document.head.appendChild(v);
    }
};

export let isSSR = false;

export function setRender (name: 'web'|'ssr') {
    if (name === 'web') {
        resetRenderer();
        isSSR = false;
    } else if (name === 'ssr') {
        defineRenderer(defaultRenderer);
        isSSR = true;
    } else {
        isSSR = false;
    }
}

if (!isWeb) {
    document = new Document();
    setRender('ssr');
}

// 渲染过程 此部分代码在服务端运行
// @ts-ignore
export function ssr (comp: IChild) {
    const frag = dom.frag;
    let count = 1;
    if (Array.isArray(comp)) count = comp.length;
    else if (comp?.__ld_type === LinkDomType.Frag) count = (comp as Frag).children.length;
    frag.append(dom.div.style('display', 'none').attr(SSR_SIZE, count), comp);
    // @ts-ignore
    return frag.el.toHtml();
}