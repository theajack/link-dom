/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-13 11:33:49
 * @Description: Coding something
 */
import { type IChild } from './element';
import {
    isReactiveLike, DepUtil, observe, isReactive, type IReactive
} from 'link-dom-reactive';
import { Text } from './text';

import type { Dom } from './element';
import { type Join, isJoin } from './join';
import { SharedStatus } from 'link-dom-shared';
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
export function traverseChildren (doms: IChild[], onChild: (child: Node, origin: IChild) => void) {
    doms.forEach(dom => {
        if (Array.isArray(dom)) {
            traverseChildren(dom, onChild);
            return;
        }
        let el: any = dom;
        if (typeof el.__ld_type === 'number') {
            el = el.el;
        } else if (isReactiveLike(el)) {
            el = new Text(el);
            el = el.el;
        } else if (!(dom instanceof Node) && !(dom?.__is_ssr)) {
            el = SharedStatus.Renderer.createTextNode(`${dom}`);
        }
        onChild(el, dom);
        // @ts-ignore
        dom.__mounted?.(dom);
    });
}