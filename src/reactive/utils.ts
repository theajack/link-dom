/*
 * @Author: chenzhongsheng
 * @Date: 2023-10-07 19:40:43
 * @Description: Coding something
 */

import type {Dom} from '../element';
import type {IComputedLike, IReactive} from './computed';
import {isReactive} from './computed';
import {observe} from './reactive';
import type {Join} from './join';
import {isJoin} from './join';
import {type Ref} from './ref';
import {DepUtil, type Dep} from './dep';

// .bind(ref|computed|value)

export function bind (el: Dom, v: IReactive|string|number|boolean) {

    let setValue: (v: any)=>void = () => {};
    let setOriginValue: (v: any)=>void = () => {};
    let value: any;
    if (typeof v === 'function') {
        observe(v, (v) => { setValue(v); }, v => {value = v;});
        const {target, key} = DepUtil.getLatest();
        setOriginValue = (v: any) => {
            target[key] = v;
            DepUtil.trigger(target, key);
        };
    } else if (isReactive(v)) {
        observe(() => v.value, (v: any) => {setValue(v);}, v => {value = v;});
        setOriginValue = (value: any) => {
            v.value = value;
        };
    } else {
        throw new Error ('bind 传入参数错误');
    }

    const {type: vType, isChecked} = parseVType(el, value);

    let ignoreSub = false; // 忽略input变更引起的改动
    setValue = (v: any) => {
        if (ignoreSub) return;
        if (isChecked) {
            // @ts-ignore
            el.el.checked = v;
            return;
        }
        el.value(v);
    };
    setValue(value);
    const getValue = () => {
        // @ts-ignore
        if (isChecked) return el.el.checked;
        const v = el.value();
        if (vType === 'number') {
            const num = parseFloat(v);
            if (Number.isNaN(num)) return '';
            return num;
        }
        return v;
    };
    const modStore = () => {
        let newValue = getValue();

        if (newValue === value) return;
        if (vType === 'number' && newValue === '') newValue = 0;
        value = newValue;
        ignoreSub = true;
        setOriginValue(value);
        ignoreSub = false;
    };
    // @ts-ignore
    el.on('input', modStore);
    // @ts-ignore
    el.on('change', modStore);
}

function parseVType (el: Dom<HTMLElement>, value: any): {
    type: 'string'|'number'|'boolean';
    isChecked: boolean;
} {
    let type: 'string'|'number'|'boolean' = 'string', isChecked = false;
    if (el.el.tagName === 'INPUT') {
        const aType = el.attr('type');
        if (aType === 'number' || aType === 'range') type = 'number';
        else if (aType === 'radio' || aType === 'checkbox') {type = 'boolean'; isChecked = true;}
        else if (typeof value === 'number') type = 'number';
        else if (typeof value === 'boolean') type = 'boolean';
    }
    return {type, isChecked};
}

export function useReactive (v: any|IReactive<any>, apply: (v:any, isInit: boolean)=>void) {
    if (isReactive(v)) {
        const origin = v;
        v = () => origin.value;
    } else if (isJoin(v)) {
        v = (v as Join).toFn();
    }
    if (typeof (v) === 'function') {
        observe(v, v => { apply(v, false); }, v => { apply(v, true); });
    } else {
        apply(v, true);
        return false;
    }
    return true;
}

export function getReactiveValue (v: any|IReactive<any>) {
    if (isReactive(v)) {
        return v.value;
    } else if (isJoin(v)) {
        return (v as Join).toFn();
    } else if (typeof v === 'function') {
        return v();
    } else {
        return v;
    }
}

export function isReactiveLike (v: any): v is Ref<any>|IComputedLike {
    return isReactive(v) || (typeof v === 'function');
}

export function generateReactiveByValue (v: any) {
    const {target, key} = DepUtil.getLatest();

    const value = target?.[key];
    if (!target || v !== value) {
        console.warn('generateReactiveByValue 传入参数错误');
        return null;
    }

    // ! 相等也有可能不是
    return {
        sub: (fn: (v: any, ov: any)=>void) => {
            return DepUtil.sub(target, key, fn);
        },
        set: (v: any) => {
            if (v === target[key]) return;
            target[key] = v;
            DepUtil.trigger(target, key);
        }
    };
}

export const OriginTarget = Symbol('OriginTarget');
export const ProxyTarget = Symbol('ProxyTarget');
window.OriginTarget = OriginTarget;
