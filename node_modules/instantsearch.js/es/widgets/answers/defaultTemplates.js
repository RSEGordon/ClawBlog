var defaultTemplates = {
    header: function header() {
        return '';
    },
    loader: function loader() {
        return '';
    },
    item: function item(item) {
        return JSON.stringify(item);
    }
};

export { defaultTemplates as default };
