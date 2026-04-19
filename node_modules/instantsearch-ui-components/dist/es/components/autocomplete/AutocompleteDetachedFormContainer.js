import { cx } from '../../lib/cx.js';
import { createButtonComponent } from '../Button.js';

function createAutocompleteDetachedFormContainerComponent(param) {
    var createElement = param.createElement;
    var Button = createButtonComponent({
        createElement: createElement
    });
    return function AutocompleteDetachedFormContainer(userProps) {
        var children = userProps.children, _userProps_classNames = userProps.classNames, classNames = _userProps_classNames === void 0 ? {} : _userProps_classNames, onCancel = userProps.onCancel, translations = userProps.translations;
        return /*#__PURE__*/ createElement("div", {
            className: cx('ais-AutocompleteDetachedFormContainer', classNames.detachedFormContainer)
        }, children, /*#__PURE__*/ createElement(Button, {
            variant: "ghost",
            className: cx('ais-AutocompleteDetachedCancelButton', classNames.detachedCancelButton),
            onClick: onCancel
        }, translations.detachedCancelButtonText));
    };
}

export { createAutocompleteDetachedFormContainerComponent };
