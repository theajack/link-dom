/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-01 16:37:21
 * @Description: Coding something
 */

import {Frag, Text} from '../text';
import type {IComputeFn} from './computed';
import {getReactiveValue} from './store';

export class Join {
    __is_join = true;

    constructor (
        private strs: TemplateStringsArray,
        private values: any[]
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

    toComputed (): IComputeFn<any> {
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

export function isJoin (v: any) {
    return v?.__is_join === true;
}

export function join (strs: TemplateStringsArray, ...values: any[]): Join {
    return new Join(strs, values);
}