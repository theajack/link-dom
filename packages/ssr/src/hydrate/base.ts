/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-08 20:51:43
 * @Description: Coding something
 */

import type { Comment, Dom, Frag, Text } from 'link-dom';
import { NodeType } from '../utils';
import type { HyElement } from './element';
import type { IComment, IFragment, ITextNode } from 'link-dom-shared';

export abstract class HyBase<T extends Comment|Text|Dom|Frag> {
    dom: T;
    __is_hydrate = true;
    nodeType: NodeType;

    abstract hydrate (el: Node): void;
    parentElement: HyContainer|null = null;
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
        const parent = this.parentElement as HyContainer;
        return !parent ? -1 : parent.children.indexOf(this);
    }
    abstract get innerText (): string;
    abstract set innerText (text: string);

    remove (): void {
        this.parentElement?._removeChild(this);
    }
}

export class HyContainer extends HyBase<Frag> {
    hydrate (el: HTMLElement) {
        const childNodes = el.childNodes;

        const len = this.children.length;
        if (childNodes.length !== len) {
            throw new Error('hydrate error');
            debugger;
        }

        for (let i = 0; i < len; i++) {
            const item = this.children[i];
            const node = childNodes[i];
            item.hydrate(node);
        }
    }
    get innerText () {
        return this.children.map(item => item.innerText).join('');
    }
    set innerText (text) {
        this.children = [ new HyText(text) ];
    }
    children: HyBase[] = [];
    get childNodes (): HyBase[] {
        return this.children;
    }
    get firstChild () {
        return this.children[0];
    }
    get lastChild () {
        return this.children[this.children.length - 1];
    }
    appendChild (child: HyBase): void {
        child.parentElement = this;
        if (child.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE) {
            for (const item of (child as HyFragment).children)
                this.appendChild(item);
        } else {
            this.children.push(child);
            // onElementMounted(child, this);
        }
        // throw new Error('Method not implemented.');
    }
    prepend (child: HyBase) {
        child.parentElement = this;
        this.children.unshift(child);
    }
    insertBefore (node: HyBase, child: HyBase) {
        if (child.parentElement !== this) throw new Error('insertBefore error');
        if (child.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE) {
            for (const item of (child as HyFragment).children)
                this.insertBefore(item, child);
        } else {
            node.parentElement = this;
            this.children.splice(child.index, 0, node);
            // onElementMounted(node, this);
        }
        return node;
    }

    _removeChild (node: HyBase) {
        this.children.splice(this.getIndex(node), 1);
    }
    _next (node: HyBase) {
        return this.children[this.getIndex(node) + 1] || null;
    }
    _prev (node: HyBase) {
        return this.children[this.getIndex(node) - 1] || null;
    }

    private getIndex (node: HyBase) {
        if (node.parentElement !== this) throw new Error('removeChild error');
        const i = node.index;
        if (i === -1) throw new Error('removeChild error');
        return i;
    }

    querySelector (selector: string): HyElement|null {
        for (const child of this.children) {
            if (child.nodeType !== NodeType.ELEMENT_NODE) continue;
            const el = child as HyElement;
            if (el._matchSelector(selector)) return el;
            const childResult = (el.querySelector(selector));
            if (childResult) return childResult;
        }
        return null;
    }
    querySelectorAll (selector: string): HyElement[] {
        const list: HyElement[] = [];
        for (const child of this.children) {
            if (child.nodeType !== NodeType.ELEMENT_NODE) continue;
            const el = child as HyElement;
            if (el._matchSelector(selector)) {
                list.push(el);
            }
            const childResult = (el.querySelectorAll(selector));
            if (childResult.length) list.push(...childResult);
        }
        return list;
    }
}

export class HyText extends HyBase implements ITextNode {
    hydrate (el: Text) {
        this.textContent = el.textContent!;
    }
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

export class HyComment extends HyText implements IComment {
    nodeType = NodeType.COMMENT_NODE;
    toHtml (): string {
        return `<!--${this._textContent}-->`;
    }
}

export class HyFragment extends HyContainer implements IFragment<any> {
    nodeType = NodeType.DOCUMENT_FRAGMENT_NODE;
}