import { useReactive, type Ref, type IReactiveLike } from 'link-dom-reactive';
import { Dom } from './element';
import { LinkDomType } from '../utils';
import { KEY_LD_TYPE } from 'link-dom-shared';
import { useDirectives, type IDirective } from '../controller/directive';

export class BaseNode<T extends Text|Comment|HTMLElement> {
    el: T;
    __isFnProxy = false;
    ___created = false;
    constructor () {
        this.___created = true;
    }
    remove () {
        this.el?.remove();
        return this;
    }
    protected _useR (v: any, apply: (v: any, isInit: boolean) => void) {
        // useReactive(v, apply, this.el);
        return useReactive(v, apply);
    }
    private _mounted: ((el: T)=>void)[] = [];
    mounted (v: (el: T)=>void): this {
        this._mounted.push(v);
        return this;
    }
    __mounted () {
        this._mounted.forEach(v => v(this.el));
    }
    private _created: ((el: T)=>void)[] = [];
    created (v: (el: T)=>void): this {
        if (this.___created) {
            v(this.el);
        } else {
            this._created.push(v);
        }
        return this;
    }
    __created () {
        this._created.forEach(v => v(this.el));
        this._created = [];
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
    ref (v: Dom|Ref) {
        if ((v as any)[KEY_LD_TYPE] === LinkDomType.Ref) {
            (v as any).el = this;
        } else {
        // @ts-ignore
            v(this);
        }
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
        const clear = this._useR(val, (v) => {
            if (typeof v?.[KEY_LD_TYPE] === 'number') {
                // @ts-ignore ! 如果函数里为Dom 则移接到Dom上
                this[KEY_LD_TYPE] = v[KEY_LD_TYPE];
                Object.defineProperty(this, 'el', {
                    get () {
                        // ! 组件结合short
                        const el = v.el;
                        return el?.[KEY_LD_TYPE] ? el.el : el;
                    },
                    set (el) {
                        if (v.el?.[KEY_LD_TYPE]) {
                            v.el.el = el;
                        } else {
                            v.el = el;
                        }
                    }
                });
                this.__isFnProxy = true;
            } else {
                this.el.textContent = v;
            }
        });
        if (this.__isFnProxy) {clear?.(); }
        return this;
    }

    directive (...directives: IDirective[]) {
        useDirectives(() => this.el, this, directives);
        return this;
    }
}