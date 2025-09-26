const { initCodeMap } = require('jsbox-cmd');
const path = require('path');

initCodeMap({
    input: path.resolve(__dirname, '../jsbox-demo'),
    format: true,
    watch: false,
});