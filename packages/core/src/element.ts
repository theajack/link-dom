import { type IReactive } from 'link-dom-reactive';
import type { IAttrKey, IEventAttributes, IEventKey, IEventObject, IStyle, IStyleKey } from './type.d';
import { LinkDomType, traverseChildren, bind } from './utils';
import { queryBase } from './dom';
import type { Comment, Frag, Text } from './text';
import type { IReactiveLike } from './type.d';
import type { Join } from './join';
import { isJoin } from './join';
import type { IController } from './controller';
import { SharedStatus, checkHydrateEl } from 'link-dom-shared';
import type { IStyleBuilder } from './style';
import { getStyleBuilder } from './style';
import { BaseNode } from './node';
// eslint-disable-next-line no-undef

export type IChild = Dom|Text|Frag|Comment|string|number|HTMLElement|Node|IReactiveLike|IController|IChild[];
// @ts-ignore
export class Dom<T extends HTMLElement = HTMLElement> extends BaseNode<T> {
    __ld_type = LinkDomType.Dom;
    // eslint-disable-next-line no-undef
    constructor (key: (keyof HTMLElementTagNameMap)|T) {
        super();
        this.el = (typeof key === 'string' ? SharedStatus.Renderer.createElement(key) : key) as T;
        checkHydrateEl(this);
    }
    private _ur (key: string, val?: IReactiveLike<string|number>) {
        if (typeof val === 'undefined') {
            return this.el[key];
        }
        this._useR(val, (v) => this.el[key] = v);
        return this;
    }
    class (): string;
    class (val: IReactiveLike<string>): this;
    class (val?: IReactiveLike<string>): string | this {
        return this._ur('className', val);
    }
    id (): string;
    id (val: IReactiveLike<string>): this;
    id (val?: IReactiveLike<string>): string | this {
        return this._ur('id', val);
    }
    placeholder (): string;
    placeholder (val: IReactiveLike<string>): this;
    placeholder (val?: IReactiveLike<string>): string | this {
        return this._ur('placeholder', val);
    }
    addClass (name: string) {
        this.el.classList.add(name);
        return this;
    }
    removeClass (name: string) {
        this.el.classList.remove(name);
        return this;
    }
    hasClass (name: string): boolean {
        return this.el?.classList.contains(name);
    }
    toggleClass (name: string, force?: boolean): boolean {
        return !!this.el?.classList.toggle(name, force);
    }
    replaceClass (n: string, old: string) {
        return this.removeClass(old).addClass(n);
    }
    remove () {
        this.el?.remove();
        return this;
    }
    text (): string;
    text (val: IReactiveLike<string|number>): this;
    text (val?: IReactiveLike<string|number>): string | this {
        if (typeof val === 'undefined') {
            return this.el.innerText;
        }
        if (isJoin(val)) {
            return this.append((val as Join).toFrag());
        } else {
            return this._ur('innerText', val);
        }
    }
    attr (name: {[prop in IAttrKey]?: any} | Record<string, any>): this;
    attr (name: IAttrKey): string;
    attr (name: string): string;
    attr (name: IAttrKey, value: any): this;
    attr (name: string, value: any): this;
    attr (name: string|Record<string, any>, value?: any): string|this {
        if (typeof name === 'object') {
            for (const k in name)
                this.attr(k, name[k]);
            return this;
        }
        if (typeof value === 'undefined') {
            return this.el.getAttribute(name) || '';
        }

        this._useR(value, (v) => this.el.setAttribute(name, v));
        return this;
    }
    removeAttr (key: string) {
        this.el.removeAttribute(key);
        return this;
    }
    getStyle (name: IStyleKey|string): string {
        return this.el.style.getPropertyValue(name);
    }
    get style (): IStyleBuilder<Dom<T>> {
        return getStyleBuilder(this);
    }
    value (): string;
    value (val: IReactiveLike<string|number>): this;
    value (val?: IReactiveLike<string|number>): string | this {
        return this._ur('value', val);
    }
    html (): string;
    html (val: IReactiveLike<string|number>): this;
    html (val?: IReactiveLike<string|number>): string | this {
        return this._ur('innerHTML', val);
    }
    outerHtml (): string;
    outerHtml (val: IReactiveLike<string|number>): this;
    outerHtml (val?: IReactiveLike<string|number>): string | this {
        if (typeof val === 'undefined') {
            return this.el.outerHTML;
        }
        this._useR(val, (v) => {
            this.html(v);
            this.el = this.el.children[0] as T;
        });
        return this;
    }
    child <T extends HTMLElement = HTMLElement> (i: number) {
        const node = this.el.children[i];
        if (!node) return null;
        return new Dom(node as T);
    }
    firstChild <T extends HTMLElement = HTMLElement> () {
        return this.child<T>(0);
    }
    lastChild<T extends HTMLElement = HTMLElement> () {
        const children = this.el.children;
        if (children.length === 0) return null;
        return new Dom(children[children.length - 1] as T);
    }
    get childrenLength () {
        return this.el.children.length;
    }
    children (): Dom[];
    children (...doms: IChild[]): this;
    children (...doms: IChild[]) {
        if (doms.length > 0) {
            if (this.el.childNodes.length > 0) {
                this.empty();
            }
            return this.append(...doms);
        }
        const n = this.childrenLength;
        const list: Dom[] = [];
        for (let i = 0; i < n; i++) {
            list.push(this.child(i) as Dom);
        }
        return list;
    }
    click (value: IEventObject<MouseEvent, this>) {
        return this.on('click', value);
    }
    on (name: IEventAttributes): this;
    on <T extends IEventKey>(name: T, value?: IEventObject<DocumentEventMap[T], this>): this;
    // eslint-disable-next-line no-undef
    on <T extends IEventKey> (name: T|IEventAttributes, value?: IEventObject<DocumentEventMap[T], this>) {
        if (typeof name === 'object') {
            for (const k in name) {
                // @ts-ignore
                this.on(k, name[k]);
            }
            return this;
        }
        const dom = this.el;
        if (typeof value === 'function') {
            // @ts-ignore
            this.el.addEventListener(name, (e) => {
                value(e, this);
            });
        } else {
            const handle = (e: any) => {
                // @ts-ignore
                if (value.self && e.target !== dom) return;
                if (value!.stop) e.stopPropagation();
                if (value!.prevent) e.preventDefault();
                if (value!.once) dom.removeEventListener(name, handle, value!.capture);
                value!.listener?.(e, this);
            };
            dom.addEventListener(name, handle, value!.capture ?? false);
        }
        return this;
    }

