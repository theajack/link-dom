
/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-11 20:56:49
 * @Description: Coding something
 */
import type { Dom, IChild } from '../../element';
import { Frag } from '../../text';
import { LinkDomType } from '../../utils';
import { Marker, createMarkerNode } from '../_marker';
import type { Dep } from 'link-dom-reactive';
import { DepUtil, ref, type Ref } from 'link-dom-reactive';

export class ForChild<T=any> {
    private _marker: Marker;
    removed = false;

    private _frag: Frag|Dom;

    private _list: {dep: Dep, exp: ()=>any}[] = [];

    collect (dep: Dep, exp: ()=>any) {
        this._list.push({ dep, exp });
    }

    get frag () {
        if (!this._frag) {
            const el = this._generator(this.data, this.index);
            if (typeof el.__ld_type !== 'number') {
                this._frag = new Frag().append(el);
            } else {
                this._frag = el;
            }
            let container: any = this._frag;
            if (!container.children) {
                container = this._frag.el;
            }
            // 对于没有节点的frag 增加一个marker
            if (container.children.length === 0) {
                container.prepend(createMarkerNode());
            }
        }
        return this._frag;
    }

    get marker () {
        if (!this._marker) {
            const f = this.frag;
            const lg = f.__ld_type;
            let start: any;
            // debugger;
            if (lg === LinkDomType.Frag) {
                start = f.children[0]?.el;
                if (!start) {
                    start = createMarkerNode();
                    f.prepend(start);
                }
            } else {
                // if (f.getMarker) {
                //     console.log(f.getMarker());
                // }
                // @ts-ignore
                start = f.getMarker?.() || f.el;
            }
            this._marker = new Marker({ start, clearSelf: true });
        }
        return this._marker;
    }

    destroy () {
        if (this.removed) return;
        this._list.forEach(item => item.dep.remove(item.exp));
        this._list = [];
        this.marker.clear();
        this.removed = true;
    }

    data: Ref<T>|T;

    index: {readonly value: number};

    indexUsed = false;

    constructor (
        private _generator: (item: Ref<T>|T, index: {readonly value: number})=>IChild,
        // private list: T[],
        isDeep: boolean,
        data: T,
        private _index: number,
        itemRef: boolean,
        useIndex?: ()=>void,
    ) {
        this.data = itemRef ? (isDeep ? ref(data) : { value: data } as Ref) : data;
        const _this = this;
        this.index = {
            get value () {
                useIndex?.();
                DepUtil.add(this, 'value');
                return _this._index;
            }
        };
        // if (!window.fcChild)window.fcChild = [];
        // window.fcChild.push(this);
    }
    setIndex (v: number) {
        if (v === this._index) return;
        this._index = v;
        DepUtil.trigger(this.index, 'value');
    }
}