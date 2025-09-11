/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-11 23:58:18
 * @Description: Coding something
 */
import { OriginTarget, ProxyTarget, raw } from 'link-dom-shared';


export const listener = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    clearEmpty (target: any, length: number) {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    newItem (target: any, index: number, value: any) {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    deleteIndex (target: any, index: number) {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    updateItem (target: any, index: number, value: any) {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    isForArray (target: any[]) {return false;},
};

export function setArrayListeners (lns: typeof listener) {
    Object.assign(listener, lns);
}

function arrayReverse (this: any[]) {
    const arr = this[OriginTarget] || this;
    const proxy = this[ProxyTarget] || this;
    const len = arr.length;
    const n = Math.floor(arr.length / 2);
    for (let i = 0; i < n; i++) {
        const j = len - i - 1;
        const temp = raw(arr[i]);
        proxy[i] = arr[j];
        proxy[j] = temp;
    }
    return proxy;
}

function arraySort (this: any[], compare?: ((a: any, b: any)=>number)|undefined) {
    const arr = this[OriginTarget] || this;
    const proxy = this[ProxyTarget] || this;
    let origin: WeakMap<any, any> = new WeakMap();
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
}
// function arraySplice (this: any[], start: number, deleteCount?: number, ...items: any[]) {
//     debugger;
// }

export function useArrayMethod (key: string|symbol, target: any[]) {
    // if (!listener.isForArray(target)) return null;

    if (key === 'reverse') {
        return arrayReverse.bind(target);
    } else if (key === 'sort') {
        return arraySort.bind(target);
    // } else if (key === 'splice') {
    //     return arraySplice.bind(target);
    }
    return null;
}
