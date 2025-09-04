
/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-01 17:55:18
 * @Description: Coding something
 */
import type {Ref} from '../reactive/ref';
import type {IChild} from '../element';
import {Frag} from '../text';
import {LinkDomType} from '../utils';
import {Marker, createMarkerNode} from './_marker';

export class For <T=any> {

    __ld_type = LinkDomType.For;

    el: DocumentFragment;

    frag: Frag;

    private markers: Marker[] = [];
    
    constructor (
        private _list: Ref<T[]>,
        private _generator: (item: T, index: number)=>IChild,
    ) {
        this._list.sub(() => {
            this._initChildren();
        });
        this._initChildren();
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
        const doms = this._list.value.map((item, index) => {
            return this._renderChild(item, index);
        });
        // 后面加一个结尾
        this.frag.append(doms, createMarkerNode('for-end'));
        this.el = this.frag.el;
    }

    private _renderChild (item: T, index: number) {
        const marker = new Marker(false);
        this.markers[index] = marker;
        return [
            marker.start,
            this._generator(item, index)
        ];
    }


    private __hackArray () {

    }

    private updateItem (index: number, data: T) {

        if (data === null) {
            // 删除
            return;
        }

        const old = this._list.value[index];

        if (!old) {
            // 新增

        } else if (old === data) {
            // 更新数据

        } else {
            // 替换数据

        }

    }

    private removeItem (start: number, count: number) {
        if (start >= this._list.value.length) return;

        const end = start + count;

        for (let i = 0; i < count; i ++) {

        }

    }
}


