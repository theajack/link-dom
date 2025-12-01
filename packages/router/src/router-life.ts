/*
 * @Author: tackchen
 * @Date: 2025-11-30 21:48:19
 * @Description: Coding something
 */

/**
    导航被触发。
    global.beforeEach
    global.beforeResolve
    to.beforeEnter
    // ! 以上三个可以拦截
    from.beforeLeave
    fromComponent.beforeRouteLeave
    component.beforeRouteEnter
    // ! 触发 DOM 更新。
    component.afterRouteEnter
    to.afterEnter
    global.afterEach
 */

import { type IPromiseMayBe } from 'link-dom-shared';
import type { IRouteOptions, IRouterInnerItem } from './type';
import { isRouteParam } from './utils';

export type IGuardReturn = void | boolean | string | IRouteOptions;

export type ILifeCall<T = (IGuardReturn)> =
    (to: IRouterInnerItem, from: IRouterInnerItem) => IPromiseMayBe<T>

export class GlobalRouterLife {
    private __be_listeners: ILifeCall[] = [];
    beforeEach (fn: ILifeCall) {
        this.__be_listeners.push(fn);
    }
    async triggerEach (to: IRouterInnerItem, from: IRouterInnerItem) {
        return this._triggerCommon(this.__be_listeners, to, from);
    }
    private __re_listeners: ILifeCall[] = [];
    beforeResolve (fn: ILifeCall) {
        this.__re_listeners.push(fn);
    }
    async triggerResolve (to: IRouterInnerItem, from: IRouterInnerItem) {
        return this._triggerCommon(this.__re_listeners, to, from);
    }

    private async _triggerCommon (list: ILifeCall[], to: IRouterInnerItem, from: IRouterInnerItem) {
        for (const fn of list) {
            const v = await fn(to, from);
            if (v === false) {
                return false;
            } else if (isRouteParam(v)) {
                return v;
            }
        }
    }

    private __ae_listeners: ILifeCall<void>[] = [];
    afterEach (fn: ILifeCall<void>) {
        this.__ae_listeners.push(fn);
    }
    async triggerAfter (to: IRouterInnerItem, from: IRouterInnerItem) {
        for (const fn of this.__ae_listeners) {
            await fn(to, from);
        }
    }

    private __error: ((e: any)=>void)[] = [];
    onError (fn: (e: any)=>void) {
        this.__error.push(fn);
    }
    triggerError (e: any) {
        this.__error.forEach(fn => fn(e));
    }
}