'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createAutocompleteDetachedFormContainerComponent", {
    enumerable: true,
    get: function() {
        return createAutocompleteDetachedFormContainerComponent;
    }
});
var _cx = require("../../lib/cx");
var _Button = require("../Button");
function createAutocompleteDetachedFormContainerComponent(param) {
    var createElement = param.createElement;
    var Button = (0, _Button.createButtonComponent)({
        createElement: createElement
    });
    return function AutocompleteDetachedFormContainer(userProps) {
        var children = userProps.children, _userProps_classNames = userProps.classNames, classNames = _userProps_classNames === void 0 ? {} : _userProps_classNames, onCancel = userProps.onCancel, translations = userProps.translations;
        return /*#__PURE__*/ createElement("div", {
            className: (0, _cx.cx)('ais-AutocompleteDetachedFormContainer', classNames.detachedFormContainer)
        }, children, /*#__PURE__*/ createElement(Button, {
            variant: "ghost",
            className: (0, _cx.cx)('ais-AutocompleteDetachedCancelButton', classNames.detachedCancelButton),
            onClick: onCancel
        }, translations.detachedCancelButtonText));
    };
}
