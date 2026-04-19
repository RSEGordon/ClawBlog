/** @jsx createElement */
import type { ComponentChildren, Renderer } from '../../types';
import type { AutocompleteClassNames } from './Autocomplete';
import type { AutocompleteDetachedTranslations } from './AutocompleteDetachedSearchButton';
export type AutocompleteDetachedFormContainerProps = {
    children?: ComponentChildren;
    classNames?: Partial<AutocompleteClassNames>;
    onCancel: () => void;
    translations: AutocompleteDetachedTranslations;
};
export declare function createAutocompleteDetachedFormContainerComponent({ createElement, }: Renderer): (userProps: AutocompleteDetachedFormContainerProps) => JSX.Element;
