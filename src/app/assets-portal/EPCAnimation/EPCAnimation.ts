import {
    animate,
    state,
    style,
    transition,
    trigger,
    AnimationTriggerMetadata,
    group,
    keyframes
  } from '@angular/animations';
  
  export const EPCProgressIndicatorAnimation: {

    readonly bounce: AnimationTriggerMetadata,
    readonly noRatingbounce: AnimationTriggerMetadata,
  } = 
  {
    bounce: trigger('bounce', [
      state('show', style({
        opacity: 1,
        transform:'translateY({{ YValue }}px) scale(1)'
      }), { params: { YValue: 0 }}),
      state('hide',   style({
        opacity: 0
      })),

      transition('hide => show', [
        group([
          animate('3.0s {{ Delay }}s ease-in-out', keyframes([
            style({ transform: 'scale(0,0) translateY(0)'}),
            style({ transform: 'scale(0.8,0.8) translateY(0)'}),
            style({ transform: 'scale(1,0.45) translateY(10px)'}),
            style({ transform: 'scale(0.55, 1.0) translateY({{ YValue1 }}px)' }),
            style({ transform: 'scale(1.00, 0.55) translateY({{ YValue2 }}px)' }),
            style({ transform: 'scale(0.65, 1.0) translateY({{ YValue3 }}px)' }),     
            style({ transform: 'scale(1,0.75) translateY({{ YValue4 }}px)' }),
            style({ transform: 'scale(0.85,1) translateY({{ YValue5 }}px)' }),
            style({ transform: 'scale(1,0.95) translateY({{ YValue6 }}px)' }),
            style({ transform: 'scale(0.95,1) translateY({{ YValue5 }}px)' }),
            style({ transform: 'scale(1,1) translateY({{ YValue6 }}px)' }),
            style({ transform: 'scale(1,1) translateY({{ YValue }}px)' }), 
          ])),
        animate('1s {{ Delay }}s ease-out', style({
          opacity: 1
          }))
         ])
        ], { params: { YValue: 0, YValue1: 0, YValue2: 0, YValue3: 0, YValue4: 0, YValue5: 0, YValue6: 0, Delay: 0 } }
        )
      ]),

      noRatingbounce: trigger('noRatingbounce', [
        state('show', style({
          opacity: 1,
        }), { params: { YValue: 0 }}),
        state('hide',   style({
          opacity: 0
        })),
  
        transition('hide => show', [
          group([
          animate('2s {{ Delay }}s ease-out', style({
            opacity: 1
            }))
           ])
          ], { params: { YValue: 0, YValue1: 0, YValue2: 0, YValue3: 0, YValue4: 0, YValue5: 0, YValue6: 0, Delay: 0 } }
          )
        ])
      };


   

/*    {
    fill: trigger('fill', [
        state('*', style({ transform: "translateY({{ percentage }}px)"}), { params: { percentage: 0 } }),
        transition('* <=> *', animate(1000))

    ])

  };  */