export const schema = {
    title: 'Timeline settings',
    type: 'object',
    required: [],
    properties: {
        globalHeader: {
            title: 'Global header HTML template',
            type: 'string',
            default: '',
        },
        template: {
            title: 'HTML item template',
            type: 'string',
            default: '',
        },
        dotTemplate: {
            title: 'HTML dot template',
            type: 'string',
            default: '',
        },
        styles: {
            title: 'CSS Styles',
            type: 'string',
            default: '',
        },
        timeline: {
            title: 'Timeline general settings',
            type: 'object',
            properties: {
                pending: {
                    title: 'Pending conditions',
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                },
                reverse: {
                    title: 'Reverse',
                    type: 'boolean',
                    default: false,
                },
                mode: {
                    title: 'Mode',
                    type: 'string',
                    enum: ['left', 'alternate', 'right'],
                    default: 'left',
                },
            },
        },
    },
};

export const ui = {
    globalHeader: {
        'ui:widget': 'textarea',
    },
    template: {
        'ui:widget': 'textarea',
    },
    dotTemplate: {
        'ui:widget': 'textarea',
    },
    styles: {
        'ui:widget': 'textarea',
    },
};
