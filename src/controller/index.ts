/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-01 19:32:29
 * @Description: Coding something
 */

import type {IChild} from '../element';
import type {Ref} from '../reactive/ref';
import type {IReactiveLike} from '../type';
import {For} from './for';
import {If} from './if';
import '../reactive/reactive';

export type IController = For | If

export const ctrl = {

    for: <T = any> (list: Ref<T[]>, fn: (item: T, index: Ref<number>)=>IChild) => {
        return new For<T>(list, fn);
    },

    if (ref: IReactiveLike, gene: ()=>IChild) {
        return new If(ref, gene);
    },
    scope (gene: ()=>IChild) {
        return gene();
    }
};