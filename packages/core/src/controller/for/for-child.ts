
/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-11 20:56:49
 * @Description: Coding something
 */
import { LifeScopeType, onEnterScope, onExitScope } from '../../lifes';
import type { Dom, IChild } from '../../element';
import { Frag } from '../../text';
import { LinkDomType } from '../../utils';
import { Marker, createMarkerNode } from '../_marker';
import { DepUtil, ref, type Ref } from 'link-dom-reactive';
import { SharedStatus } from 'link-dom-shared';

// window.list = [];
export class ForChild<T=any> {

    private _marker: Marker;
    removed = false;

    private _frag: Frag|Dom;

    private _start: any = null;

    get frag () {
        if (!this._frag) {
            onEnterScope(LifeScopeType.ForChild, this, this.index.value);
            const el = this._generator(this.data, this.index);
            if (typeof el.__ld_type !== 'number' || el.__ld_type === LinkDomType.Component) {
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

        if (this._frag.__ld_type === LinkDomType.Frag) {
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
            console.log('debug for-child', this._start, this._start.dom.el);
            this._start.__for_child = this;
        }

        console.log('Ensure start', this._start);
        this._start.__marker = true; // ! 标记为分割节点
        return this._start;
    }

    __replaceHydrateStart (el: any) {
        if (SharedStatus.isHydrating) {
            this._start = el;
            this._start.__marker = true;
        }
    }

    get marker () {
        if (!this._marker) {
            const start = this.ensureStart();
            this._marker = new Marker({ start, clearSelf: true, end: false });
        }
        // if (!this._marker) {
        //     const f = this.frag;
        //     const lg = f.__ld_type;
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

    destroy () {
        if (this.removed) return false;
        this.marker.clear();
        this.removed = true;
        return true;
    }

    data: Ref<T>|T;

    index: {readonly value: number};

    constructor (
        private _generator: (item: Ref<T>|T, index: {readonly value: number})=>IChild,
        // private list: T[],
        isDeep: boolean,
        data: T,
        private _index: number,
        itemRef: boolean,
        useIndex?: ()=>void,
    ) {
        // window.list.push(this);
        // console.log('debug', 'new for child');
        // debugger;
        this.data = itemRef ? (isDeep ? ref(data) : { value: data } as Ref) : data;
        const _this = this;
        this.index = {
            get value () {
                useIndex?.();
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