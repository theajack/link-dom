/*
 * @Author: chenzhongsheng
 * @Date: 2023-07-06 22:46:06
 * @Description: Coding something
 */

import type { IComputedLike, IReactive } from 'link-dom-reactive';
import type { Dom } from './element';
import type { Join } from './join';

type TCssCommonValue = 'inherit' | 'initial' | 'unset' | 'revert' | 'none' | 'auto';

export interface IOptionStyle {
        // optional string style
    textDecoration: 'blink'|'dashed'|'dotted'|'double'|'line-through'|'overline'|'solid'|'underline'|'wavy'|TCssCommonValue;
    position: 'relative' | 'absolute' | 'fixed' | 'sticky' | 'static' | TCssCommonValue;
    alignItems: 'stretch'|'center'|'flex-start'|'flex-end'|'baseline'|TCssCommonValue;
    justifyContent: 'flex-start'|'flex-end'|'center'|'space-between'|'space-evenly'|'space-around'|TCssCommonValue;
    display: 'none'|'flex'|'block'|'inline'|'inline-block'|'list-item'|'run-in'|'compact'|'marker'|'table'|'inline-table'|'table-row-group'|'table-header-group'|'table-footer-group'|'table-row'|'table-column-group'|'table-column'|'table-cell'|'table-caption'|TCssCommonValue;
    alignContent: 'stretch'|'center'|'flex-start'|'flex-end'|'space-between'|'space-around'|TCssCommonValue;
    backgroundAttachment: 'scroll'|'fixed'|'local'|TCssCommonValue;
    backgroundBlendMode: 'normal'|'multiply'|'screen'|'overlay'|'darken'|'lighten'|'color-dodge'|'saturation'|'color'|'luminosity'|TCssCommonValue;
    backgroundClip: 'border-box'|'padding-box'|'content-box'|TCssCommonValue;
    backgroundOrigin: 'border-box'|'padding-box'|'content-box'|TCssCommonValue;
    backgroundRepeat: 'repeat'|'repeat-x'|'repeat-y'|'no-repeat'|TCssCommonValue;
    boxSizing: 'content-box'|'border-box'|'inherit';
    clear: 'left'|'right'|'both'|'none'|'inherit';
    textAlign: 'auto'|'left'|'right'|'center'|'justify'|'start'|'end'|TCssCommonValue;
    wordWrap: 'normal'|'break-word'|'break-all';
    whiteSpace: 'normal'|'pre'|'nowrap'|'pre-wrap'|'pre-line'|'inherit';
    wordBreak: 'normal'|'break-word'|'break-all'|'keep-all';
    wordSpacing: 'normal'|'length'|'inherit';
    verticalAlign: 'baseline'|'sub'|'super'|'top'|'text-top'|'middle'|'bottom'|'text-bottom'|'length'|'%'|'inherit';
    fontStyle: 'normal'|'italic'|'oblique'|'inherit';
    flexDirection: 'row'|'row-reverse'|'column'|'column-reverse'|'initial'|'inherit';
    flexWrap: 'nowrap'|'wrap'|'wrap-reverse'|'initial'|'inherit';
    resize: 'none'|'both'|'horizontal'|'vertical';
    textOverflow: 'clip'|'ellipsis'|'string'|'initial'|'inherit';
    float: 'left'|'right'|'none'|'inherit';
    visibility: 'visible'|'hidden'|'collapse'|'inherit';
    overflow: 'visible'|'hidden'|'scroll'|'auto'|'inherit';
    overflowX: 'visible'|'hidden'|'scroll'|'auto'|'inherit';
    overflowY: 'visible'|'hidden'|'scroll'|'auto'|'inherit';
    cursor: 'auto'|'crosshair'|'pointer'|'move'|'e-resize'|'ne-resize'|'nw-resize'|'n-resize'|'se-resize'|'sw-resize'|'s-resize'|'w-resize'|'text'|'wait'|'help';
}

type INumberStyleEnum = 'paddingTop'| 'paddingBottom'| 'paddingLeft'| 'paddingRight'| 'marginTop'| 'marginBottom'| 'marginLeft'| 'marginRight'| 'fontSize'| 'lineHeight'| 'top'| 'left'| 'bottom'| 'right'| 'borderRadius'| 'textIndent'|
    // TNumberAutoStyle
    'width'| 'maxWidth'| 'minWidth'| 'height'| 'maxHeight'| 'minHeight'| 'flexBasis'|
    // pure number style
    'opacity' | 'order' | 'zIndex'| 'flex'| 'flexGrow'| 'flexShrink'|
    // fournumber style
    'margin'| 'padding' |
    'borderWidth' | 'borderTopWidth' | 'borderBottomWidth' | 'borderLeftWidth' | 'borderRightWidth';

type INumberStyle = {
    [prop in INumberStyleEnum]: string|number;
}

