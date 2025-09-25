/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-05 23:56:58
 * @Description: Coding something
 */

import type { CustomElement } from './custom';

export type IListener = (event: any) => any;
export type IEventListener = (el: CustomElement, name: string, call: IListener) => void;

export interface ICustomRender<IEle extends CustomElement = CustomElement> {
    render?(el: IEle): ((el: IEle)=>void)|void;
    onRenderEnd?(el: IEle): void;
    addEventListener?: IEventListener;
    removeEventListener?: IEventListener;
}