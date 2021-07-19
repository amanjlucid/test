export class ChartComponentModel {
    settings = {
        selectionEnabled: true
    };
    content = [{
        type: 'column',
        content: [{
            isClosable: true,
            type: 'row',
            content: [{
                type: 'component',
                componentName: 'testComponent',
                componentState: { text: 'Component1' },
                title: 'Component 1',
            }, {
                type: 'component',
                componentName: 'testComponent',
                componentState: { text: 'Component2' },
                title: 'Component 2',
            }]
        }, {
            type: 'row',
            content: [{
                type: 'component',
                componentName: 'testComponent',
                componentState: { text: 'Component3' },
                title: 'Component 3',

            }

            ]
        }]
    }]

}