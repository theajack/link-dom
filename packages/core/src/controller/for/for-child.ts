
/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-11 20:56:49
 * @Description: Coding something
 */
import { LifeScopeType, onEnterScope, onExitScope, setCurrentScope } from '../../element/lifes';
import type { Frag } from '../../element/text';
import { frag } from '../../element/text';
import { filterElement, TransStatus } from '../../utils';
import { Marker } from '../marker';
import { DepUtil, ref, type Ref } from 'link-dom-reactive';
import { KEY_SCOPE, SharedStatus } from 'link-dom-shared';
import type { ForClass } from './for';

// window.list = [];
export class ForChild<T=any> {

    private _marker: Marker;
    removed = false;

    private _frag: Frag;

    originEl: any;

    transitionEl = null as any;

    get frag () {
        if (!this._frag) {
            setCurrentScope(this.parent[KEY_SCOPE]);
            onEnterScope(LifeScopeType.ForChild, this, this.index.value);
            const el = this.parent._generator(this.data as any, this.index);
            this.transitionEl = el; // ! 透传父for的switchDomsFns
            this._frag = frag(this.marker.wrapContent(el));
            onExitScope();
        }
        return this._frag;
    }

    get marker () {
        if (!this._marker) {
            this._marker = new Marker();
            if (SharedStatus.isHydrating) {
                // @ts-ignore
                this._marker.start.__for_child = this; // ! 标记需要替换marker
            }
        }
        return this._marker;
    }

    destroy () {
        if (this.removed) return false;
        console.log('for child clear');
        if (this.parent.transition) {
            const list = this.marker.pick(false);
            this.parent.transition.triggerDone(filterElement(list), TransStatus.LeaveFrom).then(() => {
                list.forEach(el => el.remove());
            });
        } else {
            this.marker.clear(true);
        }
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