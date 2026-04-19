'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
var _utils = require("../../lib/utils");
var defaultTemplates = {
    empty: function empty() {
        return 'No results';
    },
    item: function item(data) {
        return JSON.stringify((0, _utils.omit)(data, [
            '__hitIndex'
        ]), null, 2);
    }
};
var _default = defaultTemplates;
