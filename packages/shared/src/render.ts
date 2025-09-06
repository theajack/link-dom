/*
 * @Author: chenzhongsheng
 * @Date: 2023-06-26 08:35:17
 * @Description: Coding something
 */

import type { IElement, IFragment, IRenderer, ITextNode } from './type';

export let Renderer: IRenderer;

export function defineRenderer (renderer: IRenderer) {
    Renderer = renderer;
    return renderer;
}

if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
    defineRenderer({
        querySelector (selector: string) {
            return document.querySelector(selector) as any as IElement|null;
        },
        querySelectorAll (selector: string): IElement[] {
            return document.querySelectorAll(selector) as any as IElement[];
        },
        createElement (tag: string = 'div'): IElement {
            return document.createElement(tag) as any as IElement;
        },
        createTextNode (text: string = '') {
            return document.createTextNode(text) as ITextNode;
        },
        createFragment (): IFragment {
            return document.createDocumentFragment() as any as IFragment;
        },
    });
}