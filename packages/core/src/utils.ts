/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-13 11:33:49
 * @Description: Coding something
 */
import {
    DepUtil, observe, isReactive, type IReactive
} from 'link-dom-reactive';
import type { Dom } from './element/element';
import { KEY_LD_TYPE, LD_TYPE_REF } from 'link-dom-shared';
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

    Ref = LD_TYPE_REF,
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

export function toLinkDomLink<T extends any> (v: T, el?: ()=>any): T & {
    __ld_type: LinkDomType,
    el: Dom,
} {
    // @ts-ignore
    v[KEY_LD_TYPE] = LinkDomType.Dom;
    Object.defineProperty(v, 'el', {
        get () {
            return el ? el() : (v as any)().el;
        }
    }) as any;
    return v as any;
}

export function assignDefault<T> (target: T, def: T) {
    if (!def) return target;
    for (const k in def) {
        // @ts-ignore
        if (typeof target[k] === 'undefined') {
            // @ts-ignore
            target[k] = def[k];
        }
    }
    return target;
}

export function parseNodeList (v: any) {
    if (!Array.isArray(v)) v = [ v ];
    return {
        dom: v[0] || null,
        domList: v,
    };
}

const CtrlLinkApi = [ 'if', 'elif', 'else', 'case', 'default' ] as const;
export const CtrlLinkApiSet = new Set(CtrlLinkApi);

export function isDomFrag (v: any) {
    return v?.nodeType === 11;
}

export function filterElement (list: any[]|null): HTMLElement[]|null {
    return list?.filter(item => item.nodeType === Node.ELEMENT_NODE) || null;
}

export enum TransStatus {
    EnterFrom, // 元素还不存在
    EnterActive, // 元素已存在
    LeaveFrom, // 元素还存在
}