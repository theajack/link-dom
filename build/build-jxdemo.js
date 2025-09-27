/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-27 10:02:55
 * @Description: Coding something
 */
const { initCodeMap } = require('jsbox-cmd');
const path = require('path');

initCodeMap({
    input: path.resolve(__dirname, '../jsbox-demo'),
    format: true,
    watch: false,
});
