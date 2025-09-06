/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-06 00:06:35
 * @Description: Coding something
 */
import type { Computed, Link } from './computed';
import type { Ref } from './ref';

export type IComputedLike<T=any> = IComputeFn<T> | Computed<T>;

export type IComputeFn<T = any> = ()=>T;

export type IComputedWatch = ((
    computed: Computed<any> | Ref<any>,
    key?: string
) => void);

export type IReactive<T=any> = IComputedLike<T> | Ref<T> | Link<T>;