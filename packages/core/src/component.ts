
// defineComponent(fn).slots([ 'a', 'b' ]).props([ 'c', 'd' ]);

import { reader } from 'link-dom-reactive';
import type { IController } from './controller';
import type { Dom, IChild } from './element';
import { getReactiveValue as read, LinkDomType } from './utils';

export type ISlot = Dom | HTMLElement | Dom | IController | (()=>ISlot);
export type ISlots<T extends string = string> = {
    [key in T]: ISlot;
}

export type IProp = any;
export type IProps<T extends string = string> = {
    [key in T]: IProp;
}

export type ILifeKeys = 'beforeMount' | 'mounted';

export type IComponentProxy<
    Slots extends ISlots = ISlots,
    Props extends IProps = IProps,
    SlotKey extends keyof Slots = keyof Slots,
    PropKey extends keyof Props = keyof Props,
> = {
    (...slots: ISlot[]): IComponentProxy<Slots, Props>;
    props(props: Props): IComponentProxy<Slots, Props>;
    slots(slots: Slots): IComponentProxy<Slots, Props>;
} & {
    slot: {
        <Key extends SlotKey>(slot: Slots[Key]): IComponentProxy<Slots, Props>;
        <Key extends SlotKey>(key: Key, slot: Slots[Key]): IComponentProxy<Slots, Props>;
    } & {
        [Key in SlotKey]: (slot: Slots[Key]) => IComponentProxy<Slots, Props>;
    };
    getProp<K extends PropKey>(key: K): Props[K];
    getSlot<K extends SlotKey>(key: K): Slots[K];
} & {
    [Key in PropKey]: (
        Props[Key] extends boolean ?
            ((prop?: Props[Key]) => IComponentProxy<Slots, Props>):
            ((prop: Props[Key]) => IComponentProxy<Slots, Props>)
    )
} & {
    [Key in ILifeKeys]: (fn: ()=>void) => IComponentProxy<Slots, Props>
}

interface IComponentArgs<
    Slots extends ISlots = ISlots,
    Props extends IProps = IProps,
> extends Record<ILifeKeys, (fn: ()=>void) => void> {
    slots: Slots;
    props: Props;
    // onUnmounted: () => void,
    // onUpdated: () => void,
    // onBeforeMount: () => void,
    // onBeforeUnmount: () => void,
    // onBeforeUpdate: () => void,
}

export type IComponent<
    Slots extends ISlots = ISlots,
    Props extends IProps = IProps,
> = (args: IComponentArgs<Slots, Props>) => IChild;

const FnKeys = new Set([ 'bind', 'call', 'apply' ]);

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

function createScope (flow = true) {

    let p: any;

    const props: IProps = {} as any;
    const slots: ISlots = {} as any;

    const { lifes, triggers } = createLifes();

    const slotFn = function (key: any, value: any) {
        if (arguments.length === 1) {
            value = key;
            key = 'default';
        }
        slots[key || 'default'] = value;
        console.log('slot', slots, key, value);
        return p;
    };

    const utils = {
        getProp: (key: string) => read(props[key]),
        getSlot: (key: string) => slots[key],
        slots: (v: ISlots) => {
            Object.assign(slots, v);
            return p;
        },
        slot: new Proxy(slotFn, {
            get (_, key) {
                if (typeof key === 'symbol' || FnKeys.has(key as string)) {
                    return slotFn[key];
                }
                return (value: any) => slotFn(key, value);
            }
        }),
        prop: flow ? (key: keyof IProps, value?: any) => {
            props[key] = reader(value ?? true);
            return p;
        } : (key: keyof IProps, value?: any) => {
            props[key] = value ?? true;
            return p;
        },
        ...lifes,
        ...triggers,
    };

    return {
        scope: { props, slots, ...lifes } as IComponentArgs,
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
    Slots extends ISlots = ISlots,
    Props extends IProps = IProps,
> (fn: IComponent<Slots, Props>, flow = true): IComponentProxy<Slots, Props> {
    const { scope, utils, setProxy } = createScope(flow);

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
            if (key === 'el') return fn(scope as any); // ! 组合返回值
            if (typeof key === 'symbol' || FnKeys.has(key as string)) {
                return fn[key];
            }
            if (key in utils) return utils[key];
            return (value: any) => utils.prop(key, value);
        }
    });
    setProxy(p);
    return p as any;
}
