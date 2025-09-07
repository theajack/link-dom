/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-06 22:00:01
 * @Description: Coding something
 */

import type { Ref, If } from 'link-dom';
import { ctrl, ref, LinkDomType } from 'link-dom';
import type { IRouterInnerItem } from './router';
import { Router } from './router';

// 按照执行顺序来确立

window._rvs = [] as any[];
let id = 0;

let RouterCurrentComp: any = null;
const RouterMap = new WeakMap<Function, RouterView>();

export class RouterView {

    __ld_type = LinkDomType.RouterView;

    nextView: RouterView | null = null;
    static Root: RouterView | null = null;

    if: If;

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
        this.id = id ++;
        window._rvs.push(this);
    }

    get el () {
        return this.if.el;
    }

    initRoutes (routes: IRouterInnerItem[]) {
        let isFirst = true;
        for (const route of routes) {
            const cond = () => {
                return this.path.value === route.path.path;
            };
            // todo 这里可以加参数
            const comp = () => {
                if (route?.routerView) {
                    RouterCurrentComp = route.component;
                    RouterMap.set(RouterCurrentComp, route.routerView);
                }
                return route.component();
            };
            if (isFirst) {
                isFirst = false;
                this.if = ctrl.if(cond, comp);
            } else {
                this.if.elif(cond, comp);
            }
        }
    }


    __mounted () {
        this.if.__mounted();
    }
}
export function routerView () {
    if (!RouterCurrentComp) {
        debugger;
        return RouterView.Root;
    };
    debugger;
    const view = RouterMap.get(RouterCurrentComp);
    if (!view) throw new Error('view not found');
    return view;
}