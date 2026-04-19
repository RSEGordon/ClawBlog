import { _ as _$1 } from '@swc/helpers/esm/_class_call_check.js';
import { _ } from '@swc/helpers/esm/_create_class.js';
import { _ as _$2 } from '@swc/helpers/esm/_define_property.js';
import { _ as _$3 } from '@swc/helpers/esm/_object_spread.js';
import { _ as _$7 } from '@swc/helpers/esm/_object_spread_props.js';
import { _ as _$6 } from '@swc/helpers/esm/_object_without_properties.js';
import { _ as _$5 } from '@swc/helpers/esm/_sliced_to_array.js';
import { _ as _$4 } from '@swc/helpers/esm/_to_consumable_array.js';
import { processStream } from './stream-parser.js';
import { SerialJobExecutor, generateId } from './utils.js';

/**
 * Abstract base class for chat implementations.
 */ var AbstractChat = /*#__PURE__*/ function() {
    function AbstractChat(param) {
        var _this = this;
        var _param_generateId = param.generateId, generateId$1 = _param_generateId === void 0 ? generateId : _param_generateId, _param_id = param.id, id = _param_id === void 0 ? generateId$1() : _param_id, transport = param.transport, state = param.state, onError = param.onError, onToolCall = param.onToolCall, onFinish = param.onFinish, onData = param.onData, sendAutomaticallyWhen = param.sendAutomaticallyWhen;
        var _this1 = this;
        _$1(this, AbstractChat);
        _$2(this, "id", void 0);
        _$2(this, "generateId", void 0);
        _$2(this, "state", void 0);
        _$2(this, "transport", void 0);
        _$2(this, "onError", void 0);
        _$2(this, "onToolCall", void 0);
        _$2(this, "onFinish", void 0);
        _$2(this, "onData", void 0);
        _$2(this, "sendAutomaticallyWhen", void 0);
        _$2(this, "activeResponse", null);
        _$2(this, "jobExecutor", new SerialJobExecutor());
        /**
   * Appends or replaces a user message to the chat list. This triggers the API call to fetch
   * the assistant's response.
   */ _$2(this, "sendMessage", function(message, options) {
            return _this.jobExecutor.run(function() {
                // Build the user message
                var userMessagePromise;
                if (message) {
                    var messageId = message.messageId || _this.generateId();
                    if ('parts' in message && message.parts) {
                        // Full message with parts provided
                        userMessagePromise = Promise.resolve(_$3({
                            id: messageId,
                            role: 'user'
                        }, message));
                    } else if ('text' in message && message.text) {
                        // Build from text
                        var parts = [
                            {
                                type: 'text',
                                text: message.text
                            }
                        ];
                        // Add file parts if provided
                        if (message.files) {
                            userMessagePromise = _this.convertFilesToParts(message.files).then(function(fileParts) {
                                var _parts;
                                (_parts = parts).push.apply(_parts, _$4(fileParts));
                                return {
                                    id: messageId,
                                    role: 'user',
                                    parts: parts,
                                    metadata: message.metadata
                                };
                            });
                        } else {
                            userMessagePromise = Promise.resolve({
                                id: messageId,
                                role: 'user',
                                parts: parts,
                                metadata: message.metadata
                            });
                        }
                    } else if ('files' in message && message.files) {
                        // Files only
                        userMessagePromise = _this.convertFilesToParts(message.files).then(function(fileParts) {
                            return {
                                id: messageId,
                                role: 'user',
                                parts: fileParts,
                                metadata: message.metadata
                            };
                        });
                    } else {
                        userMessagePromise = Promise.resolve(undefined);
                    }
                } else {
                    userMessagePromise = Promise.resolve(undefined);
                }
                return userMessagePromise.then(function(userMessage) {
                    if (userMessage) {
                        _this.state.pushMessage(userMessage);
                    }
                    return _this.makeRequest(_$3({
                        trigger: 'submit-message',
                        messageId: userMessage === null || userMessage === void 0 ? void 0 : userMessage.id
                    }, options));
                });
            });
        });
        /**
   * Regenerate the assistant message with the provided message id.
   * If no message id is provided, the last assistant message will be regenerated.
   */ _$2(this, "regenerate", function() {
            var _0 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : void 0;
            var _ref = [
                _0
            ], _ref1 = _$5(_ref, 1), tmp = _ref1[0], _ref2 = tmp === void 0 ? {} : tmp, messageId = _ref2.messageId, options = _$6(_ref2, [
                "messageId"
            ]);
            return _this1.jobExecutor.run(function() {
                // Find the message to regenerate from
                var targetIndex = -1;
                if (messageId) {
                    targetIndex = _this1.state.messages.findIndex(function(m) {
                        return m.id === messageId;
                    });
                } else {
                    // Find the last assistant message
                    for(var i = _this1.state.messages.length - 1; i >= 0; i--){
                        if (_this1.state.messages[i].role === 'assistant') {
                            targetIndex = i;
                            break;
                        }
                    }
                }
                if (targetIndex >= 0) {
                    // Remove the assistant message and all messages after it
                    _this1.state.messages = _this1.state.messages.slice(0, targetIndex);
                }
                return _this1.makeRequest(_$3({
                    trigger: 'regenerate-message',
                    messageId: messageId
                }, options));
            });
        });
        /**
   * Attempt to resume an ongoing streaming response.
   */ _$2(this, "resumeStream", function(options) {
            return _this.jobExecutor.run(function() {
                if (!_this.transport) {
                    return Promise.reject(new Error('Transport is required for resuming stream. Please provide a transport when initializing the chat.'));
                }
                _this.setStatus({
                    status: 'submitted'
                });
                return _this.transport.reconnectToStream(_$3({
                    chatId: _this.id
                }, options)).then(function(stream) {
                    if (stream) {
                        return _this.processStreamWithCallbacks(stream);
                    } else {
                        _this.setStatus({
                            status: 'ready'
                        });
                        return Promise.resolve();
                    }
                }, function(error) {
                    _this.handleError(error);
                    return Promise.resolve();
                });
            });
        });
        /**
   * Clear the error state and set the status to ready if the chat is in an error state.
   */ _$2(this, "clearError", function() {
            if (_this.state.status === 'error') {
                _this.setStatus({
                    status: 'ready',
                    error: undefined
                });
            }
        });
        /**
   * Add a tool result for a tool call.
   */ _$2(this, "addToolResult", function(param) {
            var tool = param.tool, toolCallId = param.toolCallId, output = param.output;
            return _this.jobExecutor.run(function() {
                // Find the message with this tool call
                var messageIndex = _this.state.messages.findIndex(function(m) {
                    var _ref;
                    var _m_parts;
                    return (_ref = (_m_parts = m.parts) === null || _m_parts === void 0 ? void 0 : _m_parts.some(function(p) {
                        return 'toolCallId' in p && p.toolCallId === toolCallId || 'type' in p && p.type === "tool-".concat(String(tool));
                    })) !== null && _ref !== void 0 ? _ref : false;
                });
                if (messageIndex === -1) return Promise.resolve();
                var message = _this.state.messages[messageIndex];
                var updatedParts = message.parts.map(function(part) {
                    if ('toolCallId' in part && part.toolCallId === toolCallId && 'state' in part) {
                        return _$7(_$3({}, part), {
                            state: 'output-available',
                            output: output
                        });
                    }
                    return part;
                });
                _this.state.replaceMessage(messageIndex, _$7(_$3({}, message), {
                    parts: updatedParts
                }));
                // Check if we should auto-send based on sendAutomaticallyWhen
                if (_this.sendAutomaticallyWhen) {
                    return Promise.resolve(_this.sendAutomaticallyWhen({
                        messages: _this.state.messages
                    })).then(function(shouldSend) {
                        if (shouldSend) {
                            return _this.makeRequest({
                                trigger: 'submit-message'
                            });
                        }
                        return Promise.resolve();
                    });
                }
                return Promise.resolve();
            });
        });
        /**
   * Abort the current request immediately, keep the generated tokens if any.
   */ _$2(this, "stop", function() {
            if (_this.activeResponse) {
                _this.activeResponse.abortController.abort();
                _this.activeResponse = null;
            }
            _this.setStatus({
                status: 'ready'
            });
            return Promise.resolve();
        });
        this.id = id;
        this.generateId = generateId$1;
        this.state = state;
        this.transport = transport;
        this.onError = onError;
        this.onToolCall = onToolCall;
        this.onFinish = onFinish;
        this.onData = onData;
        this.sendAutomaticallyWhen = sendAutomaticallyWhen;
    }
    _(AbstractChat, [
        {
            key: "status",
            get: /**
   * Hook status:
   *
   * - `submitted`: The message has been sent to the API and we're awaiting the start of the response stream.
   * - `streaming`: The response is actively streaming in from the API, receiving chunks of data.
   * - `ready`: The full response has been received and processed; a new user message can be submitted.
   * - `error`: An error occurred during the API request, preventing successful completion.
   */ function get() {
                return this.state.status;
            }
        },
        {
            key: "setStatus",
            value: function setStatus(param) {
                var status = param.status, error = param.error;
                this.state.status = status;
                if (error !== undefined) {
                    this.state.error = error;
                }
            }
        },
        {
            key: "error",
            get: function get() {
                return this.state.error;
            }
        },
        {
            key: "messages",
            get: function get() {
                return this.state.messages;
            },
            set: function set(messages) {
                this.state.messages = messages;
            }
        },
        {
            key: "lastMessage",
            get: function get() {
                return this.state.messages[this.state.messages.length - 1];
            }
        },
        {
            key: "makeRequest",
            value: function makeRequest(options) {
                var _this = this;
                if (!this.transport) {
                    return Promise.reject(new Error('Transport is required for sending messages. Please provide a transport when initializing the chat.'));
                }
                // Abort any existing request
                if (this.activeResponse) {
                    this.activeResponse.abortController.abort();
                }
                var abortController = new AbortController();
                this.activeResponse = {
                    abortController: abortController
                };
                this.setStatus({
                    status: 'submitted'
                });
                return this.transport.sendMessages({
                    chatId: this.id,
                    messages: this.state.messages,
                    abortSignal: abortController.signal,
                    trigger: options.trigger,
                    messageId: options.messageId,
                    headers: options.headers,
                    body: options.body,
                    requestMetadata: options.metadata
                }).then(function(stream) {
                    _this.activeResponse.stream = stream;
                    return _this.processStreamWithCallbacks(stream);
                }, function(error) {
                    if (error.name === 'AbortError') {
                        // Request was aborted, don't treat as error
                        return Promise.resolve();
                    }
                    _this.handleError(error);
                    return Promise.resolve();
                });
            }
        },
        {
            key: "processStreamWithCallbacks",
            value: function processStreamWithCallbacks(stream) {
                var _this = this;
                this.setStatus({
                    status: 'streaming'
                });
                var currentMessageId;
                var currentMessage;
                var currentMessageIndex = -1;
                var isAbort = false;
                var isDisconnect = false;
                var isError = false;
                // Track current text/reasoning part state
                var currentTextPartId;
                var currentReasoningPartId;
                // Promise chain for handling tool calls that return promises
                var pendingToolCall = Promise.resolve();
                return new Promise(function(resolve) {
                    processStream(stream, // eslint-disable-next-line complexity
                    function(chunk) {
                        switch(chunk.type){
                            case 'start':
                                {
                                    currentMessageId = chunk.messageId || _this.generateId();
                                    // Check if we're continuing an existing message or creating a new one
                                    var lastMessage = _this.lastMessage;
                                    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.id === currentMessageId) {
                                        currentMessage = lastMessage;
                                        currentMessageIndex = _this.state.messages.length - 1;
                                    } else {
                                        currentMessage = {
                                            id: currentMessageId,
                                            role: 'assistant',
                                            parts: [],
                                            metadata: chunk.messageMetadata
                                        };
                                        _this.state.pushMessage(currentMessage);
                                        currentMessageIndex = _this.state.messages.length - 1;
                                    }
                                    break;
                                }
                            case 'text-start':
                                {
                                    if (!currentMessage) break;
                                    currentTextPartId = chunk.id;
                                    var textPart = {
                                        type: 'text',
                                        text: '',
                                        state: 'streaming',
                                        providerMetadata: chunk.providerMetadata
                                    };
                                    currentMessage = _$7(_$3({}, currentMessage), {
                                        parts: _$4(currentMessage.parts).concat([
                                            textPart
                                        ])
                                    });
                                    _this.state.replaceMessage(currentMessageIndex, currentMessage);
                                    break;
                                }
                            case 'text-delta':
                                {
                                    if (!currentMessage || !currentTextPartId) break;
                                    var partIndex = currentMessage.parts.findIndex(function(p) {
                                        return p.type === 'text' && p.state === 'streaming';
                                    });
                                    if (partIndex === -1) break;
                                    var updatedParts = _$4(currentMessage.parts);
                                    var textPart1 = updatedParts[partIndex];
                                    updatedParts[partIndex] = _$7(_$3({}, textPart1), {
                                        text: textPart1.text + chunk.delta
                                    });
                                    currentMessage = _$7(_$3({}, currentMessage), {
                                        parts: updatedParts
                                    });
                                    _this.state.replaceMessage(currentMessageIndex, currentMessage);
                                    break;
                                }
                            case 'text-end':
                                {
                                    if (!currentMessage) break;
                                    var partIndex1 = currentMessage.parts.findIndex(function(p) {
                                        return p.type === 'text' && p.state === 'streaming';
                                    });
                                    if (partIndex1 === -1) break;
                                    var updatedParts1 = _$4(currentMessage.parts);
                                    var textPart2 = updatedParts1[partIndex1];
                                    updatedParts1[partIndex1] = _$7(_$3({}, textPart2), {
                                        state: 'done'
                                    });
                                    currentMessage = _$7(_$3({}, currentMessage), {
                                        parts: updatedParts1
                                    });
                                    _this.state.replaceMessage(currentMessageIndex, currentMessage);
                                    currentTextPartId = undefined;
                                    break;
                                }
                            case 'reasoning-start':
                                {
                                    if (!currentMessage) break;
                                    currentReasoningPartId = chunk.id;
                                    var reasoningPart = {
                                        type: 'reasoning',
                                        text: '',
                                        state: 'streaming',
                                        providerMetadata: chunk.providerMetadata
                                    };
                                    currentMessage = _$7(_$3({}, currentMessage), {
                                        parts: _$4(currentMessage.parts).concat([
                                            reasoningPart
                                        ])
                                    });
                                    _this.state.replaceMessage(currentMessageIndex, currentMessage);
                                    break;
                                }
                            case 'reasoning-delta':
                                {
                                    if (!currentMessage || !currentReasoningPartId) break;
                                    var partIndex2 = currentMessage.parts.findIndex(function(p) {
                                        return p.type === 'reasoning' && p.state === 'streaming';
                                    });
                                    if (partIndex2 === -1) break;
                                    var updatedParts2 = _$4(currentMessage.parts);
                                    var reasoningPart1 = updatedParts2[partIndex2];
                                    updatedParts2[partIndex2] = _$7(_$3({}, reasoningPart1), {
                                        text: reasoningPart1.text + chunk.delta
                                    });
                                    currentMessage = _$7(_$3({}, currentMessage), {
                                        parts: updatedParts2
                                    });
                                    _this.state.replaceMessage(currentMessageIndex, currentMessage);
                                    break;
                                }
                            case 'reasoning-end':
                                {
                                    if (!currentMessage) break;
                                    var partIndex3 = currentMessage.parts.findIndex(function(p) {
                                        return p.type === 'reasoning' && p.state === 'streaming';
                                    });
                                    if (partIndex3 === -1) break;
                                    var updatedParts3 = _$4(currentMessage.parts);
                                    var reasoningPart2 = updatedParts3[partIndex3];
                                    updatedParts3[partIndex3] = _$7(_$3({}, reasoningPart2), {
                                        state: 'done'
                                    });
                                    currentMessage = _$7(_$3({}, currentMessage), {
                                        parts: updatedParts3
                                    });
                                    _this.state.replaceMessage(currentMessageIndex, currentMessage);
                                    currentReasoningPartId = undefined;
                                    break;
                                }
                            case 'tool-input-start':
                                {
                                    if (!currentMessage) break;
                                    var toolPart = {
                                        type: "tool-".concat(chunk.toolName),
                                        toolCallId: chunk.toolCallId,
                                        state: 'input-streaming',
                                        input: chunk.input,
                                        providerExecuted: chunk.providerExecuted
                                    };
                                    currentMessage = _$7(_$3({}, currentMessage), {
                                        parts: _$4(currentMessage.parts).concat([
                                            toolPart
                                        ])
                                    });
                                    _this.state.replaceMessage(currentMessageIndex, currentMessage);
                                    break;
                                }
                            case 'tool-input-delta':
                                {
                                    break;
                                }
                            case 'tool-input-available':
                                {
                                    if (!currentMessage) break;
                                    // Find existing tool part or create new one
                                    var existingIndex = currentMessage.parts.findIndex(function(p) {
                                        return 'toolCallId' in p && p.toolCallId === chunk.toolCallId;
                                    });
                                    var toolPart1 = {
                                        type: "tool-".concat(chunk.toolName),
                                        toolCallId: chunk.toolCallId,
                                        state: 'input-available',
                                        input: chunk.input,
                                        callProviderMetadata: chunk.callProviderMetadata,
                                        providerExecuted: chunk.providerExecuted
                                    };
                                    if (existingIndex >= 0) {
                                        var updatedParts4 = _$4(currentMessage.parts);
                                        updatedParts4[existingIndex] = toolPart1;
                                        currentMessage = _$7(_$3({}, currentMessage), {
                                            parts: updatedParts4
                                        });
                                    } else {
                                        currentMessage = _$7(_$3({}, currentMessage), {
                                            parts: _$4(currentMessage.parts).concat([
                                                toolPart1
                                            ])
                                        });
                                    }
                                    _this.state.replaceMessage(currentMessageIndex, currentMessage);
                                    // Trigger onToolCall callback only for client-executed tools
                                    // (server-executed tools have providerExecuted: true and don't need client handling)
                                    if (_this.onToolCall && !chunk.providerExecuted) {
                                        var result = _this.onToolCall({
                                            toolCall: {
                                                toolName: chunk.toolName,
                                                toolCallId: chunk.toolCallId,
                                                input: chunk.input
                                            }
                                        });
                                        if (result && typeof result.then === 'function') {
                                            pendingToolCall = pendingToolCall.then(function() {
                                                return result;
                                            });
                                        }
                                    }
                                    break;
                                }
                            case 'tool-output-available':
                                {
                                    if (!currentMessage) break;
                                    var toolIndex = currentMessage.parts.findIndex(function(p) {
                                        return 'toolCallId' in p && p.toolCallId === chunk.toolCallId;
                                    });
                                    if (toolIndex >= 0) {
                                        var updatedParts5 = _$4(currentMessage.parts);
                                        var existingPart = updatedParts5[toolIndex];
                                        updatedParts5[toolIndex] = _$7(_$3({}, existingPart), {
                                            state: 'output-available',
                                            output: chunk.output,
                                            callProviderMetadata: chunk.callProviderMetadata,
                                            preliminary: chunk.preliminary
                                        });
                                        currentMessage = _$7(_$3({}, currentMessage), {
                                            parts: updatedParts5
                                        });
                                        _this.state.replaceMessage(currentMessageIndex, currentMessage);
                                    }
                                    break;
                                }
                            case 'tool-error':
                                {
                                    if (!currentMessage) break;
                                    var toolIndex1 = currentMessage.parts.findIndex(function(p) {
                                        return 'toolCallId' in p && p.toolCallId === chunk.toolCallId;
                                    });
                                    if (toolIndex1 >= 0) {
                                        var _chunk_input;
                                        var updatedParts6 = _$4(currentMessage.parts);
                                        var existingPart1 = updatedParts6[toolIndex1];
                                        updatedParts6[toolIndex1] = _$7(_$3({}, existingPart1), {
                                            state: 'output-error',
                                            errorText: chunk.errorText,
                                            input: (_chunk_input = chunk.input) !== null && _chunk_input !== void 0 ? _chunk_input : existingPart1.input,
                                            callProviderMetadata: chunk.callProviderMetadata
                                        });
                                        currentMessage = _$7(_$3({}, currentMessage), {
                                            parts: updatedParts6
                                        });
                                        _this.state.replaceMessage(currentMessageIndex, currentMessage);
                                    }
                                    break;
                                }
                            case 'source-url':
                                {
                                    if (!currentMessage) break;
                                    var sourcePart = {
                                        type: 'source-url',
                                        sourceId: chunk.sourceId,
                                        url: chunk.url,
                                        title: chunk.title
                                    };
                                    currentMessage = _$7(_$3({}, currentMessage), {
                                        parts: _$4(currentMessage.parts).concat([
                                            sourcePart
                                        ])
                                    });
                                    _this.state.replaceMessage(currentMessageIndex, currentMessage);
                                    break;
                                }
                            case 'source-document':
                                {
                                    if (!currentMessage) break;
                                    var docPart = {
                                        type: 'source-document',
                                        sourceId: chunk.sourceId,
                                        mediaType: chunk.mediaType,
                                        title: chunk.title,
                                        filename: chunk.filename,
                                        providerMetadata: chunk.providerMetadata
                                    };
                                    currentMessage = _$7(_$3({}, currentMessage), {
                                        parts: _$4(currentMessage.parts).concat([
                                            docPart
                                        ])
                                    });
                                    _this.state.replaceMessage(currentMessageIndex, currentMessage);
                                    break;
                                }
                            case 'file':
                                {
                                    if (!currentMessage) break;
                                    var filePart = {
                                        type: 'file',
                                        url: chunk.url,
                                        mediaType: chunk.mediaType
                                    };
                                    currentMessage = _$7(_$3({}, currentMessage), {
                                        parts: _$4(currentMessage.parts).concat([
                                            filePart
                                        ])
                                    });
                                    _this.state.replaceMessage(currentMessageIndex, currentMessage);
                                    break;
                                }
                            case 'start-step':
                                {
                                    if (!currentMessage) break;
                                    var stepPart = {
                                        type: 'step-start'
                                    };
                                    currentMessage = _$7(_$3({}, currentMessage), {
                                        parts: _$4(currentMessage.parts).concat([
                                            stepPart
                                        ])
                                    });
                                    _this.state.replaceMessage(currentMessageIndex, currentMessage);
                                    break;
                                }
                            case 'message-metadata':
                                {
                                    if (!currentMessage) break;
                                    currentMessage = _$7(_$3({}, currentMessage), {
                                        metadata: chunk.messageMetadata
                                    });
                                    _this.state.replaceMessage(currentMessageIndex, currentMessage);
                                    break;
                                }
                            case 'error':
                                {
                                    isError = true;
                                    throw new Error(chunk.errorText);
                                }
                            case 'abort':
                                {
                                    isAbort = true;
                                    break;
                                }
                            case 'finish':
                                {
                                    if (currentMessage && chunk.messageMetadata !== undefined) {
                                        currentMessage = _$7(_$3({}, currentMessage), {
                                            metadata: chunk.messageMetadata
                                        });
                                        _this.state.replaceMessage(currentMessageIndex, currentMessage);
                                    }
                                    break;
                                }
                            default:
                                {
                                    // Handle data parts (data-*)
                                    var chunkType = chunk.type;
                                    if ((chunkType === null || chunkType === void 0 ? void 0 : chunkType.startsWith('data-')) && currentMessage) {
                                        var dataPart = {
                                            type: chunkType,
                                            id: chunk.id,
                                            data: chunk.data
                                        };
                                        currentMessage = _$7(_$3({}, currentMessage), {
                                            parts: _$4(currentMessage.parts).concat([
                                                dataPart
                                            ])
                                        });
                                        _this.state.replaceMessage(currentMessageIndex, currentMessage);
                                        // Trigger onData callback
                                        if (_this.onData) {
                                            _this.onData(dataPart);
                                        }
                                    }
                                }
                        }
                    }, function() {
                        // Wait for any pending tool calls to complete
                        pendingToolCall.then(function() {
                            // Stream finished successfully
                            _this.setStatus({
                                status: 'ready'
                            });
                            _this.activeResponse = null;
                            // Trigger onFinish callback
                            if (_this.onFinish && currentMessage) {
                                _this.onFinish({
                                    message: currentMessage,
                                    messages: _this.state.messages,
                                    isAbort: isAbort,
                                    isDisconnect: isDisconnect,
                                    isError: isError
                                });
                            }
                            // Note: sendAutomaticallyWhen is only checked in addToolResult,
                            // not here. For server-executed tools, the server continues the
                            // conversation. For client-executed tools, addToolResult handles it.
                            resolve();
                        });
                    }, function(error) {
                        if (error.name === 'AbortError') {
                            isAbort = true;
                            _this.setStatus({
                                status: 'ready'
                            });
                        } else {
                            isDisconnect = true;
                            _this.handleError(error);
                        }
                        // Still call onFinish even on error/abort
                        if (_this.onFinish && currentMessage) {
                            _this.onFinish({
                                message: currentMessage,
                                messages: _this.state.messages,
                                isAbort: isAbort,
                                isDisconnect: isDisconnect,
                                isError: isError
                            });
                        }
                        resolve();
                    });
                });
            }
        },
        {
            key: "handleError",
            value: function handleError(error) {
                this.setStatus({
                    status: 'error',
                    error: error
                });
                if (this.onError) {
                    this.onError(error);
                }
            }
        },
        {
            key: "convertFilesToParts",
            value: function convertFilesToParts(files) {
                var _this, _loop = function(i) {
                    var file = files[i];
                    promises.push(_this.fileToDataUrl(file).then(function(dataUrl) {
                        return {
                            type: 'file',
                            mediaType: file.type,
                            filename: file.name,
                            url: dataUrl
                        };
                    }));
                };
                if (Array.isArray(files)) {
                    return Promise.resolve(files);
                }
                var promises = [];
                for(var i = 0; i < files.length; i++)_this = this, _loop(i);
                return Promise.all(promises);
            }
        },
        {
            key: "fileToDataUrl",
            value: function fileToDataUrl(file) {
                return new Promise(function(resolve, reject) {
                    var reader = new FileReader();
                    reader.onload = function() {
                        return resolve(reader.result);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            }
        }
    ]);
    return AbstractChat;
}();

export { AbstractChat };
