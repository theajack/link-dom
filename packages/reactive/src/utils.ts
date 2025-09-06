/*
 * @Author: chenzhongsheng
 * @Date: 2023-10-07 19:40:43
 * @Description: Coding something
 */

import type { IComputedLike } from './type.d';
import { isReactive } from './computed';
import { type Ref } from './ref';
import { DepUtil } from './dep';

export function isReactiveLike (v: any): v is Ref<any>|IComputedLike {
    return isReactive(v) || (typeof v === 'function');
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
