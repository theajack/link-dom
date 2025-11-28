/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-01 19:32:29
 * @Description: Coding something
 */

import type { Dom, IChild } from '../element';
import { isReactive, type Ref } from 'link-dom-reactive';
import type { IControlLink, IReactiveLike } from '../type.d';
import { ForClass } from './for/for';
import type { IfShortUseFn } from './if';
import { IfClass, IfInner } from './if';
import { SwitchClass } from './switch';
import type { IOptionStyle } from '../type.d';
import { ShowClass } from './show';
import { AwaitClass } from './await';
import { KEY_FC_API_LINK, KEY_FC_API_VALUE, KEY_LD_TYPE, SharedStatus } from 'link-dom-shared';
import { LinkDomType } from '../utils';

export { Elif, Else, type IfClass } from './if';
export { Default, Case, type SwitchClass } from './switch';

export type IController = ForClass | IfClass | SwitchClass;

function parseForList <T> (list: Ref<T[]>|T[]) {
    const arr = (isReactive(list)) ? list.value : list;
    const isStatic = !arr[SharedStatus.OriginTarget];
    return { arr, isStatic };
}

export interface IfCtrl {
    (ref: IReactiveLike): IfShortUseFn;
    (ref: IReactiveLike, gene?: (()=>IChild)|IChild, elseGen?: (()=>IChild)|IChild): IfClass;
}

export const ctrl = {
    for: <T = any> (list: Ref<T[]>|T[], fn: (item: T, index: {readonly value: number})=>IChild) => {
        const { arr, isStatic } = parseForList(list);
        if (isStatic) return arr.map((item, index) => fn(item, { value: index }));
        return new ForClass<T>(arr, fn);
    },
    forRef: <T = any> (list: Ref<T[]>|T[], fn: (item: Ref<T>, index: {readonly value: number})=>IChild) => {
        const { arr, isStatic } = parseForList(list);
        if (isStatic) return arr.map((item, index) => fn({ value: item } as Ref, { value: index }));
        return new ForClass<T>(arr, fn, true);
    },
    forStatic: <T = any> (list: Ref<T[]>|T[], fn: (item:T, index: number)=>IChild) => {
        return (isReactive(list) ? list.value : list).map((item, index) => fn(item, index));
    },
    if: ((ref: IReactiveLike, gene?: (()=>IChild)|IChild, elseGen?: (()=>IChild)|IChild) => {
        if (!gene) {
            return IfInner(ref);
        }
        const target = new IfClass(ref, gene);
        if (elseGen) {
            target.else(elseGen);
        }
        return target;
    }) as IfCtrl,
    switch (ref: IReactiveLike): SwitchClass & {
        (...args: (Dom|IControlLink)[]): SwitchClass
    } {
        const target = new SwitchClass(ref);
        let p: any = null;
        const fn = (...args: Dom[]) => {
            let hasDefault = false;
            for (const item of args) {
                const type = (item as any)[KEY_FC_API_LINK];
                if (!type) {
                    throw new Error('Switch can only has case or default children');
                }
                if (hasDefault) {
                    throw new Error('Switch can only has one default children');
                }
                if (type === 'default') {
                    hasDefault = true;
                    target.default(item);
                } else if (type === 'case') {
                    const value = (item as any)[KEY_FC_API_VALUE];
                    target.case(value, item);
                }
            }
            return p;
        };
        p = new Proxy(fn, {
            get (_, key) {
                if (key === KEY_LD_TYPE) return LinkDomType.Switch;
                if (key === 'el') return target.el;
                if (typeof target[key] === 'function') {
                    return (...args: any[]) => {
                        target[key](...args);
                        return p;
                    };
                }
                return target[key];
            }
        });
        return p;
    },
    scope (gene: ()=>IChild) {
        return gene();
    },
    show (
        ref: IReactiveLike<any>,
        gene: (()=>IChild)|IChild,
        showDisplay?: IOptionStyle['display'],
    ) {
        return new ShowClass(ref, gene, showDisplay);
    },
    // 异步控制器
    await<T> (data: Promise<T>, fn: (v: T)=>IChild) {
        return new AwaitClass(data, fn);
    },
};