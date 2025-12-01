/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-06 19:17:46
 * @Description: Coding something
 */

import type { Dom } from 'link-dom';
import { DepUtil, dom } from 'link-dom';
import { RouterPath } from './path';
import { formatUrl, queryToSearch, searchToQuery, applyParam, isRouteParam } from './utils';
import { RouterView } from './router-view';
import type { IRouteComponentArgs, IRouteOptions, IRouterInnerItem, IRouterItem, IRouterOptions } from './type';
import type { IGuardReturn, ILifeCall } from './router-life';
import { GlobalRouterLife } from './router-life';
import { watiNextFrame } from 'link-dom-shared';

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
        const prev = this._path;
        this._path = path;
        DepUtil.trigger(this, 'path');
        return () => {this._setPath(prev);};
    }
    get path () {
        DepUtil.add(this, 'path');
        return this._path;
    }
    private _query: Record<string, string> = {};
    protected _setQuery (query: Record<string, string>) {
        const prev = this._query;
        this._query = query;
        DepUtil.trigger(this, 'query');
        return () => {this._setQuery(prev);};
    }
    get query () {
        DepUtil.add(this, 'query');
        return this._query;
    }
    private _param: Record<string, string|number|boolean> = {};
    protected _setParam (param: Record<string, string|number|boolean>) {
        const prev = this._param;
        this._param = param;
        DepUtil.trigger(this, 'param');
        return () => {this._setParam(prev);};
    }
    get param () {
        DepUtil.add(this, 'param');
        return this._param;
    }
    routeList: IRouterInnerItem[] = [];
    private _currentRoute: IRouterInnerItem;

    protected _setCurrentRoute (route: IRouterInnerItem) {
        const prev = this._currentRoute;
        this._currentRoute = route;
        DepUtil.trigger(this, 'currentRoute');
        return () => {this._setCurrentRoute(prev);};
    }
    get currentRoute () {
        DepUtil.add(this, 'currentRoute');
        return this._currentRoute;
    }
}

export class Router extends RouterState {

    private life: GlobalRouterLife;

    private rootRoute: IRouterInnerItem;

    // private route404: IRouterInnerItem | null = null;

    // 用于执行name到route的路由匹配
    private _flatMap: Record<string, IRouterInnerItem> = {};

    get routes () {
        return this.rootRoute.children!;
    }
    // private routeList: IRouterInnerItem[] = [];
    base = '';
    mode: 'hash'|'history';
    static instance: Router;
    constructor ({
        routes,
        base = '',
        mode = 'hash',
        beforeEach,
        beforeResolve,
        afterEach,
        onError,
    }: IRouterOptions) {
        if (Router.instance) return Router.instance;
        super();
        this.life = new GlobalRouterLife();
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
        if (beforeEach) this.life.beforeEach(beforeEach);
        if (beforeResolve) this.life.beforeResolve(beforeResolve);
        if (afterEach) this.life.afterEach(afterEach);
        if (onError) this.life.onError(onError);
    }

    private _initRoutes (routes: IRouterItem[], routerView: RouterView): IRouterInnerItem[] {
        const innerRouters = routes.map(item => {
            const hasChildren = item.children && item.children?.length > 0;
            const route: IRouterInnerItem = {
                component: item.component,
                beforeEnter: item.beforeEnter,
                beforeLeave: item.beforeLeave,
                afterEnter: item.afterEnter,
                // ! 如果需要支持动态路由此处需要修改
                path: new RouterPath(item.path, hasChildren),
            };
            if (item.name) route.name = item.name;
            if (item.meta) route.meta = item.meta;
            if (hasChildren) {
                route.routerView = new RouterView();
                route.children = this._initRoutes(item.children!, route.routerView);
            }
            // if (item.path === '/404') {
            //     this.route404 = route;
            // }
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
                // console.log('hashchange', e);
                const { newURL } = e;
                this._enterWrap(newURL);
            });
            console.time();
            Promise.resolve().then(() => {
                console.timeEnd();
                this._enterWrap(location.href);
            });
        } else {
            console.warn('history mode not support now');
        }
    }
    private async _enterWrap (url) {
        try {
            await this._enterNewUrl(url);
        } catch (e) {
            console.error('route error', e);
            this.life.triggerError(e);
        }
    }

    private async _enterNewUrl (url: string) {
        // console.log(`test:${url}`);
        const { path, search } = formatUrl(url);
        // list 为route的路径，param为route所有url match参数
        const { list, param, matchedPaths } = this._matchRoutes(path, [ this.rootRoute ]);

        const to = list[list.length - 1];
        const from = this.currentRoute;

        debugger;

        // 统一处理拦截逻辑
        const checkValue = (v: (IGuardReturn), fn?: ()=>void) => {
            if (v === false) {
                fn?.();
                console.warn('Route cancel', to);
                return true;
            } else if (isRouteParam(v)) {
                this.route(v);
                return true;
            }
        };
        console.log('router change');
        if (checkValue(await this.life.triggerEach(to, from))) return;

        const resetList = [
            this._setCurrentRoute(to),
            this._setQuery(searchToQuery(search)),
            this._setParam(param),
            this._setPath(path),
        ];
        const reset = () => {resetList.forEach(fn => fn());};
        list.forEach(route => route.routerView?._initRouterInfo(to, from));
        if (checkValue(await this.life.triggerResolve(to, from), reset)) return;
        if (checkValue(await to.beforeEnter?.(to, from), reset)) return;
        await from?.beforeLeave?.(to, from);
        console.log('router debug info', this.routeList, list, this.routeList.length, list.length);
        list.forEach((route, index) => route.routerView?._setPath(matchedPaths[index + 1]));
        console.log('router debug info', this.routeList, list, this.routeList.length, list.length);
        this.routeList = list;
        await watiNextFrame();
        list.forEach(route => route.routerView?._afterEnter(to, from));
        await to.afterEnter?.(to, from);
        // this.currentPath.value = path;
        await this.life.triggerAfter(to, from);
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
                matchedPaths.push(item.path.pathStr);
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
            finalPath = route.path.pathStr;
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
    private _routeToUrl (url: string, state?: Record<string, any>, mode?: 'push'|'replace') {
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
        return history.forward();
    }
    go (delta: number) {
        return history.go(delta);
    }

    _getRouteComponentArgs (): IRouteComponentArgs {
        const _this = this;
        return {
            get route () {return _this.currentRoute;},
            get query () {return _this.query;},
            get param () {return _this.param;},
            get path () {return _this.path;},
            get meta () {return _this.currentRoute.meta;},
        };
    }
    beforeEach (fn: ILifeCall) {
        return this.life.beforeEach(fn);
    }
    beforeResolve (fn: ILifeCall) {
        return this.life.beforeResolve(fn);
    }
    afterEach (fn: ILifeCall<void>) {
        return this.life.afterEach(fn);
    }
    onError (fn: (e: any)=>void) {
        return this.life.onError(fn);
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