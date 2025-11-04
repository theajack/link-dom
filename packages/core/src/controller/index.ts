/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-01 19:32:29
 * @Description: Coding something
 */

import type { IChild } from '../element';
import { isReactive, type Ref } from 'link-dom-reactive';
import type { IReactiveLike } from '../type.d';
import { ForClass } from './for/for';
import { IfClass } from './if';
import { SwitchClass } from './switch';
import type { IOptionStyle } from '../type.d';
import { ShowClass } from './show';
import { AwaitClass } from './await';
import { SharedStatus } from 'link-dom-shared';

export type IController = ForClass | IfClass | SwitchClass;

function parseForList <T> (list: Ref<T[]>|T[]) {
    const arr = (isReactive(list)) ? list.value : list;
    const isStatic = !arr[SharedStatus.OriginTarget];
    return { arr, isStatic };
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
    if (ref: IReactiveLike, gene: (()=>IChild)|IChild, elseGen?: (()=>IChild)|IChild) {
        const target = new IfClass(ref, gene);
        if (elseGen) {
            target.else(elseGen);
        }
        return target;
    },
    switch (ref: IReactiveLike) {
        return new SwitchClass(ref);
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