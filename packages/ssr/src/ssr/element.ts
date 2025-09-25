/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-08 20:52:05
 * @Description: Coding something
 */

import  { ClassList, Style, type IElement, RenderStatus } from 'link-dom-shared';
import { SSRContainer, SSRText } from './base';
import { NodeType } from '../utils';
import type { Dom } from 'link-dom';

export class SSRElement extends SSRContainer<Dom> implements IElement {
    nodeType = NodeType.ELEMENT_NODE;
    classList: ClassList = new ClassList();
    hydrate (el: HTMLElement): void {
        super.hydrate(el);
        // 遍历 _eventsListeners
        for (const [ handler, [ name, options ] ] of this._eventsListeners) {
            el.addEventListener(name as any, handler as any, options);
        }
    }
    toHtml (): string {
        if (this._outerHTML) return this._outerHTML;
        let html = `<${this.tagName}${this.classList.toString()}`;
        const map = this.style;
        const keys = Object.keys(map);
        if (keys.length > 0) {
            html += ` style="${keys.map(key => `${key}: ${map[key]};`).join(' ')}"`;
        }
        for (const key in this.attr) {
            html += ` ${key}="${this.attr[key]}"`;
        }
        return `${html}>${this.toInnerHtml()}</${this.tagName}>`;
    }
    private toInnerHtml (): string {
        return super.toHtml();
    }
    [prop: string]: any;
    tagName: string;
    style = new Style();
    constructor (tagName: string) {
        super();
        this.tagName = tagName;
    }
    _eventsListeners: Map<Function, [string, any]> = new Map();
    addEventListener (name: string, handler: any, options: any): void {
        if (RenderStatus.isSSR) return;
        this._eventsListeners.set(handler, [ name, options ]);
    }
    removeEventListener (name: string, handler: any): void {
        if (RenderStatus.isSSR) return;
        this._eventsListeners.delete(handler);
    }
    attr: Record<string, string> = {};
    setAttribute (name: string, value: string): void {
        this.attr[name] = value;
    }
    removeAttribute (name: string): void {
        delete this.attr[name];
    }
    getAttribute (name: string): string {
        return this.attr[name];
    }
    // SSREle
    set className (value: string) {
        this.classList.setClass(value);
    }
    get className () {
        return Array.from(this.classList.set).join(' ');
    }
    private _attr (k: string, v?: any): any {
        if (v === undefined) return this.getAttribute(k);
        this.setAttribute(k, v);
    }

    set id (value: string) { this._attr('id', value); }
    get id () { return this._attr('id'); }

    set value (value: string) { this._attr('value', value); }
    get value () { return this._attr('value'); }

    set innerHTML (value: string) {
        this.children = [ new SSRText(value) ];
    }
    get innerHTML () { return this.toInnerHtml(); }

    private _outerHTML: string = '';
    get outerHTML () {
        return this.toHtml();
    }
    set outerHTML (value: string) {
        this._outerHTML = value;
    }
    get textContent () {return this.innerText;}
    set textContent (value: string) {
        this.innerText = value;
    }

    // 暂时只实现一些简单的选择器
    _matchSelector (selector: string) {
        if (this.tagName === selector) return true;

        if (selector[0] === ('#')) {
            if (this.attr['id'] === selector.substring(1)) return true;
        } else if (selector[0] === ('.')) {
            if (this.classList.contains(selector.substring(1))) return true;
        } else if (selector[0] === '[') {
            const result = selector.match(/^\[(.*?)(="?(.*?)"?)\]$/);
            if (result) {
                const name = result[1];
                const val = result[3];
                if (typeof val === 'undefined') {
                    return name in this.attr;
                }
                return this.attr[name] === val;
            }
        }
        return false;
    }
}