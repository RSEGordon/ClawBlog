import type { ChatMessageBase } from '../../components';
export declare const getTextContent: (message: ChatMessageBase) => string;
export declare const hasTextContent: (message: ChatMessageBase) => boolean;
export declare const isPartText: (part: ChatMessageBase["parts"][number]) => part is Extract<ChatMessageBase["parts"][number], {
    type: "text";
}>;
