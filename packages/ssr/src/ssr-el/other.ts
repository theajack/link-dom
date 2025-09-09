/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-08 20:52:20
 * @Description: Coding something
 */

import type { IComment, IFragment, ITextNode } from 'link-dom-shared';
import { SSRBase, SSRContainer, SSREleType } from './base';


export class SSRText extends SSRBase implements ITextNode {
    _textContent: string = '';
    get textContent (): string {
        return this.innerText;
    }
    get innerText (): string {
        return this._textContent;
    }
    set innerText (text: string) {
        this._textContent = text;
    }
    type = SSREleType.Text;
    toHtml (): string {
        return this.textContent;
    }
    constructor (textContent: string) {
        super();
        this._textContent = textContent;
    }
}

export class SSRComment extends SSRText implements IComment {
    type = SSREleType.Comment;
    toHtml (): string {
        return `<!--${this._textContent}-->`;
    }
}

export class SSRFragment extends SSRContainer implements IFragment<any> {
    type = SSREleType.Frag;
}