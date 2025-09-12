/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-01 19:32:29
 * @Description: Coding something
 */

import type { IChild } from '../element';
import type { Ref } from 'link-dom-reactive';
import type { IReactiveLike } from '../type.d';
import { For } from './for/for';
import { If } from './if';
import { Switch } from './switch';
import type { IOptionStyle } from '../type.d';
import { Show } from './show';

export type IController = For | If | Switch;

export const ctrl = {
    for: <T = any> (list: Ref<T[]>, fn: (item: T, index: number)=>IChild) => {
        return new For<T>(list, fn);
    },
    forNoIndex: <T = any> (list: Ref<T[]>, fn: (item: T)=>IChild) => {
        return new For<T>(list, fn, false, false);
    },
    forRef: <T = any> (list: Ref<T[]>, fn: (item: Ref<T>, index: number)=>IChild) => {
        return new For<T>(list, fn, true);
    },
    forRefNoIndex: <T = any> (list: Ref<T[]>, fn: (item: Ref<T>)=>IChild) => {
        return new For<T>(list, fn, true, false);
    },
    forStatic: <T = any> (list: T[], fn: (item:T, index: number)=>IChild) => {
        return list.map((item, index) => fn(item, index));
    },
    if (ref: IReactiveLike, gene: ()=>IChild) {
        return new If(ref, gene);
    },
    switch (ref: IReactiveLike) {
        return new Switch(ref);
    },
    scope (gene: ()=>IChild) {
        return gene();
    },
    show (
        ref: IReactiveLike<boolean>,
        gene: ()=>IChild,
        showDisplay?: IOptionStyle['display'],
    ) {
        return new Show(ref, gene, showDisplay);
    },
};