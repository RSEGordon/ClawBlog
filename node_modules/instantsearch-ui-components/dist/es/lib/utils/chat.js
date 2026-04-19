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

export { getTextContent, hasTextContent, isPartText };
