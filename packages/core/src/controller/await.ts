/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-13 17:32:04
 * @Description: Coding something
 */
import { filterElement, LinkDomType, TransStatus } from '../utils';
import { Marker } from './marker';
import type { Frag } from '../element/text';
import { frag, } from '../element/text';
import type { IChild } from '../element/element';
import { KEY_LD_TYPE, KEY_SCOPE, SharedStatus, watiNextFrame } from 'link-dom-shared';
import type { LifeScope } from '../element/lifes';
import { setCurrentScope } from '../element/lifes';
import { isComponent, type IComponentProxy } from '../element/component';
import type { ITransCall } from '../components/trans-base';
import { TransitionProxy } from '../components/trans-base';
import type { ITransScope } from '../components';

export class AwaitClass {
    [KEY_LD_TYPE] = LinkDomType.Await;
    [KEY_SCOPE]: LifeScope;
    _frag: Frag;
    _default: IChild[] = [];

    marker: Marker;

    get el () {
        if (!this._frag) {
            this._frag = frag(...this.marker.wrapContent(this._default));
            // @ts-ignore
            this._default = filterElement(Array.from(this._frag.el.children));
        }
        return this._frag.el;
    }
    getMarker () {
        return this.marker.start;
    }
    constructor (
        _promise: Promise<any>|IComponentProxy,
        _generator: (data: any)=>IChild,
    ) {
        this.marker = new Marker();
        if (!SharedStatus.isSSR) {
            if (isComponent(_promise)) {
                // @ts-ignore
                _promise = _promise.el;
            }
            _promise.then((data: any) => {
                this.onData(data, _generator);
            });
        }
    }

    private async onData (data: any, _generator: (data: any)=>IChild) {
        const scope = this[KEY_SCOPE];
        if (this.transition) {
            const add = async () => {
                setCurrentScope(scope);
                const child = _generator(data);
                const f = frag(child);
                const doms = Array.from(f.el.children);
                await this.transition.trigger(doms, TransStatus.EnterFrom);
                f.__mounted();
                this.marker.replace(f.el);
                await watiNextFrame(); // ! 首次append的元素 此处需要等待布局生效
                await this.transition.trigger(doms, TransStatus.EnterActive);
            };
            if (this.marker.end) {
                const remove = async () => {
                    scope.beforeUnmount();
                    const list = this.marker.pick(false, false);
                    await this.transition.trigger(filterElement(list), TransStatus.LeaveFrom);
                    list.forEach(item => item.remove());
                    scope.unmounted();
                };
                await this.transition.callSwitchFn(add, remove);
                console.log('resolve all done');
            } else {
                await add();
                this.transition.done();
            }
        } else {
            if (this.marker.end) {
                scope.beforeUnmount();
                this.marker.clear(true);
                scope.unmounted();
            }
            setCurrentScope(scope);
            const child = _generator(data);
            const f = frag(child);
            f.__mounted();
            this.marker.replace(f.el);
        }
        // @ts-ignore
        this._default = null;
        // @ts-ignore
        this.transition = null;
    }

    default (...doms: IChild[]) {
        this._default = doms;
        this.marker.initEnd();
        return this;
    }

    private transition: TransitionProxy;
    async onSwitchDoms (fn: ITransCall, trans: ITransScope, showAppear = false) {
        if (!this.transition) { this.transition = new TransitionProxy(trans); }
        this.transition.onSwitchDoms(fn);
        if (showAppear) {
            await this.transition.appear(this._default);
        }
    }
}