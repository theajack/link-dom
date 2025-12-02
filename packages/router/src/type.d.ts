/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-05 23:56:58
 * @Description: Coding something
 */

import type { IChild } from 'link-dom';
import type { RouterPath } from './path';
import type { RouterView } from './router-view';
import type { ILifeCall } from './router-life';


export interface IRouteComponentArgs {
    query: Record<string, string>;
    param: Record<string, string|number|boolean>;
    meta?: Record<string, any>;
    route: IRouterInnerItem;
    path: string;
}

export interface IRouterItemBase<T = string> {
    path: T;
    component: (options: IRouteComponentArgs)=>IChild;
    name?: string;
    meta?: Record<string, any>;
    beforeEnter?: ILifeCall;
    afterEnter?: ILifeCall<void>;
    beforeLeave?: ILifeCall<void>;
}

export interface IRouterItem extends IRouterItemBase<string|(()=>string)> {
    children?: IRouterItem[];
}

export interface IRouterInnerItem extends IRouterItemBase<RouterPath> {
    routerView?: RouterView;
    path: RouterPath;
    children?: IRouterInnerItem[];
    __enterList?: ILifeCall[];
}

export interface IRouterOptions {
    routes: IRouterItem[];
    base?: string;
    mode?: 'hash'|'history';
    beforeEach?: ILifeCall
    beforeResolve?: ILifeCall<void>
    afterEach?: ILifeCall<void>
    onError?: (e: any)=>void
}

export interface IRouteOptions {
    path?: string;
    name?: string;
    query?: Record<string, any>;
    param?: Record<string, any>;
    mode?: 'push'|'replace';
    state?: Record<string, any>;
}
