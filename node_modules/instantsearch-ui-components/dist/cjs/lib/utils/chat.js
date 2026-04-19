'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get getTextContent () {
        return getTextContent;
    },
    get hasTextContent () {
        return hasTextContent;
    },
    get isPartText () {
        return isPartText;
    }
});
var getTextContent = function getTextContent(message) {
    return message.parts.map(function(part) {
        return 'text' in part ? part.text : '';
    }).join('');
};
var hasTextContent = function hasTextContent(message) {
    return getTextContent(message).trim() !== '';
};
var isPartText = function isPartText(part) {
    return part.type === 'text';
};
