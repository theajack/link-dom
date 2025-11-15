// mounted 和 unmounted

import type { ComponentScope } from './component';
import { type IComponentProxy } from './component';
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
    For = LinkDomType.For,
    If = LinkDomType.If,
    Component = LinkDomType.Component,
    RouterView = LinkDomType.RouterView,
}

export let CurrentScope: LifeScope|null = null;

const LifeScopeLink: LifeScope[] = [];

const scopes: LifeScope[] = [];

export class LifeScope {
    children: LifeScope[] = [];
    parent: LifeScope|null = null;
    root: LifeScope;
    component: ComponentScope|null = null;

    constructor (
        public type: LifeScopeType,
        public dom: IfClass|ForClass|IComponentProxy|null
    ) {
        // enterScope(this);
        scopes.push(this);
        if (type === LifeScopeType.Root) {
            this.root = this;
        }
    }
}

export function onEnterScope (type: LifeScopeType, dom: IfClass|ForClass|IComponentProxy|null, component: ComponentScope | null) {
    const scope = new LifeScope(type, dom);
    scope.component = component;
    LifeScopeLink.push(scope);
    if (CurrentScope) {
        scope.parent = CurrentScope;
        scope.root = CurrentScope.root;
        CurrentScope.children.push(scope);
    }
    CurrentScope = scope;
    return scope;
}

export function onExitScope () {
    LifeScopeLink.pop();
    CurrentScope = LifeScopeLink[LifeScopeLink.length - 1] || null;
}