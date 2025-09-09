/*
 * @Author: chenzhongsheng
 * @Date: 2023-06-26 08:35:17
 * @Description: Coding something
 */

import type { IComment, IElement, IFragment, IRenderer, ITextNode } from './type';
import { isWeb } from './utils';

export let Renderer: IRenderer;

const defaultRenderer: IRenderer = {
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

if (isWeb()) {
    resetRenderer();
}
