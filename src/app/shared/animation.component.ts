import { animate, state, style, transition } from '@angular/animations';
/*
 *This component containes animation definitions. You can add them to the animation-property of your Angular-component.
 *Just set a trigger and pass these fuctions as the definitions-param.
 */

/**
 * Fades new Elements in from the left with increasing opacity starting with opacity=0.
 * Fades deleted Elements out to the right with decreasing opacity
 * @param fadeInStartXPos The relative x-position in px where the fadeIn shall start (default: -100px)
 * @param fadeOutEndXPos The relative x-position in px where the fadeOut shall end (default: 100px)
 * @param duration The animation-duration
 * @returns Returns an array with the state and transition-configurations
 */
export const fadeInOut = (fadeInStartXPos: number = -100, fadeOutEndXPos: number = 100, duration = 300) => {
    return [
        state('in',
            style({
                opacity: 1,
                transform: 'translateX(0)'
            })
        ),
        transition('void => *', [
            style({
                opacity: 0,
                transform: `translateX(${fadeInStartXPos}px)`
            }),
            animate(duration)
        ]),
        transition('* => void', [
            animate(duration),
            style({
                transform: `translateX(${fadeOutEndXPos}px)`,
                opacity: 0
            })
        ])
    ];
};

/**
 * Fades new Elements in from the right with increasing opacity starting with opacity=0
 * @param fadeInStartXPos The relative x-position in px where the fadeIn shall start (default: 200px)
 * @param duration The animation-duration
 * @returns Returns an array with the state and transition-configurations
 */
export const fadeInRight = (fadeInStartXPos: number = 200, duration: number = 300) => {
    return [
        state('in',
            style({
                opacity: 1,
                transform: 'translateX(0)'
            })),
        transition('void => *', [
            style({
                opacity: 0,
                transform: `translateX(${fadeInStartXPos}px)`
            }),
            animate(duration)
        ])
    ];
};
