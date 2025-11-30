
/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-11 20:56:49
 * @Description: Coding something
 */
import { LifeScopeType, onEnterScope, onExitScope, setCurrentScope } from '../../element/lifes';
import type { Dom } from '../../element/element';
import { Frag } from '../../element/text';
import { LinkDomType, TransStatus } from '../../utils';
import { Marker, createMarkerNode } from '../marker';
import { DepUtil, ref, type Ref } from 'link-dom-reactive';
import { KEY_LD_TYPE, KEY_SCOPE, SharedStatus } from 'link-dom-shared';
import type { ForClass } from './for';

// window.list = [];
export class ForChild<T=any> {

    private _marker: Marker;
    removed = false;

    private _frag: Frag|Dom;

    private _start: any = null;
    originEl: any;

    transitionEl = null as any;

    get frag () {
        if (!this._frag) {
            setCurrentScope(this.parent[KEY_SCOPE]);
            onEnterScope(LifeScopeType.ForChild, this, this.index.value);
            const el = this.parent._generator(this.data as any, this.index);
            this.transitionEl = el; // ! 透传父for的switchDomsFns
            if (typeof el[KEY_LD_TYPE] !== 'number' || el[KEY_LD_TYPE] === LinkDomType.Component) {
                this._frag = new Frag().append(el);
            } else {
                this._frag = el;
            }
            this.ensureStart();
            let container: any = this._frag;
            if (!container.children) {
                container = this._frag.el;
            }
            // 对于没有节点的frag 增加一个marker
            if (container.children.length === 0) {
                container.prepend(createMarkerNode());
            }
            onExitScope();
        }
        return this._frag;
    }

    private ensureStart () {
        if (this._start) return this._start;

        if (this._frag[KEY_LD_TYPE] === LinkDomType.Frag) {
            this._start = this._frag.children[0]?.el;
            if (!this._start) {
                this._start = createMarkerNode();
                this._frag.prepend(this._start);
            }
        } else {
            // @ts-ignore
            this._start = this._frag.getMarker?.() || this._frag.el;
        }

        if (SharedStatus.isHydrating) {
            this._start.__for_child = this; // ! 标记需要替换marker
        }

        // console.log('Ensure start', this._start);
        this._start.__marker = true; // ! 标记为分割节点
        return this._start;
    }

    get marker () {
        if (!this._marker) {
            const start = this.ensureStart();
            this._marker = new Marker({ start, clearSelf: true, end: false });
        }
        // if (!this._marker) {
        //     const f = this.frag;
        //     const lg = f[KEY_LD_TYPE];
        //     let start: any;
        //     // debugger;
        //     if (lg === LinkDomType.Frag) {
        //         start = this._start?.el;
        //         if (!start) {
        //             start = createMarkerNode();
        //             f.prepend(start);
        //         }
        //     } else {
        //         // if (f.getMarker) {
        //         //     console.log(f.getMarker());
        //         // }
        //         // @ts-ignore
        //         start = f.getMarker?.() || f.el;
        //     }
        //     this._marker = new Marker({ start, clearSelf: true, end: false });
        // }
        return this._marker;
    }

    async destroy () {
        if (this.removed) return false;
        if (this.parent.transition) {
            const list = this.marker.pick(false, true);
            await this.parent.transition.triggerDone(list, TransStatus.LeaveFrom);
        }
        console.log('for child clear');
        this.marker.clear();
        this.removed = true;
        return true;
    }

    data: Ref<T>|T;

    index: {readonly value: number};

    constructor (
        private parent: ForClass,
        data: T,
        private _index: number,
    ) {
        const { _itemRef, _isDeep } = parent;
        // window.list.push(this);
        // console.log('debug', 'new for child');
        // debugger;
        this.data = _itemRef ? (_isDeep ? ref(data) : { value: data } as Ref) : data;
        const _this = this;
        this.index = {
            get value () {
                parent._$useIndex?.();
                DepUtil.add(this, 'value');
                return _this._index;
            },
            // @ts-ignore
            __isReactive: true,
        };
        // if (!window.fcChild)window.fcChild = [];
        // window.fcChild.push(this);
        // console.log('debug end', 'new for child');
        // console.warn('debug end', 'new for child');
    }
    setIndex (v: number) {
        if (v === this._index) return;
        this._index = v;
        DepUtil.trigger(this.index, 'value');
    }
}