
/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-01 17:55:18
 * @Description: Coding something
 */
import type {IChild} from '../element';
import {Frag} from '../text';
import {LinkDomType} from '../utils';
import {watch, type IReactiveLike} from '../reactive/computed';
import {getReactiveValue} from '../reactive/store';
import {Marker} from './_marker';

export class If {

    __ld_type = LinkDomType.If;

    private frag: Frag;

    _el: DocumentFragment;

    private marker: Marker;

    private activeIndex = -1;

    private _conds: {
        ref: IReactiveLike,
        gene: ()=>IChild,
    }[] = [];

    get el () {
        this._initChildren();
        return this._el;
    }
    
    constructor (
        ref: IReactiveLike,
        gene: ()=>IChild,
    ) {
        this._addCond(ref, gene);
        this.marker = new Marker();
    }
    elif (ref: IReactiveLike, gene: ()=>IChild) {
        return this._addCond(ref, gene);
    }
    private _addCond (ref: IReactiveLike, gene: ()=>IChild) {
        this._conds.push({ref, gene});
        return this;
    }
    else (gene: ()=>IChild) {
        this._addCond(true, gene);
        this._initChildren();
        return this;
    }
    __mounted () {
        this._initChildren();
        this.frag?.__mounted?.(this.frag);

        watch(() => this._conds.map(item => getReactiveValue(item.ref)), () => {
            const index = this.switchCase();
            if (index !== this.activeIndex) {
                this.activeIndex = index;
                if (index === -1) {
                    this.marker.clear();
                } else {
                    this.frag = new Frag().append(this._conds[index].gene());
                    this.marker.replace(this.frag.el);
                }
            }
        });

        const index = this.switchCase();
        this.activeIndex = index;
        if (index >= 0) {
            this.frag.append(this._conds[index].gene());
        }
    }

    mounted (v: (el: Frag)=>void) {
        this.frag.mounted(v);
        return this;
    }
    private _initChildren () {
        if (this._el) return;
        this.frag = new Frag();
        this.frag.append(this.marker.start);
        const index = this.switchCase();
        this.activeIndex = index;
        if (index >= 0) {
            this.frag.append(this._conds[index].gene());
        }
        this.frag.append(this.marker.end!);
        this._el = this.frag.el;
    }

    private switchCase () {
        const n = this._conds.length;
        for (let i = 0; i < n; i ++) {
            const item = this._conds[i];
            const bool = !!(getReactiveValue(item.ref));
            if (bool) {
                return i;
            }
        }
        return -1;
    }
}
