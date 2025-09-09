
/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-08 19:55:58
 * @Description: Coding something
 */

import { dom, type IChild } from 'link-dom';
import { SSR_SIZE } from '../utils';
import type { IComment, IElement, IFragment, IRenderer, ITextNode } from 'link-dom-shared';
import { RendererType } from 'link-dom-shared';
import { HyElement } from './element';
import { HyComment, HyFragment, HyText } from './base';


class Document {
    _body: HyElement;
    get body () {
        if (!this._body) {
            this._body = new HyElement('body');
        }
        return this._body;
    }
    _head: HyElement;
    get head () {
        if (!this._head) {
            this._head = new HyElement('head');
        }
        return this._head;
    }
}

export let doc: Document;

const defaultRenderer: IRenderer = {
    type: RendererType.Hydrate,
    createElement (tag: string = 'div') {
        return new HyElement(tag);
    },
    querySelector: function (selector: string): IElement<any> | null {
        return doc.body.querySelector(selector);
    },
    querySelectorAll: function (selector: string): IElement<any>[] {
        return doc.body.querySelectorAll(selector);
    },
    createTextNode: function (text?: string | undefined): ITextNode {
        return new HyText(text || '');
    },
    createComment: function (text?: string | undefined): IComment {
        return new HyComment(text || '');
    },
    createFragment: function (): IFragment<any> {
        return new HyFragment();
    },
    addStyle: function (v: any): void {
        document.head.appendChild(v);
    }
};


let ssrNodes: HTMLElement[]|null = null;

function initSSRNodes () {
    if (!ssrNodes) {
        ssrNodes = Array.from(document.querySelectorAll(`[${SSR_SIZE}]`));
    }
    if (!ssrNodes.length) {
        throw new Error('[SSR] hydration error: Element not found1');
    }
    return ssrNodes;
}

// // 水合过程 此部分在客户端运行
// export function hydrate (node: IChild): void {
//     const clientFrag = dom.div.append(node);
//     const childNodes = Array.from(clientFrag.el.childNodes);
//     const nodes = findSSRNodes(childNodes);
//     const n = nodes.length;
//     // console.time();
//     for (let i = 0; i < n; i++) {
//         (nodes[i] as Element).replaceWith(childNodes[i]);
//         // 待优化
//     };
//     // console.timeEnd();
//     // // const ssrFrag = dom.div.append(nodes);
//     // console.log('   ssr', ssrFrag.el.innerHTML.length, ssrFrag.el.innerHTML);
//     // console.log('client', clientFrag.el.innerHTML.length, clientFrag.el.innerHTML);
//     // debugger;
// }

// 水合过程 此部分在客户端运行
export function hydrate <T extends any[]> (comp: (...args: T)=>IChild): Node[]  {
    const clientFrag = dom.div.append(node);
    const childNodes = Array.from(clientFrag.el.childNodes);
    const nodes = findSSRNodes(childNodes);
    const n = nodes.length;
    // console.time();
    for (let i = 0; i < n; i++) {
        (nodes[i] as Element).replaceWith(childNodes[i]);
        // 待优化
    };
    // console.timeEnd();
    // // const ssrFrag = dom.div.append(nodes);
    // console.log('   ssr', ssrFrag.el.innerHTML.length, ssrFrag.el.innerHTML);
    // console.log('client', clientFrag.el.innerHTML.length, clientFrag.el.innerHTML);
    // debugger;
}


// 找到marker
function findSSRNodes (clientNodes: Node[]) {

    if (!ssrNodes) {
        ssrNodes = Array.from(document.querySelectorAll(`[${SSR_SIZE}]`));
    }
    if (!ssrNodes.length) {
        throw new Error('[SSR] hydration error: Element not found1');
    }
    for (const node of ssrNodes) {
        const result = compareNodes(clientNodes, node);
        if (result) {
            return result;
        }
    }
    throw new Error('[SSR] hydration error: Element not found2');
}

// 如果命中了就取出所有ssr nodes
// clientNodes 是客户端的节点
export function compareNodes (clientNodes: Node[], marker: HTMLElement) {
    const size = parseInt(marker.getAttribute(SSR_SIZE) || '0');
    if (size !== clientNodes.length) return null;
    const result: Node[] = [];
    let next: Node = marker;
    for (let i = 0; i < size; i ++) {
        next = next.nextSibling!;
        if (next.textContent !== clientNodes[i].textContent) {
            return null;
        }
        result.push(next);
    }
    marker.remove();
    ssrNodes?.splice(ssrNodes.indexOf(marker), 1);
    return result;
}

export function getNodesByMarker (marker: HTMLElement): Node[] {
    const nodes: Node[] = [];
    const size = parseInt(marker.getAttribute(SSR_SIZE) || '0');
    for (let i = 0; i < size; i ++) {
        const node = marker.nextSibling;
        if (node) {
            nodes.push(node);
        } else {
            throw new Error('[SSR] hydration error: Element not found');
        }
    }
    marker.remove();
    return nodes;
}