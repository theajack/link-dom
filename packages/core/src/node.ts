import { Dom } from './element';
import type { IReactiveLike } from './type';
import { useReactive } from './utils';

export class BaseNode<T extends Text|Comment|HTMLElement> {
    el: T;
    remove () {
        this.el?.remove();
        return this;
    }
    protected _useR (v: any, apply: (v: any, isInit: boolean) => void) {
        // useReactive(v, apply, this.el);
        useReactive(v, apply);
    }
    // @ts-ignore
    private __mounted?: (el: T)=>void;
    mounted (v: (el: T)=>void) {
        this.__mounted = v;
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

        this._useR(value, (v) => this.el.__xr_data[name] = v);
        return this;
    }
    next <T extends HTMLElement = HTMLElement> () {
        const next = this.el.nextElementSibling as any;
        return next ? new Dom<T>(next) : null;
    }
    prev <T extends HTMLElement = HTMLElement> () {
        const prev = this.el.previousElementSibling as any;
        return prev ? new Dom<T>(prev) : null;
    }
    brothers () {
        // @ts-ignore
        return this.parent()?.children() || [];
    }
    // (dom: Dom) => void
    ref (v: Dom) {
        // @ts-ignore
        v(this);
        return this;
    }
    parent <T extends HTMLElement = HTMLElement> (i = 1) {
        if (i === 0) return this as any as Dom<T>;
        let el: any = this.el;
        while (i > 0) {
            el = el.parentElement;
            if (!el) return null;
            i--;
        }
        return new Dom<T>(el);
    }
    text (): string;
    text (val: IReactiveLike<string|number|boolean>): this;
    text (val?: IReactiveLike<string|number|boolean>): string | this {
        if (typeof val === 'undefined') {
            return this.el.textContent;
        }
        this._useR(val, (v) => this.el.textContent = v);
        return this;
    }
}