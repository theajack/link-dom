/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-13 14:32:56
 * @Description: Coding something
 */

import {observe} from './reactive';
import {DepUtil} from './dep';
import type {Join} from './join';
import {type Ref} from './ref';
import {generateReactiveByValue} from './utils';

export type IReactiveLike<T=any> = IReactive<T> | T | Join;
export type IReactive<T=any> = IComputedLike<T> | Ref<T> | Link<T>;

export type IComputedLike<T=any> = IComputeFn<T> | Computed<T>;

export type IComputeFn<T = any> = ()=>T;

export type IComputedWatch = ((
    computed: Computed<any> | Ref<any>,
    key?: string
) => void);
export class Computed<T=any> {
    __isReactive = true;
    _value: T;

    private _set?: (v: T)=>void;

    get value () {
        DepUtil.add(this, 'value');
        return this._value;
    }
    set value (v) {
        if (!this._set) {
            console.warn('Computed not have set property');
            return;
        }
        this._set(v);
    }

    constructor (get: IComputeFn<T>, set?: (v: T)=>void) {
        this._set = set;
        observe(get, (v) => {
            this._value = v;
            DepUtil.trigger(this, 'value');
        },  (value) => { this._value = value; });
    }

    destroy () {
        DepUtil.clear(this);
    }
}

export function computed<T> (v: IComputedLike<T>, set?: (v: T)=>void) {
    if (isReactive(v)) return v;
    return new Computed(v as ()=>T, set);
}

export function watch<T> (v: IReactive<T>, fn: (v: T, old: T)=>void): ()=>void {
    if (isReactive(v)) {
        const origin = v;
        v = () => origin.value;
    }
    if (typeof v === 'function') {
        return observe(v as any, fn);
    }
    return () => {};
}

export function isReactive (v: any): v is Ref<any> {
    return !!v?.__isReactive;
}

export class Link<T = any> {
    __isReactive = true;
    private _value: T;
    get value () {
        DepUtil.add(this, 'value');
        return this._value;
    }
    private _set?: (v: T)=>void;
    private _clearDep?: ()=>void;
    set value (v) {
        if (v === this._value) return;
        this._set?.(v);
        this._triggerSet(v);
    }
    private _triggerSet (v: T) {
        this._value = v;
        DepUtil.trigger(this, 'value');
    }
    constructor (_value: T) {
        if (typeof _value === 'function') throw new Error('Link 不能传入函数');
        if (isReactive(_value)) return _value as any;
        const react = generateReactiveByValue(_value);
        if (react) {
            this._value = _value;
            this._set = react.set;
            this._clearDep = react.sub((v: any) => {
                this._triggerSet(v);
            });
        } else {
            this._value = _value;
        }
    }
    destroy () {
        DepUtil.clear(this);
        this._clearDep?.();
    }
}


export function link (value: any) {
    return new Link(value);
}