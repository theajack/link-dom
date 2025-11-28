/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-01 16:37:21
 * @Description: Coding something
 */

import type { IReactive } from 'link-dom-reactive';
import { Frag, Text } from './text';
import { LinkDomType, read } from './utils';
import { KEY_LD_TYPE } from 'link-dom-shared';

export class Join {
    __is_join = true;
    [KEY_LD_TYPE] = LinkDomType.Join;

    get el () {
        return this.toFrag().el;
    }

    constructor (
        private strs: TemplateStringsArray,
        private values: (IReactive|string|number|boolean)[]
    ) {
    }

    toFrag (): Frag {
        const frag = new Frag();
        const n = this.values.length;
        for (let i = 0; i < n; i++) {
            if (this.strs[i]) frag.append(this.strs[i]);
            frag.append(new Text(this.values[i]));
        }
        if (this.strs[n]) frag.append(this.strs[n]);
        return frag;
    }

    toFn<T extends any> (): ()=>T {
        return () => {
            let value = '';
            const n = this.values.length;
            for (let i = 0; i < n; i++) {
                value += (this.strs[i]) + read(this.values[i]);
            }
            return value + this.strs[n] as T;
        };
    }
}


export function join (strs: TemplateStringsArray, ...values: (IReactive|string|number|boolean)[]): Join {
    // console.log(isSSR);
    return new Join(strs, values);
}