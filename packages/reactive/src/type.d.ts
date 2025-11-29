/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-06 00:06:35
 * @Description: Coding something
 */
import type { KEY_LD_TYPE } from 'link-dom-shared';
import type { Computed, Link } from './computed';
import type { Ref } from './ref';

export type IComputedLike<T=any> = IComputeFn<T> | Computed<T>;

export type IComputeFn<T = any> = ()=>T;

export type IComputedWatch = ((
    computed: Computed<any> | Ref<any>,
    key?: string
) => void);

export type IReactive<T=any> = IComputedLike<T> | Ref<T> | Link<T>|{readonly value: T; };

export type IReactiveLike<T=any> = IReactive<T> | T | IJoin;

export interface IJoin<T = any> {
    __is_join: boolean;
    [KEY_LD_TYPE]: number;
    toFrag(): T;
    toFn<V = any>(): ()=>V;
    get el(): any;
}