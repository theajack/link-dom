

/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-01 21:28:27
 * @Description: Coding something
 */
import { isArrayOrJson, SharedStatus, deepAssign } from 'link-dom-shared';
import type { Dep } from './dep';
import { DepUtil } from './dep';

export function observe (
    exp: ()=>any,
    fn: (newValue: any, oldValue: any)=>void,
    onvalue?: (value: any)=>void,
) {
    if (typeof exp !== 'function') return () => {};
    // console.log('debug observe', fn);
    DepUtil.inCollecting = true;
    // debugger;
    const value = exp();
    onvalue?.(value);
    DepUtil.inCollecting = false;

    if (DepUtil.Temp.size > 0) {
        let cache: Dep[] = [];
        DepUtil.Temp.forEach(dep => {
            dep.collect(exp, fn, value, cache);
            cache.push(dep);
        });
        DepUtil.Temp.clear();
        return () => {
            cache.forEach(dep => dep.remove(exp));
            // @ts-ignore
            cache = null;
        };
    }
    DepUtil.Temp.clear();
    return () => {};
}

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    useArrayMethod (target: any[], key: string|symbol) {return null as any;},
};

export function setArrayListeners (lns: typeof listener) {
    Object.assign(listener, lns);
}
export function reactive<T extends object = any> (data: T): T {
    if (data[SharedStatus.OriginTarget]) return data;
    if (data[SharedStatus.ProxyTarget]) return data[SharedStatus.ProxyTarget];
    if (!isArrayOrJson(data)) return data;
    const proxy = new Proxy(data, {
        get (target, key) {
            if (key === SharedStatus.OriginTarget) return target;
            if (key === SharedStatus.ProxyTarget || key === 'constructor') return target[key];
            if (Array.isArray(target)) {
                const result = listener.useArrayMethod(target, key);
                if (result) {
                    return result;
                }
            }
            const value = target[key];
            if (typeof value === 'function') return target[key];
            DepUtil.add(target, key);
            if (isArrayOrJson(value) && !value[SharedStatus.ProxyTarget]) {
                // 标记root 后续可以在 for 循环中用户判断是否是内部ref
                target[key] = reactive(value);
            }
            return Reflect.get(target, key, target);
        },
        set (target, key, value, receiver) {
            // console.log('Proxy Set', target, key, value);
            const origin = target[key];
            if (value === origin) return true;
            const isArrayLength = Array.isArray(target) && key === 'length';
            if (isArrayLength) {
                if (origin !== value) {
                    DepUtil.trigger(target, key);
                    listener.clearEmpty(target, value);
                }
                return Reflect.set(target, key, value, receiver);
            }
            const isArrayIndex = isArrayItem(target, key);
            if (isArrayIndex && typeof origin === 'undefined') {
                // value = reactive(deepClone(value));
                value = reactive(value);
                (listener.newItem(target, parseInt(key as string), value));
            } else if (isArrayOrJson(origin) && isArrayOrJson(value)) {
                if (listener.isForArray(origin[SharedStatus.OriginTarget])) {
                    // ! 在for场景中进行了优化 使用splice更高效
                    origin[SharedStatus.ProxyTarget].splice(0, origin.length, ...value);
                } else {
                    deepAssign(origin, value);
                }
                DepUtil.trigger(target, key);
                return true;
            } else {
                (listener.updateItem(target, parseInt(key as string), value));
            }
            const result = Reflect.set(target, key, value, receiver);
            DepUtil.trigger(target, key);
            return result;
        },
        deleteProperty (target, key) {
            // console.log('Proxy Delete', target, key);
            if (!(key in target)) true;
            if (isArrayItem(target, key)) {
                const i = parseInt(key as string);
                listener.deleteIndex(target, i);
            }
            const result = Reflect.deleteProperty(target, key);
            DepUtil.trigger(target, key);
            return result;
        },
    });
    data[SharedStatus.ProxyTarget] = proxy;
    return proxy;
}

function isArrayItem (target: any, key: string|symbol): target is any[] {
    return (Array.isArray(target) && (typeof key === 'string') && parseInt(key).toString() === key);
}


export function isDeepReactive (v: any) {
    return !!(v?.[SharedStatus.OriginTarget]);
}