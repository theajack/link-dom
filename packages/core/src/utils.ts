/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-13 11:33:49
 * @Description: Coding something
 */
import type {
    IComputed,
    Ref
} from 'link-dom-reactive';
import {
    DepUtil, observe, isReactive, type IReactive
} from 'link-dom-reactive';
import type { Dom } from './element';
import { type Join } from './join';
export enum LinkDomType {
    Dom,
    Text,
    Join,
    Frag,
    Comment,
    For,
    If,
    Switch,
    Show,
    Await,
    Marker,
    RouterView,
    StyleBuilder,
    Short,
    Component,
    Root, // ! 虚拟节点，用来作为scope根节点

    Ref = 1000,

}


// .bind(ref|computed|value)
export function bind (el: Dom, v: IReactive|string|number|boolean) {

    let setValue: (v: any)=>void = () => {};
    let setOriginValue: (v: any)=>void = () => {};
    let value: any;
    if (typeof v === 'function') {
        observe(v, (v) => { setValue(v); }, v => {value = v;});
        const { target, key } = DepUtil.getLatest();
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

    const { type: vType, isChecked } = parseVType(el, value);

    let ignoreSub = false; // 忽略input变更引起的改动
    setValue = (v: any) => {
        if (ignoreSub) return;
        if (isChecked) {
            // @ts-ignore
            el.el.checked = v;
            return;
        }
        value = v;
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
    return { type, isChecked };
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
        // observe(v, v => { apply(v, false); }, v => { apply(v, true); }, el);
    } else {
        apply(v, true);
        return false;
    }
    return true;
}

export function getReactiveValue<T extends any> (v: T|IReactive<T>): T {
    if (isReactive(v)) {
        return v.value;
    } else if (isJoin(v)) {
        return (v as Join).toFn() as T;
    } else if (typeof v === 'function') {
        // @ts-ignore
        return v() as T;
    } else {
        return v as T;
    }
}


export function toggle (v: IComputed<boolean>|Ref<boolean>) {
    return () => {v.value = !v.value;};
}


export function isJoin (v: any): v is Join {
    return v?.__is_join === true;
}

export function isPureFunc (v: any) {
    return typeof v === 'function' && typeof v.__ld_type !== 'number';
}

export function parseFuncWrap (v: any) {
    return (isPureFunc(v)) ? v() : v;
}