/*
 * @Author: chenzhongsheng
 * @Date: 2023-10-07 19:40:43
 * @Description: Coding something
 */

import type { IComputedLike, IReactiveLike } from './type.d';
import { type Ref } from './ref';
import { DepUtil } from './dep';
import { observe } from './reactive';
import type { IComputed, Link } from './computed';
import { isPureFunc } from 'link-dom-shared';

export function isReactiveLike (v: any): v is Ref<any>|IComputedLike {
    return isReactive(v) || isPureFunc(v);
}

export function generateReactiveByValue (v: any) {
    const { target, key } = DepUtil.getLatest();

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

export function isReactive (v: any): v is Ref<any> {
    return !!v?.__isReactive;
}


export function useReactive (
    v: any|IReactiveLike<any>,
    apply: (v:any, isInit: boolean)=>void,
) {
    if (isReactive(v)) {
        const origin = v;
        v = () => origin.value;
    } else if (isJoin(v)) {
        v = (v as any).toFn();
    }
    if (typeof (v) === 'function') {
        return observe(v, v => { apply(v, false); }, v => { apply(v, true); });
    } else {
        apply(v, true);
        return null;
    }
}

export function read<T extends any> (v: IReactiveLike<T>): T {
    if (isReactive(v)) {
        return v.value;
    } else if (isJoin(v)) {
        return (v).toFn() as T;
    } else if (typeof v === 'function') {
        // @ts-ignore
        return v() as T;
    } else {
        return v as T;
    }
}

export function readFn<T extends any> (v: any): ()=>T {
    return () => read(v);
}

export function isStatic (v: any) {
    DepUtil.inCollecting = true;
    read(v);
    DepUtil.inCollecting = false;
    if (DepUtil.Temp.size > 0) {
        DepUtil.Temp.clear();
        return false;
    }
    return true;
}

export function toggle (v: IComputed<boolean>|Ref<boolean>|Link<boolean>) {
    return () => {v.value = !v.value;};
}

export function isJoin (v: any): v is {el: any, toFrag(): any, toFn(): (()=>any)} {
    return v?.__is_join === true;
}
