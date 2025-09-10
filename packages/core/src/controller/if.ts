
/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-01 17:55:18
 * @Description: Coding something
 */
import type { IChild } from '../element';
import { Frag } from '../text';
import { LinkDomType } from '../utils';
import { watch } from 'link-dom-reactive';
import { getReactiveValue } from '../utils';
import { Marker } from './_marker';
import type { IReactiveLike } from '../type.d';

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

    // todo 这个是否会在ssr中受影响
    private _el: DocumentFragment;

    private marker: Marker;

    private activeIndex = -1;

    private scopes: IfScope[] = [];

    get el () {
        this._initChildren();
        return this._el;
    }

    constructor (
        ref: IReactiveLike<boolean>,
        gene: ()=>IChild,
    ) {
        this._addCond(ref, gene);
        this.marker = new Marker();
    }
    elif (ref: IReactiveLike<boolean>, gene: ()=>IChild) {
        return this._addCond(ref, gene);
    }
    private _addCond (ref: IReactiveLike<boolean>, gene: ()=>IChild) {
        this.scopes.push(new IfScope(ref, gene));
        return this;
    }
    else (gene: ()=>IChild) {
        this._addCond(true, gene);
        return this;
    }
    private _clearWatch: ()=>void;
    __mounted () {
        console.log('test:if mounted');
        // this._initChildren();
        if (this.__mountedFn) {
            this.frag.mounted(this.__mountedFn);
        }
        this.frag?.__mounted?.(this.frag);
        this._clearWatch = watch(() => this.scopes.map(item => getReactiveValue(item.ref)), () => {
            const index = this.switchCase();
            console.log('test:if switch', index, this.activeIndex);
            // console.log('if switch', index);
            if (index !== this.activeIndex) {
                const prev = this.activeIndex;
                this.activeIndex = index;
                let list: Node[];
                if (index === -1) {
                    list = this.marker.clear();
                } else {
                    const frag = this.scopes[index].toFrag();
                    list = this.marker.replace(frag.el);
                }
                this.scopes[prev]?.store(list);
            }
        });
        // @ts-ignore
        this.frag = null;
    }

    private __mountedFn?: (el: Frag)=>void;
    mounted (v: (el: Frag)=>void) {
        this.__mountedFn = v;
        return this;
    }
    private _initChildren () {
        if (this._el) return;
        this.frag = new Frag();
        this.frag.append(this.marker.start);
        const index = this.switchCase();
        console.log('test:if switch1', index, this.activeIndex);
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
        // @ts-ignore
        this.scopes = null;
        this._clearWatch?.();
    }
}
