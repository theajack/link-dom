
// defineComponent(fn).slots([ 'a', 'b' ]).props([ 'c', 'd' ]);

import type { Ref } from 'link-dom-reactive';
import { reader } from 'link-dom-reactive';
import type { IController } from './controller';
import type { Dom, IChild } from './element';
import { getReactiveValue as read, LinkDomType } from './utils';
import { mount, type IMountParent } from './mount';
// import { createLifeScope, LifeScopeType } from './lifes';

export type ISlot = Dom | HTMLElement | Dom | IController | (()=>ISlot);
export type ISlots<T extends string = string> = {
    [key in T]: ISlot;
}

export type IProp = any;
export type IProps<T extends string = string> = {
    [key in T]: IProp;
}

export type IEmit = (...args: any) => void;
export type IEmits<T extends string = string> = {
    [key in T]: IEmit;
}

export type IExpose = any;
export type IExposes<T extends string = string> = {
    [key in T]: IExpose;
}

export type ILifeKeys = 'beforeMount' | 'mounted';

export function componentRefs <E extends IComponentProxy = IComponentProxy, T extends string[] = string[]> (...list: T): {
    [k in T[number]]: E
} {
    const refs: any = {};
    list.forEach(name => {
        refs[name] = (ele: Dom) => { refs[name] = ele; };
    });
    return refs;
}

export type IComponentProxy<
    Props extends IProps = IProps,
    Emits extends IEmits = IEmits,
    Slots extends ISlots = ISlots,
    Exposes extends IExposes = IExposes,
    SlotKey extends keyof Slots = keyof Slots,
    PropKey extends keyof Props = keyof Props,
> = {
    (...slots: ISlot[]): IComponentProxy<Props, Emits, Slots, Exposes>;
    prop<K extends PropKey>(key: K, prop: Props[K]): IComponentProxy<Props, Emits, Slots, Exposes>;
    props(props: Props): IComponentProxy<Props, Emits, Slots, Exposes>;
    slots(slots: Slots): IComponentProxy<Props, Emits, Slots, Exposes>;
    slot: {
        <Key extends SlotKey>(slot: Slots[Key]): IComponentProxy<Props, Emits, Slots, Exposes>;
        <Key extends SlotKey>(key: Key, slot: Slots[Key]): IComponentProxy<Props, Emits, Slots, Exposes>;
    } & {
        [Key in SlotKey]: (slot: Slots[Key]) => IComponentProxy<Props, Emits, Slots, Exposes>;
    };
    getProp<K extends PropKey>(key: K): Props[K];
    getSlot<K extends SlotKey>(key: K): Slots[K];
    on: {
        <K extends keyof Emits>(key: K, fn: Emits[K]): IComponentProxy<Props, Emits, Slots, Exposes>;
    } & {
        [Key in keyof Emits]: (fn: Emits[Key]) => IComponentProxy<Props, Emits, Slots, Exposes>;
    },
    expose: Exposes,
    ref: (v: IComponentProxy|Ref) => IComponentProxy<Props, Emits, Slots, Exposes>;
    mount: (parent: IMountParent) => IComponentProxy<Props, Emits, Slots, Exposes>;
} & {
    [Key in PropKey]: (
        Props[Key] extends boolean ?
            ((prop?: Props[Key]) => IComponentProxy<Props, Emits, Slots, Exposes>):
            ((prop: Props[Key]) => IComponentProxy<Props, Emits, Slots, Exposes>)
    )
} & {
    [Key in ILifeKeys]: (fn: ()=>void) => IComponentProxy<Props, Emits, Slots, Exposes>
}

interface IComponentArgs<
    Props extends IProps = IProps,
    Emits extends IEmits = IEmits,
    Slots extends ISlots = ISlots,
    Exposes extends IExposes = IExposes,
> extends Record<ILifeKeys, (fn: ()=>void) => void> {
    // 组件内部使用的
    slots: Slots;
    props: Props;
    emit: {
        <K extends keyof Emits>(key: K, ...args: Parameters<Emits[K]>): void
    } & {
        [key in keyof Emits]: (...args: Parameters<Emits[key]>) => void
    }
    expose: Exposes,
    // onUnmounted: () => void,
    // onUpdated: () => void,
    // onBeforeMount: () => void,
    // onBeforeUnmount: () => void,
    // onBeforeUpdate: () => void,
}

export type IComponent<
    Props extends IProps = IProps,
    Emits extends IEmits = IEmits,
    Slots extends ISlots = ISlots,
    Exposes extends IExposes = IExposes,
> = (args: IComponentArgs<Props, Emits, Slots, Exposes>) => IChild;

// const FnKeys = new Set([ 'call', 'apply' ]); // 是否需要不代理这些key，代理会导致打包后可能导致错误
const FnKeys = new Set([ 'apply' ]); // 是否需要不代理这些key，代理会导致打包后可能导致错误
// ! 如 a.slot(...args) => a.slot.apply(a, args)

