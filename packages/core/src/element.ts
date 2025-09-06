import { type IReactive } from 'link-dom-reactive';
import type { IAttrKey, IEventObject, IStyle, IStyleKey } from './type.d';
import { LinkDomType, formatCssKV, traverseChildren, bind, useReactive } from './utils';
import { queryBase } from './dom';
import type { Comment, Frag, Text } from './text';
import type { IReactiveLike } from './type.d';
import type { Join } from './join';
import { isJoin } from './join';
import type { IController } from './controller';
// eslint-disable-next-line no-undef
type IEventKey = keyof DocumentEventMap;

export type IChild = Dom|Text|Frag|Comment|string|number|HTMLElement|Node|IReactiveLike|IController|IChild[];

export class Dom<T extends HTMLElement = HTMLElement> {
    __ld_type = LinkDomType.Dom;
    el: T;
    // eslint-disable-next-line no-undef
    constructor (key: (keyof HTMLElementTagNameMap)|T) {
        this.el = (typeof key === 'string' ? document.createElement(key) : key) as T;
    }
    private _ur (key: string, val?: IReactiveLike<string|number>) {
        if (typeof val === 'undefined') {
            return this.el[key];
        }
        useReactive(val, (v) => this.el[key] = v);
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
    // @ts-ignore
    private __mounted?: (el: Dom)=>void;
    mounted (v: (el: Dom)=>void) {
        this.__mounted = v;
        return this;
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

        useReactive(value, (v) => this.el.setAttribute(name, v));
        return this;
    }
    removeAttr (key: string) {
        this.el.removeAttribute(key);
        return this;
    }
    private __xr_funcs: Record<string, (...args: any[]) => any> = {};
    func(k: string): (...args: any[]) => any;
    func(k: string, v: (...args: any[]) => any): this;
    func (k: string, v?: (...args: any[]) => any) {
        if (typeof v === 'undefined') {
            return this.__xr_funcs[k];
        }
        this.__xr_funcs[k] = v;
        return this;
    }
    data (name: Record<string, any>): this;
    data (name: string): any|null;
    data (name: string, value: any): this;
    data (name: string|Record<string, any>, value?: any): string|this {
        if (typeof name === 'object') {
            for (const k in name)
                this.data(k, name[k]);
            return this;
        }
        if (typeof value === 'undefined') {
            // @ts-ignore
            return this.el.__xr_data?.[name] || null;
        }
        // @ts-ignore
        if (!this.el.__xr_data) this.el.__xr_data = {};
        // @ts-ignore

        useReactive(value, (v) => this.el.__xr_data[name] = v);
        return this;
    }
    style (name: IStyle|Record<string, any>): this;
    style (name: IStyleKey|string): string;
    style <T extends IStyleKey>(name: T, value: IStyle[T]): this;
    style (name: IStyleKey|IStyle|string, value?: any): string|this {
        const style = this.el.style;
        if (typeof value !== 'undefined') {
            // @ts-ignore
            useReactive(value, (v) => {
                // @ts-ignore
                const { important, cssValue, cssKey } = formatCssKV(name, v);
                style.setProperty(cssKey, cssValue, important);
            });

            return this;
        }
        if (typeof name === 'string') {
            // @ts-ignore
            return style[name] as string;
        }
        // @ts-ignore
        for (const k in name) {
            // @ts-ignore
            this.style(k, name[k]);
        }
        return this;
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
        useReactive(val, (v) => {
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
    next <T extends HTMLElement = HTMLElement> () {
        const next = this.el.nextElementSibling as any;
        return next ? new Dom<T>(next) : null;
    }
    prev <T extends HTMLElement = HTMLElement> () {
        const prev = this.el.previousElementSibling as any;
        return prev ? new Dom<T>(prev) : null;
    }
    firstChild <T extends HTMLElement = HTMLElement> () {
        return this.child<T>(0);
    }
    lastChild<T extends HTMLElement = HTMLElement> () {
        const children = this.el.children;
        if (children.length === 0) return null;
        return new Dom(children[children.length - 1] as T);
    }
    brothers () {
        return this.parent()?.children() || [];
    }
    get childrenLength () {
        return this.el.children.length;
    }
    children () {
        const n = this.childrenLength;
        const list: Dom[] = [];
        for (let i = 0; i < n; i++) {
            list.push(this.child(i) as Dom);
        }
        return list;
    }
    click (value: IEventObject<this>) {
        return this.on('click', value);
    }
    on (name: Partial<Record<IEventKey, IEventObject<this>>>): this;
    on (name: IEventKey, value?: IEventObject<this>): this;
    // eslint-disable-next-line no-undef
    on (name: IEventKey|Partial<Record<IEventKey, IEventObject<this>>>, value?: IEventObject<this>) {
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
            const handle = (e: Event) => {
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
    // (dom: Dom) => void
    ref (v: Dom) {
        // @ts-ignore
        v(this);
        return this;
    }
    hide () {
        return this.display('none');
    }
    display (display: IReactiveLike<IStyle['display']> = 'block') {
        return this.style('display', display as any);
    }
    show (visible: IReactiveLike<boolean>, display: IStyle['display'] = 'block') {
        useReactive(visible, (v) => {
            this.display(v ? display : 'none');
        });
        return this;
    }

    query <T extends HTMLElement = HTMLElement>(selector: string, one: true): Dom<T>;
    query <T extends HTMLElement = HTMLElement>(selector: string, one?: false): Dom<T>[];
    query <T extends HTMLElement = HTMLElement> (selector: string, one = false): Dom<T>|Dom<T>[] {
        return queryBase(selector, one, this.el);
    }
    src(): string;
    src(v: IReactiveLike<string>): this;
    src (v?: IReactiveLike<string>) {
        return this._ur('src', v);
    }
    parent <T extends HTMLElement = HTMLElement> (i = 1) {
        if (i === 0) return this;
        let el: any = this.el;
        while (i > 0) {
            el = el.parentElement;
            if (!el) return null;
            i--;
        }
        return new Dom<T>(el);
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
