/*
 * @Author: chenzhongsheng
 * @Date: 2023-10-07 19:40:43
 * @Description: Coding something
 */

import type  {Dom} from '../element';
import {getComputeWatch} from './computed';

type IState = Record<string, any>;

type IActions<State extends IState, Actions extends IActions<State, Actions>> = {
  [prop in string]: (this: IStore<State, Actions> & Actions, ...args: any[]) => any;
}


export type IStore<
  State extends IState,
  Actions extends IActions<State, Actions>
> = {
  [prop in keyof State]: State[prop];
} & {
  [prop in keyof Actions]: Actions[prop];
} & {
  $sub: <Prop extends keyof State>(key: Prop, ln: (v: State[Prop], prev: State[Prop])=>void) => (()=>void);
  $unsub: <Prop extends keyof State>(key: Prop, ln?: (v: State[Prop], prev: State[Prop])=>void) => boolean;
  $get: <Prop extends keyof State>(key: Prop)=>State[Prop];
}
// set: <Prop extends keyof State>(key: Prop, value: State[Prop][0]) => void;

export function createStore<
  State extends IState,
  Actions extends IActions<State, Actions>
> (state: State, actions: Actions = {} as any): IStore<State, Actions> {
    const subMap: any = {};
    const originData: any = {};
    // @ts-ignore
    const result: IStore<State, Actions> = {
        $sub (k: any, ln: any) {
            if (!subMap[k]) subMap[k] = [];
            subMap[k].push(ln);
            return () => {result.$unsub(k, ln);};
        },
        $unsub (k: any, ln?: any) {
            if (!subMap[k]) return;
            if (typeof ln === 'undefined') {
                delete subMap[k];
                return true;
            }
            const index = subMap[k].indexOf(ln);
            if (index === -1) return false;
            subMap[k].splice(index, 1);
            return true;
        },
        $get (attr: string) {
            return originData[attr];
        },
    };

    const objMap: any = {};
    for (const k in state) {
        const value = state[k];
        originData[k] = value;
        objMap[k] = {
            get () {
                latestStore = {store: result, attr: k};
                getComputeWatch()?.(result, k);
                const v = originData[k];
                return v;
            },
            set (v: any) {
                const origin = originData[k];
                originData[k] = v;
                subMap[k]?.forEach((fn: any) => {fn(v, origin);});
            }
        };
        // @ts-ignore
        result[k] = value;
    }

    Object.defineProperties(result, objMap);

    for (const k in actions) {
        // @ts-ignore
        result[k] = (...args: any[]) => {
            return actions[k].apply(result, args);
        };
    }
    return result;
};

let latestStore: {store: IStore<any, any>, attr: string} | null = null;

export function bindStore (el: Dom, v: any) {
    if (!latestStore) throw new Error('Bind 传入参数错误');
    const {store, attr} = latestStore;
    if (store[attr] !== v) throw new Error('Bind 传入参数错误');

    const dom = el.el;
    let vType = 'string';
    if (dom.tagName === 'INPUT') {
        const type = el.attr('type');
        if (type === 'number' || type === 'range') {
            vType = 'number';
        } else if (type === 'radio' || type === 'checkbox') {
            vType = 'boolean';
        }
    }

    const getValue = () => {
        // @ts-ignore
        if (vType === 'boolean') return dom.checked;
        const v = el.value();
        return vType === 'number' ? parseFloat(v) : v;
    };
    const setValue = (v: any) => {
        if (vType === 'boolean') {
            // @ts-ignore
            dom.checked = v;
            return;
        }
        el.value(v);
    };
    let ignoreSub = false;
    const modStore = () => {
        ignoreSub = true;
        store[attr] = getValue();
        ignoreSub = false;
    };

    setValue(store[attr]);
    // @ts-ignore
    el.event('input', () => { modStore();});
    // @ts-ignore
    el.event('change', () => { modStore(); });
    store.$sub('attr', (v: any) => {if (!ignoreSub)setValue(v);});
}