/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-06 19:17:46
 * @Description: Coding something
 */

import type { IChild, Ref } from 'link-dom';
import  { reactive, ref } from 'link-dom';
import { RouterPath } from './path';
import { formatUrl, searchToQuery } from './utils';
import  { RouterView } from './router-view';

interface IRouterItemBase<T = string> {
    path: T;
    component: ()=>IChild;
    name?: string;
    meta?: Record<string, any>;
}

export interface IRouterItem extends IRouterItemBase<string> {
    children?: IRouterItem[];
}

export interface IRouterInnerItem extends IRouterItemBase<RouterPath> {
    routerView?: RouterView;
    path: RouterPath;
    children?: IRouterItemBase<RouterPath>[];
}

export interface IRouterOptions {
    routes: IRouterItem[];
    base?: string;
    mode?: 'hash'|'history';
}

/**
 * 路由路径
 *
 * 1. 初始化 Router（全局唯一）；初始化current
 * 2. 初始化 RouterViews，与 routes children 一一对应
 *      初始化了一个 RouterView就来找route初始化dom
 *
 * 两种路由过程
 * 1. 直接输入url -> 重新初始化
 * 2. 通过 route api 或 赋值 currentPath -> 设置hash -> hashchange 重新初始化
 *
 * 路由 addComponent 的时候记录一下当前 RouteItem, 通过这个讲 RouterView 与 RouteItem关联
 */

export class Router {

    rootRoute: IRouterInnerItem;

    get routes () {
        return this.rootRoute.children!;
    }
    base = '';

    store: {
        currentPath: string,
        query: Record<string, string>,
        param: Record<string, string|number|boolean>,
    };

    mode: 'hash'|'history';
    path: Ref<string>;

    static instance: Router;
    constructor ({
        routes,
        base = '',
        mode = 'hash'
    }: IRouterOptions) {
        if (Router.instance) {
            return Router.instance;
        }
        Router.instance = this;
        const routerView = new RouterView();
        this.rootRoute = {
            component: () => [],
            path: new RouterPath('/', true),
            children: this._initRoutes(routes, routerView),
            routerView,
        };
        this.base = base;
        this.mode = mode;
        this.path = ref('');
        this.store = reactive({
            get currentPath () {return Router.instance.path.value; },
            set currentPath (v: string) { Router.instance.path.value = v; },
            query: {},
            param: {},
        });
        this._initEvents();
    }

    private _initRoutes (routes: IRouterItem[], routerView: RouterView): IRouterInnerItem[] {
        const innerRouters = routes.map(item => {
            const hasChildren = item.children && item.children?.length > 0;
            const route: IRouterInnerItem = {
                component: item.component,
                name: item.name,
                meta: item.meta,
                // ! 如果需要支持动态路由此处需要修改
                path: new RouterPath(item.path, hasChildren),
            };
            if (hasChildren) {
                route.routerView = new RouterView();
                route.children = this._initRoutes(item.children!, route.routerView);
            }
            return route;
        });
        routerView.initRoutes(innerRouters);
        return innerRouters;
    }

    private _initEvents () {
        if (this.mode === 'hash') {
            window.addEventListener('hashchange', (e) => {
                console.log('hashchange', e);
                const { newURL } = e;
                this._enterNewUrl(newURL);
            });
            this._enterNewUrl(location.href);
        } else {
            console.warn('history mode not support now');
        }
    }

    routeList: IRouterInnerItem[] = [];

    private _enterNewUrl (url: string) {
        const { path, search } = formatUrl(url);
        // list 为route的路径，param为route所有url match参数
        const { list, param, matchedPaths } = this._matchRoutes(path, [ this.rootRoute ]);

        // if (list.length === 0) {
        //     this.rootRoute.routerView!.path.value = '';
        //     // todo 处理404
        //     return;
        // }

        list.forEach((route, index) => {
            if (route.routerView) {
                route.routerView.path.value = matchedPaths[index + 1];
            }
        });
        this.routeList = list;
        Object.assign(this.store.query, searchToQuery(search));
        Object.assign(this.store.param, param);
    }

    private _matchRoutes (
        path: string,
        routes: IRouterInnerItem[],
        list: IRouterInnerItem[] = [],
        matchedPaths: string[] = [],
        param: Record<string, string> = {},
        deep = 0,
    ): {
        list: IRouterInnerItem[];
        param: Record<string, string>;
        matchedPaths: string[];
    } {
        const route = routes.find(item => {
            const { matched, param: p } = item.path.match(path);
            Object.assign(param, p);
            if (matched) {
                matchedPaths.push(item.path.path);
                return true;
            }
            return false;
        });
        if (!route) {
            // console.warn('route not found', deep);
            if (deep === 1) this._route404();
            return { list: [], param: {}, matchedPaths: [] };
        }
        list.push(route);
        if (route.children) {
            this._matchRoutes(path, route.children, list, matchedPaths, param, deep + 1);
        }
        return { list, param, matchedPaths };
    }

    private _route404 () {
        // todo route 404
        console.warn('route 404');
    }
}

export function createRouter (options: IRouterOptions) {
    return new Router(options);
}