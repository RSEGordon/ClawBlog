import { omit } from '../../lib/utils/omit.js';

var defaultTemplates = {
    empty: function empty() {
        return 'No results';
    },
    item: function item(data) {
        return JSON.stringify(omit(data, [
            '__hitIndex'
        ]), null, 2);
    }
};

export { defaultTemplates as default };
