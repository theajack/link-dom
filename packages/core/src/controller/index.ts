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

export type IController = ForClass | IfClass | SwitchClass;

export const ctrl = {
    for: <T = any> (list: Ref<T[]>|T[], fn: (item: T, index: {readonly value: number})=>IChild) => {
        return new ForClass<T>(list, fn);
    },
    forRef: <T = any> (list: Ref<T[]>|T[], fn: (item: Ref<T>, index: {readonly value: number})=>IChild) => {
        return new ForClass<T>(list, fn, true);
    },
    forStatic: <T = any> (list: Ref<T[]>|T[], fn: (item:T, index: number)=>IChild) => {
        return (isReactive(list) ? list.value : list).map((item, index) => fn(item, index));
    },
    if (ref: IReactiveLike, gene: (()=>IChild)|IChild) {
        return new IfClass(ref, gene);
    },
    switch (ref: IReactiveLike) {
        return new SwitchClass(ref);
    },
    scope (gene: ()=>IChild) {
        return gene();
    },
    show (
        ref: IReactiveLike<boolean>,
        gene: (()=>IChild)|IChild,
        showDisplay?: IOptionStyle['display'],
    ) {
        return new ShowClass(ref, gene, showDisplay);
    },
    // 异步控制器
    await<T> (data: Promise<T>, fn: (v: T)=>IChild) {
        return new AwaitClass(data, fn);
    }
};