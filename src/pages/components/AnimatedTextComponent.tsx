import React, {useCallback, useEffect, useMemo, useState} from "react";
import {
    useFont,
    useSharedValueEffect,
    useValue,
    Text as SkiaText,
} from "@shopify/react-native-skia";
import {Easing, useSharedValue, withTiming} from "react-native-reanimated";
import {Dimensions} from "react-native";

export default function AnimatedTextComponent({char, index, text, shouldDelete}) {
    const allowedCanvasWidth = Dimensions.get('window').width - 20;
    const fontSize = 40 - (Math.floor(text.length / 1.5)); // auto adjust font size
    const font = useFont(require("../../../assets/Roboto-Medium.ttf"), fontSize);
    const charDistance = (fontSize / 8) * 5;
    const yOrigin = 30;
    const yOriginAdd = 40;
    const animationDurationX = 160;

    const totalWidthNeeded = useMemo(
        () => {
            const numberOfNonNumeric = text.replace(/[0-9]/g, '').length;
            const numberOfNums = text.length - numberOfNonNumeric;
            return numberOfNonNumeric * (charDistance / 2) + numberOfNums * charDistance;
        }
        , [text]
    );

    const xPosition = useMemo(
        () => {
            const initialPositionX = ((allowedCanvasWidth - totalWidthNeeded) / 2) - (charDistance / 2);
            return Math.max(initialPositionX + ((index + 1) * charDistance) - (text.slice(0, index).replace(/[0-9]/g, '').length) * (charDistance / 2), initialPositionX);
        }
        , [text]
    );

    const fromY = useValue(0);
    const fromX = useValue(xPosition);
    const fromOpacity = useValue(1);
    const sharedFromY = useSharedValue(yOrigin + yOriginAdd);
    const sharedFromX = useSharedValue(xPosition);
    const sharedFromOpacity = useSharedValue(1);

    const [prevText, setPrevText] = useState('');
    const [prevXPosition, setPrevXPosition] = useState(xPosition);

    const triggerAnimation = useCallback((toValue, duration, cbFunc?) => withTiming(
        toValue,
        {
            duration: duration,
            easing: Easing.linear
        },
        () => cbFunc && cbFunc()
    ), []);

    useEffect(() => { //decides and plays for required animation
        const fromY = yOrigin;
        let toY = yOrigin;
        const fromX = prevXPosition;
        const toX = xPosition;
        let animationDurationY = 0;

        if ((index === 0 && text.length === 1 && !shouldDelete && prevText.length <= text.length)
            || (prevText.length < text.length
                && (index + 1 === text.length
                    || (text.lastIndexOf(",") === index && text.split(",").length > prevText.split(",").length)))) {
            animationDurationY = 400;
            sharedFromY.value = fromY + yOriginAdd;
            sharedFromX.value = fromX;
            sharedFromOpacity.value = 0;
            sharedFromOpacity.value = triggerAnimation(1, animationDurationY);
        } else if (shouldDelete && index + 1 === text.length && text.length > 1) {
            animationDurationY = 250;
            sharedFromY.value = fromY;
            sharedFromX.value = fromX;
            sharedFromOpacity.value = 1;
            toY += yOriginAdd;
            sharedFromOpacity.value = triggerAnimation(0, animationDurationY);
        }

        sharedFromY.value = triggerAnimation(toY, animationDurationY);
        sharedFromX.value = triggerAnimation(toX, animationDurationX);

        setPrevText(text);
        setPrevXPosition(xPosition);
    }, [text, shouldDelete]);

    useSharedValueEffect(() => {
        fromY.current = sharedFromY.value;
        fromX.current = sharedFromX.value;
        fromOpacity.current = sharedFromOpacity.value;
    }, sharedFromY, sharedFromX, sharedFromOpacity);

    if (!font) {
        return null;
    }

    return <SkiaText
        opacity={fromOpacity}
        x={fromX}
        y={fromY}
        text={char}
        font={font}
    />
}