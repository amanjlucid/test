export class ChartComponentModel {
    settings = {
        selectionEnabled: true,
        responsiveMode: 'onload',
        constrainDragToContainer: true,
    };
    labels = {
        popout: 'open in new window',
        popin: 'pop in'
    };
    // dimensions = {
    //     dragProxyWidth: 600,
    //     dragProxyHeight: 200,
    //     minItemHeight: 400,
    // };
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
        },
        {
            type: 'row',
            content: [{
                isClosable:false,
                height: 30,
                type: 'component',
                componentName: 'testComponent',
                componentState: { text: 'Component5' },
                title: '',
            }

            ]
        }]
    }]

}