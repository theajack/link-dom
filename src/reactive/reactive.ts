

/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-01 21:28:27
 * @Description: Coding something
 */
// import {ForGlobal} from '../controller/for';
import {ForGlobal} from '../controller/for';
import {isArrayOrJson} from '../utils';
import {DepUtil} from './dep';
import {OriginTarget, ProxyTarget, deepAssign, deepClone, raw} from './utils';

export function observe (
    exp: ()=>any,
    fn: (newValue: any, oldValue: any)=>void,
    onvalue?: (value: any)=>void
) {
    if (typeof exp !== 'function') return () => {};
    // console.log('debug observe', fn);
    DepUtil.inCollecting = true;
    const value = exp();
    onvalue?.(value);
    DepUtil.inCollecting = false;
    let deps = Array.from(DepUtil.Temp);
    DepUtil.Temp.clear();
    for (const dep of deps) {
        dep.collect(exp, {fn, value});
    }
    return () => {
        for (const dep of deps) {
            dep.remove(exp);
        }
        // @ts-ignore
        deps = null; exp = null;
    };
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

export function reactive<T extends object = any> (data: T): T {
    if (data[OriginTarget]) return data;
    if (data[ProxyTarget]) return data[ProxyTarget];
    if (!isArrayOrJson(data)) return data;
    const proxy = new Proxy(data, {
        get (target, key) {
            if (key === OriginTarget) return target;
            if (key === ProxyTarget || key === 'constructor') return target[key];
            const value = target[key];
            DepUtil.add(target, key);
            if (Array.isArray(target)) {
                if (key === 'reverse') {
                    return arrayReverse.bind(target);
                } else if (key === 'sort') {
                    return arraySort.bind(target);
                }
            }
            if (isArrayOrJson(value) && !value[ProxyTarget]) {
                target[key] = reactive(value);
            }
            return Reflect.get(target, key, target);
        },
        set (target, key, value, receiver) {
            // console.log('Proxy Set', target, key, value);
            const origin = target[key];
            const isArrayLength = Array.isArray(target) && key === 'length';
            if (isArrayLength) {
                DepUtil.trigger(target, key);
                ForGlobal.clearEmpty(target, value);
            }
            if (value === origin) return true;
            const isArrayIndex = isArrayItem(target, key);
            if (isArrayIndex && typeof origin === 'undefined') {
                value = reactive(deepClone(value));
                (ForGlobal.newItem(target, parseInt(key as string), value));
            } else if (isArrayOrJson(origin) && isArrayOrJson(value)) {
                deepAssign(origin, value);
                DepUtil.trigger(target, key);
                return true;
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
                ForGlobal.deleteIndex(target, i);
            }
            const result = Reflect.deleteProperty(target, key);
            DepUtil.trigger(target, key);
            return result;
        },
    });
    data[ProxyTarget] = proxy;
    return proxy;
}

function isArrayItem (target: any, key: string|symbol): target is any[] {
    return (Array.isArray(target) && (typeof key === 'string') && parseInt(key).toString() === key);
}
