import React, {useCallback, useMemo, useState} from "react";
import {Dimensions, StyleSheet, View} from "react-native";
import {FlashList} from "@shopify/flash-list";
import DraggableImageComponent from "./components/DraggableImageComponent";
import {useSharedValue} from "react-native-reanimated";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import DefiTeam1 from '../../assets/team/1.png';
import DefiTeam2 from '../../assets/team/2.png';
import DefiTeam3 from '../../assets/team/3.png';
import DefiTeam4 from '../../assets/team/4.png';
import DefiTeam5 from '../../assets/team/5.png';
import DefiTeam6 from '../../assets/team/6.png';
import DefiTeam7 from '../../assets/team/7.png';
import DefiTeam8 from '../../assets/team/8.png';
import DefiTeam9 from '../../assets/team/9.png';
import DefiTeam10 from '../../assets/team/10.png';
import DefiTeam11 from '../../assets/team/11.png';
import DefiTeam12 from '../../assets/team/12.png';

const pageWidth = Dimensions.get('window').width;
const pageHeight = Dimensions.get('window').height;
const imageWidthHeight = 120;
const images = [
    DefiTeam1, DefiTeam2, DefiTeam3, DefiTeam4, DefiTeam5, DefiTeam6, DefiTeam7, DefiTeam8, DefiTeam9, DefiTeam10, DefiTeam11, DefiTeam12
];

const numColumns = 3; // # of columns in a row
const separatorMargin = 10; // vertical margin between rows

const calculateInitialPositions = (orderedImages) => {
    const positionsObject = {};
    const singleAreaWidth = pageWidth / numColumns;
    const startFromX = singleAreaWidth / 2;
    const requiredRows = orderedImages.length / numColumns;
    const totalYSpaceRequired = (requiredRows * imageWidthHeight) + ((requiredRows -1) * (separatorMargin * 2));
    const startFromY = totalYSpaceRequired >= pageHeight ? imageWidthHeight / 2 : ((pageHeight - totalYSpaceRequired) / 2) + (imageWidthHeight / 2);

    orderedImages.forEach((val, index) => {
        const row = Math.floor(index / numColumns);
        const column = index % numColumns;
        positionsObject[index] = {
            x: startFromX + (singleAreaWidth * column),
            y: startFromY + (imageWidthHeight * row) + (separatorMargin * 2 * row)
        }
    });
    return positionsObject;
}

export default function DragDrop() {
    const [orderedImages, setOrderedImages] = useState(images);
    const swapCandidateIndex = useSharedValue(-1);

    const uiPositions = useMemo(() => calculateInitialPositions(orderedImages),[orderedImages]);

    const swapItems = useCallback((index1, index2) => {
        [orderedImages[index1], orderedImages[index2]] = [orderedImages[index2], orderedImages[index1]];
        setOrderedImages([...orderedImages]);
    }, [orderedImages]);

    return (
        <View style={styles.container}>
            <GestureHandlerRootView style={{flex: 1}}>
                <View style={{height: '100%', width: pageWidth}}>
                    <FlashList
                        keyExtractor={(item, index) => `defi${index}`}
                        scrollEnabled={false}
                        numColumns={numColumns}
                        estimatedItemSize={orderedImages.length}
                        renderToHardwareTextureAndroid
                        centerContent
                        data={orderedImages}
                        renderItem={({item, index}) =>
                            <DraggableImageComponent imageItem={item} index={index} uiPositions={uiPositions} swapCandidateIndex={swapCandidateIndex} swapItems={swapItems} />
                        }
                        ItemSeparatorComponent={() => <View style={{marginVertical: separatorMargin}} />}
                    />
                </View>
            </GestureHandlerRootView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});