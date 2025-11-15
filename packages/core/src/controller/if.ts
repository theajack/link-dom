
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
import { SharedStatus } from 'link-dom-shared';
// import { CurrentScope, LifeScope, LifeScopeType } from '../lifes';

// let id = 0;

// window.a = {};

// 用来存放if隐藏时的对象，不影响内部响应式操作
class IfScope {

    frag: Frag;
    // lifeScope: LifeScope;

    // id: number;

    constructor (
        public ref: IReactiveLike,
        private gene: (()=>IChild)|IChild,
    ) {
        // console.log('debug', 'new if scope', ref);
        // this.lifeScope = new LifeScope(LifeScopeType.If);
    //     this.id = id++;
    //     window.a[this.id] = this;
    }

    toFrag (): Frag {
        // console.log(this.id, SharedStatus.isHydrating, SharedStatus.isSSR);
        if (!this.frag) {
            const el = typeof this.gene === 'function' ? this.gene() : this.gene;
            this.frag = new Frag().append(el);
        } else {
            if (!SharedStatus.isHydrating &&
                // @ts-ignore
                this.frag.el.__is_hydrate) {
                // @ts-ignore
                this.frag.el = this.frag.el.toDom().el;
            }
        }
        // console.log('debug end', 'new if scope', this.ref);
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


let id = 0;
export class IfClass {

    __ld_type = LinkDomType.If;
    id = id++;

    private frag: Frag;

    // todo 这个是否会在ssr中受影响
    private _el: DocumentFragment;

    private marker: Marker;

    private activeIndex = -1;
    private prevIndex = -1;
    private _renderered = false;

    private scopes: IfScope[] = [];

    get el () {
        // console.log('debug', 'new if', this.id);
        this._initChildren();
        return this._el;
    }

    getMarker () {
        return this.marker.start;
    }

    constructor (
        ref: IReactiveLike<any>,
        gene: (()=>IChild)|IChild,
    ) {
        // console.log('debug', 'new if', this.id, ref);
        this._addCond(ref, gene);
        this.marker = new Marker();
        // console.log('%cdebug end new if', 'color: red');
    }
    elif (ref: IReactiveLike<any>, gene: (()=>IChild)|IChild) {
        return this._addCond(ref, gene);
    }
    private _addCond (ref: IReactiveLike<any>, gene: (()=>IChild)|IChild) {
        this.scopes.push(new IfScope(ref, gene));
        return this;
    }
    else (gene: (()=>IChild)|IChild) {
        this._addCond(true, gene);
        return this;
    }
    private _clearWatch: ()=>void;
    __mounted () {
        // this.scopes.forEach(scope => {
        //     scope.lifeScope.parent = CurrentScope;
        // });
        // console.trace('11111111');
        if (!this.frag) return;
        // console.log('test:if mounted');
        // this._initChildren();
        if (this.__mountedFn) {
            this.frag.mounted(this.__mountedFn);
        }
        this.frag?.__mounted?.(this.frag);
        this._renderered = true;
        // debugger;
        // @ts-ignore
        this.frag = null;
    }

    private _initElements () {
        if (SharedStatus.isSSR || !this._renderered) return;
        let list: Node[];
        if (this.activeIndex === -1) {
            list = this.marker.clear();
        } else {
            const frag = this.scopes[this.activeIndex].toFrag();
            frag.__mounted();
            list = this.marker.replace(frag.el);
        }
        this.scopes[this.prevIndex]?.store(list);
    }

    private __mountedFn?: (el: Frag)=>void;
    mounted (v: (el: Frag)=>void) {
        this.__mountedFn = v;
        return this;
    }
    private _initChildren () {
        if (this._el) return;
        this._clearWatch = watch(() => this.scopes.map(item => getReactiveValue(item.ref)), () => {
            const index = this.switchCase();
            // console.log('test:if switch', index, this.activeIndex);
            // console.log('if switch', index);
            if (index !== this.activeIndex) {
                this.prevIndex = this.activeIndex;
                this.activeIndex = index;
                this._initElements();
            }
        });
        // ! 优化静态if中不生成marker node
        const isStatic: boolean = (this._clearWatch as any).static;
        this.frag = new Frag();
        if (!isStatic) this.frag.append(this.marker.start);
        const index = this.switchCase();
        // console.log('test:if switch1', index, this.activeIndex);
        this.activeIndex = index;
        if (index >= 0) {
            this.frag.append(this.scopes[index].toFrag());
        }
        if (!isStatic) this.frag.append(this.marker.end!);
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
