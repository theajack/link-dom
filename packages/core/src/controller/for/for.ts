
/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-01 17:55:18
 * @Description: Coding something
 */
import type  { IChild } from '../../element/element';
import { Frag, frag } from '../../element/text';
import { LinkDomType, TransStatus } from '../../utils';
import { createMarkerNode, removeBetween } from '../marker';
import { checkHydrateMarker, getTarget, KEY_LD_TYPE, KEY_SCOPE, SharedStatus } from 'link-dom-shared';
import type { Ref } from 'link-dom-reactive';
import { isReactive, DepUtil, isDeepReactive } from 'link-dom-reactive';
import { ForChild } from './for-child';
import { ForGlobal } from './for-util';
import { type LifeScope } from '../../element/lifes';
import type { ITransCall } from '../../components/trans-base';
import { TransitionProxy } from '../../components/trans-base';
import type { ITransScope } from '../../components';

// window._fl = [];
export class ForClass <T=any> {

    [KEY_LD_TYPE] = LinkDomType.For;
    [KEY_SCOPE]: LifeScope;

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
        this._list = (isReactive(_list)) ? _list.value : _list;
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

    private async insertChildNode (data: T, index: number, marker: Node) {
        // console.time();
        // const frag = new Frag();
        const child = this.newChild(data, index);
        // console.log('insertChildNode', index, data);
        // frag.append(child.frag);
        const parent = marker.parentNode!;
        // @ts-ignore
        child.frag.__mounted?.();

        // ! for 下面直接是if等元素 需要使用一个frga包裹一下
        const el = frag(child.frag).el;
        let doms: any[];
        if (this.transition) {
            doms = Array.from(el.children);
            await this.transition.trigger(doms, TransStatus.EnterFrom);
        }
        parent.insertBefore(el, marker);
        if (this.transition) {
            await this.transition.triggerDone(doms!, TransStatus.EnterActive);
        }

        // const el = child.frag.el;
        // debugger;

        // const list = isDomFrag(el) ? Array.from(el.children) : [ el ];
        // this._triggerSwitch(list, []);

        // parent.insertBefore(el, marker);
        // console.log('insertChildNode end', index, data);
        // console.timeEnd();
    }

    get __mounted () {
        return this.frag.__mounted.bind(this.frag);
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
        console.log('init child', list.length);
        for (let i = 0; i < size; i++) {
            const child = this.newChild(list[i], i);
            // const el = child.frag.el;
            // const nodes = isDomFrag(el) ? Array.from(el.children) : [ el ];
            frag.append(child.frag);
        }
        frag.append(this.end);

        this.frag = frag;
        checkHydrateMarker(this);
        // this.frag.append(this.start, this.end);
        this._el = this.frag.el;
    }

    async _deleteItem (i: number) {
        // console.log('delete item', index);
        const child = this.children[i];
        if (child) {
            this._removeChildScope(child, i);
            this[KEY_SCOPE]?.children.splice(i, 1);
        }
    }

    _removeDoms (start: number, count: number) {
        for (let i = start; i < start + count; i++) {
            console.log('remove doms1', i, start, count);
            const child = this.children[i];
            if (child) {
                this._removeChildScope(child, start + i);
            }
        }
        console.log('remove doms2', start, count);
        this.children.splice(start, count);
        this[KEY_SCOPE]?.children.splice(start, count);
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
            ci.marker.clear(true).forEach(node => {
                parent.insertBefore(node, cj.marker.start);
            });
        }
        cj.marker.clear(true).forEach(node => {
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
        // const list = this.children.splice(length);
        this.children.splice(length).forEach((child, i) => {
            this._removeChildScope(child, start + i);
        });
        this[KEY_SCOPE]?.children.splice(length);
    }

    private _removeChildScope (child: ForChild, i: number) {
        const scope = this[KEY_SCOPE]?.children[i];
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
            this[KEY_SCOPE].children = [];
        }
        // @ts-ignore
        this.end.remove();
    }

    transition: TransitionProxy;

    onSwitchDoms (fn: ITransCall, trans: ITransScope, showAppear = false) {
        if (!this.transition) { this.transition = new TransitionProxy(trans); }
        console.log('for onSwitchDoms', this.transition);
        this.transition.onSwitchDoms(fn);
        this.children.forEach(async child => {
            if (showAppear) {
                const doms = child.marker.pick(true, true);
                await this.transition.appear(doms);
            }
            child.transitionEl?.onSwitchDoms?.(fn);
        });
    }
}


