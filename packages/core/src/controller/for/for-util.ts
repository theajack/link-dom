/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-12 11:05:56
 * @Description: Coding something
 */

import { DepUtil, reactive, setArrayListeners } from 'link-dom-reactive';
import { OriginTarget, ProxyTarget, deepAssign, isArrayOrJson, raw } from 'link-dom-shared';
import type { For } from './for';

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
    },
    isForArray (target: any[]) {
        return ForGlobal.Map.has(target);
    },
    useArrayMethod (target: any[], key: string|symbol) {
        return FnMap[key]?.bind(target) || null;
    }
});

function triggerSub (arr: any[], key: string|symbol) {
    DepUtil.trigger(arr, key);
    const value = arr[key];
    if (isArrayOrJson(value)) {
        for (const k in value) {
            triggerSub(value, k);
        }
    }
}

const FnMap = {
    reverse (this: any[]) {
        const arr = this;
        // const proxy = this[ProxyTarget] || this;
        // debugger;
        const len = arr.length;
        const n = Math.floor(arr.length / 2);
        const fors = ForGlobal.Map.get(this);
        for (let i = 0; i < n; i++) {
            const j = len - i - 1;
            const temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
            triggerSub(arr, i.toString());
            triggerSub(arr, j.toString());
            fors?.forEach(item => item._swapDom(i, j));
        }
        return this[ProxyTarget] || this;
    },
    sort (this: any[], compare?: ((a: any, b: any)=>number)|undefined) {
        const arr = this[OriginTarget] || this;
        const proxy = this[ProxyTarget] || this;
        let origin: Map<any, any> = new Map();
        let proxy2 = new Proxy(arr, {
            set (target, key, value) {
            // 将 index = key 的值设置为value
                const ov = target[key];
                if (ov === value) return true;
                origin.set(ov, raw(ov)); // ! 保存原始值
                const setValue = origin.get(value) || value;
                proxy[key] = setValue;
                return true;
            },
        });
        proxy2.sort(compare);
        // @ts-ignore
        origin = proxy2 = null; // ! 立即回收
        return proxy;
    },
    splice (this: any[], start: number, ...items: any[]) {
        const count = items.length;
        let removeCount = 0;
        let addCount = 0;
        if (count === 0) {
            // 从start开始全部删完
            removeCount = this.length - start;
        } else {
            removeCount = items.shift();
            addCount = count - 1;
        }
        if (typeof removeCount === 'number') {
            const min = Math.min(removeCount, addCount);
            for (let i = 0; i < min; i++) {
                deepAssign(this[i + start], items.shift());
            }
            if (removeCount !== addCount) {
                const fors = ForGlobal.Map.get(this);
                start += min;
                if (removeCount > addCount) {
                    removeCount -= addCount;
                    this.splice(start, removeCount);
                    fors?.forEach(item => item._removeDoms(start, removeCount));
                // 从for里面删除
                } else {
                    this.splice(start, 0, ...items.map(item => reactive(item)));
                    fors?.forEach(item => item._addDoms(start, items.length));
                }
            }
        }
        // @ts-ignore
        return this[ProxyTarget] || this;
    },
    unshift (this: any[], ...items: any[]) {
        const fors = ForGlobal.Map.get(this);
        this.splice(0, 0, ...items.map(item => reactive(item)));
        fors?.forEach(item => item._addDoms(0, items.length));
        // @ts-ignore
        return this[ProxyTarget] || this;
    },
    shift (this: any[]) {
        const fors = ForGlobal.Map.get(this);
        const item = this.splice(0, 1);
        fors?.forEach(item => item._removeDoms(0, 1));
        return item[0];
    }
};
