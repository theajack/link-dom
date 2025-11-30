
import type { IReactiveLike, Ref } from 'link-dom-reactive';
import { readonly, read } from 'link-dom-reactive';
import type { IController, IDirective } from '../controller';
import type { Dom } from './element';
import { CtrlLinkApiSet, LinkDomType, assignDefault, isDomFrag } from '../utils';
import { mount, type IMountParent } from './mount';
import { frag, type Comment, type Frag, type Text } from './text';
import { handleIfLinkChildren } from '../controller/if';
import { getAncestorProvide } from './lifes';
import { KEY_FC_API_LINK, KEY_FC_API_VALUE, KEY_IF_LINK_DONE, KEY_IS_NAME_USE, KEY_LD_TYPE, KEY_SCOPE, KEY_SLOT_NAME, KEY_USE_STORE } from 'link-dom-shared';
import { useDirectives } from '../controller/directive';
// import { createLifeScope, LifeScopeType } from './lifes';

type ISlotBase = Dom|Text|Frag|Comment|string|number|HTMLElement|Node|IReactiveLike|IController| (()=>ISlot);
export type ISlot = ISlotBase | (()=>ISlotBase);

export type ISlots<T extends string = string> = {
    [key in T]: ISlot;
} & {
    default: ISlot[];
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

const LifeKeys = [ 'created', 'beforeMount', 'mounted', 'beforeUnmount', 'unmounted', 'beforeHydrate', 'hydrated' ] as const;

export type ILifeKeys = (typeof LifeKeys)[number];

export function componentRefs <E extends IComponentProxy = IComponentProxy, T extends string[] = string[]> (...list: T): {
    [k in T[number]]: E
} {
    const refs: any = {};
    list.forEach(name => {
        refs[name] = (ele: Dom) => { refs[name] = ele; };
    });
    return refs;
}

type ILifeFn = (v: Node, list: Node[])=>(void|Promise<void>);

export type IComponentProxy<
    Props extends IProps = IProps,
    Slots extends ISlots = ISlots,
    Emits extends IEmits = IEmits,
    Exposes extends IExposes = IExposes,
    SlotKey extends keyof Slots = keyof Slots,
    PropKey extends keyof Props = keyof Props,
> = {
    // ! 组件外部调用的
    (...slots: ISlot[]): IComponentProxy<Props, Slots, Emits, Exposes>;
    prop<K extends PropKey>(key: K, prop: Props[K]): IComponentProxy<Props, Slots, Emits, Exposes>;
    props(props: Props): IComponentProxy<Props, Slots, Emits, Exposes>;
    slots(slots: Slots): IComponentProxy<Props, Slots, Emits, Exposes>;
    slot: {
        <Key extends SlotKey>(slot: Slots[Key]): IComponentProxy<Props, Slots, Emits, Exposes>;
        <Key extends SlotKey>(key: Key, slot: Slots[Key]): IComponentProxy<Props, Slots, Emits, Exposes>;
    } & {
        [Key in SlotKey]: (slot: Slots[Key]) => IComponentProxy<Props, Slots, Emits, Exposes>;
    };
    getProp<K extends PropKey>(key: K): Props[K];
    getSlot<K extends SlotKey>(key: K): Slots[K];
    on: {
        <K extends keyof Emits>(key: K, fn: Emits[K]): IComponentProxy<Props, Slots, Emits, Exposes>;
    } & {
        [Key in keyof Emits]: (fn: Emits[Key]) => IComponentProxy<Props, Slots, Emits, Exposes>;
    },
    expose: Exposes,
    ref: (v: IComponentProxy|Ref) => IComponentProxy<Props, Slots, Emits, Exposes>;
    mount: (parent: IMountParent) => IComponentProxy<Props, Slots, Emits, Exposes>;
    directive: (...directives: IDirective[]) => IComponentProxy<Props, Slots, Emits, Exposes>;
} & {
    if: (ref: IReactiveLike) => IComponentProxy<Props, Slots, Emits, Exposes>;
    elif: (ref: IReactiveLike) => IComponentProxy<Props, Slots, Emits, Exposes>;
    else: (...args: any[]) => IComponentProxy<Props, Slots, Emits, Exposes>;
    case: (cond: any|(any[])|(()=>any)) => IComponentProxy<Props, Slots, Emits, Exposes>;
    default: (...args: any[]) => IComponentProxy<Props, Slots, Emits, Exposes>;
} & {
    [Key in PropKey]: (
        Props[Key] extends (boolean|IReactiveLike<boolean>|(()=>boolean)) ?
            ((prop?: Props[Key]) => IComponentProxy<Props, Slots, Emits, Exposes>):
            ((prop: Props[Key]) => IComponentProxy<Props, Slots, Emits, Exposes>)
    )
} & {
    [Key in ILifeKeys]: (fn: ILifeFn) => IComponentProxy<Props, Slots, Emits, Exposes>
};

type IProvide<T extends Record<string, any>, K extends keyof T = keyof T> = (key: K, value: T[K])=>void


interface IComponentArgs<
    Props extends IProps = IProps,
    Slots extends ISlots = ISlots,
    Emits extends IEmits = IEmits,
    Exposes extends IExposes = IExposes,
    Provides extends Record<string|symbol, any> = Record<string|symbol, any>,
> extends Record<ILifeKeys, (fn: ILifeFn) => void> {
    // ! 组件内部使用的
    slots: Slots;
    props: Props;
    emit: {
        <K extends keyof Emits>(key: K, ...args: Parameters<Emits[K]>): void
    } & {
        [key in keyof Emits]: (...args: Parameters<Emits[key]>) => void
    }
    expose: Exposes,
    provide: IProvide<Provides>,
    inject: <T>(key: string|symbol, def?: T)=>T,
}

export type IComponent<
    Props extends IProps = IProps,
    Slots extends ISlots = ISlots,
    Emits extends IEmits = IEmits,
    Exposes extends IExposes = IExposes,
> = (args: IComponentArgs<Props, Slots, Emits, Exposes>) => any;

// const FnKeys = new Set([ 'call', 'apply' ]); // 是否需要不代理这些key，代理会导致打包后可能导致错误
const FnKeys = new Set([ 'apply' ]); // 是否需要不代理这些key，代理会导致打包后可能导致错误
// ! 如 a.slot(...args) => a.slot.apply(a, args)

function createLifes (getp: () => any, getds: ()=>any[]) {
    const result = {
        lifes: {} as Record<ILifeKeys, any>,
        triggers: {} as any,
    };

    let isCreated = false;

    for (const key of LifeKeys) {
        const list: any[] = [];
        result.lifes[key] = (fn: any) => {
            // console.log(`add life ${key} ${fn.toString()} ${list.length}`);
            if (key === 'created' && isCreated) {
                fn(...getds());
            } else {
                list.push(fn);
            }
            return getp();
        };
        result.triggers[`__${key}`] = () => {
            list.forEach(fn => fn(...getds()));
            if (key === 'created' && !isCreated) {
                isCreated = true;
            }
            // console.log(`trigger life ${key} ${a}`);
        };
    }

    return result;
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
        key = key || 'default';

        if (key === 'default') {
            if (!slots[key]) slots[key] = [];
            slots[key].push(value);
        } else {
            slots[key] = value;
        }

        // console.log('slot', slots, key, value);
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

    const tempStore = {
        [KEY_SCOPE]: null,
        [KEY_SLOT_NAME]: null,
        [KEY_FC_API_LINK]: null,
        [KEY_IF_LINK_DONE]: null,
        [KEY_FC_API_VALUE]: null,
        __doms: [],
    } as any;

    const { emit, emitUtils } = createEmit(getp);

    const { lifes, triggers } = createLifes(getp, () => tempStore.__doms);
    const { slotUtils, slots } = createSlot(getp);

    const expose: Record<string, any> = {};


    const _store: any = {};

    const store = (key: string|symbol, value?: any) => {
        if (typeof key === 'undefined') return _store;
        // console.log('useStore', key, value);
        if (typeof value === 'undefined') return _store[key];
        if (value === null) {
            delete _store[key];
            return;
        }
        return _store[key] = value;
    };

    const provide = (key: string, value: any) => {
        store(key, value);
    };

    const inject = (key: string|symbol, def?: any) => {
        return getAncestorProvide(getp(), key) ?? def;
    };

    // ! 给组件外部调用的
    const utils = {
        getProp: (key: string) => read(props[key]),
        prop: flow ? (key: keyof IProps, value?: any) => {
            props[key] = readonly(value ?? true);
            return p;
        } : (key: keyof IProps, value?: any) => {
            props[key] = value ?? true;
            return p;
        },
        ref: (v: any) => {
            if (v[KEY_LD_TYPE] === LinkDomType.Ref) {
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
        directive (...directives: IDirective[]) {
            useDirectives(() => tempStore.__doms, getp(), directives);
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
        scope: { props, slots, emit, expose, provide, inject, ...lifes } as IComponentArgs,
        utils,
        tempStore,
        store,
        setProxy (proxy: any) {return (p = proxy);},
        assignSlots: (slots: any[]) => {
            // 处理If Else
            // ! 为了保序 这里必须使用foreach
            slots.forEach((el, index) => {
                const result = handleIfLinkChildren(el, slots, index);
                if (result) {
                    slots[index] = result;
                }
            });
            for (let item of slots) {
                if (!item) continue;
                // ! 处理数组逻辑
                if (Array.isArray(item)) {
                    item = frag(...item);
                }
                utils.slot((item as any)[KEY_SLOT_NAME], item);
            }
        }
    };
}

export function slot (slot: ISlot): ISlot;
export function slot (key: string, slot: ISlot): ISlot;
export function slot (key: string|ISlot, slot?: ISlot): ISlot {
    if (arguments.length === 1) {
        return key as ISlot;
    }
    // @ts-ignore
    slot[KEY_SLOT_NAME] = key;
    return slot as ISlot;
}

let currentComponentScope: any = null;

export function defineComponent<
    Props extends IProps = IProps,
    Slots extends ISlots = ISlots,
    Emits extends IEmits = IEmits,
    Exposes extends IExposes = IExposes,
> (fn: IComponent<Props, Slots, Emits, Exposes>, {
    flow = true,
    name = Math.random().toString(36).substring(2),
    defaultProps,
}: {
    flow?: boolean,
    name?: string,
    defaultProps?: Partial<Props>,
} = {}): IComponentProxy<Props, Slots, Emits, Exposes> {
    const target = (...slots: ISlot[]) => {
        // console.trace();
        // console.log('component createTarget', name);
        let result: any = null;
        const { scope, utils, tempStore, setProxy, assignSlots, store } = createScope(flow);
        // console.log('createTarget', store);
        // console.log('call target', name)
        assignSlots(slots); // ! 此处为首次调用组件
        const componentFn = (...slots: any[]) => {
            assignSlots(slots); // ! 此处为先 点调用属性之后调用组件
            return p;
        };
        const p = new Proxy(componentFn, {
            get (_, key) {
                if (CtrlLinkApiSet.has(key as any)) {
                    return (...args: any[]) => {
                        p[KEY_FC_API_LINK] = key;
                        p[KEY_FC_API_VALUE] = args[0];
                        // ! 避免类似 .default()()的情况
                        if (key === 'default' || key === 'else') {
                            if (args.length) componentFn(...args);
                        }
                        return p;
                    };
                }
                if (key === KEY_LD_TYPE) return LinkDomType.Component;
                if (key in tempStore) return tempStore[key];
                if (key === KEY_USE_STORE) return store;
                if (key === 'name') return name;
                if (key === 'el') {
                    // ! 需要缓存组件元素
                    if (result) return result;
                    assignDefault(scope.props, defaultProps);
                    currentComponentScope = scope;
                    result = fn(scope as any); // ! 最终组合返回值
                    currentComponentScope = null;
                    utils.__created();
                    return result;
                }
                if (typeof key === 'symbol' || FnKeys.has(key as string)) {
                    return fn[key];
                }
                if (key in utils) return utils[key];
                return (value: any) => utils.prop(key, value);
            },
            set (_, key, value) {
                if (key in tempStore) tempStore[key] = value;
                return true;
            }
        });
        setProxy(p);
        // window.a = window.a || [];
        // window.a.push(p);
        // console.log('createComponent', p);
        return p;
    };

    return new Proxy(target, {
        get (_, key) {
            if (key === KEY_LD_TYPE) return LinkDomType.Component;
            if (key === 'name') return name + '11';
            // ! 用来判断是否为直接使用组件，没有调用组件函数
            if (key === KEY_IS_NAME_USE) return true;
            if (key === 'el') {
                // ! 组合返回值
                // @ts-ignore
                return target().el;
            }
            if (typeof key === 'symbol' || FnKeys.has(key as string)) {
                return fn[key];
            }
            // console.log('call key', key)
            const comp = target();
            // @ts-ignore
            return comp[key];
        }
    }) as any;
}

export function isComponent (v: any): v is IComponentProxy {
    return v?.[KEY_LD_TYPE] === LinkDomType.Component;
}

export function addDomsToComponent (dom: any, node: any) {
    if (!node) return;
    if (isDomFrag(node)) {
        dom.__doms.push(...node.childNodes);
    } else {
        dom.__doms.push(node);
    }
}

export function getContext<
    Props extends IProps = IProps,
    Slots extends ISlots = ISlots,
    Emits extends IEmits = IEmits,
    Exposes extends IExposes = IExposes,
    Provides extends Record<string|symbol, any> = Record<string|symbol, any>,
> (): IComponentArgs<Props, Slots, Emits, Exposes, Provides> {
    if (!currentComponentScope) throw new Error('getContext must be called in component');
    return currentComponentScope as any;
}