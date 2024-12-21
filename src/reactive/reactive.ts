/*
 * @Author: chenzhongsheng
 * @Date: 2024-08-09 14:50:37
 * @Description: Coding something
 */

import {LinkDomType} from '../utils';
import type {IHistoryData} from './history';
import {GlobalStoreUseHistory} from './history';

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
        value: data.store[data.attr],
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
            } else {
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
    if (isReactive(v)) {
        const {value, reacts} = v;

        reacts.forEach((item: any) => {
            if (isReactHistory(item)) {
                item.store.$sub(item.attr, () => {
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
    if (reacts.length === 1) {
        const {store, attr} = reacts[0];
        return store.$get(attr);
    } else {
        return reacts.map(item => {
            if (isReactHistory(item)) {
                return item.store.$get(item.attr);
            }
            return item;
        }).join('');
    }
}

export function isReactHistory (item: any): item is IHistoryData {
    return typeof item === 'object' && !!item?.store.$unsub;
}

export function isReactive (v: any): v is IReactive {
    return v?.__ld_type === LinkDomType.Reactive;
}

// window.react = react;

// let a = 1;

// react`a=${raw(1)},count=${store.count}`;