    append (...doms: IChild[]) {
        traverseChildren(doms, (child) => {
            this.el.appendChild(child);
        });
        return this;
    }
    prepend (...doms: IChild[]) {
        traverseChildren(doms, (child) => {
            this.el.prepend(child);
        });
        return this;
    }
    hide () {
        return this.display('none');
    }
    display (display: IReactiveLike<IStyle['display']> = 'block') {
        return this.style('display', display as any);
    }
    show (visible: IReactiveLike<boolean>, display: IStyle['display'] = 'block') {
        this._useR(visible, (v) => {
            this.display(v ? display : 'none');
        });
        return this;
    }
    query <T extends HTMLElement = HTMLElement>(selector: string, one: true): Dom<T>;
    query <T extends HTMLElement = HTMLElement>(selector: string, one?: false): Dom<T>[];
    query <T extends HTMLElement = HTMLElement> (selector: string, one = false): Dom<T>|Dom<T>[] {
        return queryBase(selector, one, this.el);
    }
    src (): string;
    src (v: IReactiveLike<string>): this;
    src (v?: IReactiveLike<string>) {
        return this._ur('src', v);
    }
    empty () {
        return this.html('');
    }
    name(): string;
    name(v: IReactiveLike<string>): this;
    name (value?: IReactiveLike<string>): string|this {
        return this.attr(`__xr_name`, value);
    }
    findName (name: string) {
        return this.query(`[__xr_name="${name}"]`, true);
    }
    find (v: string) {
        return this.query(v, true);
    }

    type (name: 'text'|'number'|'password'|'checkbox'|
        'radio'|'color'|'range'|'submit'|'reset'|'input'|
        'date'|'email'|'tel') {
        return this.attr('type', name);
    }

    bind (v: IReactive) {
        bind(this, v);
        return this;
    }
}