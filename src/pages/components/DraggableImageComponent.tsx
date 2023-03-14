import React, {useState} from 'react';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import {PanGestureHandler} from "react-native-gesture-handler";
import {StyleSheet} from "react-native";

interface IPosition { x?: number, y?: number };

const imageWidthHeight = 120;

export default function DraggableImageComponent({imageItem, index, uiPositions, swapCandidateIndex, swapItems}) {
    const [isDragActive, setIsDragActive] = useState(false);
    const [isSwapCandidate, setIsSwapCandidate] = useState(false);

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const exactCoordinates = useSharedValue(uiPositions[index]);

    // Animate Swap Candidate
    useAnimatedReaction(
        () => swapCandidateIndex.value,
        (current, previous) => {
            if (previous !== null && current !== previous) {
                if(!isSwapCandidate && swapCandidateIndex.value == index) {
                    runOnJS(setIsSwapCandidate)(true);
                } else if(isSwapCandidate) {
                    runOnJS(setIsSwapCandidate)(false);
                }
            }}
    ), [isSwapCandidate];

    //Detect intersection with others during Drag operation and set Swap candidate
    function detectIntersection(){
        'worklet';

        const movingCoordinateX = exactCoordinates.value.x + translateX.value;
        const movingCoordinateY = exactCoordinates.value.y + translateY.value;

        for (const [key, value] of Object.entries(uiPositions)) {
            if(key == index) {
                continue;
            }
            const {x, y} : IPosition = value;
            const xMin = x - (imageWidthHeight / 2);
            const xMax = x + (imageWidthHeight / 2);
            const yMin = y - (imageWidthHeight / 2);
            const yMax = y + (imageWidthHeight / 2);

            if(movingCoordinateX >= xMin && movingCoordinateX <= xMax && movingCoordinateY >= yMin && movingCoordinateY <= yMax) {
                swapCandidateIndex.value = key;
            } else if(swapCandidateIndex.value == key) {
                swapCandidateIndex.value = -1;
            }
        }
    };

    const panGestureEvent = useAnimatedGestureHandler({
        onStart: (event, context: any) => {
            runOnJS(setIsDragActive)(true);
            context.translateX = translateX.value;
            context.translateY = translateY.value;
        },
        onActive: (event, context) => {
            translateX.value = event.translationX + context.translateX;
            translateY.value = event.translationY + context.translateY;

            detectIntersection();
        },
        onFinish:  (event, context) => {
            runOnJS(setIsDragActive)(false);
        },
        onEnd: (event, context) => {
            if(swapCandidateIndex.value > -1) {
                runOnJS(swapItems)(index, swapCandidateIndex.value);
                swapCandidateIndex.value = -1;
                translateX.value = withTiming(0, {duration: 840, easing: Easing.inOut(Easing.circle)});
                translateY.value = withTiming(0, {duration: 840, easing: Easing.inOut(Easing.linear)});
            } else {
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
            }
        },
    });

    const rStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: translateX.value,
                },
                {
                    translateY: translateY.value,
                },
            ],
            shadowColor: isDragActive ? 'blue' : isSwapCandidate ? 'red' : 'black',
            shadowRadius: 16,
            shadowOpacity: withSpring(isDragActive || isSwapCandidate ? 0.8 : 0),
            opacity: withSpring(isSwapCandidate ? 0.4 : 1),
            shadow: {
                elevation: 5
            },
        };
    }, [isDragActive, isSwapCandidate]);

    return (
        <Animated.View style={[rStyle, {width: '100%', alignItems: 'center', zIndex: isDragActive ? 1 : 0}]}>
            <PanGestureHandler onGestureEvent={panGestureEvent}>
                <Animated.Image source={imageItem} style={styles.imageItem} />
            </PanGestureHandler>
        </Animated.View>

    )
}

const styles = StyleSheet.create({
    imageItem: {
        width: imageWidthHeight,
        height: imageWidthHeight,
    },
});