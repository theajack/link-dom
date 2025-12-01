/*
 * @Author: tackchen
 * @Date: 2025-12-01 23:21:47
 * @Description: Coding something
 */

// 此处为为了给组件使用 单独的一份，和router有冗余但是不好复用

export interface IRouteOptions {
    path?: string;
    name?: string;
    query?: Record<string, any>;
    param?: Record<string, any>;
    mode?: 'push'|'replace';
    state?: Record<string, any>;
}
export type IReturnGuard = void | boolean | string | IRouteOptions;

export interface IRouteComponentArgs {
    query: Record<string, string>;
    param: Record<string, string|number|boolean>;
    meta?: Record<string, any>;
    route: IRouterInnerItem;
    path: string;
}

export interface IRouterItemBase<T = string> {
    path: T;
    component: (options: IRouteComponentArgs)=>any;
    name?: string;
    meta?: Record<string, any>;
    beforeEnter?: ILifeCall;
    afterEnter?: ILifeCall;
    beforeLeave?: ILifeCall;
}

export type ILifeCall = (to: IRouterInnerItem, from: IRouterInnerItem) => void

export interface RouterPath {
    path: string|(()=>string),
    pathStr: string,
    is404(): boolean,
    hasChildren: boolean,
}

export interface IRouterInnerItem extends IRouterItemBase<RouterPath> {
    routerView?: {
        path: {value: string},
        el: any,
    };
    path: RouterPath;
    children?: IRouterItemBase[];
    __enterList?: ILifeCall[];
}