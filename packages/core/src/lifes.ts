// mounted 和 unmounted

import { SharedStatus } from 'link-dom-shared';
import { type IComponentProxy } from './component';
import type { AwaitClass } from './controller/await';
import type { ForClass } from './controller/for/for';
import type { IfClass } from './controller/if';
import { LinkDomType } from './utils';

/*
mounted 触发时机

仅组件维度

1. if条件切换
2. for加载/移除
3. 路由切换
4. await加载

建立组件树，在以上场景对组件进行遍历操作

以下为组件树元素

1.


*/

export enum LifeScopeType {
    Root = 1001,
    ForChild = 1002,
    For = LinkDomType.For,
    If = LinkDomType.If,
    Component = LinkDomType.Component,
    RouterView = LinkDomType.RouterView,
    Await = LinkDomType.Await,
    Switch = LinkDomType.Switch,
}

export let CurrentScope: LifeScope|null = null;

export function setCurrentScope (scope: LifeScope|null) {
    CurrentScope = scope;
}

export function getCurrentScope () {
    return CurrentScope;
}

// window.cur = () => CurrentScope;

const LifeScopeLink: LifeScope[] = [];

const scopes: LifeScope[] = [];

type RouterView = any; // 暂时仅做语义使用
type IScopeDynamicDom = IfClass|ForClass|RouterView|AwaitClass;
type IScopeDom = IScopeDynamicDom|IComponentProxy|null;

export class LifeScope {
    children: LifeScope[] = [];
    parent: LifeScope|null = null;
    root: LifeScope;

    childrenMap: any = null;

    component: IComponentProxy|null = null;

    constructor (
        public type: LifeScopeType,
        public dom: IScopeDom
    ) {
        scopes.push(this);
        if (type === LifeScopeType.Root) {
            this.root = this;
        }
        if (dom) {
            dom.__ld_scope = this;
        }
    }
    beforeUnmount () {
        this.children.forEach(child => child.beforeUnmount());
        // @ts-ignore
        this.component?.__beforeUnmount();
    }
    mounted () {
        this.children.forEach(child => child.mounted());
        // @ts-ignore
        this.component?.__mounted();
    }
    beforeMount () {
        this.children.forEach(child => child.beforeMount());
        // @ts-ignore
        this.component?.__beforeMount();
    }
    unmounted () {
        this.children.forEach(child => child.unmounted());
        // @ts-ignore
        this.component?.__unmounted();
        this.children = [];
    }
}

export function onEnterScope (type: LifeScopeType, dom: IScopeDom, index?: number) {
    const scope = new LifeScope(type, dom);
    LifeScopeLink.push(scope);
    if (dom?.__ld_type === LinkDomType.Component) {
        scope.component = dom;
    }
    if (CurrentScope) {
        scope.parent = CurrentScope;
        scope.root = CurrentScope.root;
        const list = CurrentScope.children;
        if (typeof index === 'number' && index < list.length) {
            CurrentScope.children.splice(index, 0, scope);
        } else {
            CurrentScope.children.push(scope);
        }
    }
    CurrentScope = scope;
    return scope;
}

export function onExitScope () {
    LifeScopeLink.pop();
    CurrentScope = LifeScopeLink[LifeScopeLink.length - 1] || null;
}

/*

beforeMount
mounted

beforUnmount
unmounted

beforHydrate
hydrated

*/

export function updateIfScopeBranch (scope: LifeScope, prev: number, active: number) {
    const isSSR = SharedStatus.isSSR;
    CurrentScope = scope;
    // window.scope = scope;
    return {
        beforeUnmount () {
            if (isSSR) return;
            scope.beforeUnmount();
            if (!scope.childrenMap) {
                scope.childrenMap = {};
            }
            if (!scope.childrenMap[prev]) {
                scope.childrenMap[prev] = scope.children;
            }
        },
        mounted () {
            if (isSSR) return;
            if (!scope.childrenMap[active]) {
                scope.childrenMap[active] = scope.children;
            }
            scope.mounted();
        },
        unmounted () {
            if (isSSR) return;
            scope.unmounted();
            if (scope.childrenMap[active]) {
                scope.children = scope.childrenMap[active];
                scope.beforeMount();
            }
        },
    };
}
