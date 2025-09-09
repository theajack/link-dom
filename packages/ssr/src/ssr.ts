/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-06 11:04:10
 * @Description: Coding something
 */
import type { IComment, IElement, IFragment, ITextNode } from 'link-dom-shared';
import { defineRenderer, isWeb } from 'link-dom-shared';
import type { SSRBase } from './ssr-el';
import { SSRComment, SSRElement, SSRFragment, SSRText } from './ssr-el';
import type { Dom } from 'link-dom';
import { SSR_ATTR, getSSRId } from './utils';

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

if (!isWeb()) {

    document = new Document();
    defineRenderer({
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
    });
}

// 渲染过程 此部分代码在服务端运行
// @ts-ignore
export function ssr (dom: Dom<SSRBase>, id?: string) {
    id = getSSRId(id);
    dom.attr(SSR_ATTR, id);
    return dom.el.toHtml();
}