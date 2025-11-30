
/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-01 17:55:18
 * @Description: Coding something
 */
import type { IChild } from '../element/element';
import { frag, Frag } from '../element/text';
import { filterElement, TransStatus } from '../utils';
import { LinkDomType } from '../utils';
import type { IReactiveLike } from 'link-dom-reactive';
import { watch, read } from 'link-dom-reactive';
import { Marker } from './marker';
import type { IControlLink } from '../type.d';
import {
    KEY_FC_API_LINK, KEY_FC_API_VALUE, KEY_IF_LINK_DONE, KEY_LD_TYPE, KEY_SCOPE,
    parseFuncWrap, SharedStatus
} from 'link-dom-shared';
import { updateIfScopeBranch, type LifeScope, IsFcApiKeys } from '../element/lifes';
import { TransitionProxy, type ITransCall } from '../components/trans-base';
import type { ITransScope } from '../components';
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
            this.frag = new Frag().append(
                parseFuncWrap(this.gene)
            );
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

    // ! 默认会全部缓存 也就是keepAlive默认已经实现了
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

    [KEY_LD_TYPE] = LinkDomType.If;
    [KEY_SCOPE]: LifeScope;
    id = id++;

    __ifProxy?: any; // 是否是代理Switch

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

    private transition: TransitionProxy;
    async onSwitchDoms (fn: ITransCall, trans: ITransScope, showAppear = false) {
        if (!this.transition) { this.transition = new TransitionProxy(trans); }
        this.transition.onSwitchDoms(fn);
        if (showAppear) {
            const doms = this.marker.pick(false, true);
            await this.transition.appear(doms);
        }
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
            // life
            this.frag.mounted(this.__mountedFn);
        }
        this.frag?.__mounted(this.frag);
        this._renderered = true;
        //
        // @ts-ignore
        this.frag = null;
    }

    get _lifeScope () {
        return this[KEY_SCOPE] || this.__ifProxy?.[KEY_SCOPE];
    }

    private async _initElements () {
        if (SharedStatus.isSSR || !this._renderered) return;
        let list: HTMLElement[] = [];
        if (this.activeIndex === -1) {
            if (this.transition) {
                const doms = this.marker.pick(false, true) as HTMLElement[];
                await this.transition.triggerDone(doms, TransStatus.LeaveFrom);
                console.warn('_initElements 1');
            }
            list = this.marker.clear();
        } else {
            const life = updateIfScopeBranch(this._lifeScope, this.prevIndex, this.activeIndex);
            life.beforeUnmount();
            if (this.transition) {
                // ! 此处必须要不包含element，因为需要remove掉所有元素
                list = this.marker.pick(false, false);
                const remove = async () => {
                    await this.transition.trigger(filterElement(list), TransStatus.LeaveFrom);
                    list.forEach(item => item.remove());
                    life.unmounted();
                };
                const add = async () => {
                    const frag = this.scopes[this.activeIndex].toFrag();
                    const doms = Array.from(frag.el.children);
                    await this.transition.trigger(doms, TransStatus.EnterFrom);
                    console.warn('_initElements enter from');
                    frag.__mounted();
                    this.marker.replace(frag.el);
                    life.mounted();
                    console.warn('_initElements enter action start');
                    await this.transition.trigger(doms, TransStatus.EnterActive);
                    console.warn('_initElements enter action end');
                };
                await this.transition.callSwitchFn(add, remove);
                console.log('resolve all done');
            } else {
                list = this.marker.clear();
                life.unmounted();
                const frag = this.scopes[this.activeIndex].toFrag();
                frag.__mounted();
                this.marker.replace(frag.el);
                life.mounted();
            }
        }
        this.scopes[this.prevIndex]?.store(list);
    }

    private __mountedFn?: (el: Frag)=>void;
    mounted (v: (el: Frag)=>void) {
        this.__mountedFn = v;
        return this;
    }
    private _initReady: Promise<void> = Promise.resolve();
    private _initChildren () {
        if (this._el) return;
        this._clearWatch = watch(() => this.scopes.map(item => read(item.ref)), async () => {
            if (this.transition) {
                this.transition.cancel();
                await this._initReady;
                console.log('_initReady');
            }
            const index = this.switchCase();
            // console.log('test:if switch', index, this.activeIndex);
            console.log('if switch', index);
            if (index !== this.activeIndex) {
                this.prevIndex = this.activeIndex;
                this.activeIndex = index;
                this._initReady = this._initElements();
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
            const f = this.scopes[index].toFrag();
            // // debugger; // todo 这里好像执行不到可以删除
            // if (this.transition) {
            //     const doms = Array.from(f.el.children);
            //     this.transition.trigger(doms, TransStatus.EnterFrom, true);
            //     this.transition.trigger(doms, TransStatus.EnterActive, true);
            // }
            // ! 初始化if加载
            this.frag.append(f);
        }
        if (!isStatic) this.frag.append(this.marker.end!);
        this._el = this.frag.el;
    }

    private switchCase () {
        const n = this.scopes.length;
        for (let i = 0; i < n; i ++) {
            const item = this.scopes[i];
            const bool = !!(read(item.ref));
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

export type IfShortUseFn = {
    (...args: IChild[]): IControlLink,
    same(): IControlLink;
}

export function IfInner (ref: IReactiveLike): IfShortUseFn {
    const fn: any = ((...args: IChild[]) => {
        return {
            [KEY_LD_TYPE]: LinkDomType.Dom,
            [KEY_FC_API_LINK]: 'if',
            [KEY_FC_API_VALUE]: ref,
            get el () {return frag(...args).el;}
        } as IControlLink;
    });
    fn.same = () => fn(ref);
    return fn;
};

export function Elif (ref: IReactiveLike<any>): IfShortUseFn {
    const fn: any = (...args: IChild[]) => {
        return {
            [KEY_FC_API_LINK]: 'elif',
            [KEY_FC_API_VALUE]: ref,
            [KEY_LD_TYPE]: LinkDomType.Dom,
            get el () {return frag(...args).el;}
        } as IControlLink;
    };
    fn.same = () => fn(ref);
    return fn;
}

export function Else (...args: IChild[]) {
    return {
        [KEY_FC_API_LINK]: 'else',
        [KEY_LD_TYPE]: LinkDomType.Dom,
        get el () {return frag(...args).el;}
    } as IControlLink;
}


// ! 处理if链式调用逻辑
export function handleIfLinkChildren (el: any, list: any[], start: number = 0) {
    if (el?.[KEY_FC_API_LINK] && IsFcApiKeys.has(el[KEY_FC_API_LINK])) {
        if (!el[KEY_IF_LINK_DONE]) {
            const type = el[KEY_FC_API_LINK] as 'if'|'elif'|'else';
            if (type === 'if') {
                const ifEl = new IfClass(el[KEY_FC_API_VALUE], el);
                let count = 0;
                for (let i = start + 1; i < list.length; i++) {
                    const cur = list[i];
                    if (!cur[KEY_FC_API_LINK]) break;
                    if (cur[KEY_FC_API_LINK] === 'elif') {
                        cur[KEY_IF_LINK_DONE] = true;
                        ifEl.elif(cur[KEY_FC_API_VALUE], cur);
                        count ++;
                    } else if (cur[KEY_FC_API_LINK] === 'else') {
                        cur[KEY_IF_LINK_DONE] = true;
                        ifEl.else(cur);
                        count ++;
                        break; // ! else 之后就结束了 不然会印象影响后面的
                    } else {
                        break; // ! 同上
                    }
                }
                if (count) list.splice(start + 1, count);
                // list[start] = ifEl;
                el[KEY_IF_LINK_DONE] = true;
                // ! 此处要把dom一起改掉
                return ifEl;
            } else {
                throw new Error(`${type} can not use without if`);
            }
        }
    }
    return null;
}