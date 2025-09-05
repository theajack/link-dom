
/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-01 17:55:18
 * @Description: Coding something
 */
import type {IChild} from '../element';
import {Frag} from '../text';
import {LinkDomType} from '../utils';
import {watch} from '../reactive/computed';
import {getReactiveValue} from '../reactive/utils';
import {Marker} from './_marker';
import type {IReactiveLike} from '../type';

// 用来存放if隐藏时的对象，不影响内部响应式操作
class IfScope {

    frag: Frag;
    
    constructor (
        public ref: IReactiveLike,
        private gene: ()=>IChild,
    ) {
    }

    toFrag (): Frag {
        if (!this.frag) {
            this.frag = new Frag().append(this.gene());
        }
        return this.frag;
    }

    store (list: Node[]): void {
        this.frag = new Frag().append(list);
    }
}


export class If {

    __ld_type = LinkDomType.If;

    private frag: Frag;

    _el: DocumentFragment;

    private marker: Marker;

    private activeIndex = -1;

    private scopes: IfScope[] = [];

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
        this.scopes.push(new IfScope(ref, gene));
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

        watch(() => this.scopes.map(item => getReactiveValue(item.ref)), () => {
            const index = this.switchCase();
            if (index !== this.activeIndex) {
                const prev = this.activeIndex;
                this.activeIndex = index;
                let list: Node[];
                if (index === -1) {
                    list = this.marker.clear();
                } else {
                    this.frag = this.scopes[index].toFrag();
                    list = this.marker.replace(this.frag.el);
                }
                this.scopes[prev]?.store(list);
            }
        });
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
            this.frag.append(this.scopes[index].toFrag());
        }
        this.frag.append(this.marker.end!);
        this._el = this.frag.el;
    }

    private switchCase () {
        const n = this.scopes.length;
        for (let i = 0; i < n; i ++) {
            const item = this.scopes[i];
            const bool = !!(getReactiveValue(item.ref));
            if (bool) {
                return i;
            }
        }
        return -1;
    }

    destroy () {
    }
}
