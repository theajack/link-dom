
/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-01 17:55:18
 * @Description: Coding something
 */
import type { IChild } from '../element';
import { Frag } from '../text';
import { LinkDomType } from '../utils';
import { createMarkerNode, removeBetween } from './_marker';
import { OriginTarget, checkHydrateMarker, } from 'link-dom-shared';
import { setArrayListeners, isRef, type Ref, watch, DepUtil, isDeepReactive } from 'link-dom-reactive';
import { ForChild } from './for-child';

export const ForGlobal = {
    Map: new WeakMap<any[], Set<For>>(),
    add (list: any[], forItem: For) {
        list = list[OriginTarget] || list;

        // ForGlobal.Map.set(list, forItem);
        let set = ForGlobal.Map.get(list);
        if (!set) {
            set = new Set();
            ForGlobal.Map.set(list, set);
        }
        set.add(forItem);
    },
};

setArrayListeners({
    deleteIndex (target: any[], index: number) {
        ForGlobal.Map.get(target)?.forEach(item => item._deleteItem(index));
    },
    newItem (target: any[], index: number, data: any) {
        ForGlobal.Map.get(target)?.forEach(item => item._newItem(index, data));
        // ForGlobal.Map.get(target)?._newItem(index, data);
    },
    clearEmpty (target: any[], length: number) {
        // ForGlobal.Map.get(target)?._clearEmptyChildren(length);
        ForGlobal.Map.get(target)?.forEach(item => item._clearEmptyChildren(length));
    },
    updateItem (target: any[], index: number, data: any) {
        ForGlobal.Map.get(target)?.forEach(item => item._updateItem(index, data));
    }
});

export class For <T=any> {

    __ld_type = LinkDomType.For;

    el: DocumentFragment;

    frag: Frag;

    private children: ForChild[] = [];

    private _list: T[];
    private _generator: (item: Ref<T>, index: number)=>IChild;

    end: Node;

    _isDeep = false;

    private _clearWatch: ()=>void;

    constructor (
        _list: Ref<T[]>|T[],
        _generator: (item: Ref<T>|T, index: number)=>IChild,
        private itemRef = false,
    ) {
        if (isRef(_list)) {
            this._list = _list.value;
            ForGlobal.add(this._list, this);
            this._clearWatch = watch(_list, (v) => {
                this._list = v;
                // console.log('set list');
                this.resetList();
            });
        } else {
            this._list = _list;
            ForGlobal.add(this._list, this);
        }
        this._isDeep = isDeepReactive(this._list);
        this._generator = _generator;
        this._initChildren();

        checkHydrateMarker(this);
        // window._for = this;
    }

    private resetList () {
        if (this.children.length > 0) {
            removeBetween(this.children[0].marker.start, this.end);
        }
        const parent = this.end.parentNode!;
        this.frag = this._initListFrag();
        parent.insertBefore(this.frag.el, this.end);
    }

    private newChild (data: T, index: number) {
        const child = new ForChild(
            this._generator,
            this._isDeep,
            // this._list,
            data,
            index,
            this.itemRef,
        );
        this.children[index] = child;
        return child;
    }
    _updateItem (index: number, data: T) {
        // console.log('updateItem', index, this._list.length, data);
        if (index >= this._list.length) {
            this.insertChildNode(data, index, this.end);
            return;
        }
        this.children[index].data.value = data;
    }
    _newItem (index: number, data: T) {
        // console.trace('newItem', index, this._list.length, data);
        const cc = this.children, n = cc.length;
        let marker = this.end, markerIndex = index;
        while (index < n && !cc[markerIndex]) {
            markerIndex ++;
        }
        marker = cc[markerIndex]?.marker.start || this.end;
        this.insertChildNode(data, index, marker);
    }

    private insertChildNode (data: T, index: number, marker: Node) {
        // console.time();
        // const frag = new Frag();
        const child = this.newChild(data, index);
        DepUtil.CurForChild = child;
        // console.log('insertChildNode', index, data);
        // frag.append(child.frag);
        const parent = marker.parentNode!;
        parent.insertBefore(child.frag.el, marker);
        // console.log('insertChildNode end', index, data);
        DepUtil.CurForChild = null;
        // console.timeEnd();
    }

    get __mounted () {
        return this.frag.__mounted;
    }

    mounted (v: (el: Frag)=>void) {
        this.frag.mounted(v);
        return this;
    }
    private _initChildren () {
        this.frag = this._initListFrag();
        // 后面加一个结尾
        this.end = createMarkerNode('for-end');
        this.frag.append(this.end);
        this.el = this.frag.el;
    }

    private _initListFrag () {
        const frag = new Frag();
        const list = this._list;
        const size = list.length;
        for (let i = 0; i < size; i++) {
            frag.append(this.newChild(list[i], i).frag);
        }
        return frag;
    }

    _deleteItem (index: number) {
        const child = this.children[index];
        child?.destroy();
    }

    _clearEmptyChildren (length: number) {
        if (length >= this.children.length) return;
        this.children.splice(length).forEach(child => {
            child.destroy();
        });
    }

    destroy () {
        this._clearWatch?.();
        if (this.children.length > 0) {
            removeBetween(this.children[0].marker.start, this.end);
        }
        // @ts-ignore
        this.end.remove();
    }
}


