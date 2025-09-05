
/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-01 17:55:18
 * @Description: Coding something
 */
import {isRef, ref, type Ref} from '../reactive/ref';
import type {IChild} from '../element';
import {Frag} from '../text';
import {isArrayOrJson, LinkDomType} from '../utils';
import {Marker, createMarkerNode, removeBetween} from './_marker';
import {watch} from '../reactive/computed';
import {OriginTarget, deepAssign} from '../reactive/utils';

class ForChild<T=any> {
    private _marker: Marker;
    index: Ref<number>;
    // removed = false;

    private _frag: Frag;

    get frag () {
        if (!this._frag) {
            this._frag = new Frag().append(this._generator(this.data, this.index));
            this.marker;
        }
        return this._frag;
    }

    get marker () {
        if (!this._marker) {
            const first = this.frag.el.firstChild;
            this._marker = new Marker({start: first, clearSelf: true});
            if (!first) {
                this.frag.prepend(this._marker.start);
            }
        }
        return this._marker;
    }

    constructor (
        private _generator: (item: T, index: Ref<number>)=>IChild,
        // private list: T[],
        private data: T,
        index: number
    ) {
        this.index = ref(index);
    }
}

export const ForGlobal = {
    Map: new WeakMap<any[], Set<For>>(),
    add (list: any[], forItem: For) {
        list = list[OriginTarget] || list;
        let set = ForGlobal.Map.get(list);
        if (!set) {
            set = new Set();
            ForGlobal.Map.set(list, set);
        }
        set.add(forItem);
    },
    deleteIndex (target: any[], index: number) {
        ForGlobal.Map.get(target)?.forEach(item => item._deleteItem(index));
    },
    newItem (target: any[], index: number, data: any) {
        ForGlobal.Map.get(target)?.forEach(item => item._newItem(index, data));
    },
    clearEmpty (target: any[], length: number) {
        ForGlobal.Map.get(target)?.forEach(item => item._clearEmptyChildren(length));
    }
};

export class For <T=any> {

    __ld_type = LinkDomType.For;

    el: DocumentFragment;

    frag: Frag;

    private children: ForChild[] = [];
    
    private _list: T[];
    private _isDeep = false;
    private _generator: (item: T, index: Ref<number>)=>IChild;

    private endMarker: Node;

    private _clearWatch: ()=>void;

    constructor (
        _list: Ref<T[]>|T[],
        _generator: (item: T, index: Ref<number>)=>IChild,
    ) {
        if (isRef(_list)) {
            this._list = _list.value;
            ForGlobal.add(this._list, this);
            this._isDeep = _list._deep;
            if (!this._isDeep) {
                this._clearWatch = watch(_list, (v) => {
                    this._list = v;
                    console.log('set list');
                    this.resetList();
                });
            }
        } else {
            this._list = _list;
        }
        this._generator = _generator;
        this._initChildren();
    }

    private resetList () {
        if (this.children.length > 0) {
            removeBetween(this.children[0].marker.start, this.endMarker);
        }
        const parent = this.endMarker.parentNode!;
        this.frag = this._initListFrag();
        parent.insertBefore(this.frag.el, this.endMarker);
    }

    private newChild (data: T, index: number) {
        const child = new ForChild(
            this._generator,
            // this._list,
            data,
            index
        );
        this.children[index] = child;
        return child;
    }
    _updateItem (index: number, data: T) {
        console.log('updateItem', index, this._list.length, data);
        if (index >= this._list.length) {
            const frag = new Frag();
            frag.append(this.newChild(data, index).frag);
            const parent = this.endMarker.parentNode!;
            parent.insertBefore(frag.el, this.endMarker);
            return;
        }

        const isNewObj = isArrayOrJson(data);
        const oldObj = isArrayOrJson(this._list[index]);
        if (isNewObj && oldObj) {
            deepAssign(this._list[index], data);
        }
    }
    _newItem (index: number, data: T) {
        const frag = new Frag();
        const cc = this.children, n = cc.length;
        let marker = this.endMarker, markerIndex = index;
        while (index < n && !cc[markerIndex]) {
            markerIndex ++;
        }
        marker = cc[markerIndex]?.marker.start || this.endMarker;
        frag.append(this.newChild(data, index).frag);
        const parent = marker.parentNode!;
        parent.insertBefore(frag.el, marker);
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
        this.endMarker = createMarkerNode('for-end');
        this.frag.append(this.endMarker);
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
        if (child) {
            child.marker.clear();
        }
    }

    _clearEmptyChildren (length: number) {
        if (length >= this.children.length) return;
        this.children.splice(length).forEach(child => {
            child.marker.clear();
        });
    }

    destroy () {
        this._clearWatch?.();
        if (this.children.length > 0) {
            removeBetween(this.children[0].marker.start, this.endMarker);
        }
        // @ts-ignore
        this.endMarker.remove();
    }
}


