/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-13 14:32:56
 * @Description: Coding something
 */

import {getComputeWatch} from './computed';
import {setLatestStore} from './store';

export class Ref<T> {

    __isRef = true;

    _value: T;

    get value () {
        setLatestStore(this);
        getComputeWatch()?.(this);
        return this._value;
    }
    set value (v) {
        const oldValue = this._value;
        this._value = v;
        this._listeners.forEach(fn => {fn(v, oldValue);});
    }
    private _listeners: ((v: T, n: T)=>void)[] = [];

    constructor (v: T) {
        this._value = v;
    }

    sub (fn: (v: T, old: T)=>void) {
        this._listeners.push(fn);
        return () => this.unsub(fn);
    }

    unsub (fn: (v: T, old: T)=>void) {
        const index = this._listeners.indexOf(fn);
        if (index !== -1) {
            this._listeners.splice(index, 1);
            return true;
        }
        return false;
    }

    destroy () {
        this._listeners = [];
    }
}
export function isRef (v: any): v is Ref<any> {
    return !!v?.__isRef;
}
export function ref<T> (v: T) {
    return new Ref(v);
}