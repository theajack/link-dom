// mounted 和 unmounted
import { type } from '../../router/dist/index.d';

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


export const enum LifeScopeType {
    Root,
    Component,
    If,
    For,
    Await,
}

export interface ILifeScope {
    __type: number;
}

export let CurrentScope: LifeScope|null = null;

const LifeScopeLink: LifeScope[] = [];

function enterScope (scope: LifeScope) {
    LifeScopeLink.push(scope);
    if (CurrentScope) {
        scope.parent = CurrentScope;
        CurrentScope.children.push(scope);
    }
    CurrentScope = scope;
}

export function exitScope () {
    LifeScopeLink.pop();
    CurrentScope = LifeScopeLink[LifeScopeLink.length - 1] || null;
}

// todo

const scopes: LifeScope[] = [];
window.scopes = scopes;
export class LifeScope {

    children: LifeScope[] = [];
    parent: LifeScope|null = null;

    constructor (public type: LifeScopeType) {
        enterScope(this);
        console.log(this);
        scopes.push(this);
    }
}

export function activeLifeScope (scope: LifeScope) {
    enterScope(scope);
    console.log(scope);
    scopes.push(scope);
}

export function createLifeScope <T> (type: LifeScopeType, fn: ()=>T): T {
    new LifeScope(type);
    const res = fn();
    exitScope();
    return res;
}