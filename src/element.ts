import {bindStore} from './reactive/store';
import type {IAttrKey, IEventObject, IStyle, IStyleKey} from './type';
import {useReact, type IReactive, isReactHistory, buildReactive, isReactive} from './reactive/reactive';
import {LinkDomType, formatCssKV, traverseChildren} from './utils';
import {queryBase} from './dom';
import type {Frag} from './text';
import {Text} from './text';
// eslint-disable-next-line no-undef
type IEventKey = keyof DocumentEventMap;

export type IChild = Dom|Text|Frag|string|number|HTMLElement|IReactive|IChild[];

export class Dom {
    __ld_type = LinkDomType.Dom;
    el: HTMLElement;
    // eslint-disable-next-line no-undef
    constructor (key: (keyof HTMLElementTagNameMap)|HTMLElement) {
        this.el = typeof key === 'string' ? document.createElement(key) : key;
    }
    private _ur (key: string, val?: string|number|IReactive) {
        if (typeof val === 'undefined') {
            return this.el[key];
        }
        useReact(val, (v) => this.el[key] = v);
        return this;
    }
    class (): string;
    class (val: string): this;
    class (val?: string|IReactive): string | this {
        return this._ur('className', val);
    }
    id (): string;
    id (val: string): this;
    id (val?: string|IReactive): string | this {
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
    remove () {
        this.el?.remove();
        return this;
    }
    text (): string;
    text (val: string|number|IReactive): this;
    text (val?: string|number|IReactive): string | this {
        if (typeof val === 'undefined') {
            return this.el.innerText;
        }
        if (isReactive(val)) {
            const {reacts} = val;
            let content = '';
            for (const item of reacts) {
                if (isReactHistory(item)) {
                    if (content) {
                        this.append(new Text(content));
                        content = '';
                    }
                    this.append(new Text(buildReactive(item)));
                } else {
                    content += item;
                }
            };
            if (content) {this.append(new Text(content));}
        } else {
            this.el.innerText = val as string;
        }
        return this;
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

        useReact(value, (v) => this.el.setAttribute(name, v));
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
        this.el.__xr_data[name] = value;
        return this;
    }
    style (name: IStyle|Record<string, any>): this;
    style (name: IStyleKey|string): string;
    style <T extends IStyleKey>(name: T, value: IStyle[T]): this;
    style (name: IStyleKey|IStyle|string, value?: any): string|this {
        const style = this.el.style;
        if (typeof value !== 'undefined') {
            // @ts-ignore
            useReact(value, (v) => {
                // @ts-ignore
                const {important, cssValue, cssKey} = formatCssKV(name, v);
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
    value (val: string|number): this;
    value (val?: string|number): string | this {
        return this._ur('value', val);
    }
    html (): string;
    html (val: string|number): this;
    html (val?: string|number): string | this {
        return this._ur('innerHTML', val);
    }
    outerHtml (): string;
    outerHtml (val: string|number|IReactive): this;
    outerHtml (val?: string|number|IReactive): string | this {
        if (typeof val === 'undefined') {
            return this.el.outerHTML;
        }
        useReact(val, (v) => {
            this.html(v);
            this.el = this.el.children[0] as HTMLElement;
        });
        return this;
    }
    child (i: number) {
        const node = this.el.children[i];
        if (!node) return null;
        return new Dom(node as HTMLElement);
    }
    children () {
        const n = this.el.children.length;
        const list: Dom[] = [];
        for (let i = 0; i < n; i++) {
            list.push(this.child(i) as Dom);
        }
        return list;
    }
    click (value: IEventObject) {
        return this.event('click', value);
    }
    event (name: Partial<Record<IEventKey, IEventObject>>): this;
    event (name: IEventKey, value?: IEventObject): this;
    // eslint-disable-next-line no-undef
    event (name: IEventKey|Partial<Record<IEventKey, IEventObject>>, value?: IEventObject) {
        if (typeof name === 'object') {
            for (const k in name) {
                // @ts-ignore
                this.event(k, name[k]);
            }
            return this;
        }
        const dom = this.el;
        if (typeof value === 'function') {
            // @ts-ignore
            this.el.addEventListener(name, value);
        } else {
            const handle = (e: Event) => {
                // @ts-ignore
                if (value.self && e.target !== dom) return;
                if (value!.stop) e.stopPropagation();
                if (value!.prevent) e.preventDefault();
                if (value!.once) dom.removeEventListener(name, handle, value!.capture);
                value!.listener?.(e);
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
        return this.style('display', 'none');
    }
    show (display = 'block') {
        return this.style('display', display as any);
    }
    setVisible (visible = true, display = 'block') {
        return visible ? this.show(display) : this.hide();
    }
    query (selector: string, one: true): Dom;
    query (selector: string, one?: false): Dom[];
    query (selector: string, one = false): Dom|Dom[] {
        return queryBase(selector, one, this.el);
    }
    src(): string;
    src(v: string): this;
    src (v?: string|IReactive) {
        return this._ur('src', v);
    }
    parent () {
        return this.el.parentElement;
    }
    empty () {
        return this.html('');
    }
    name(): string;
    name(v: string): this;
    name (value?: string): string|this {
        return this.attr(`__xr_name`, value);
    }
    find (name: string) {
        return this.query(`[__xr_name="${name}"]`, true);
    }

    type (name: 'text'|'number'|'password'|'checkbox'|
        'radio'|'color'|'range'|'submit'|'reset'|'input'|
        'date'|'email'|'tel') {
        return this.attr('type', name);
    }

    // @ts-ignore
    bind (v: any) {
        bindStore(this, v);
        return this;
    }
}
