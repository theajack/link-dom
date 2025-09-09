/*
 * @Author: chenzhongsheng
 * @Date: 2023-06-26 08:35:17
 * @Description: Coding something
 */

import { type IComment, type IElement, type IFragment, type IRenderer, type ITextNode } from './type';
import { isWeb, RendererType } from './utils';

export let Renderer: IRenderer;

const defaultRenderer: IRenderer = {
    type: RendererType.Web,
    querySelector (selector: string) {
        return document.querySelector(selector) as any as IElement|null;
    },
    querySelectorAll (selector: string): IElement[] {
        return document.querySelectorAll(selector) as any as IElement[];
    },
    createElement (tag: string = 'div'): IElement {
        return document.createElement(tag) as any as IElement;
    },
    createComment (text: string = ''): IComment {
        return document.createComment(text) as any as IComment;
    },
    createTextNode (text: string = ''): ITextNode {
        return document.createTextNode(text) as ITextNode;
    },
    createFragment (): IFragment {
        return document.createDocumentFragment() as any as IFragment;
    },
    addStyle (v: any) {
        document.head.appendChild(v);
    }
};

export function defineRenderer (renderer: IRenderer) {
    Renderer = renderer;
    return renderer;
}

export function resetRenderer () {
    defineRenderer(defaultRenderer);
}

if (isWeb) {
    resetRenderer();
}

export function checkHydrateEl (dom: {el: any}) {
    if (dom.el.__hydrate === true) {
        dom.el.dom = dom;
    }
}