// prevent：阻止默认事件（常用）；
// stop：阻止事件冒泡（常用）；
// once：事件只触发一次（常用）；
// capture：使用事件的捕获模式；
// self：只有event.target是当前操作的元素时才触发事件；
type TEventDecorator = 'prevent' | 'stop' | 'capture' | 'once' | 'self';
export type IEventObject<T extends Dom = Dom> = ((e: Event, dom: T)=>any) | ({
    listener?: (e: Event, dom: T)=>any;
} & {
[decorator in TEventDecorator]?: boolean;
})
export interface IEventAttributes {
    onclick?: IEventObject;
    onmousedown?: IEventObject;
    onmouseenter?: IEventObject;
    onmouseleave?: IEventObject;
    onmousemove?: IEventObject;
    onmouseover?: IEventObject;
    onmouseup?: IEventObject;
    ontouchend?: IEventObject;
    ontouchmove?: IEventObject;
    ontouchstart?: IEventObject;
    onwheel?: IEventObject;
    oninput?: IEventObject;
    onchange?: IEventObject;
    onfullscreenchange?: IEventObject;
    onfullscreenerror?: IEventObject;
    oncopy?: IEventObject;
    oncut?: IEventObject;
    onpaste?: IEventObject;
    onabort?: IEventObject;
    onauxclick?: IEventObject;
    onbeforeinput?: IEventObject;
    onblur?: IEventObject;
    oncanplay?: IEventObject;
    oncanplaythrough?: IEventObject;
    onclose?: IEventObject;
    oncompositionend?: IEventObject;
    oncompositionstart?: IEventObject;
    oncompositionupdate?: IEventObject;
    oncontextmenu?: IEventObject;
    oncuechange?: IEventObject;
    ondblclick?: IEventObject;
    ondrag?: IEventObject;
    ondragend?: IEventObject;
    ondragenter?: IEventObject;
    ondragleave?: IEventObject;
    ondragover?: IEventObject;
    ondragstart?: IEventObject;
    ondrop?: IEventObject;
    ondurationchange?: IEventObject;
    onemptied?: IEventObject;
    onended?: IEventObject;
    onerror?: IEventObject;
    onfocus?: IEventObject;
    onfocusin?: IEventObject;
    onfocusout?: IEventObject;
    onformdata?: IEventObject;
    ongotpointercapture?: IEventObject;
    oninvalid?: IEventObject;
    onkeydown?: IEventObject;
    onkeypress?: IEventObject;
    onkeyup?: IEventObject;
    onload?: IEventObject;
    onloadeddata?: IEventObject;
    onloadedmetadata?: IEventObject;
    onloadstart?: IEventObject;
    onlostpointercapture?: IEventObject;
    onmouseout?: IEventObject;
    onpause?: IEventObject;
    onplay?: IEventObject;
    onplaying?: IEventObject;
    onpointercancel?: IEventObject;
    onpointerdown?: IEventObject;
    onpointerenter?: IEventObject;
    onpointerleave?: IEventObject;
    onpointermove?: IEventObject;
    onpointerout?: IEventObject;
    onpointerover?: IEventObject;
    onpointerup?: IEventObject;
    onprogress?: IEventObject;
    onratechange?: IEventObject;
    onreset?: IEventObject;
    onresize?: IEventObject;
    onscroll?: IEventObject;
    onselect?: IEventObject;
    onselectionchange?: IEventObject;
    onselectstart?: IEventObject;
    onsubmit?: IEventObject;
    onsuspend?: IEventObject;
    ontimeupdate?: IEventObject;
    ontoggle?: IEventObject;
    ontouchcancel?: IEventObject;
}


// type IStringStyleEnum = 'color'|'backgroundColor'|'backgroundImage'|'fontWeight'|'fontFamily'

// type IStringStyle = {
//     [prop in INumberStyleEnum]: string;
// }

type ICustomStyle = keyof INumberStyle | keyof IOptionStyle;


type IOriginStyle =
    Omit<CSSStyleDeclaration, ICustomStyle> &
    IOptionStyle &
    INumberStyle

export type IStyle = {
    [Key in (keyof IOriginStyle)]?: IOriginStyle[Key] | IComputedLike<IOriginStyle[Key]>
}

type IGlobalStyle = {
    [prop in string]: IStyle|string|IGlobalStyle;
}

export type IStyleKey = keyof IStyle;

export type IAttrKey = 'accesskey' | 'alt' | 'async' | 'autoplay' | 'checked' | 'color' | 'class' |
    'cols' | 'dir' | 'disabled' | 'enctype' | 'formnovalidate' | 'height' | 'hidden' | 'id' | 'lang' | 'maxlength' | 'name' | 'nonce' | 'readonly' | 'required' | 'size' | 'src' | 'style' | 'width' | 'height' |
    'summary' | 'tabindex' | 'target' | 'title' | 'type' | 'value' | 'href' | 'selected' | 'poster' | 'muted' | 'controls' | 'loop' | 'border' | 'cellspacing' | 'cellpadding' | 'rowspan' | 'colspan';

// Reactive

export type IReactiveLike<T=any> = IReactive<T> | T | Join;