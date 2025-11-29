/*
 * @Author: tackchen
 * @Date: 2025-11-29 17:46:38
 * @Description: Coding something
 */

import type { Frag } from '../element/text';
import { isComponent, type IComponentProxy } from '../element/component';
import type { Dom } from '../element/element';
import type { BaseNode } from '../element/node';
import { parseNodeList } from '../utils';

export type IDirectiveNode = Dom<any>|BaseNode<any>|IComponentProxy|Frag;

export type IDirArgs<Binding> = {
    dom: Node;
    domList: Node[];
    binding: Binding;
    node: IDirectiveNode
}

export interface IDriectoryHooks<Binding extends any = any> {
    created?(data: IDirArgs<Binding>): void;
    mounted?(data: IDirArgs<Binding>): void;
    // 以下仅在组件上有效
    unmounted?(data: IDirArgs<Binding>): void;
    beforeMount?(data: IDirArgs<Binding>): void;
    beforeUnmount?(data: IDirArgs<Binding>): void;
    beforeHydrate?(data: IDirArgs<Binding>): void;
    hydrated?(data: IDirArgs<Binding>): void;
}

export interface IDirective {
    (el: ()=>Node|(Node[]), node: IDirectiveNode): void;
}

const DomKeys = new Set([ 'created', 'mounted' ]);

export function defineDirective <Binding extends any = any> (hooks: IDriectoryHooks<Binding>) {
    return (binding?: Binding) => {
        return (el: ()=>Node|(Node[]), node: IDirectiveNode) => {
            const _isComponent = isComponent(node);
            for (const k in hooks) {
                if (_isComponent || DomKeys.has(k)) {
                    node[k]?.(() => {
                        hooks[k]({
                            binding,
                            node,
                            ...parseNodeList(el())
                        });
                    });
                } else {
                    console.warn(`directive hook ${k} only support in Component`);
                }
            }
        };
    };
}

export function useDirectives (el: ()=>Node|(Node[]), node: IDirectiveNode, directives: IDirective[]) {
    directives.forEach(d => {
        d(el, node);
    });
}