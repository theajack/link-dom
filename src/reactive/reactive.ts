/*
 * @Author: chenzhongsheng
 * @Date: 2024-08-09 14:50:37
 * @Description: Coding something
 */

import {LinkDomType} from '../utils';
import {computed, computedToHistoryData, isComputedLike} from './computed';
import type {IHistoryData} from './history';
import {GlobalStoreUseHistory, isReactHistory} from './history';

const RawMark = Symbol('raw');

export function raw (v: any) {
    return {[RawMark]: true, value: v};
}

export interface IReactive {
    value: any;
    reacts: any[],
    __ld_type: LinkDomType.Reactive,
}

export function buildReactive (data: IHistoryData): IReactive {
    return {
        value: data.get(),
        reacts: [data],
        __ld_type: LinkDomType.Reactive,
    };
}

export function react (tpl: TemplateStringsArray|any, ...args: any[]): IReactive {
    let value: any, reacts: any[];
    if (args.length === 0) {
        // react(store.count)
        value = tpl;
        reacts = [GlobalStoreUseHistory.latest];
    } else {
        value = tpl[tpl.length - 1];
        let index = 1;
        reacts = [value] as any[];
        for (let i = args.length - 1; i >= 0; i--) {
            let arg = args[i];
            if (arg?.[RawMark]) {
                arg = arg.value;
                reacts.unshift(arg);
            } else if (isComputedLike(arg)) {
                const computed = computedToHistoryData(arg);
                arg = computed?.get();
                reacts.unshift(computed);
            } else {
                // 此处无法区分 storeData 和 普通的静态变量
                // 所以如果是静态变量需要使用 raw 包裹
                const data = GlobalStoreUseHistory.getHistory(index);
                reacts.unshift(data);
                index ++;
            }

            reacts.unshift(tpl[i]);

            value = `${tpl[i]}${arg}${value}`;
        }
    }
    return {
        value,
        reacts,
        __ld_type: LinkDomType.Reactive,
    };
}

export const $ = react;

export function useReact (v: any, apply: (v:any)=>void) {
    if (isComputedLike(v)) {
        const compute = computed(v);
        compute.sub(() => {
            apply(compute.value);
        });
        apply(compute.value);
    } else if (isReactive(v)) {
        const {value, reacts} = v;

        reacts.forEach((item: any) => {
            if (isReactHistory(item)) {
                item.sub(() => {
                    apply(concatReactsValues(reacts));
                });
            }
        });
        apply(value);
    } else {
        apply(v);
    }
}

function concatReactsValues (reacts: any[]): any {
    return reacts.map(item => {
        if (isReactHistory(item)) {
            return item.get();
        }
        return item;
    }).join('');
}
export function isReactive (v: any): v is IReactive {
    return v?.__ld_type === LinkDomType.Reactive;
}

// window.react = react;

// let a = 1;

// react`a=${raw(1)},count=${store.count}`;