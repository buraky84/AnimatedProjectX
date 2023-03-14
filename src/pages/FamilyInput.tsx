import React, {useCallback, useMemo, useState} from "react";
import {View, Text, StyleSheet, Dimensions, TouchableOpacity} from "react-native";
import {
    Canvas
} from "@shopify/react-native-skia";
import {FlashList} from "@shopify/flash-list";
import AnimatedTextComponent from "./components/AnimatedTextComponent";

const pageWidth = Dimensions.get('window').width;
const formatter = Intl.NumberFormat("en-US");
export default function FamilyInput() {
    const [displayValue, setDisplayValue] = useState('0');
    const [delayedDelete, setDelayedDelete] = useState(false);

    const numPadData = [...new Array(9).fill(0).map((_, index) => index + 1), '.', '0', '<'];

    const onNumPadClick = useCallback((val) => {
        if(val === '.' && displayValue[displayValue.length -1] === '.') { // prevent NaN when double "." pressed
            return;
        }
        let newDisplayVal = displayValue;
        if(val === '<') {
            newDisplayVal = newDisplayVal.slice(0, -1);
            setDelayedDelete(true);
            setTimeout(() => {
                setDelayedDelete(false);
                setDisplayValue(newDisplayVal);
            }, 250);
        } else {
            newDisplayVal = newDisplayVal + val;
            setDisplayValue(newDisplayVal);
        }
    }, [displayValue]);

    const formattedDisplayVal = formatter.format(Number(displayValue));

    return (
        <View style={styles.container}>
            <View style={styles.canvasAreaContainer}>
                <View style={styles.canvasView}>
                    <Canvas style={{flex: 1}} mode="continuous">
                        <AnimatedTextComponent key={`skia_text_00`} char='$' text={formattedDisplayVal} index={-1} shouldDelete={false} />
                        {[...formattedDisplayVal].map((char, _index) => {
                            return <AnimatedTextComponent key={`animated_text_${_index}`} char={char} text={formattedDisplayVal} index={_index} shouldDelete={delayedDelete} />
                        })
                        }
                    </Canvas>
                </View>
            </View>
            <View style={styles.numPadContainer}>
                <FlashList
                    scrollEnabled={false}
                    numColumns={3}
                    data={numPadData}
                    estimatedItemSize={numPadData.length}
                    renderItem={({item}) =>
                        <TouchableOpacity onPress={() => onNumPadClick(item)} style={styles.numPadItem}>
                            <Text style={styles.numPadText}>{item}</Text>
                        </TouchableOpacity>
                    }
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    canvasAreaContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    canvasView: {height: 100, width: pageWidth - 20},
    numPadContainer: {height: 400, width: pageWidth, backgroundColor: '#FFFFFF'},
    numPadItem: {width: '100%', height: 100, backgroundColor: '#f8f8f8', alignItems: 'center', justifyContent: 'center'},
    numPadText: {textAlign: 'center', color: 'black', fontSize: 22, fontWeight: '500'},
});