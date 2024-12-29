/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-13 14:32:56
 * @Description: Coding something
 */

import {LinkDomType} from '../utils';
import type {IHistoryData} from './history';
import type {IStore} from './store';

export type IComputedLike<T=any> = IComputeFn<T> | Computed<T>;

export type IComputeFn<T> = ()=>T;

export type IComputedWatch = ((
    computed: Computed<any> | IStore<any, any>,
    key?: string
) => void);
let computedWatch: IComputedWatch|null = null;

function setComputeWatchEnable (fn: IComputedWatch) {
    computedWatch = fn;
    return () => {
        computedWatch = null;
    };
}

export function getComputeWatch () {
    return computedWatch;
}

class Computed<T> {

    __ld_type = LinkDomType.Computed;
    _value: T;

    private _compute: IComputeFn<T>;
    private _dirty = false;

    get value () {
        if (this._dirty) {
            this._refreshValue();
        }
        getComputeWatch()?.(this);
        return this._value;
    }
    // set value (v) {
    //     this._value = v;
    // }

    private _listeners: ((v: T)=>void)[] = [];

    private _clearSub: (()=>void)[] = [];
    constructor (v: IComputeFn<T>) {
        this._compute = v;
        const disable = setComputeWatchEnable((store, key) => {
            const handler = () => {
                this._dirty = true;
                this._listeners.forEach(fn => {fn(this._value);});
            };
            const clear = typeof key === 'string' ?
                // @ts-ignore
                store.$sub(key, handler) :
                store.sub(store);
                
            this._clearSub.push(clear);
        });
        this._refreshValue();
        disable();
    }

    private _refreshValue () {
        this._value = this._compute();
        this._dirty = false;
    }

    sub (fn: (v: T)=>void) {
        this._listeners.push(fn);
        return () => this.unsub(fn);
    }

    unsub (fn: (v: T)=>void) {
        const index = this._listeners.indexOf(fn);
        if (index !== -1) {
            this._listeners.splice(index, 1);
        }
    }

    destroy () {
        this._listeners = [];
        this._clearSub.forEach(fn => fn());
        this._clearSub = [];
    }
}

export function computed<T> (v: IComputedLike<T>) {
    if (isComputed(v)) return v;
    return new Computed(v);
}

export function watch<T> (v: IComputeFn<T>, fn: (v: T)=>void) {
    return computed(v).sub(fn);
}

export function isComputed (v: any): v is Computed<any> {
    return v?.__ld_type === LinkDomType.Computed;
}

export function isComputedLike (v: any): v is IComputedLike<any> {
    return typeof v === 'function' || isComputed(v);
}

export function computedToHistoryData (v: any): IHistoryData|null {
    if (typeof v === 'function') {
        v = computed(v);
    }

    if (isComputed(v)) {
        return {
            get: () => v.value,
            set: (x) => v.value = x,
            sub: (ln) => v.sub(ln),
            __ld_type: LinkDomType.History,
        };
    }

    return null;
}