/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-05 22:26:21
 * @Description: Coding something
 */
import type { IControlLink, IReactiveLike } from '../type.d';
import { IfClass } from './if';
import { read } from '../utils';
import type { IChild } from '../element';
import { LinkDomType } from '../utils';
import { frag, type Frag } from '../text';
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
    case (cond: any|(any[])|(()=>any), gene: (()=>IChild)|IChild) {
        const fn = () => {
            const refv = read(this.ref);
            const value = (typeof cond === 'function') ? cond() : cond;
            return (Array.isArray(value)) ? value.includes(refv) : value === refv;
        };
        if (!this.if) {
            this.if = new IfClass(fn, gene);
            this.if.__ifProxy = this;
        } else {
            this.if.elif(fn, gene);
        }
        return this;
    }
    default (gene: (()=>IChild)|IChild) {
        if (!this.if) {
            this.if = new IfClass(() => false, gene);
            this.if.__ifProxy = this;
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

export function Case (cond: any|(any[])|(()=>any)) {
    return (...args: IChild[]) => {
        return {
            __fc_api_link: 'case',
            __fc_api_value: cond,
            __ld_type: LinkDomType.Dom,
            get el () {return frag(...args).el;}
        } as IControlLink;
    };
}

export function Default (...args: IChild[]) {
    return {
        __fc_api_link: 'default',
        __ld_type: LinkDomType.Dom,
        get el () {return frag(...args).el;}
    } as IControlLink;
}