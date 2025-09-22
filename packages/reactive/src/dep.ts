/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-03 11:01:02
 * @Description: Coding something
 */

type IDepExe = (newValue: any, oldValue: any)=>void;
type IDepLis = ()=>void;

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
        // console.log(target, key);
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
    sub (target: any, key: string|symbol, exe: IDepExe) {
        const dep = this.add(target, key, true);
        const lis = () => target[key];
        dep!.collect(lis, exe, target[key]);
        return () => dep!.remove(lis);
    },
    trigger (target: any, key: string|symbol) {
        const dep = this.getDep(target, key);
        if (!dep) return;
        // debugger;
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
    // static WeakMap = new WeakMap<()=>any, Set<Dep>>();
    // list: WeakMap<any, DepItem> = new WeakMap();
    // ! 因为需要遍历订阅者列表 所以无法使用WeakMap
    // 所以需要手动在订阅者无效时 手动移除订阅者，不然会有内存泄露
    // 但是这也会增加性能开销和内存占用
    list: Map<IDepLis, [IDepExe, any]> = new Map();
    // collect (key: any, item: DepItem) {
    //     this.list.set(exp, item);
    // }
    collect (exp: IDepLis, exe: IDepExe, value: any) {
        // console.log('collect', item);
        // ! 此处为将for中的依赖收集起来 for移除后需要移除dep中的list 以释放内存
        // ? 此处若是for-child中有if逻辑 还是可能会存在内存泄露，如 if未命中的分支中含有外部ref，此时无法获取到 CurForChild
        // console.trace(exp.toString(), item.fn.toString());
        // debugger;
        DepUtil.CurForChild?.collect(this, exp);
        this.list.set(exp, [ exe, value ]);
    }
    trigger () {
        for (const [ lis, info ] of this.list) {
            const value = lis();
            // debugger;
            // 此处无需判断值是否相等，前置赋值时都已经判断过了
            // if (newValue !== value || typeof value === 'object') {
            info[0](value, info[1]);
            info[1] = value;
        }
    }
    remove (lis: IDepLis) {
        this.list.delete(lis);
    }
}