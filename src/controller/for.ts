
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
import {deepAssign, reactive} from '../reactive/reactive';
import {OriginTarget} from '../reactive/utils';

class ForChild<T=any> {
    marker: Marker;
    index: Ref<number>;
    // removed = false;

    constructor (
        private _generator: (item: T, index: Ref<number>)=>IChild,
        // private list: T[],
        private data: T,
        index: number
    ) {
        this.index = ref(index);
        this.marker = new Marker(false);
    }

    toFrag () {
        return [this.marker.start, this._generator(this.data, this.index)];
    }
}

export class HangUp {
    list: (()=>void)[] = [];

    add (fn: ()=>void) {
        this.list.push(fn);
    }

    run (fn: ()=>void, cond: ()=>boolean) {
        if (cond()) {
            fn();
        } else {
            this.add(fn);
        }
    }
}

export const ForGlobal = {
    Map: new WeakMap<any[], For>(),

    add (list: any[], forItem: For) {
        ForGlobal.Map.set(list[OriginTarget], forItem);
    },

    setIndex (target: any[], index: number, data: any) {
        const forItem = ForGlobal.Map.get(target);
        forItem?._updateItem(index, data);
    },

    deleteIndex (target: any[], index: number) {
        const forItem = ForGlobal.Map.get(target);
        forItem?._deleteItem(index);
    },
    clearEmpty (target: any[], length: number) {
        const forItem = ForGlobal.Map.get(target);
        forItem?._clearEmptyChildren(length);
    }
};

export class For <T=any> {

    __ld_type = LinkDomType.For;

    el: DocumentFragment;

    frag: Frag;

    hangUp: HangUp;

    private children: ForChild[] = [];
    
    private _list: T[];
    private _isDeep = false;
    private _generator: (item: T, index: Ref<number>)=>IChild;

    private endMarker: Comment;

    constructor (
        _list: Ref<T[]>|T[],
        _generator: (item: T, index: Ref<number>)=>IChild,
    ) {
        window._for = this;
        this.hangUp = new HangUp();
        if (isRef(_list)) {
            this._list = _list.value;
            ForGlobal.add(this._list, this);
            this._isDeep = _list._deep;
            watch(_list, (v) => {
                console.log('set list');
                this._setList(v);
            });
        } else {
            this._list = _list;
        }
        this._generator = _generator;
        this._initChildren();
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

    // list.value = newList;
    private _setList (v: T[]) {
        if (this._isDeep) {
            v = reactive(v);
        }
        const newSize = v.length;
        const oldSize = this._list.length;
        const n = Math.min(oldSize, newSize);
        for (let i = 0; i < n; i ++) {
            this._updateItem(i, v[i]);
        }
        if (newSize > oldSize) {
            const frag = new Frag();
            // 新增
            for (let i = oldSize; i < newSize; i++) {
                frag.append(this.newChild(v[i], i).toFrag());
            }
            // todo 在元素可见时显示出来
            this.hangUp.run(() => {
                const parent = this.endMarker.parentElement!;
                parent.insertBefore(frag.el, this.endMarker);
            }, () => !!this.endMarker.parentElement);
        } else if (newSize < oldSize) {
            this.hangUp.run(() => {
                removeBetween(this.children[newSize].marker.start, this.endMarker);
            }, () => !!this.endMarker.parentElement);
            this.children.length = newSize;
        }
    }
    _updateItem (index: number, data: T) {
        console.log('updateItem', index, this._list.length, data);
        debugger;
        if (index >= this._list.length) {
            const frag = new Frag();
            frag.append(this.newChild(data, index).toFrag());
            this.hangUp.run(() => {
                const parent = this.endMarker.parentElement!;
                parent.insertBefore(frag.el, this.endMarker);
            }, () => !!this.endMarker.parentElement);
            return;
        }

        const isNewObj = isArrayOrJson(data);
        const oldObj = isArrayOrJson(this._list[index]);
        if (isNewObj && oldObj) {
            deepAssign(this._list[index], data);
        }
    }

    get __mounted () {
        return this.frag.__mounted;
    }

    mounted (v: (el: Frag)=>void) {
        this.frag.mounted(v);
        return this;
    }
    private _initChildren () {
        this.frag = new Frag();
        const list = this._list;
        const size = list.length;
        for (let i = 0; i < size; i++) {
            this.frag.append(this.newChild(list[i], i).toFrag());
        }
        // 后面加一个结尾
        this.endMarker = createMarkerNode('for-end');
        this.frag.append(this.endMarker);
        this.el = this.frag.el;
    }

    // private _renderChild (item: T, index: number) {
    //     const marker = new Marker(false);
    //     this.markers[index] = marker;
    //     return [
    //         marker.start,
    //         this._generator(item, index)
    //     ];
    // }


    private __hackArray () {

    }


    _removeItem (start: number, count: number) {
        if (start >= this.children.length) return;
        const list = this.children.splice(start, count);
        list.forEach(item => item.marker.clear());
    }

    _deleteItem (index: number) {
        const child = this.children[index];
        if (child) {
            child.marker.clear();
        }
    }

    _clearEmptyChildren (length: number) {
        this.children.splice(length);
    }
}


