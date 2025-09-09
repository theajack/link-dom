/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-08 20:51:43
 * @Description: Coding something
 */

import type { Comment, Dom, Frag, Text } from 'link-dom';
import { NodeType } from '../utils';
import type { SSRElement } from './element';
import type { IComment, IFragment, ITextNode } from 'link-dom-shared';

export abstract class SSRBase<T extends Comment|Text|Dom|Frag = any> {
    dom: T;
    __is_ssr = true;
    nodeType: NodeType;
    abstract toHtml (): string;
    hydrate (el: any) {
        // 部分text这里没有dom
        if (!this.dom) throw new Error('dom is not set');
        this.dom.el = el;
    }

    parentElement: SSRContainer<Dom|Frag>|null = null;
    get parentNode (): any {
        return this.parentElement;
    }
    get nextSibling (): any {
        return this.nextElementSibling;
    }
    get nextElementSibling (): any {
        return this.parentElement?._next(this);
    }
    get previousSibling (): any {
        return this.previousElementSibling;
    }
    get previousElementSibling (): any {
        return this.parentElement?._prev(this);
    }
    get index () {
        const parent = this.parentElement as SSRContainer;
        return !parent ? -1 : parent.children.indexOf(this);
    }
    abstract get innerText (): string;
    abstract set innerText (text: string);

    remove (): void {
        this.parentElement?._removeChild(this);
    }
}

export class SSRContainer<T extends Dom|Frag = Frag> extends SSRBase<T> {
    hydrate (el: HTMLElement) {
        super.hydrate(el);
        const childNodes = el.childNodes;
        const len = this.children.length;
        if (childNodes.length !== len) {
            throw new Error('hydrate error');
            // debugger;
        }
        for (let i = 0; i < len; i++) {
            const item = this.children[i];
            const node = childNodes[i];
            item.hydrate(node);
        }
    }
    toHtml (): string {
        let html = '';
        for (const item of this.children) {
            html += item.toHtml();
        }
        return html;
    }
    get innerText () {
        return this.children.map(item => item.innerText).join('');
    }
    set innerText (text) {
        this.children = [ new SSRText(text) ];
    }
    children: SSRBase[] = [];
    get childNodes (): SSRBase[] {
        return this.children;
    }
    get firstChild () {
        return this.children[0];
    }
    get lastChild () {
        return this.children[this.children.length - 1];
    }
    appendChild (child: SSRBase): void {
        child.parentElement = this;
        if (child.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE) {
            for (const item of (child as SSRFragment).children)
                this.appendChild(item);
        } else {
            this.children.push(child);
            // onElementMounted(child, this);
        }
        // throw new Error('Method not implemented.');
    }
    prepend (child: SSRBase) {
        child.parentElement = this;
        this.children.unshift(child);
    }
    insertBefore (node: SSRBase, child: SSRBase) {
        if (child.parentElement !== this) throw new Error('insertBefore error');
        if (child.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE) {
            for (const item of (child as SSRFragment).children)
                this.insertBefore(item, child);
        } else {
            node.parentElement = this;
            this.children.splice(child.index, 0, node);
            // onElementMounted(node, this);
        }
        return node;
    }

    _removeChild (node: SSRBase) {
        this.children.splice(this.getIndex(node), 1);
    }
    _next (node: SSRBase) {
        return this.children[this.getIndex(node) + 1] || null;
    }
    _prev (node: SSRBase) {
        return this.children[this.getIndex(node) - 1] || null;
    }

    private getIndex (node: SSRBase) {
        if (node.parentElement !== this) throw new Error('removeChild error');
        const i = node.index;
        if (i === -1) throw new Error('removeChild error');
        return i;
    }

    querySelector (selector: string): SSRElement|null {
        for (const child of this.children) {
            if (child.nodeType !== NodeType.ELEMENT_NODE) continue;
            const el = child as SSRElement;
            if (el._matchSelector(selector)) return el;
            const childResult = (el.querySelector(selector));
            if (childResult) return childResult;
        }
        return null;
    }
    querySelectorAll (selector: string): SSRElement[] {
        const list: SSRElement[] = [];
        for (const child of this.children) {
            if (child.nodeType !== NodeType.ELEMENT_NODE) continue;
            const el = child as SSRElement;
            if (el._matchSelector(selector)) {
                list.push(el);
            }
            const childResult = (el.querySelectorAll(selector));
            if (childResult.length) list.push(...childResult);
        }
        return list;
    }
}

export class SSRText extends SSRBase<Text> implements ITextNode {
    _textContent: string = '';
    nodeType = NodeType.TEXT_NODE;
    get textContent (): string {
        return this._textContent;
    }
    set textContent (text: string) {
        // @ts-ignore
        if (typeof text !== 'string') text = text.toString();
        this._textContent = text;
    }
    get innerText (): string {
        return this.textContent;
    }
    set innerText (text: string) {
        this.textContent = text;
    }
    toHtml (): string {
        return this.textContent;
    }
    constructor (textContent: string) {
        super();
        this.textContent = textContent;
    }
}

export class SSRComment extends SSRText implements IComment {
    nodeType = NodeType.COMMENT_NODE;
    toHtml (): string {
        return `<!--${this._textContent}-->`;
    }
}

export class SSRFragment extends SSRContainer implements IFragment<any> {
    nodeType = NodeType.DOCUMENT_FRAGMENT_NODE;
}