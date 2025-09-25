/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-08 20:51:43
 * @Description: Coding something
 */

import type { Dom } from 'link-dom';
import { Comment } from 'link-dom';
import { Frag, Text } from 'link-dom';
import { NodeType } from '../utils';
import type { SSRElement } from './element';
import { RenderStatus, type IComment, type IFragment, type ITextNode } from 'link-dom-shared';


export abstract class SSRBase<T extends Comment|Text|Dom|Frag = any> {
    dom: T;
    __is_ssr = true;
    __is_hydrate = false;
    nodeType: NodeType;
    abstract toHtml (isSingle: boolean): string;
    abstract toDom (): Frag|Dom|Text|Comment;
    constructor () {
        if (RenderStatus.isHydrating) {
            this.__is_hydrate = true;
        }
    }
    hydrate (el: any) {
        // 部分text这里没有dom
        if (!this.dom) {
            // console.log('not dom', this);
            return;
        }
        // 指定真实的dom节点: 将SSRElement替换为真实dom节点
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
    toDom () {
        const frag = new Frag();
        for (const item of this.children) {
            frag.append(item.toDom?.() || item);
        }
        return frag;
    }
    hydrate (el: HTMLElement) {
        super.hydrate(el);
        const childNodes = el.childNodes;
        // const curChildren = this.flatChildren();
        const curChildren = this.children;
        const len = curChildren.length;

        if (childNodes.length !== len) {
            throw new Error('hydrate error');
            // debugger;
        }
        for (let i = 0; i < len; i++) {
            const item = curChildren[i];
            const node = childNodes[i];
            // @ts-ignore
            if (node?.tagName === 'ST') {
                // ! 此处只能web平台使用了
                const text: any = document.createTextNode((item as any).textContent);
                node.replaceWith(text);
                item.hydrate(text);
            } else {
                item.hydrate(node);
            }
        }
    }
    toHtml (): string {
        let html = '';
        const isSingle = this.children.length <= 1;
        for (const item of this.children) {
            html += item.toHtml(isSingle);
        }
        return html;
    }
    get innerText () {
        let text = '';
        for (const item of this.childNodes) {
            if (item.nodeType === NodeType.COMMENT_NODE) continue;
            text += item.innerText;
        }
        return text;
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
        if (child.__is_ssr) {
            child.parentElement = this;
        }
        if (child.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE) {
            for (const item of (child as SSRFragment).children) {
                this.appendChild(item);
            }
            // ! frag 被append之后 内部元素需要清空
            (child as SSRFragment).children = [];
        } else {
            this.children.push(child);
            // onElementMounted(child, this);
        }
        // throw new Error('Method not implemented.');
    }
    prepend (child: SSRBase) {
        if (child.__is_ssr) {
            child.parentElement = this;
        }
        if (child.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE) {
            for (const item of (child as SSRFragment).children)
                this.prepend(item);
        } else {
            this.children.unshift(child);
            // onElementMounted(child, this);
        }
    }
    insertBefore (node: SSRBase, child: SSRBase) {
        if (child.parentElement !== this) throw new Error('insertBefore error');
        if (child.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE) {
            for (const item of (child as SSRFragment).children)
                this.insertBefore(item, child);
        } else {
            if (node.__is_ssr) {
                node.parentElement = this;
            }
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
    toHtml (isSingle: boolean): string {
        // 此处为了保证多个text节点在水合是可以被回复，使用一个标签替换
        return isSingle ? this.textContent : `<st>${this.textContent}</st>`;
    }
    toDom (): Text {
        return new Text(this._textContent);
    }
    constructor (textContent: string) {
        super();
        this.textContent = textContent;
    }
}

// @ts-ignore
export class SSRComment extends SSRBase<Comment> implements IComment {
    _textContent: string = '';
    nodeType = NodeType.COMMENT_NODE;
    markerType: ''|'start'|'end';
    hydrate (el: any): void {
        // 部分text这里没有dom
        if (!this.markerType) {
            // console.log('not dom', this);
            // debugger;
            // throw new Error('dom is not set');
            return;
        }
        // 指定真实的dom节点
        this.dom[this.markerType] = el;
    }
    constructor (textContent: string) {
        super();
        this.textContent = textContent;
    }
    innerText: string;
    get textContent (): string {
        return this._textContent;
    }
    set textContent (text: string) {
        // @ts-ignore
        if (typeof text !== 'string') text = text.toString();
        this._textContent = text;
    }
    toHtml (): string {
        return `<!--${this._textContent}-->`;
    }
    toDom (): Comment {
        return new Comment(this._textContent);
    }
}

export class SSRFragment extends SSRContainer implements IFragment<any> {
    nodeType = NodeType.DOCUMENT_FRAGMENT_NODE;
}