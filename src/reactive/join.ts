/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-01 16:37:21
 * @Description: Coding something
 */

import type {IReactive} from '../type';
import {Frag, Text} from '../text';
import {getReactiveValue} from './utils';

export class Join {
    __is_join = true;

    constructor (
        private strs: TemplateStringsArray,
        private values: (IReactive|string|number|boolean)[]
    ) {
    }

    toFrag (): Frag {
        const frag = new Frag();
        const n = this.values.length;
        for (let i = 0; i < n; i++) {
            frag.append(this.strs[i], new Text(this.values[i]));
        }
        frag.append(this.strs[n]);
        return frag;
    }

    toFn (): ()=>any {
        return () => {
            let value = '';
            const n = this.values.length;
            for (let i = 0; i < n; i++) {
                value += (this.strs[i]) + getReactiveValue(this.values[i]);
            }
            return value + this.strs[n];
        };
    }
}

export function isJoin (v: any): v is Join {
    return v?.__is_join === true;
}

export function join (strs: TemplateStringsArray, ...values: (IReactive|string|number|boolean)[]): Join {
    return new Join(strs, values);
}