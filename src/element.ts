import {bindStore} from './reactive/store';
import {IAttrKey, IEventObject, IStyle, IStyleKey} from './type';
import './reactive/reactive';
import {IReactive, useReact} from './reactive/reactive';
// eslint-disable-next-line no-undef
type IEventKey = keyof DocumentEventMap;

export function collectRef <T extends string[]> (...list: T): {
    [k in T[number]]: Dom
} {
    const refs: any = {};
    list.forEach(name => {
        refs[name] = (ele: Dom) => { refs[name] = ele; };
    });
    return refs;
}

export type IChild = Dom|string|number|HTMLElement|IChild[];

export class Dom {
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
        return this._ur('innerText', val);
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
            useReact(value, (v) => style[name] = v);
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
    outerHtml (val: string|number): this;
    outerHtml (val?: string|number): string | this {
        if (typeof val === 'undefined') {
            return this.el.outerHTML;
        }
        this.html(val);
        this.el = this.el.children[0] as HTMLElement;
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
        doms.forEach(dom => {
            if (Array.isArray(dom)) {
                for (const item of dom) {
                    this.append(item);
                }
            } else {
                let el: any = dom;
                if (dom instanceof Dom) {
                    el = dom.el;
                } else if (!(dom instanceof HTMLElement)) {
                    // @ts-ignore
                    el = document.createTextNode(`${dom}`);
                }
                // @ts-ignore
                this.el.appendChild(el);
                // @ts-ignore
                dom.__mounted?.(dom);
            }
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

const DomNames = [
    'a', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'button', 'canvas', 'code', 'pre', 'table', 'th', 'td', 'tr', 'video', 'audio',
    'ol', 'select', 'option', 'p', 'i', 'iframe', 'img', 'input', 'label', 'ul', 'li', 'span', 'textarea', 'form', 'br', 'tbody',
    'object', 'progress', 'section', 'slot', 'small', 'strong', 'sub', 'summary', 'sup', 'template',
    'title', 'var', 'style', 'meta', 'head', 'link', 'svg', 'script',
] as const;

type TDomName = (typeof DomNames)[number];

interface IDom {
    // eslint-disable-next-line no-undef
    (name: keyof HTMLElementTagNameMap): Dom;
    (name: HTMLElement): Dom;
    (name: TDomName): Dom;
    (name: string): Dom;
}

type IDoms = {
    [tagName in TDomName]: Dom;
}


export function query (selector: string, one: true): Dom;
export function query (selector: string, one?: false): Dom[];
export function query (selector: string, one = false): Dom|Dom[] {
    return queryBase(selector, one, document);
}

function queryBase (selector: string, one = false, parent: any = document) {
    if (one) {
        const el = parent.querySelector(selector);
        if (el) return new Dom(el as HTMLElement);
        throw new Error('Element is not exist' + selector);
    }
    const list = parent.querySelectorAll(selector);
    const res: (Dom)[] = [];
    for (let i = 0; i < list.length; i++) {
        res.push(new Dom(list[i] as HTMLElement));
    }
    return res;
}

// @ts-ignore
export const dom: IDom & IDoms = (() => {
    const builder = (name: any) => new Dom(name);
    const pps: any = {};
    DomNames.forEach(name => {
        pps[name] = {
            get: () => builder(name)
        };
    });
    Object.defineProperties(builder, pps);
    return builder;
})();

type IGlobalStyle = {
    [prop in string]: IStyle|string|IGlobalStyle;
}
export function style (data: Record<string, IStyle|IGlobalStyle>) {
    const dom = new Dom('style').text(styleStr(data)).el;
    return document.head.appendChild(dom);
}

function styleStr (data: Record<string, IStyle|IGlobalStyle>, prefix = ''): string {
    let cssStr = prefix ? `${prefix}{` : '';
    const sub: string[] = [];
    for (const key in data) {
        const value = data[key];
        if (typeof value === 'object') {

            let keyStr = '';
            if (key[0] === '&') {
                keyStr = key.substring(1);
            } else if (key[0] === ':') {
                keyStr = key;
            } else {
                keyStr = ` ${key}`;
            }

            sub.push(styleStr(value as any, `${prefix}${keyStr}`));
            continue;
        } else {
            cssStr += `${transformCssKey(key)}:${value};`;
        }
    }
    cssStr += (prefix ? `}` : '');
    return cssStr + sub.join('');
}

// 替换replaceAll
// backgroundColor => 'background-color'
function transformCssKey (str: string) {
    const n = str.length;
    let result = '';
    for (let i = 0; i < n; i++) {
        const s = str[i];
        const code = s.charCodeAt(0);
        if (code >= 65 && code <= 90) {
            result += `-${s.toLowerCase()}`;
        } else {
            result += s;
        }
    }
    return result;
}

export function mount (node: Dom|Dom[], parent: string|HTMLElement|Dom) {
    let el: any = parent;
    if (typeof parent === 'string') {
        el = queryBase(parent, true);
    } else if (parent instanceof HTMLElement) {
        el = new Dom(parent);
    }
    Array.isArray(node) ? el.append(...node) : el.append(node);
}