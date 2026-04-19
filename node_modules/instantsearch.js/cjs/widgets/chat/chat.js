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
    get RecommendToolType () {
        return _chat.RecommendToolType;
    },
    get SearchIndexToolType () {
        return _chat.SearchIndexToolType;
    },
    get default () {
        return _default;
    }
});
var _define_property = require("@swc/helpers/_/_define_property");
var _interop_require_default = require("@swc/helpers/_/_interop_require_default");
var _object_spread = require("@swc/helpers/_/_object_spread");
var _object_spread_props = require("@swc/helpers/_/_object_spread_props");
var _object_without_properties = require("@swc/helpers/_/_object_without_properties");
var _sliced_to_array = require("@swc/helpers/_/_sliced_to_array");
var _instantsearchuicomponents = require("instantsearch-ui-components");
var _preact = require("preact");
var _hooks = require("preact/hooks");
var _Template = /*#__PURE__*/ _interop_require_default._(require("../../components/Template/Template"));
var _connectChat = /*#__PURE__*/ _interop_require_default._(require("../../connectors/chat/connectChat"));
var _chat = require("../../lib/chat");
var _templating = require("../../lib/templating");
var _useStickToBottom = require("../../lib/useStickToBottom");
var _utils = require("../../lib/utils");
var _templates = require("../../templates");
var withUsage = (0, _utils.createDocumentationMessageGenerator)({
    name: 'chat'
});
var Chat = (0, _instantsearchuicomponents.createChatComponent)({
    createElement: _preact.h,
    Fragment: _preact.Fragment
});
function getDefinedProperties(obj) {
    return Object.fromEntries(Object.entries(obj).filter(function(param) {
        var _param = _sliced_to_array._(param, 2), value = _param[1];
        return value !== undefined;
    }));
}
function createCarouselTool(showViewAll, templates, getSearchPageURL) {
    var Button = (0, _instantsearchuicomponents.createButtonComponent)({
        createElement: _preact.h
    });
    function SearchLayoutComponent(param) {
        var message = param.message, applyFilters = param.applyFilters, onClose = param.onClose;
        var input = message === null || message === void 0 ? void 0 : message.input;
        var output = message === null || message === void 0 ? void 0 : message.output;
        var items = (output === null || output === void 0 ? void 0 : output.hits) || [];
        var MemoedHeaderComponent = (0, _hooks.useMemo)(function() {
            return function(props) {
                return /*#__PURE__*/ (0, _preact.h)(HeaderComponent, _object_spread._({
                    nbHits: output === null || output === void 0 ? void 0 : output.nbHits,
                    input: input,
                    hitsPerPage: items.length,
                    applyFilters: applyFilters,
                    onClose: onClose
                }, props));
            };
        }, [
            items.length,
            input,
            output === null || output === void 0 ? void 0 : output.nbHits,
            applyFilters,
            onClose
        ]);
        return (0, _templates.carousel)({
            showNavigation: false,
            templates: {
                header: MemoedHeaderComponent
            }
        })({
            items: items,
            templates: {
                item: function item(param) {
                    var item = param.item;
                    return /*#__PURE__*/ (0, _preact.h)(_Template.default, {
                        templates: templates,
                        templateKey: "item",
                        data: item,
                        rootTagName: "fragment"
                    });
                }
            },
            sendEvent: function sendEvent() {}
        });
    }
    function HeaderComponent(param) {
        var canScrollLeft = param.canScrollLeft, canScrollRight = param.canScrollRight, scrollLeft = param.scrollLeft, scrollRight = param.scrollRight, nbHits = param.nbHits, input = param.input, hitsPerPage = param.hitsPerPage, applyFilters = param.applyFilters, onClose = param.onClose;
        if ((hitsPerPage !== null && hitsPerPage !== void 0 ? hitsPerPage : 0) < 1) {
            return null;
        }
        return /*#__PURE__*/ (0, _preact.h)("div", {
            className: "ais-ChatToolSearchIndexCarouselHeader"
        }, /*#__PURE__*/ (0, _preact.h)("div", {
            className: "ais-ChatToolSearchIndexCarouselHeaderResults"
        }, nbHits && /*#__PURE__*/ (0, _preact.h)("div", {
            className: "ais-ChatToolSearchIndexCarouselHeaderCount"
        }, hitsPerPage !== null && hitsPerPage !== void 0 ? hitsPerPage : 0, " of ", nbHits.toLocaleString(), " result", nbHits > 1 ? 's' : ''), showViewAll && /*#__PURE__*/ (0, _preact.h)(Button, {
            variant: "ghost",
            size: "sm",
            onClick: function onClick() {
                if (!input || !applyFilters) return;
                var params = applyFilters({
                    query: input.query,
                    facetFilters: input.facet_filters
                });
                if (getSearchPageURL && new URL(getSearchPageURL(params)).pathname !== window.location.pathname) {
                    window.location.href = getSearchPageURL(params);
                }
                onClose();
            },
            className: "ais-ChatToolSearchIndexCarouselHeaderViewAll"
        }, "View all", /*#__PURE__*/ (0, _preact.h)(_instantsearchuicomponents.ArrowRightIcon, {
            createElement: _preact.h
        }))), (hitsPerPage !== null && hitsPerPage !== void 0 ? hitsPerPage : 0) > 2 && /*#__PURE__*/ (0, _preact.h)("div", {
            className: "ais-ChatToolSearchIndexCarouselHeaderScrollButtons"
        }, /*#__PURE__*/ (0, _preact.h)(Button, {
            variant: "outline",
            size: "sm",
            iconOnly: true,
            onClick: scrollLeft,
            disabled: !canScrollLeft,
            className: "ais-ChatToolSearchIndexCarouselHeaderScrollButton"
        }, /*#__PURE__*/ (0, _preact.h)(_instantsearchuicomponents.ChevronLeftIcon, {
            createElement: _preact.h
        })), /*#__PURE__*/ (0, _preact.h)(Button, {
            variant: "outline",
            size: "sm",
            iconOnly: true,
            onClick: scrollRight,
            disabled: !canScrollRight,
            className: "ais-ChatToolSearchIndexCarouselHeaderScrollButton"
        }, /*#__PURE__*/ (0, _preact.h)(_instantsearchuicomponents.ChevronRightIcon, {
            createElement: _preact.h
        }))));
    }
    return {
        templates: {
            layout: SearchLayoutComponent
        }
    };
}
function createDefaultTools(templates, getSearchPageURL) {
    var _obj;
    return _obj = {}, _define_property._(_obj, _chat.SearchIndexToolType, createCarouselTool(true, templates, getSearchPageURL)), _define_property._(_obj, _chat.RecommendToolType, createCarouselTool(false, templates, getSearchPageURL)), _define_property._(_obj, _chat.MemorizeToolType, {
        templates: {}
    }), _define_property._(_obj, _chat.MemorySearchToolType, {
        templates: {}
    }), _define_property._(_obj, _chat.PonderToolType, {
        templates: {}
    }), _obj;
}
function ChatWrapper(param) {
    var layoutComponent = param.layoutComponent, cssClasses = param.cssClasses, chatOpen = param.chatOpen, setChatOpen = param.setChatOpen, chatMessages = param.chatMessages, indexUiState = param.indexUiState, setIndexUiState = param.setIndexUiState, chatStatus = param.chatStatus, chatInput = param.chatInput, setChatInput = param.setChatInput, sendMessage = param.sendMessage, regenerate = param.regenerate, stop = param.stop, error = param.error, isClearing = param.isClearing, clearMessages = param.clearMessages, onClearTransitionEnd = param.onClearTransitionEnd, onFeedback = param.onFeedback, feedbackState = param.feedbackState, toolsForUi = param.toolsForUi, toggleButtonProps = param.toggleButtonProps, headerProps = param.headerProps, messagesProps = param.messagesProps, promptProps = param.promptProps, suggestionsProps = param.suggestionsProps, state = param.state;
    var _useStickToBottom1 = (0, _useStickToBottom.useStickToBottom)({
        initial: 'smooth',
        resize: 'smooth'
    }), scrollRef = _useStickToBottom1.scrollRef, contentRef = _useStickToBottom1.contentRef, scrollToBottom = _useStickToBottom1.scrollToBottom, isAtBottom = _useStickToBottom1.isAtBottom;
    state.init();
    var _state_use = _sliced_to_array._(state.use(false), 2), maximized = _state_use[0], setMaximized = _state_use[1];
    return /*#__PURE__*/ (0, _preact.h)(Chat, {
        layoutComponent: layoutComponent,
        classNames: cssClasses,
        open: chatOpen,
        maximized: maximized,
        sendMessage: sendMessage,
        regenerate: regenerate,
        stop: stop,
        error: error,
        toggleButtonComponent: toggleButtonProps.layoutComponent,
        toggleButtonProps: {
            open: chatOpen,
            onClick: function onClick() {
                return setChatOpen(!chatOpen);
            },
            toggleIconComponent: toggleButtonProps.iconComponent
        },
        headerComponent: headerProps.layoutComponent,
        promptComponent: promptProps.layoutComponent,
        suggestionsComponent: suggestionsProps.suggestionsComponent,
        headerProps: {
            onClose: function onClose() {
                return setChatOpen(false);
            },
            maximized: maximized,
            onToggleMaximize: function onToggleMaximize() {
                return setMaximized(!maximized);
            },
            onClear: clearMessages,
            canClear: Boolean(chatMessages === null || chatMessages === void 0 ? void 0 : chatMessages.length) && !isClearing,
            closeIconComponent: headerProps.closeIconComponent,
            minimizeIconComponent: headerProps.minimizeIconComponent,
            maximizeIconComponent: headerProps.maximizeIconComponent,
            titleIconComponent: headerProps.titleIconComponent,
            translations: headerProps.translations
        },
        messagesProps: {
            status: chatStatus,
            onReload: function onReload(messageId) {
                return regenerate({
                    messageId: messageId
                });
            },
            onClose: function onClose() {
                return setChatOpen(false);
            },
            onFeedback: onFeedback,
            feedbackState: feedbackState,
            messages: chatMessages,
            indexUiState: indexUiState,
            isClearing: isClearing,
            onClearTransitionEnd: onClearTransitionEnd,
            isScrollAtBottom: isAtBottom,
            scrollRef: scrollRef,
            contentRef: contentRef,
            onScrollToBottom: scrollToBottom,
            setIndexUiState: setIndexUiState,
            tools: toolsForUi,
            loaderComponent: messagesProps.loaderComponent,
            errorComponent: messagesProps.errorComponent,
            actionsComponent: messagesProps.actionsComponent,
            assistantMessageProps: messagesProps.assistantMessageProps,
            userMessageProps: messagesProps.userMessageProps,
            translations: messagesProps.translations,
            messageTranslations: messagesProps.messageTranslations
        },
        promptProps: {
            promptRef: promptProps.promptRef,
            status: chatStatus,
            value: chatInput,
            onInput: function onInput(event) {
                setChatInput(event.currentTarget.value);
            },
            onSubmit: function onSubmit() {
                sendMessage({
                    text: chatInput
                });
                setChatInput('');
            },
            onStop: function onStop() {
                stop();
            },
            headerComponent: promptProps.headerComponent,
            footerComponent: promptProps.footerComponent,
            translations: promptProps.translations
        },
        suggestionsProps: {
            onSuggestionClick: suggestionsProps.onSuggestionClick,
            suggestions: suggestionsProps.suggestions
        }
    });
}
var createRenderer = function createRenderer(param) {
    var renderState = param.renderState, cssClasses = param.cssClasses, containerNode = param.containerNode, templates = param.templates, tools = param.tools;
    var state = createLocalState();
    var promptRef = {
        current: null
    };
    var wasOpen = false;
    // eslint-disable-next-line complexity
    return function(props, isFirstRendering) {
        var _templates_header, _templates_header1, _templates_header2, _templates_header3, _templates_header4, _templates_header5, _templates_header6, _templates_header7, _templates_header8, _templates_header9, _templates_messages, _templates_messages1, _templates_messages2, _templates_messages3, _templates_messages4, _templates_messages5, _templates_assistantMessage, _templates_assistantMessage1, _templates_message, _templates_message1, _templates_userMessage, _templates_userMessage1, _templates_prompt, _templates_prompt1, _templates_prompt2, _templates_prompt3, _templates_prompt4, _templates_prompt5, _templates_prompt6, _templates_prompt7, _templates_prompt8, _templates_toggleButton, _templates_toggleButton1;
        var indexUiState = props.indexUiState, input = props.input, instantSearchInstance = props.instantSearchInstance, messages = props.messages, open = props.open, sendMessage = props.sendMessage, setIndexUiState = props.setIndexUiState, setInput = props.setInput, setOpen = props.setOpen, status = props.status, error = props.error, regenerate = props.regenerate, stop = props.stop, isClearing = props.isClearing, clearMessages = props.clearMessages, onClearTransitionEnd = props.onClearTransitionEnd, toolsFromConnector = props.tools, suggestions = props.suggestions, onFeedback = props.sendChatMessageFeedback, feedbackState = props.feedbackState;
        if (isFirstRendering) {
            renderState.templateProps = (0, _templating.prepareTemplateProps)({
                defaultTemplates: {},
                templatesConfig: instantSearchInstance.templatesConfig,
                templates: templates
            });
            return;
        }
        var toolsForUi = {};
        Object.entries(toolsFromConnector).forEach(function(param) {
            var _param = _sliced_to_array._(param, 2), key = _param[0], connectorTool = _param[1];
            var _widgetTool_templates;
            var widgetTool = tools[key];
            // Compatibility shim with Algolia MCP Server search tool
            if (!widgetTool && key.startsWith("".concat(_chat.SearchIndexToolType, "_"))) {
                widgetTool = tools[_chat.SearchIndexToolType];
            }
            toolsForUi[key] = _object_spread._({}, connectorTool, (widgetTool === null || widgetTool === void 0 ? void 0 : (_widgetTool_templates = widgetTool.templates) === null || _widgetTool_templates === void 0 ? void 0 : _widgetTool_templates.layout) && {
                layoutComponent: function layoutComponent(layoutComponentProps) {
                    return /*#__PURE__*/ (0, _preact.h)(_Template.default, {
                        templates: widgetTool.templates,
                        rootTagName: "fragment",
                        templateKey: "layout",
                        data: layoutComponentProps
                    });
                }
            });
        });
        var headerTemplateProps = (0, _templating.prepareTemplateProps)({
            defaultTemplates: {},
            templatesConfig: instantSearchInstance.templatesConfig,
            templates: templates.header
        });
        var headerLayoutComponent = ((_templates_header = templates.header) === null || _templates_header === void 0 ? void 0 : _templates_header.layout) ? function(headerProps) {
            return /*#__PURE__*/ (0, _preact.h)(_Template.default, _object_spread_props._(_object_spread._({}, headerTemplateProps), {
                templateKey: "layout",
                rootTagName: "div",
                data: headerProps
            }));
        } : undefined;
        var headerCloseIconComponent = ((_templates_header1 = templates.header) === null || _templates_header1 === void 0 ? void 0 : _templates_header1.closeIcon) ? function() {
            return /*#__PURE__*/ (0, _preact.h)(_Template.default, _object_spread_props._(_object_spread._({}, headerTemplateProps), {
                templateKey: "closeIcon",
                rootTagName: "span"
            }));
        } : undefined;
        var headerMinimizeIconComponent = ((_templates_header2 = templates.header) === null || _templates_header2 === void 0 ? void 0 : _templates_header2.minimizeIcon) ? function() {
            return /*#__PURE__*/ (0, _preact.h)(_Template.default, _object_spread_props._(_object_spread._({}, headerTemplateProps), {
                templateKey: "minimizeIcon",
                rootTagName: "span"
            }));
        } : undefined;
        var headerMaximizeIconComponent = ((_templates_header3 = templates.header) === null || _templates_header3 === void 0 ? void 0 : _templates_header3.maximizeIcon) ? function(param) {
            var maximized = param.maximized;
            return /*#__PURE__*/ (0, _preact.h)(_Template.default, _object_spread_props._(_object_spread._({}, headerTemplateProps), {
                templateKey: "maximizeIcon",
                rootTagName: "span",
                data: {
                    maximized: maximized
                }
            }));
        } : undefined;
        var headerTitleIconComponent = ((_templates_header4 = templates.header) === null || _templates_header4 === void 0 ? void 0 : _templates_header4.titleIcon) ? function() {
            return /*#__PURE__*/ (0, _preact.h)(_Template.default, _object_spread_props._(_object_spread._({}, headerTemplateProps), {
                templateKey: "titleIcon",
                rootTagName: "span"
            }));
        } : undefined;
        var headerTranslations = getDefinedProperties({
            title: (_templates_header5 = templates.header) === null || _templates_header5 === void 0 ? void 0 : _templates_header5.titleText,
            minimizeLabel: (_templates_header6 = templates.header) === null || _templates_header6 === void 0 ? void 0 : _templates_header6.minimizeLabelText,
            maximizeLabel: (_templates_header7 = templates.header) === null || _templates_header7 === void 0 ? void 0 : _templates_header7.maximizeLabelText,
            closeLabel: (_templates_header8 = templates.header) === null || _templates_header8 === void 0 ? void 0 : _templates_header8.closeLabelText,
            clearLabel: (_templates_header9 = templates.header) === null || _templates_header9 === void 0 ? void 0 : _templates_header9.clearLabelText
        });
        var messagesTemplateProps = (0, _templating.prepareTemplateProps)({
            defaultTemplates: {},
            templatesConfig: instantSearchInstance.templatesConfig,
            templates: templates.messages
        });
        var messagesLoaderComponent = ((_templates_messages = templates.messages) === null || _templates_messages === void 0 ? void 0 : _templates_messages.loader) ? function(loaderProps) {
            return /*#__PURE__*/ (0, _preact.h)(_Template.default, _object_spread_props._(_object_spread._({}, messagesTemplateProps), {
                templateKey: "loader",
                rootTagName: "div",
                data: loaderProps
            }));
        } : undefined;
        var messagesErrorComponent = ((_templates_messages1 = templates.messages) === null || _templates_messages1 === void 0 ? void 0 : _templates_messages1.error) ? function(errorProps) {
            return /*#__PURE__*/ (0, _preact.h)(_Template.default, _object_spread_props._(_object_spread._({}, messagesTemplateProps), {
                templateKey: "error",
                rootTagName: "div",
                data: errorProps
            }));
        } : undefined;
        var messagesTranslations = getDefinedProperties({
            scrollToBottomLabel: (_templates_messages2 = templates.messages) === null || _templates_messages2 === void 0 ? void 0 : _templates_messages2.scrollToBottomLabelText,
            loaderText: (_templates_messages3 = templates.messages) === null || _templates_messages3 === void 0 ? void 0 : _templates_messages3.loaderText,
            copyToClipboardLabel: (_templates_messages4 = templates.messages) === null || _templates_messages4 === void 0 ? void 0 : _templates_messages4.copyToClipboardLabelText,
            regenerateLabel: (_templates_messages5 = templates.messages) === null || _templates_messages5 === void 0 ? void 0 : _templates_messages5.regenerateLabelText
        });
        var assistantMessageTemplateProps = (0, _templating.prepareTemplateProps)({
            defaultTemplates: {},
            templatesConfig: instantSearchInstance.templatesConfig,
            templates: templates.assistantMessage
        });
        var assistantMessageLeadingComponent = ((_templates_assistantMessage = templates.assistantMessage) === null || _templates_assistantMessage === void 0 ? void 0 : _templates_assistantMessage.leading) ? function() {
            return /*#__PURE__*/ (0, _preact.h)(_Template.default, _object_spread_props._(_object_spread._({}, assistantMessageTemplateProps), {
                templateKey: "leading",
                rootTagName: "fragment"
            }));
        } : undefined;
        var assistantMessageFooterComponent = ((_templates_assistantMessage1 = templates.assistantMessage) === null || _templates_assistantMessage1 === void 0 ? void 0 : _templates_assistantMessage1.footer) ? function() {
            return /*#__PURE__*/ (0, _preact.h)(_Template.default, _object_spread_props._(_object_spread._({}, assistantMessageTemplateProps), {
                templateKey: "footer",
                rootTagName: "fragment"
            }));
        } : undefined;
        var messageTranslations = getDefinedProperties({
            actionsLabel: (_templates_message = templates.message) === null || _templates_message === void 0 ? void 0 : _templates_message.actionsLabelText,
            messageLabel: (_templates_message1 = templates.message) === null || _templates_message1 === void 0 ? void 0 : _templates_message1.messageLabelText
        });
        var userMessageTemplateProps = (0, _templating.prepareTemplateProps)({
            defaultTemplates: {},
            templatesConfig: instantSearchInstance.templatesConfig,
            templates: templates.userMessage
        });
        var userMessageLeadingComponent = ((_templates_userMessage = templates.userMessage) === null || _templates_userMessage === void 0 ? void 0 : _templates_userMessage.leading) ? function() {
            return /*#__PURE__*/ (0, _preact.h)(_Template.default, _object_spread_props._(_object_spread._({}, userMessageTemplateProps), {
                templateKey: "leading",
                rootTagName: "fragment"
            }));
        } : undefined;
        var userMessageFooterComponent = ((_templates_userMessage1 = templates.userMessage) === null || _templates_userMessage1 === void 0 ? void 0 : _templates_userMessage1.footer) ? function() {
            return /*#__PURE__*/ (0, _preact.h)(_Template.default, _object_spread_props._(_object_spread._({}, userMessageTemplateProps), {
                templateKey: "footer",
                rootTagName: "fragment"
            }));
        } : undefined;
        var promptTemplateProps = (0, _templating.prepareTemplateProps)({
            defaultTemplates: {},
            templatesConfig: instantSearchInstance.templatesConfig,
            templates: templates.prompt
        });
        var promptLayoutComponent = ((_templates_prompt = templates.prompt) === null || _templates_prompt === void 0 ? void 0 : _templates_prompt.layout) ? function(promptProps) {
            return /*#__PURE__*/ (0, _preact.h)(_Template.default, _object_spread_props._(_object_spread._({}, promptTemplateProps), {
                templateKey: "layout",
                rootTagName: "div",
                data: promptProps
            }));
        } : undefined;
        var promptHeaderComponent = ((_templates_prompt1 = templates.prompt) === null || _templates_prompt1 === void 0 ? void 0 : _templates_prompt1.header) ? function() {
            return /*#__PURE__*/ (0, _preact.h)(_Template.default, _object_spread_props._(_object_spread._({}, promptTemplateProps), {
                templateKey: "header",
                rootTagName: "fragment"
            }));
        } : undefined;
        var promptFooterComponent = ((_templates_prompt2 = templates.prompt) === null || _templates_prompt2 === void 0 ? void 0 : _templates_prompt2.footer) ? function() {
            return /*#__PURE__*/ (0, _preact.h)(_Template.default, _object_spread_props._(_object_spread._({}, promptTemplateProps), {
                templateKey: "footer",
                rootTagName: "fragment"
            }));
        } : undefined;
        var promptTranslations = getDefinedProperties({
            textareaLabel: (_templates_prompt3 = templates.prompt) === null || _templates_prompt3 === void 0 ? void 0 : _templates_prompt3.textareaLabelText,
            textareaPlaceholder: (_templates_prompt4 = templates.prompt) === null || _templates_prompt4 === void 0 ? void 0 : _templates_prompt4.textareaPlaceholderText,
            emptyMessageTooltip: (_templates_prompt5 = templates.prompt) === null || _templates_prompt5 === void 0 ? void 0 : _templates_prompt5.emptyMessageTooltipText,
            stopResponseTooltip: (_templates_prompt6 = templates.prompt) === null || _templates_prompt6 === void 0 ? void 0 : _templates_prompt6.stopResponseTooltipText,
            sendMessageTooltip: (_templates_prompt7 = templates.prompt) === null || _templates_prompt7 === void 0 ? void 0 : _templates_prompt7.sendMessageTooltipText,
            disclaimer: (_templates_prompt8 = templates.prompt) === null || _templates_prompt8 === void 0 ? void 0 : _templates_prompt8.disclaimerText
        });
        var actionsComponent = templates.actions ? function(actionsProps) {
            return /*#__PURE__*/ (0, _preact.h)(_Template.default, _object_spread_props._(_object_spread._({}, renderState.templateProps), {
                templateKey: "actions",
                rootTagName: "div",
                data: actionsProps
            }));
        } : undefined;
        var toggleButtonTemplateProps = (0, _templating.prepareTemplateProps)({
            defaultTemplates: {},
            templatesConfig: instantSearchInstance.templatesConfig,
            templates: templates.toggleButton
        });
        var toggleButtonLayoutComponent = ((_templates_toggleButton = templates.toggleButton) === null || _templates_toggleButton === void 0 ? void 0 : _templates_toggleButton.layout) ? function(toggleButtonProps) {
            return /*#__PURE__*/ (0, _preact.h)(_Template.default, _object_spread_props._(_object_spread._({}, toggleButtonTemplateProps), {
                templateKey: "layout",
                rootTagName: "button",
                data: toggleButtonProps
            }));
        } : undefined;
        var toggleButtonIconComponent = ((_templates_toggleButton1 = templates.toggleButton) === null || _templates_toggleButton1 === void 0 ? void 0 : _templates_toggleButton1.icon) ? function(param) {
            var isOpen = param.isOpen;
            return /*#__PURE__*/ (0, _preact.h)(_Template.default, _object_spread_props._(_object_spread._({}, toggleButtonTemplateProps), {
                templateKey: "icon",
                rootTagName: "span",
                data: {
                    isOpen: isOpen
                }
            }));
        } : undefined;
        var suggestionsComponent = templates.suggestions ? function(suggestionsProps) {
            return /*#__PURE__*/ (0, _preact.h)(_Template.default, _object_spread_props._(_object_spread._({}, renderState.templateProps), {
                templateKey: "suggestions",
                rootTagName: "fragment",
                data: suggestionsProps
            }));
        } : undefined;
        var layoutTemplateProps = (0, _templating.prepareTemplateProps)({
            defaultTemplates: {},
            templatesConfig: instantSearchInstance.templatesConfig,
            templates: {
                layout: templates.layout
            }
        });
        var layoutComponent = templates.layout ? function(layoutProps) {
            var headerComponent = layoutProps.headerComponent, messagesComponent = layoutProps.messagesComponent, promptComponent = layoutProps.promptComponent, toggleButtonComponent = layoutProps.toggleButtonComponent, restLayoutProps = _object_without_properties._(layoutProps, [
                "headerComponent",
                "messagesComponent",
                "promptComponent",
                "toggleButtonComponent"
            ]);
            return /*#__PURE__*/ (0, _preact.h)(_Template.default, _object_spread_props._(_object_spread._({}, layoutTemplateProps), {
                templateKey: "layout",
                rootTagName: "fragment",
                data: _object_spread_props._(_object_spread._({}, restLayoutProps), {
                    templates: {
                        header: function header() {
                            return headerComponent;
                        },
                        messages: function messages() {
                            return messagesComponent;
                        },
                        prompt: function prompt() {
                            return promptComponent;
                        },
                        toggleButton: function toggleButton() {
                            return toggleButtonComponent;
                        }
                    }
                })
            }));
        } : undefined;
        state.subscribe(rerender);
        function rerender() {
            (0, _preact.render)(/*#__PURE__*/ (0, _preact.h)(ChatWrapper, {
                layoutComponent: layoutComponent,
                cssClasses: cssClasses,
                chatOpen: open,
                setChatOpen: setOpen,
                chatMessages: messages,
                indexUiState: indexUiState,
                setIndexUiState: setIndexUiState,
                chatStatus: status,
                chatInput: input,
                setChatInput: setInput,
                sendMessage: sendMessage,
                regenerate: regenerate,
                stop: stop,
                error: error,
                isClearing: isClearing,
                clearMessages: clearMessages,
                onClearTransitionEnd: onClearTransitionEnd,
                onFeedback: onFeedback,
                feedbackState: feedbackState,
                toolsForUi: toolsForUi,
                toggleButtonProps: {
                    layoutComponent: toggleButtonLayoutComponent,
                    iconComponent: toggleButtonIconComponent
                },
                headerProps: {
                    layoutComponent: headerLayoutComponent,
                    closeIconComponent: headerCloseIconComponent,
                    minimizeIconComponent: headerMinimizeIconComponent,
                    maximizeIconComponent: headerMaximizeIconComponent,
                    titleIconComponent: headerTitleIconComponent,
                    translations: headerTranslations
                },
                messagesProps: {
                    loaderComponent: messagesLoaderComponent,
                    errorComponent: messagesErrorComponent,
                    actionsComponent: actionsComponent,
                    assistantMessageProps: {
                        leadingComponent: assistantMessageLeadingComponent,
                        footerComponent: assistantMessageFooterComponent
                    },
                    userMessageProps: {
                        leadingComponent: userMessageLeadingComponent,
                        footerComponent: userMessageFooterComponent
                    },
                    translations: messagesTranslations,
                    messageTranslations: messageTranslations
                },
                promptProps: {
                    layoutComponent: promptLayoutComponent,
                    headerComponent: promptHeaderComponent,
                    footerComponent: promptFooterComponent,
                    translations: promptTranslations,
                    promptRef: promptRef
                },
                state: state,
                suggestionsProps: {
                    suggestions: suggestions,
                    onSuggestionClick: function onSuggestionClick(message) {
                        sendMessage({
                            text: message
                        });
                    },
                    suggestionsComponent: suggestionsComponent
                }
            }), containerNode);
        }
        var shouldFocusPrompt = !wasOpen && open;
        rerender();
        if (shouldFocusPrompt) {
            window.requestAnimationFrame(function() {
                var _promptRef_current;
                (_promptRef_current = promptRef.current) === null || _promptRef_current === void 0 ? void 0 : _promptRef_current.focus();
            });
        }
        wasOpen = open;
    };
};
var defaultTemplates = {
    item: function item(item) {
        return JSON.stringify(item, null, 2);
    }
};
var _default = function chat(widgetParams) {
    var _ref = widgetParams || {}, container = _ref.container, tmp = _ref.templates, userTemplates = tmp === void 0 ? {} : tmp, _ref_cssClasses = _ref.cssClasses, cssClasses = _ref_cssClasses === void 0 ? {} : _ref_cssClasses, _ref_resume = _ref.resume, resume = _ref_resume === void 0 ? false : _ref_resume, userTools = _ref.tools, getSearchPageURL = _ref.getSearchPageURL, options = _object_without_properties._(_ref, [
        "container",
        "templates",
        "cssClasses",
        "resume",
        "tools",
        "getSearchPageURL"
    ]);
    if (!container) {
        throw new Error(withUsage('The `container` option is required.'));
    }
    var containerNode = (0, _utils.getContainerNode)(container);
    var templates = _object_spread._({}, defaultTemplates, userTemplates);
    var defaultTools = createDefaultTools(templates, getSearchPageURL);
    var tools = _object_spread._({}, defaultTools, userTools);
    var specializedRenderer = createRenderer({
        containerNode: containerNode,
        cssClasses: cssClasses,
        renderState: {},
        templates: templates,
        tools: tools
    });
    var makeWidget = (0, _connectChat.default)(specializedRenderer, function() {
        return (0, _preact.render)(null, containerNode);
    });
    return _object_spread_props._(_object_spread._({}, makeWidget(_object_spread._({
        resume: resume,
        tools: tools
    }, options))), {
        $$widgetType: 'ais.chat'
    });
};
function createLocalState() {
    var state = [];
    var subscriptions = new Set();
    var cursor = 0;
    function use(initialValue) {
        var index = cursor++;
        if (state[index] === undefined) {
            state[index] = initialValue;
        }
        return [
            state[index],
            function(value) {
                var prev = state[index];
                if (prev === value) {
                    return prev;
                }
                state[index] = value;
                subscriptions.forEach(function(fn) {
                    return fn();
                });
                return value;
            }
        ];
    }
    return {
        init: function init() {
            cursor = 0;
        },
        subscribe: function subscribe(fn) {
            subscriptions.add(fn);
            return function() {
                return subscriptions.delete(fn);
            };
        },
        use: use
    };
}
