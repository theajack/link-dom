/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-03 11:01:02
 * @Description: Coding something
 */
interface DepItem {
    fn: (newValue: any, oldValue: any)=>void,
    value: any,
    // exp: ()=>any
}

export const DepUtil = {
    // {target: {key: dep}}
    Global: new WeakMap() as WeakMap<any, Map<string|symbol, Dep>>,
    Temp: new Set() as Set<Dep>,
    // CurEl: null as HTMLElement|null,
    inCollecting: false,
    _latest: {} as { target: any, key: string|symbol },
    setLatest (target: any, key: string|symbol = 'value') {
        // console.log(new Error().stack!);
        this._latest.target = target;
        this._latest.key = key;
    },
    getLatest () { return this._latest; },
    add (target: any, key: string|symbol, sub = false) {
        this.setLatest(target, key);
        if (!this.inCollecting && !sub) return null;
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
        if (!sub) this.Temp.add(dep);
        return dep;
    },
    getDep (target: any, key: string|symbol) {
        return this.Global.get(target)?.get(key);
    },
    sub (target: any, key: string|symbol, fn: (newValue: any, oldValue: any)=>void) {
        const dep = this.add(target, key, true);
        const exp = () => target[key];
        dep!.collect(exp, { fn, value: target[key] });
        return () => dep!.remove(exp);
    },
    trigger (target: any, key: string|symbol) {
        const dep = this.getDep(target, key);
        if (!dep) return;
        dep?.trigger();
    },
    clear (target: any) {
        this.Global.delete(target);
    },

    CurForChild: null as any,
};

// window.depu = DepUtil;

// window.deps = [];

export class Dep {
    // constructor () {
    //     window.deps.push(this);
    // }
    // list: WeakMap<any, DepItem> = new WeakMap();
    list: Map<()=>any, DepItem> = new Map();
    // collect (key: any, item: DepItem) {
    //     this.list.set(exp, item);
    // }
    collect (exp: ()=>any, item: DepItem) {
        // console.log('collect', item);
        DepUtil.CurForChild?.collect(this, exp);
        this.list.set(exp, item);
    }
    trigger () {
        for (const [ exp, item ] of this.list) {
            const { fn, value } = item;
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