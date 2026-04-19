import { _ } from '@swc/helpers/esm/_object_spread.js';
import { _ as _$1 } from '@swc/helpers/esm/_object_spread_props.js';
import { cx } from 'instantsearch-ui-components';
import { render, h } from 'preact';
import SearchBox from '../../components/SearchBox/SearchBox.js';
import connectSearchBox from '../../connectors/search-box/connectSearchBox.js';
import { component } from '../../lib/suit.js';
import defaultTemplate from './defaultTemplates.js';
import { createDocumentationMessageGenerator } from '../../lib/utils/documentation.js';
import { getContainerNode } from '../../lib/utils/getContainerNode.js';

var withUsage = createDocumentationMessageGenerator({
    name: 'search-box'
});
var suit = component('SearchBox');
var renderer = function renderer(param) {
    var containerNode = param.containerNode, cssClasses = param.cssClasses, placeholder = param.placeholder, templates = param.templates, autofocus = param.autofocus, searchAsYouType = param.searchAsYouType, ignoreCompositionEvents = param.ignoreCompositionEvents, showReset = param.showReset, showSubmit = param.showSubmit, showLoadingIndicator = param.showLoadingIndicator;
    return function(param) {
        var refine = param.refine, query = param.query, isSearchStalled = param.isSearchStalled;
        render(/*#__PURE__*/ h(SearchBox, {
            query: query,
            placeholder: placeholder,
            autofocus: autofocus,
            refine: refine,
            searchAsYouType: searchAsYouType,
            ignoreCompositionEvents: ignoreCompositionEvents,
            templates: templates,
            showSubmit: showSubmit,
            showReset: showReset,
            showLoadingIndicator: showLoadingIndicator,
            isSearchStalled: isSearchStalled,
            cssClasses: cssClasses
        }), containerNode);
    };
};
var searchBox = function searchBox(widgetParams) {
    var _ref = widgetParams || {}, container = _ref.container, _ref_placeholder = _ref.placeholder, placeholder = _ref_placeholder === void 0 ? '' : _ref_placeholder, tmp = _ref.cssClasses, userCssClasses = tmp === void 0 ? {} : tmp, _ref_autofocus = _ref.autofocus, autofocus = _ref_autofocus === void 0 ? false : _ref_autofocus, _ref_searchAsYouType = _ref.searchAsYouType, searchAsYouType = _ref_searchAsYouType === void 0 ? true : _ref_searchAsYouType, _ref_ignoreCompositionEvents = _ref.ignoreCompositionEvents, ignoreCompositionEvents = _ref_ignoreCompositionEvents === void 0 ? false : _ref_ignoreCompositionEvents, _ref_showReset = _ref.showReset, showReset = _ref_showReset === void 0 ? true : _ref_showReset, _ref_showSubmit = _ref.showSubmit, showSubmit = _ref_showSubmit === void 0 ? true : _ref_showSubmit, _ref_showLoadingIndicator = _ref.showLoadingIndicator, showLoadingIndicator = _ref_showLoadingIndicator === void 0 ? true : _ref_showLoadingIndicator, queryHook = _ref.queryHook, tmp1 = _ref.templates, userTemplates = tmp1 === void 0 ? {} : tmp1;
    if (!container) {
        throw new Error(withUsage('The `container` option is required.'));
    }
    var containerNode = getContainerNode(container);
    var cssClasses = {
        root: cx(suit(), userCssClasses.root),
        form: cx(suit({
            descendantName: 'form'
        }), userCssClasses.form),
        input: cx(suit({
            descendantName: 'input'
        }), userCssClasses.input),
        submit: cx(suit({
            descendantName: 'submit'
        }), userCssClasses.submit),
        submitIcon: cx(suit({
            descendantName: 'submitIcon'
        }), userCssClasses.submitIcon),
        reset: cx(suit({
            descendantName: 'reset'
        }), userCssClasses.reset),
        resetIcon: cx(suit({
            descendantName: 'resetIcon'
        }), userCssClasses.resetIcon),
        loadingIndicator: cx(suit({
            descendantName: 'loadingIndicator'
        }), userCssClasses.loadingIndicator),
        loadingIcon: cx(suit({
            descendantName: 'loadingIcon'
        }), userCssClasses.loadingIcon)
    };
    var templates = _({}, defaultTemplate, userTemplates);
    var specializedRenderer = renderer({
        containerNode: containerNode,
        cssClasses: cssClasses,
        placeholder: placeholder,
        templates: templates,
        autofocus: autofocus,
        searchAsYouType: searchAsYouType,
        ignoreCompositionEvents: ignoreCompositionEvents,
        showReset: showReset,
        showSubmit: showSubmit,
        showLoadingIndicator: showLoadingIndicator
    });
    var makeWidget = connectSearchBox(specializedRenderer, function() {
        return render(null, containerNode);
    });
    return _$1(_({}, makeWidget({
        queryHook: queryHook
    })), {
        $$widgetType: 'ais.searchBox'
    });
};

export { searchBox as default };
