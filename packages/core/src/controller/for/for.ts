
/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-01 17:55:18
 * @Description: Coding something
 */
import type  { IChild } from '../../element';
import { Frag } from '../../text';
import { LinkDomType } from '../../utils';
import { createMarkerNode, removeBetween } from '../_marker';
import { checkHydrateMarker, getTarget, SharedStatus } from 'link-dom-shared';
import type { Ref } from 'link-dom-reactive';
import { isRef, DepUtil, isDeepReactive } from 'link-dom-reactive';
import { ForChild } from './for-child';
import { ForGlobal } from './for-util';
import { type LifeScope } from '../../lifes';

// window._fl = [];
export class ForClass <T=any> {

    __ld_type = LinkDomType.For;
    __ld_scope: LifeScope;

    private _el: DocumentFragment;

    frag: Frag;

    private children: ForChild[] = [];

    private _list: T[];
    _generator: (item: Ref<T>, index: {readonly value: number})=>IChild;

    end: Node;

    start: Node;

    getMarker () {
        return this.start;
    }

    _isDeep = false;

    private _clearWatch: ()=>void;

    get el () {
        this._initChildren();
        return this._el;
    }
    constructor (
        _list: Ref<T[]>|T[],
        _generator: (item: Ref<T>|T, index: {readonly value: number})=>IChild,
        public _itemRef = false,
    ) {
        // window._for = this;
        this._list = (isRef(_list)) ? _list.value : _list;
        // console.log('init for');

        if (!SharedStatus.isSSR) {
            ForGlobal.add(this._list, this);
        }
        this._isDeep = isDeepReactive(this._list);
        this._generator = _generator;
        // this._initChildren();
        // window._fl.push(this);
    }

    // private resetList () {
    //     if (this.children.length > 0) {
    //         removeBetween(this.children[0].marker.start, this.end);
    //     }
    //     const parent = this.end.parentNode!;
    //     this.frag = this._initListFrag();
    //     parent.insertBefore(this.frag.el, this.end);
    // }

    private _useIndex = false;
    _$useIndex = () => {
        this._useIndex = true;
        // @ts-ignore
        this._$useIndex = null;
    };

    private newChild (data: T, index: number) {
        const child = new ForChild(this, data, index);

        // 处理简单值类型 ref set和原始数据同步
        if (this._itemRef && this._isDeep && typeof data !== 'object') {
            DepUtil.sub(child.data, 'value', (newValue) => {
                const index = child.index.value;
                const target = this._list[SharedStatus.OriginTarget];
                target[index] = newValue;
                DepUtil.trigger(target, `${index}`);
            });
        }

        this.children[index] = child;
        return child;
    }
    _updateItem (index: number, data: T) {
        // console.log('updateItem', index, this._list.length, data);
        if (index >= this._list.length) {
            // console.log('insertChildNode1', index, this._list.length, data);
            this.insertChildNode(data, index, this.end);
            return;
        }
        // debugger;
        this.children[index].data.value = data;
    }
    _newItem (index: number, data: T) {
        // console.log('newItem', index, this._list.length, data);
        const cc = this.children, n = cc.length;
        let marker = this.end, markerIndex = index;
        while (markerIndex < n && !cc[markerIndex]) {
            markerIndex ++;
        }
        marker = cc[markerIndex]?.marker.start || this.end;
        // console.log('insertChildNode2', index, this._list.length, data);
        this.insertChildNode(data, index, marker);
    }

    private insertChildNode (data: T, index: number, marker: Node) {
        // console.time();
        // const frag = new Frag();
        const child = this.newChild(data, index);
        // console.log('insertChildNode', index, data);
        // frag.append(child.frag);
        const parent = marker.parentNode!;
        // @ts-ignore
        child.frag.__mounted?.();
        parent.insertBefore(child.frag.el, marker);
        // console.log('insertChildNode end', index, data);
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
        if (this._el) return;
        this.start = createMarkerNode('f-s');
        // 后面加一个结尾
        this.end = createMarkerNode('f-e');
        const frag = new Frag();
        frag.append(this.start);
        const list = this._list;
        const size = list.length;
        for (let i = 0; i < size; i++) {
            const child = this.newChild(list[i], i);
            frag.append(child.frag);
        }
        frag.append(this.end);

        this.frag = frag;
        checkHydrateMarker(this);
        // this.frag.append(this.start, this.end);
        this._el = this.frag.el;
    }

    _deleteItem (i: number) {
        // console.log('delete item', index);
        const child = this.children[i];
        if (child) {
            this._removeChildScope(child, i);
            this.__ld_scope?.children.splice(i, 1);
        }
    }

    _removeDoms (start: number, count: number) {
        for (let i = start; i < start + count; i++) {
            const child = this.children[i];
            if (child) {
                this._removeChildScope(child, start + i);
            }
        }
        this.children.splice(start, count);
        this.__ld_scope?.children.splice(start, count);
        this._updateIndex(start + count - 1);
    }
    _addDoms (start: number, count: number) {
        for (let i = start; i < start + count; i++) {
            this.children.splice(i, 0, null as any);
            this._newItem(i, this._list[i]);
        }
        this._updateIndex(start + count);
    }
    _swapDom (i: number, j: number) {
        const ci = this.children[i];
        const cj = this.children[j];

        let iMarker = this.children[i + 1].marker.start;
        const parent = iMarker.parentElement!;
        if (j === i + 1) {
            iMarker = ci.marker.start;
        } else {
            ci.marker.clear().forEach(node => {
                parent.insertBefore(node, cj.marker.start);
            });
        }
        cj.marker.clear().forEach(node => {
            parent.insertBefore(node, iMarker);
        });
        if (this._useIndex) {
            ci.setIndex(j);
            cj.setIndex(i);
        }
        this.children[i] = cj;
        this.children[j] = ci;
    }

    private _updateIndex (start: number) {
        if (!this._useIndex) return;
        // console.log('updateIndex', start);
        const n = this.children.length;
        for (let i = start; i < n; i++) {
            this.children[i].setIndex(i);
        }
    }

    _clearEmptyChildren (length: number) {
        if (length >= this.children.length) return;
        const start = length;
        this.children.splice(length).forEach((child, i) => {
            this._removeChildScope(child, start + i);
        });
        this.__ld_scope?.children.splice(length);
    }

    private _removeChildScope (child: ForChild, i: number) {
        const scope = this.__ld_scope?.children[i];
        scope?.beforeUnmount();
        if (child.destroy()) {
            scope?.unmounted();
        }
        DepUtil.clearDep(getTarget(this._list), (i).toString());
    }

    destroy () {
        this._clearWatch?.();
        if (this.children.length > 0) {
            removeBetween(this.children[0].marker.start, this.end);
            this.children.forEach((child, i) => {
                this._removeChildScope(child, i);
            });
            this.children = [];
            this.__ld_scope.children = [];
        }
        // @ts-ignore
        this.end.remove();
    }
}


