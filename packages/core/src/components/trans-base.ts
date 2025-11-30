import { TransStatus } from '../utils';
import type { ITransScope } from './transition';

/*
 * @Author: tackchen
 * @Date: 2025-11-30 16:10:42
 * @Description: Coding something
 */

export type ITransCall = (list: Element[]|null, status: TransStatus, isAppear: boolean) => Promise<void>;

export class TransitionProxy {
    private __ts_list?: (ITransCall)[];

    // private inTrans = false;

    constructor (
        private scope: ITransScope
    ) {

    }
    get isInTrans () {
        return !!this.__ts_list;
    }

    cancel () {
        this.scope.cancel();
    }

    done () {
        this.scope.done();
    }

    async trigger (list: (Element)[]|null, status: TransStatus, isAppear = false) {
        if (!list?.length) return;
        await Promise.all(this.__ts_list!.map(fn => fn(list, status, isAppear)));
    }

    async triggerDone (list: (Element)[]|null, status: TransStatus, isAppear = false) {
        await this.trigger(list, status, isAppear);
        this.scope.done();
    }

    async appear (doms: HTMLElement[]) {
        await this.trigger(doms, TransStatus.EnterFrom, true);
        await this.trigger(doms, TransStatus.EnterActive, true);
        this.scope.done();
    }

    onSwitchDoms (fn: ITransCall) {
        if (!this.__ts_list) this.__ts_list = [];
        this.__ts_list.push(fn);
    }

    async callSwitchFn (add: ()=>Promise<void>, remove: ()=>Promise<void>) {
        const mode = this.scope.getMode();
        if (mode === 'default') {
            await Promise.all([ remove(), add() ]);
        } else if (mode === 'in-out') {
            await add();
            await remove();
        }  else if (mode === 'out-in') {
            await remove();
            await add();
        }
        this.scope.done();
    }
}