function createLifes () {
    const _mountedList: any[] = [];
    const mounted = (fn: any) => {
        _mountedList.push(fn);
    };

    const _beforeMountList: any[] = [];
    const beforeMount = (fn: any) => {
        _beforeMountList.push(fn);
    };

    return {
        lifes: { mounted, beforeMount },
        triggers: {
            __mounted () {
                _mountedList.forEach(fn => fn());
            },
            __beforeMount () {
                _beforeMountList.forEach(fn => fn());
            },
        }
    };
}

function createEmit (getp: () => any) {

    const events: Record<string, any[]> = {};
    // 组件内部调用的
    const onFn = function (key: any, fn: any) {
        if (!events[key]) events[key] = [];
        events[key].push(fn);
        return getp();
    };

    const emitFn = function (key: any, ...args: any[]) {
        if (events[key]?.length) {
            events[key].forEach((fn: any) => fn(...args));
        }
        return getp();
    };

    return {
        // utils 是挂载在组件proxy上的
        emitUtils: {
            on: new Proxy(onFn, {
                get (_, key) {
                    if (typeof key === 'symbol' || FnKeys.has(key as string)) {return onFn[key];}
                    return (fn: any) => onFn(key, fn);
                }
            }),
        },
        emit: new Proxy(emitFn, {
            get (_, key) {
                if (typeof key === 'symbol' || FnKeys.has(key as string)) {return onFn[key];}
                return (...args: any[]) => emitFn(key, ...args);
            }
        }),
    };
}

function createSlot (getp: () => any) {
    const slots: ISlots = {} as any;
    const slotFn = function (key: any, value: any) {
        if (arguments.length === 1) {
            value = key;
            key = 'default';
        }
        slots[key || 'default'] = value;
        console.log('slot', slots, key, value);
        return getp();
    };
    return {
        slotUtils: {
            getSlot: (key: string) => slots[key],
            slots: (v: ISlots) => {
                Object.assign(slots, v);
                return getp();
            },
            slot: new Proxy(slotFn, {
                get (_, key) {
                    if (typeof key === 'symbol' || FnKeys.has(key as string)) {
                        return slotFn[key];
                    }
                    return (value: any) => slotFn(key, value);
                }
            }),
        },
        slots,
    };
}

function createScope (flow = true) {

    let p: any;
    const getp = () => p;

    const props: IProps = {} as any;

    const { emit, emitUtils } = createEmit(getp);

    const { lifes, triggers } = createLifes();
    const { slotUtils, slots } = createSlot(getp);

    const expose: Record<string, any> = {};

    // ! 给组件外部调用的
    const utils = {
        getProp: (key: string) => read(props[key]),
        prop: flow ? (key: keyof IProps, value?: any) => {
            props[key] = reader(value ?? true);
            return p;
        } : (key: keyof IProps, value?: any) => {
            props[key] = value ?? true;
            return p;
        },
        ref: (v: any) => {
            if (v.__ld_type === LinkDomType.Ref) {
                v.el = p;
            } else {
                v(p);
            }
            return p;
        },
        mount (parent: IMountParent) {
            mount(p, parent);
            return p;
        },
        expose,
        ...emitUtils,
        ...slotUtils,
        ...lifes,
        ...triggers,
    };

    return {
        // scope是组件内部使用的
        scope: { props, slots, emit, expose, ...lifes } as IComponentArgs,
        utils,
        setProxy (proxy: any) {return (p = proxy);}
        // todo 生命周期
    };
}

export function slot (slot: ISlot): ISlot;
export function slot (key: string, slot: ISlot): ISlot;
export function slot (key: string|ISlot, slot?: ISlot): ISlot {
    if (arguments.length === 1) {
        return key as ISlot;
    }
    // @ts-ignore
    slot.__slot_name = key;
    return slot as ISlot;
}

export function defineComponent<
    Props extends IProps = IProps,
    Emits extends IEmits = IEmits,
    Slots extends ISlots = ISlots,
    Exposes extends IExposes = IExposes
> (fn: IComponent<Props, Emits, Slots, Exposes>, flow = true): IComponentProxy<Props, Emits, Slots, Exposes> {
    const { scope, utils, setProxy } = createScope(flow);

    console.log('debug', 'new comp');

    let p: any = null;
    const target = (...slots: ISlot[]) => {
        for (const item of slots) {
            utils.slot((item as any).__slot_name, item);
        }
        return p;
    };

    p = new Proxy(target, {
        get (_, key) {
            if (key === '__ld_type') return LinkDomType.Component;
            if (key === 'el') {
                // ! 组合返回值
                return fn(scope as any);
                // return createLifeScope(LifeScopeType.Component, () => fn(scope as any));
            }
            if (typeof key === 'symbol' || FnKeys.has(key as string)) {
                return fn[key];
            }
            if (key in utils) return utils[key];
            return (value: any) => utils.prop(key, value);
        }
    });
    setProxy(p);
    // console.log('debug end', 'new comp');
    return p as any;
}
