/*
 * @Author: chenzhongsheng
 * @Date: 2024-08-09 14:50:37
 * @Description: Coding something
 */

import {computed, isComputedLike} from './computed';

export function useReactive (v: any, apply: (v:any)=>void) {
    if (isComputedLike(v)) {
        const compute = computed(v);
        compute.sub(() => {
            apply(compute.value);
        });
        apply(compute.value);
    } else {
        apply(v);
    }
}