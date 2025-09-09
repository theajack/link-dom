/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-08 20:52:05
 * @Description: Coding something
 */

import type { IElement } from 'link-dom-shared';
import { NodeType, SSRContainer, SSREleType, SSRText } from './base';

export class SSRStyle {
    map: Record<string, string> = {};
    setProperty (name: string, value: string, important: string) {
        // ! 此处 !important 前面需要加一个空格
        this.map[name] = `${value}${important ? ' !important' : ''}`;
    }
}

export class ClassList {
    set: Set<string> = new Set();
    add (name: string) {
        this.set.add(name);
    }
    remove (name: string) {
        this.set.delete(name);
    }
    contains (name: string) {
        return this.set.has(name);
    }
    toggle (name: string, force?: boolean | undefined) {
        if (typeof force === 'undefined') {
            if (this.set.has(name)) this.set.delete(name);
            else this.set.add(name);
        } else {
            if (force) this.set.add(name);
            else this.set.delete(name);
        }
    }
    toString () {
        if (!this.set.size) return '';
        return ` class="${Array.from(this.set).join(' ')}"`;
    }
    setClass (v: string) {
        this.set = new Set(v.split(' ').filter(item => !!item));
    }
}

export class SSRElement extends SSRContainer implements IElement {
    type = SSREleType.Element;
    nodeType = NodeType.ELEMENT_NODE;
    classList: ClassList = new ClassList();
    toHtml (): string {
        if (this._outerHTML) return this._outerHTML;
        let html = `<${this.tagName}${this.classList.toString()}`;
        const map = this.style.map;
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
    style = new SSRStyle();
    constructor (tagName: string) {
        super();
        this.tagName = tagName;
    }

    // 事件只需注册 无需处理
    addEventListener (): void {}
    removeEventListener (): void {}
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