import type { IReactiveLike } from 'link-dom-reactive';
import { isJoin, read, type IReactive } from 'link-dom-reactive';
import type { IAttrKey, IEventAttributes, IEventDecorator, IEventKey, IEventObject, IStyle, IStyleKey } from '../type';
import { LinkDomType, bind } from '../utils';
import type { IMountParent } from './mount';
import { mount, queryBase, traverseChildren } from './mount';
import type { Comment, Frag, Text } from './text';
import type { Join } from '../join';
import type { IController } from '../controller';
import { KEY_LD_TYPE, SharedStatus, checkHydrateEl, isObject } from 'link-dom-shared';
import type { IStyleBuilder } from './style';
import { getStyleBuilder } from './style';
import { BaseNode } from './node';
import type { IComponentProxy } from './component';
import { type ITagCreator } from './short';

export const TextTagKeys = new Set([ 'style', 'script' ] as const);
export const DKeys = [ 'prevent', 'stop', 'capture', 'once', 'self' ];

export type IChild = Dom|Text|Frag|Comment|string|number|HTMLElement|Node|IReactiveLike|IController|IChild[]|IComponentProxy;
interface IEventSingle<K extends IEventKey, T  extends HTMLElement = HTMLElement, > {
    (value: IEventObject<DocumentEventMap[K], Dom<T>>): ITagCreator<T> & Dom<T>;
}
interface IEvent<T extends HTMLElement = HTMLElement> {
    <K extends IEventKey>(name: K, value?: IEventObject<DocumentEventMap[K], Dom<T>>): ITagCreator<T> & Dom<T>;
    (name: IEventAttributes): ITagCreator<T> & Dom<T>;
}

const _classPrefix: string[] = [];

export function classPrefix (...prefixs: string[]) {
    _classPrefix.push(prefixs.join(''));
    return (...args: any[]) => {
        _classPrefix.pop();
        return args;
    };
}

// @ts-ignore
export class Dom<T extends HTMLElement = HTMLElement> extends BaseNode<T> {
    [KEY_LD_TYPE] = LinkDomType.Dom;

    click: IEventSingle<'click', T> & {
        [K in IEventDecorator]: IEventSingle<'click', T>;
    };
    on: IEvent<T> & {
        [K in IEventDecorator]: IEvent<T>
    // } & {
    //     [K in IEventKey]: IEventSingle<K, T>
    };

    private _tag: string;
    private _isTextNode: boolean;
    private _classPrefix: string = '';
    // eslint-disable-next-line no-undef
    constructor (key: (keyof HTMLElementTagNameMap)|T|Dom<T>) {
        // @ts-ignore
        if (key?.[KEY_LD_TYPE] === LinkDomType.Dom) {
            return key as any;
        }
        super();
        if (_classPrefix.length) {
            this._classPrefix = _classPrefix.join('');
        }
        this.el = (typeof key === 'string' ? SharedStatus.Renderer.createElement(key) : key) as T;
        this._tag = this.el.tagName.toLowerCase();
        this._isTextNode = TextTagKeys.has(this._tag as any);
        this._initEvents();
        checkHydrateEl(this);
        this.__created();
    }
    private _cp (v: string, pure = false) {
        return pure ? v : this._classPrefix + v;
    }
    private _initEvents () {
        const click: any = (fn: any) => this._on('click', fn);
        const on: any = (k: any, v: any) => this._on(k, v);
        for (const key of DKeys) {
            click[key] = (fn: any) => this._on('click', { listener: fn, [key]: true });
            on[key] = (k: any, v: any) => this._on(k, { listener: v, [key]: true });
        }
        this.click = click;
        this.on = on;
    }
    private _ur (key: string, val?: IReactiveLike<string|number>) {
        if (typeof val === 'undefined') {
            return this.el[key];
        }
        this._useR(val, (v) => this.el[key] = v);
        return this;
    }
    class (): string;
    class (val: IReactiveLike<string>|Array<IReactiveLike<string>>|Record<string, IReactiveLike<boolean>>, pure?: boolean): this;
    class (val?: IReactiveLike<string>|Array<IReactiveLike<string>>|Record<string, IReactiveLike<boolean>>, pure = false): string | this {
        if (typeof val === 'undefined') {
            return this.el.className;
        }
        if (Array.isArray(val)) {
            const origin = val as any[];
            val = () => {
                let str = '';
                for (const s of origin) str += this._cp(read(s)) + ' ';
                return str.trimEnd();
            };
        } else if (isObject(val)) {
            const origin = val as any;
            val = () => {
                let str = '';
                const v = origin;
                for (const k in (v)) {
                    if (!!read(v[k])) str += this._cp(read(k)) + ' ';
                }
                return str.trimEnd();
            };
        }
        this._useR(val, (v) => {
            this.el.className = this._cp(v, pure);
        });
        return this;
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
    addClass (name: string, pure = false) {
        this.el.classList.add(this._cp(name, pure));
        return this;
    }
    removeClass (name: string, pure = false) {
        this.el.classList.remove(this._cp(name, pure));
        return this;
    }
    hasClass (name: string, pure = false): boolean {
        return this.el?.classList.contains(this._cp(name, pure));
    }
    toggleClass (name: string, force?: boolean, pure = false): boolean {
        return !!this.el?.classList.toggle(this._cp(name, pure), force);
    }
    replaceClass (n: string, old: string, pure = false) {
        return this.removeClass(this._cp(old, pure)).addClass(this._cp(n, pure));
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
            return this._ur(this._isTextNode ? 'textContent' : 'innerText', val);
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
    private _on (name: IEventAttributes): this;
    private _on <T extends IEventKey>(name: T, value?: IEventObject<DocumentEventMap[T], this>): this;
    // eslint-disable-next-line no-undef
    private _on <T extends IEventKey> (name: T|IEventAttributes, value?: IEventObject<DocumentEventMap[T], this>) {
        if (!value) return;
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

    mount (parent: IMountParent) {
        mount(this, parent);
        return this;
    }
}