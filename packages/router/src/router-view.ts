/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-06 22:00:01
 * @Description: Coding something
 */

import type { Ref, IfClass, ITransScope } from 'link-dom';
import { ctrl, ref, LinkDomType, isComponent } from 'link-dom';
import type { IRouterInnerItem } from './type.d';
import { Router, useRouter } from './router';
import { isPureFunc, KEY_IS_NAME_USE, KEY_LD_TYPE } from 'link-dom-shared';

// 按照执行顺序来确立

// window._rvs = [] as any[];
// let id = 0;

let RouterCurrentComp: any = null;
const RouterMap = new WeakMap<Function, RouterView>();

export class RouterView {

    [KEY_LD_TYPE] = LinkDomType.RouterView;

    // id = id++;

    // nextView: RouterView | null = null;
    static Root: RouterView | null = null;

    if: IfClass;


    _to: any = null;
    _from: any = null;
    _prevComponent: any = null;

    _initRouterInfo (to: any, from: any) {
        this._to = to;
        this._from = from;
    }
    _setPath (v: string) {
        this.path.value = v;
    }
    _afterEnter (to: any, from: any) {
        this._prevComponent?.__afterRouteEnter(to, from);
        this._to = this._from = null;
    }

    onSwitchDoms (fn: any, trans: ITransScope, showAppear = false) {
        this.if?.onSwitchDoms(fn, trans, showAppear);
    }

    // id: number;

    path: Ref<string>;

    getMarker () {
        return this.if.getMarker();
    }

    constructor () {
        const router = Router.instance;
        this.path = ref('');
        if (!router) {
            throw new Error('Router not found');
        }
        if (!RouterView.Root) {
            RouterView.Root = this;
        }
        // this.id = id ++;
        // window._rvs.push(this);
    }

    get el () {
        if (!this.if) {
            console.warn('Declares some routers before use');
            return null;
        }
        return this.if.el;
    }

    private _routeSwitch (component: any) {
        if (component === this._prevComponent) return;
        console.log('debug comp route route.component component', component);
        this._prevComponent?.__beforeRouteLeave(this._to, this._from);
        if (component?.__is_route_componnet) {
            // @ts-ignore
            component.__beforeRouteEnter(this._to, this._from);
            console.log('debug comp route route.component component', component);
            this._prevComponent = component;
        } else {
            this._prevComponent = null;
        }
    }

    private _compnentList: any[] = [];

    initRoutes (routes: IRouterInnerItem[]) {
        let isFirst = true;
        let route404: IRouterInnerItem|null = null;
        let i = 0;
        for (const route of routes) {
            const index = i;

            const comp = () => {
                let component = route.component;
                if (route?.routerView) {
                    RouterCurrentComp = route.component;
                    RouterMap.set(RouterCurrentComp, route.routerView);
                }
                const routeInfo = useRouter()._getRouteComponentArgs();
                if (isPureFunc(component)) {
                    console.log('route.component pure func', component);
                    component = component(routeInfo);
                }
                if (isComponent(component)) {
                    if (component[KEY_IS_NAME_USE]) {
                        console.log('debug comp route route.component component KEY_IS_NAME_USE');
                        // ! 如果是直接使用组件名，需要先执行
                        component = component();
                    }
                    // @ts-ignore
                    component.el; // ! 需要兜底保证组件逻辑被执行了才有钩子
                    // @ts-ignore
                    component.__is_route_componnet = true;
                    this._compnentList[index] = component; // ! 缓存组件
                    this._routeSwitch(component);
                } else {
                    console.log('route.component default', component);
                    this._prevComponent = null;
                }
                return component;
            };
            const cond = () => this.path.value === route.path.pathStr;
            if (isFirst) {
                isFirst = false;
                this._initIf(ctrl.if(cond, comp));
                this.if.__ifProxy = this;
            } else {
                this.if.elif(cond, comp);
            }
            if (route.path.is404()) {
                route404 = route;
            }
            i++;
        }
        if (route404) {
            if (isFirst) {
                this._initIf(ctrl.if(() => false, () => []));
            };
            this.if.else(() => route404!.component(useRouter()._getRouteComponentArgs()));
        }
    }

    private _initIf (v: IfClass) {
        this.if = v;
        // ! 因为有缓存 这里还需要监听if变更来触发路由模块
        this.if.__ifProxy = this;
        // ! 因为有缓存 这里还需要监听if变更来触发路由模块
        this.if.onSwitchNode((i: number) => {
            this._routeSwitch(this._compnentList[i]);
        });
    }

    __mounted () {
        this.if.__mounted();
    }
}
export function routerView () {
    if (!RouterCurrentComp) {
        if (RouterView.Root === null) {
            console.warn('createRouter before use routerView');
        }
        // debugger;
        return RouterView.Root;
    };
    // debugger;
    const view = RouterMap.get(RouterCurrentComp);
    if (!view) throw new Error('view not found');
    return view;
}