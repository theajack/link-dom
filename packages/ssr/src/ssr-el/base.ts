/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-08 20:51:43
 * @Description: Coding something
 */

import type { SSRElement } from './element';
import { SSRText, type SSRFragment } from './other';

export enum SSREleType {
    Element,
    Text,
    Comment,
    Frag
}
export abstract class SSRBase {
    type: SSREleType;
    hydration: string;
    html: string;
    abstract toHtml (): string;
    parentElement: SSRBase|null = null;
    get index () {
        const parent = this.parentElement as SSRContainer;
        return !parent ? -1 : parent.children.indexOf(this);
    }
    abstract get innerText (): string;
    abstract set innerText (text: string);
}

export class SSRContainer extends SSRBase {
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
    parentElement: SSRContainer|null = null;
    get childNodes (): SSRBase[] {
        return this.children;
    }
    appendChild (child: SSRBase): void {
        if (child.type === SSREleType.Frag) {
            for (const item of (child as SSRFragment).children)
                this.appendChild(item);
        } else {
            this.children.push(child);
            // onElementMounted(child, this);
        }
        // throw new Error('Method not implemented.');
    }
    insertBefore (node: SSRBase, child: SSRBase) {
        if (child.parentElement !== this) throw new Error('insertBefore error');
        if (child.type === SSREleType.Frag) {
            for (const item of (child as SSRFragment).children)
                this.insertBefore(item, child);
        } else {
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
            if (child.type !== SSREleType.Element) continue;
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
            if (child.type !== SSREleType.Element) continue;
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