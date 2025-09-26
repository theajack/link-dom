
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
import { RenderStatus } from 'link-dom-shared';

// let id = 0;

// window.a = {};

// 用来存放if隐藏时的对象，不影响内部响应式操作
class IfScope {

    frag: Frag;

    // id: number;

    constructor (
        public ref: IReactiveLike,
        private gene: (()=>IChild)|IChild,
    ) {
    //     this.id = id++;
    //     window.a[this.id] = this;
    //     // if (RenderStatus.isHydrating) {
    //     //     debugger;
    //     // }
    }

    toFrag (): Frag {
        // console.log(this.id, RenderStatus.isHydrating, RenderStatus.isSSR);
        if (!this.frag) {
            const el = typeof this.gene === 'function' ? this.gene() : this.gene;
            this.frag = new Frag().append(el);
        } else {
            // @ts-ignore
            if (!RenderStatus.isHydrating && this.frag.el.__is_hydrate) {
                // @ts-ignore
                this.frag.el = this.frag.el.toDom().el;
            }
        }
        return this.frag;
    }

    store (list: Node[]): void {
        this.frag.append(list);
    }

    // destroy () {
    //     // @ts-ignore
    //     this.ref = this.gene = this.scope = this.frag = null;
    // }
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

    getMarker () {
        return this.marker.start;
    }

    constructor (
        ref: IReactiveLike<boolean>,
        gene: (()=>IChild)|IChild,
    ) {
        this._addCond(ref, gene);
        this.marker = new Marker();
    }
    elif (ref: IReactiveLike<boolean>, gene: (()=>IChild)|IChild) {
        return this._addCond(ref, gene);
    }
    private _addCond (ref: IReactiveLike<boolean>, gene: (()=>IChild)|IChild) {
        this.scopes.push(new IfScope(ref, gene));
        return this;
    }
    else (gene: (()=>IChild)|IChild) {
        this._addCond(true, gene);
        return this;
    }
    private _clearWatch: ()=>void;
    __mounted () {
        if (!this.frag) return;
        // console.log('test:if mounted');
        // this._initChildren();
        if (this.__mountedFn) {
            this.frag.mounted(this.__mountedFn);
        }
        this.frag?.__mounted?.(this.frag);
        if (!RenderStatus.isSSR) {
            this._clearWatch = watch(() => this.scopes.map(item => getReactiveValue(item.ref)), () => {
                const index = this.switchCase();
                // console.log('test:if switch', index, this.activeIndex);
                // console.log('if switch', index);
                if (index !== this.activeIndex) {
                    const prev = this.activeIndex;
                    this.activeIndex = index;
                    let list: Node[];
                    if (index === -1) {
                        list = this.marker.clear();
                    } else {
                        const frag = this.scopes[index].toFrag();
                        if (this.marker.start.__is_ssr) {
                            debugger;
                        }
                        frag.__mounted();
                        list = this.marker.replace(frag.el);
                    }
                    this.scopes[prev]?.store(list);
                }
            });
        }
        // debugger;
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
        // console.log('test:if switch1', index, this.activeIndex);
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
