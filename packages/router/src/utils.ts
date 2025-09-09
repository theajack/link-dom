/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-06 23:03:43
 * @Description: Coding something
 */
export interface IRouteInfo {
    path: string,
    query?: Record<string, string>,
    replace?: boolean,
    param?: Record<string, string>,
}

export function parseUrl (url: string): IRouteInfo|null {
    if (!url) return null;

    const { path, search } = formatUrl(url);

    const param = new URLSearchParams(search);
    const query: Record<string, string> = {};
    // @ts-ignore
    for (const item of param) {
        query[item[0]] = item[1];
    }
    return { path, query };
}

export function formatUrl (url: string): {path: string, search: string} {
    if (!URL.canParse(url)) {
        return { path: url, search: '' };
    }
    const Url = new URL(url);
    let search = '', path = '';
    if (Url.hash) {
        const index = Url.hash.indexOf('?');
        if (index === -1) {
            path = Url.hash.substring(1);
        } else {
            path = Url.hash.substring(1, index);
            search = Url.hash.substring(index);
        }
        if (path[0] !== '/') path = `/${path}`;
    } else {
        search = Url.search;
        path = Url.pathname;
    }
    return { search, path };
}

export function queryToSearch (query: Record<string, string>): string {
    if (!query) return '';
    let search = '';
    for (const k in query) {
        search += `&${k}=${encodeURIComponent(query[k])}`;
    }
    return search.replace('&', '?');
}

export function searchToQuery (search: string): Record<string, string> {
    const query: Record<string, string> = {};
    if (search[0] === '?') search = search.substring(1);
    if (!search) return query;
    search.split('&').forEach(item => {
        const index = item.indexOf('=');
        if (index === -1) {
            query[item] = '';
        } else {
            query[item.substring(0, index)] = decodeURIComponent(item.substring(index + 1));
        }
    });
    return query;
}

export function applyParam (path: string, param?: Record<string, string>) {
    if ((!(path.includes(':'))) || !param) return path;
    const arr = path.split('/');
    for (let i = 0; i < arr.length; i++) {
        let item = arr[i];
        if (!arr) continue;
        if (item[0] !== ':') continue;
        item = item.substring(1);
        if (item[0] === '!' || item[0] === '#') {
            item = item.substring(1);
        }
        arr[i] = param![item];
    }
    return arr.join('/');
}