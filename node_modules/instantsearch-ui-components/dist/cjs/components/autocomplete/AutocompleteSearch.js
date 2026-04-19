'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createAutocompleteSearchComponent", {
    enumerable: true,
    get: function() {
        return createAutocompleteSearchComponent;
    }
});
var _object_spread = require("@swc/helpers/_/_object_spread");
var _icons = require("./icons");
function createAutocompleteSearchComponent(param) {
    var createElement = param.createElement;
    return function AutocompleteSearch(userProps) {
        var inputProps = userProps.inputProps, onClear = userProps.onClear, query = userProps.query, isSearchStalled = userProps.isSearchStalled;
        var inputRef = inputProps.ref;
        return /*#__PURE__*/ createElement("form", {
            className: "ais-AutocompleteForm",
            action: "",
            noValidate: true,
            role: "search",
            onSubmit: function onSubmit(e) {
                return e.preventDefault();
            },
            onReset: function onReset() {
                var _inputRef_current;
                return (_inputRef_current = inputRef.current) === null || _inputRef_current === void 0 ? void 0 : _inputRef_current.focus();
            }
        }, /*#__PURE__*/ createElement("div", {
            className: "ais-AutocompleteInputWrapperPrefix"
        }, /*#__PURE__*/ createElement("label", {
            className: "ais-AutocompleteLabel",
            "aria-label": "Submit",
            htmlFor: inputProps.id,
            id: "".concat(inputProps.id, "-label")
        }, /*#__PURE__*/ createElement("button", {
            className: "ais-AutocompleteSubmitButton",
            type: "submit",
            title: "Submit",
            hidden: isSearchStalled
        }, /*#__PURE__*/ createElement(_icons.SubmitIcon, {
            createElement: createElement
        }))), /*#__PURE__*/ createElement("div", {
            className: "ais-AutocompleteLoadingIndicator",
            hidden: !isSearchStalled
        }, /*#__PURE__*/ createElement(_icons.LoadingIcon, {
            createElement: createElement,
            isSearchStalled: isSearchStalled
        }))), /*#__PURE__*/ createElement("div", {
            className: "ais-AutocompleteInputWrapper"
        }, /*#__PURE__*/ createElement("input", _object_spread._({
            className: "ais-AutocompleteInput",
            "aria-autocomplete": "both",
            "aria-labelledby": "".concat(inputProps.id, "-label"),
            autoComplete: "off",
            autoCorrect: "off",
            autoCapitalize: "off",
            enterKeyHint: "search",
            spellCheck: "false",
            maxLength: 512,
            type: "search",
            value: query
        }, inputProps))), /*#__PURE__*/ createElement("div", {
            className: "ais-AutocompleteInputWrapperSuffix"
        }, /*#__PURE__*/ createElement("button", {
            className: "ais-AutocompleteClearButton",
            type: "reset",
            title: "Clear",
            hidden: query.length === 0 || isSearchStalled,
            onClick: onClear
        }, /*#__PURE__*/ createElement(_icons.ClearIcon, {
            createElement: createElement
        }))));
    };
}
