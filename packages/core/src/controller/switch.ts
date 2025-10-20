/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-05 22:26:21
 * @Description: Coding something
 */
import type { IReactiveLike } from '../type.d';
import { IfClass } from './if';
import { getReactiveValue } from '../utils';
import type { IChild } from '../element';
import { LinkDomType } from '../utils';
import type { Frag } from '../text';
export class SwitchClass {
    __ld_type = LinkDomType.Switch;
    private if: IfClass;
    get el () {
        if (!this.if) throw new Error('switch must have case or default');
        return this.if.el;
    }
    getMarker () {
        return this.if.getMarker();
    }
    constructor (private ref: IReactiveLike) {}
    case (cond: any|(any[])|(()=>any), gene: ()=>IChild) {
        const fn = () => {
            const refv = getReactiveValue(this.ref);
            const value = (typeof cond === 'function') ? cond() : cond;
            return (Array.isArray(value)) ? value.includes(refv) : value === refv;
        };
        if (!this.if) {
            this.if = new IfClass(fn, gene);
        } else {
            this.if.elif(fn, gene);
        }
        return this;
    }
    default (gene: ()=>IChild) {
        if (!this.if) {
            this.if = new IfClass(() => false, gene);
        } else {
            this.if.else(gene);
        }
        return this;
    }

    __mounted () {
        this.if?.__mounted();
    }
    mounted (v: (el: Frag)=>void) {
        this.if.mounted(v);
        return this;
    }
    destroy () {
        this.if?.destroy();
    }
}