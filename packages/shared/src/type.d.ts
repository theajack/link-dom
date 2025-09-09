/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-05 23:56:58
 * @Description: Coding something
 */

import type { RendererType } from './utils';


export interface ITextNode {
    get textContent(): string;
    set textContent(value: string);
}
export interface IComment {
    get textContent(): string;
    set textContent(value: string);
}
export interface IFragment<T extends IElement|ITextNode = IElement|ITextNode> {
    appendChild(child: T|IFragment<T>): void;
    insertBefore(node: T, child: T | null): T;
    children: T[];
    childNodes: T[];
}
export interface IElement<T extends IElement = any> extends IFragment<T> {
    // target stopPropagation preventDefault
    tagName: string;
    style: Record<string, any>;
    addEventListener(eventName: string, listener: (e: Event)=>void, useCapture?: boolean): void;
    removeEventListener(eventName: string, listener: (e: Event)=>void, useCapture?: boolean): void;
    setAttribute(name: string, value: string): void;
    removeAttribute(name: string): void;
    getAttribute(name: string): string;
    classList: {
        add(name: string): void;
        remove(name: string): void;
    }
    remove(): void;
    get parentElement(): T|null;
    get parentNode(): T|null;
    get nextSibling(): T|null;
    className: string;
    innerHTML: string;
    outerHTML: string;
    innerText: string;
    [prop: string]: any;
}


export interface IRenderer {
    type: RendererType;
    querySelector (selector: string): IElement|null,
    querySelectorAll (selector: string): IElement[],
    createElement (tag?: string): IElement,
    createTextNode (text?: string): ITextNode,
    createComment (text?: string): IComment,
    createFragment (): IFragment,
    addStyle(v: IElement): void;
}