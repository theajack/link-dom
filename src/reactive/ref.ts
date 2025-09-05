/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-13 14:32:56
 * @Description: Coding something
 */

import {isArrayOrJson} from '../utils';
import {deepAssign, reactive} from './reactive';
import {DepUtil} from './dep';
import {isReactive} from './computed';
export class Ref<T = any> {
    __isReactive = true;
    private _value: T;
    get value () {
        DepUtil.add(this, 'value');
        return this._value;
    }
    set value (v) {
        if (v === this._value) return;
        if (this.isDeep(v)) {
            deepAssign(this._value, v);
        } else {
            this._value = v;
        }
        DepUtil.trigger(this, 'value');
    }
    _deep = false;
    constructor (_value: T, _deep = true) {
        if (isReactive(_value)) return _value;
        this._deep = _deep;
        if (!this.isDeep(_value)) {
            this._value = _value;
        } else {
            this._value = reactive(_value as object) as T;
        }
    }
    private isDeep (v: any) {
        return this._deep && isArrayOrJson(v);
    }
    destroy () {
        DepUtil.clear(this);
    }
}
export function ref<T> (v: T, deep = true) {
    return new Ref(v, deep);
}
export function isRef (v: any): v is Ref {
    return !!v?.__isReactive;
}