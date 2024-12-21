/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-13 14:32:56
 * @Description: Coding something
 */

// todo Not Support Now
export class Computed<T> {

    _value: T;

    get value () {
        return this._value;
    }
    set value (v) {
        this._value = v;
    }
    // constructor (v: ()=>T) {

    // }
}