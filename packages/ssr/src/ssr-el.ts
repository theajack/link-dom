/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-06 14:26:30
 * @Description: Coding something
 */
import type { IComment, IElement, IFragment, ITextNode } from 'link-dom-shared';


export abstract class SSRBase {
    hydration: string;
    html: string;
    abstract toHtml (): string;
}

export class SSRElement extends SSRBase implements IElement {
    toHtml (): string {
        throw new Error('Method not implemented.');
    }
    [prop: string]: any;
    tagName: string;
    style: Record<string, any>;
    constructor (tagName: string) {
        super();
        this.tagName = tagName;
        this.style = {};
    }
    addEventListener (eventName: string, listener: (e: Event) => void, useCapture?: boolean | undefined): void {
        throw new Error('Method not implemented.');
    }
    removeEventListener (eventName: string, listener: (e: Event) => void, useCapture?: boolean | undefined): void {
        throw new Error('Method not implemented.');
    }
    setAttribute (name: string, value: string): void {
        throw new Error('Method not implemented.');
    }
    removeAttribute (name: string): void {
        throw new Error('Method not implemented.');
    }
    getAttribute (name: string): string {
        throw new Error('Method not implemented.');
    }
    classList: {add (name: string): void; remove (name: string): void;};
    remove (): void {
        throw new Error('Method not implemented.');
    }
    get parentElement (): any {
        throw new Error('Method not implemented.');
    }
    get parentNode (): any {
        throw new Error('Method not implemented.');
    }
    get nextSibling (): any {
        throw new Error('Method not implemented.');
    }
    className: string;
    innerHTML: string;
    outerHTML: string;
    innerText: string;
    addEventListener (eventName: string, listener: (e: Event) => void, useCapture?: boolean | undefined): void {
        // throw new Error('Method not implemented.');
        debugger;
    }
    appendChild (child: SSRElement): void {
        debugger;
        // throw new Error('Method not implemented.');
    }
    insertBefore (node: any, child: any) {
        // throw new Error('Method not implemented.');
    }
    children: any[];
    childNodes: any[];


    // SSREle

}

export class SSRText extends SSRBase implements ITextNode {
    toHtml (): string {
        return this.textContent;
    }
    constructor (public textContent: string) {
        super();
    }
}

export class SSRComment extends SSRBase implements IComment {
    toHtml (): string {
        return this.textContent;
    }
    constructor (public textContent: string) {
        super();
    }
}

export class SSRFragment extends SSRBase implements IFragment {
    toHtml (): string {
        return '';
    }
    children: (IElement<any> | ITextNode)[] = [];
    appendChild (child: IElement<any> | ITextNode | IFragment<IElement<any> | ITextNode>): void {
        throw new Error('Method not implemented.');
    }
    insertBefore (node: IElement<any> | ITextNode, child: IElement<any> | ITextNode | null): IElement<any> | ITextNode {
        throw new Error('Method not implemented.');
    }
    childNodes: (IElement<any> | ITextNode)[] = [];
}