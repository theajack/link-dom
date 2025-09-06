/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-06 11:04:10
 * @Description: Coding something
 */
import type { IComment, IElement, IFragment, ITextNode } from 'link-dom-shared';
import { defineRenderer } from 'link-dom-shared';
import { SSRComment, SSRElement, SSRFragment, SSRText } from './ssr-el';

export function useSSR () {
    defineRenderer({
        createElement (tag: string = 'div') {
            return new SSRElement(tag);
        },
        querySelector: function (selector: string): IElement<any> | null {
            throw new Error('Function not implemented.');
        },
        querySelectorAll: function (selector: string): IElement<any>[] {
            throw new Error('Function not implemented.');
        },
        createTextNode: function (text?: string | undefined): ITextNode {
            return new SSRText(text || '');
        },
        createComment: function (text?: string | undefined): IComment {
            return new SSRComment(text || '');
        },
        createFragment: function (): IFragment {
            return new SSRFragment();
        },
        addStyle: function (v: IElement<any>): void {
            throw new Error('Function not implemented.');
        }
    });
}