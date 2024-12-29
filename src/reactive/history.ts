/*
 * @Author: chenzhongsheng
 * @Date: 2024-08-09 15:05:32
 * @Description: Coding something
 */

import {LinkDomType} from '../utils';

let instance: Target;

export interface IHistoryData {
    // store: IStore<any, any>,
    // attr: string,
    sub: (ln: (v: any)=>void)=>(()=>void),
    get: ()=>any,
    set: (v: any)=>void,
    __ld_type: LinkDomType.History,
}

class Target {
    list: IHistoryData[] = [];
    private maxSize = 50;
    constructor () {
        if (instance) return instance;
        instance = this;
    }

    addUse (store: any, attr: string) {
        if (this.list.length > this.maxSize) {
            this.list.shift();
        }
        this.list.push({
            __ld_type: LinkDomType.History,
            sub: (ln) => {
                return store.$sub(attr, ln);
                // todo unsub
            },
            get: () => store[attr],
            set: (v) => {store[attr] = v;}
        });
    }

    get latest () {
        return this.list[this.list.length - 1] || {};
    }
    getHistory (i: number) { // 倒数第i个
        const index = this.list.length - i;
        const data = this.list[index];
        if (!data) {
            throw new Error(`Out of max size ${this.maxSize}`);
        }
        return data;
    }
};

export const GlobalStoreUseHistory = new Target();

// window.GlobalStoreUseHistory = GlobalStoreUseHistory;


export function isReactHistory (item: any): item is IHistoryData {
    return item?.__ld_type === LinkDomType.History;
}
