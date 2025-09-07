/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-06 21:53:04
 * @Description: Coding something
 */

export interface IFuzzyInfo {
    reg: RegExp,
    paramMap: Record<string, string>
}

// 解析路由规则
export class RouterPath {

    fuzzyInfo: IFuzzyInfo | null;

    constructor (
        public path: string,
        public hasChildren = false
    ) {
    }

    // 用于对路由path进行匹配
    match (path: string): {matched: boolean, param: Record<string, any>} {
        if (typeof this.fuzzyInfo === 'undefined') {
            this.fuzzyInfo = parseFuzzyRouteUrl(this.path);
        }
        // 匹配失败
        if (!this.fuzzyInfo) {
            return {
                matched: this.hasChildren ? path.startsWith(this.path) : path === this.path,
                param: {}
            };
        };
        const res = this.fuzzyInfo.reg.test(path);
        if (!res) return { matched: false, param: {} };
        return {
            matched: true,
            param: extractUrlParam(path, this.fuzzyInfo),
        };
    }
}

function parseFuzzyRouteUrl (path: string): null|IFuzzyInfo {

    if (!path.includes('/:')) return null;
    const arr = path.split('/');
    const paramMap: Record<string, string> = {};
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        if (item[0] !== ':') continue;
        const res = item.match(/^:(.*?)(\((.*?)\))?$/i);
        // console.log('res1=', res)
        if (!res) throw new Error(`错误的路由表达式: ${path}`);
        const name = res[1];
        const reg = res[3] || '(.*?)';
        paramMap[i] = name;
        arr[i] = reg;
    }
    return {
        reg: new RegExp(arr.join('/')),
        paramMap,
    };
}

function extractUrlParam (path: string, fuzzyInfo: IFuzzyInfo) {
    const arr = path.split('/');

    const map = fuzzyInfo.paramMap;

    const param: Record<string, any> = {};
    for (const i in map) {
        const name = map[i];
        const v = arr[i as any];
        // : 字符串
        // :# 数字
        // :! 布尔
        if (name[0] === '#') {
            param[name.substring(1)] = parseFloat(v);
        } else if (name[0] === '!') {
            param[name.substring(1)] = v === 'true' || v === '1';
        } else {
            param[name] = v;
        }
    }
    return param;
}