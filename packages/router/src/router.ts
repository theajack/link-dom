/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-06 19:17:46
 * @Description: Coding something
 */

import type { Dom } from 'link-dom';
import { DepUtil, dom } from 'link-dom';
import { RouterPath } from './path';
import { formatUrl, queryToSearch, searchToQuery, applyParam } from './utils';
import { RouterView } from './router-view';
import type { IRouteComponentArgs, IRouteOptions, IRouterInnerItem, IRouterItem, IRouterOptions } from './type';

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

class RouterState {
    private _path: string;
    protected _setPath (path: string) {
        this._path = path;
        DepUtil.trigger(this, 'path');
    }
    get path () {
        DepUtil.add(this, 'path');
        return this._path;
    }
    private _query: Record<string, string> = {};
    protected _setQuery (query: Record<string, string>) {
        this._query = query;
        DepUtil.trigger(this, 'query');
    }
    get query () {
        DepUtil.add(this, 'query');
        return this._query;
    }
    private _param: Record<string, string|number|boolean> = {};
    protected _setParam (param: Record<string, string|number|boolean>) {
        this._param = param;
        DepUtil.trigger(this, 'param');
    }
    get param () {
        DepUtil.add(this, 'param');
        return this._param;
    }
    routeList: IRouterInnerItem[] = [];
    private _currentRoute: IRouterInnerItem;
    
    protected _setCurrentRoute (route: IRouterInnerItem) {
        this._currentRoute = route;
        DepUtil.trigger(this, 'currentRoute');
    }
    get currentRoute () {
        DepUtil.add(this, 'currentRoute');
        return this._currentRoute;
    }
}

export class Router extends RouterState {

    rootRoute: IRouterInnerItem;

    route404: IRouterInnerItem | null = null;

    // 用于执行name到route的路由匹配
    private _flatMap: Record<string, IRouterInnerItem> = {};

    get routes () {
        return this.rootRoute.children!;
    }
    base = '';
    mode: 'hash'|'history';
    static instance: Router;
    constructor ({
        routes,
        base = '',
        mode = 'hash'
    }: IRouterOptions) {
        if (Router.instance) return Router.instance;
        super();
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
        this._initEvents();
    }

    private _initRoutes (routes: IRouterItem[], routerView: RouterView): IRouterInnerItem[] {
        const innerRouters = routes.map(item => {
            const hasChildren = item.children && item.children?.length > 0;
            const route: IRouterInnerItem = {
                component: item.component,
                // ! 如果需要支持动态路由此处需要修改
                path: new RouterPath(item.path, hasChildren),
            };
            if (item.name) route.name = item.name;
            if (item.meta) route.meta = item.meta;
            if (hasChildren) {
                route.routerView = new RouterView();
                route.children = this._initRoutes(item.children!, route.routerView);
            }
            if (item.path === '/404') {
                this.route404 = route;
            }
            if (item.name) {
                if (this._flatMap[item.name]) throw new Error(`duplicate route name: ${item.name}`);
                this._flatMap[item.name] = route;
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


    private _enterNewUrl (url: string) {
        console.log(`test:${url}`);
        const { path, search } = formatUrl(url);
        // list 为route的路径，param为route所有url match参数
        const { list, param, matchedPaths } = this._matchRoutes(path, [ this.rootRoute ]);
        this.routeList = list;
        this._setCurrentRoute(list[list.length - 1]);
        this._setQuery(searchToQuery(search));
        this._setParam(param);
        list.forEach((route, index) => {
            if (route.routerView) {
                // console.log(`test:set id=${route.routerView.id}`, route.routerView.path.value, matchedPaths[index + 1]);
                console.log(`test:set`, route.routerView.path.value, matchedPaths[index + 1]);
                route.routerView.path.value = matchedPaths[index + 1];
            }
        });
        this._setPath(path);
        // this.currentPath.value = path;
    }

    private _matchRoutes (
        path: string,
        routes: IRouterInnerItem[],
        list: IRouterInnerItem[] = [],
        matchedPaths: string[] = [],
        param: Record<string, string> = {},
    ): {
        list: IRouterInnerItem[];
        param: Record<string, string>;
        matchedPaths: string[];
    } {
        // const is404 = false;
        const route = routes.find(item => {
            const { matched, param: p } = item.path.match(path);
            Object.assign(param, p);
            if (matched) {
                matchedPaths.push(item.path.path);
                return true;
            }
            return false;
        });
        if (route) {
            list.push(route);
            if (route.children) {
                this._matchRoutes(path, route.children, list, matchedPaths, param);
            }
        }
        return { list, param, matchedPaths };
    }

    route (arg: string | IRouteOptions) {
        const { data, url } = this._parseRouteInfo(arg);
        return this._routeToUrl(url, data.state, data.mode);
    }
    _parseRouteInfo (arg: string | IRouteOptions) {
        const data: IRouteOptions = typeof arg === 'string' ? { path: arg } : arg;
        const {
            path, name, query, param,
        } = data;

        let finalPath: string = '';
        if (name) {
            const route = this._flatMap[name];
            if (!route) throw new Error(`route not found: ${name}`);
            finalPath = route.path.path;
        } else {
            if (!path) throw new Error('path or name is required');
            finalPath = applyParam(path, param);
        }
        finalPath = `${this.base}${finalPath}${queryToSearch(query!)}`;
        if (this.mode === 'hash') {
            finalPath = `#${finalPath}`;
        }
        return { data, url: finalPath };
    }
    _routeToUrl (url: string, state?: Record<string, any>, mode?: 'push'|'replace') {
        if (this.mode === 'hash') {
            // location.href = finalPath;
            location.hash = url;
        } else {
            location.href = url;
        }
        history[mode === 'replace' ? 'replaceState' : 'pushState'](state || {}, '', url);
    }
    back () {
        return history.back();
    }
    forward () {
        debugger;
        return history.forward();
    }
    go (delta: number) {
        return history.go(delta);
    }

    _getRouteComponentArgs (): IRouteComponentArgs {
        const _this = this;
        // debugger;
        return {
            get route() {return _this.currentRoute},
            get query() {return _this.query},
            get param() {return _this.param},
            get path() {return _this.path},
            get meta() {return _this.currentRoute.meta},
        };
    }
}

export function createRouter (options: IRouterOptions) {
    return new Router(options);
}

export const routerLink: {
    (arg: string | IRouteOptions): Dom<HTMLAnchorElement>;
    back: () => Dom<HTMLAnchorElement>;
    forward: () => Dom<HTMLAnchorElement>;
    go: (delta: number) => Dom<HTMLAnchorElement>;
} = Object.assign((arg: string | IRouteOptions) => {
    const { url } = Router.instance._parseRouteInfo(arg);
    return dom.a.attr('href', url).text(url);
}, (() => {
    const gene = (type: 'back' | 'forward' | 'go') => {
        return (i?: number) => dom.a.attr('href', 'javascript:void(0)')
            .text(`${type}${typeof i === 'number' ? `(${i})` : ''}`)
            .click(() => {
                Router.instance[type](i!);
            });
    };
    return {
        back: gene('back'),
        forward: gene('forward'),
        go: gene('go'),
    };
})());


export function useRouter () {
    return Router.instance;
}