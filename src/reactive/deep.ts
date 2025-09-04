

/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-01 21:28:27
 * @Description: Coding something
 */
import {isArrayOrJson} from '../utils';

const DepUtil = {
    Global: new WeakMap() as WeakMap<any, Map<string|symbol, Dep>>,
    Temp: new Set() as Set<Dep>,
    inCollecting: false,
    add (target: any, key: string|symbol) {
        let dep: Dep;
        let depsMap = this.Global.get(target);
        if (!depsMap) {
            depsMap = new Map();
            this.Global.set(target, depsMap);
        }
        dep = depsMap.get(key)!;
        if (!dep) {
            dep = new Dep();
            depsMap.set(key, dep);
        }
        this.Temp.add(dep);
        return dep;
    },
    trigger (target: any, key: string|symbol) {
        const depsMap = this.Global.get(target);
        if (!depsMap) return;
        const dep = depsMap.get(key);
        if (!dep) return;
        dep.trigger();
    }
};

export function observe (exp: ()=>any, fn: (newValue: any, oldValue: any)=>void) {
    if (typeof exp !== 'function') return;
    DepUtil.inCollecting = true;
    const value = exp();
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

interface DepItem {
    fn: (newValue: any, oldValue: any)=>void,
    value: any
}

class Dep {
    list: Map<()=>any, DepItem> = new Map();
    collect (exp: ()=>any, item: DepItem) {
        this.list.set(exp, item);
    }
    trigger () {
        for (const [exp, item] of this.list) {
            const {fn, value} = item;
            const newValue = exp();
            if (newValue !== value) {
                fn(newValue, value);
            }
            item.value = newValue;
        }
    }
    remove (exp: ()=>any) {
        this.list.delete(exp);
    }
}

export function deepRef (data: any) {
    return new Proxy(data, {
        get (target, key) {
            const value = target[key];
            if (DepUtil.inCollecting) {
                DepUtil.add(target, key);
            }
            if (isArrayOrJson(value)) {
                return deepRef(value);
            }
            return Reflect.get(target, key, target);
        },
        set (target, key, value, receiver) {
            const result = Reflect.set(target, key, value, receiver);
            DepUtil.trigger(target, key);
            return result;
        },
        deleteProperty (target, key) {
            const result = Reflect.deleteProperty(target, key);
            DepUtil.trigger(target, key);
            return result;
        },
    });
}