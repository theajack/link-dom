/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-06 22:00:01
 * @Description: Coding something
 */

import type { Ref, If } from 'link-dom';
import { ctrl, ref, LinkDomType } from 'link-dom';
import type { IRouterInnerItem } from './type.d';
import { Router, useRouter } from './router';

// 按照执行顺序来确立

// window._rvs = [] as any[];
// let id = 0;

let RouterCurrentComp: any = null;
const RouterMap = new WeakMap<Function, RouterView>();

export class RouterView {

    __ld_type = LinkDomType.RouterView;

    // nextView: RouterView | null = null;
    static Root: RouterView | null = null;

    if: If;

    // id: number;

    path: Ref<string>;

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
        return this.if.el;
    }

    initRoutes (routes: IRouterInnerItem[]) {
        let isFirst = true;
        let route404: IRouterInnerItem|null = null;
        for (const route of routes) {
            const cond = () => {
                // console.trace(`test:rv cond id=${this.id}`, this.path.value, route.path.path);
                // console.log(`test:rv cond id=${this.id}`, this.path.value, route.path.path);
                // console.log(`test:rv cond`, this.path.value, route.path.path);
                return this.path.value === route.path.path;
            };
            const comp = () => {
                if (route?.routerView) {
                    RouterCurrentComp = route.component;
                    RouterMap.set(RouterCurrentComp, route.routerView);
                }
                // console.log(`test:args`, JSON.stringify(Router.instance.query));
                // todo 这里可以加参数
                return route.component(useRouter()._getRouteComponentArgs());
            };
            if (isFirst) {
                isFirst = false;
                this.if = ctrl.if(cond, comp);
            } else {
                this.if.elif(cond, comp);
            }
            if (route.path.is404()) {
                route404 = route;
            }
        }
        if (route404) {
            if (isFirst) {
                this.if = ctrl.if(() => false, () => []);
            };
            this.if.else(() => route404!.component(useRouter()._getRouteComponentArgs()));
        }
    }


    __mounted () {
        this.if.__mounted();
    }
}
export function routerView () {
    if (!RouterCurrentComp) {
        // debugger;
        return RouterView.Root;
    };
    // debugger;
    const view = RouterMap.get(RouterCurrentComp);
    if (!view) throw new Error('view not found');
    return view;
}