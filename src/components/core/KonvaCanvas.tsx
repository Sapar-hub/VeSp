import React, { useRef, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import useStore from '../../store/mainStore';
import Konva from 'konva';
import { drawSceneObject, drawGridAndAxes, drawBasisAxes, drawBasisGrid, drawCovector } from '../../rendering/KonvaDrawer.tsx';
import type { Vector } from '../../store/mainStore'; // Import Vector type

const PIXELS_PER_UNIT = 50;

export const KonvaCanvas: React.FC = () => {
    const { objects, tempObjects, selectedObjectId, multiSelection, setSelectedObjectId, updateObject, mode, toggleMultiSelect, basisVectorIds, isDualSpaceVisible } = useStore(state => state);
    const stageRef = useRef<Konva.Stage>(null);
    const [stageState, setStageState] = useState({
        scale: 1,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    });

    // Memoize basis vectors to prevent unnecessary re-renders
    const basisVectors = React.useMemo(() => {
        return basisVectorIds.map(id => objects.get(id)).filter((v): v is Vector => v?.type === 'vector');
    }, [basisVectorIds, objects]);

    // Check if the current basis is the standard 2D basis
    const isStandardBasis = React.useMemo(() => {
        if (basisVectors.length < 2) return false;

        const x = basisVectors[0].components;
        const y = basisVectors[1].components;

        const isIdentity = (v: [number, number, number], target: [number, number, number]) => 
            Math.abs(v[0] - target[0]) < 0.001 &&
            Math.abs(v[1] - target[1]) < 0.001;

        // Check x=[1,0] and y=[0,1]
        return isIdentity(x, [1, 0, 0]) && isIdentity(y, [0, 1, 0]);
    }, [basisVectors]);

    console.log('Rendering KonvaCanvas with objects:', objects);

    const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();
        const scaleBy = 1.1;
        const stage = stageRef.current;
        if (!stage) return;

        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        if (!pointer) return;

        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

        setStageState({
            scale: newScale,
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        });
    };

    const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
        const id = e.target.id();
        const object = objects.get(id);
        if (object && object.type === 'vector') {
            const newStart: [number, number, number] = [e.target.x() / PIXELS_PER_UNIT, e.target.y() / PIXELS_PER_UNIT, 0];
            const newEnd: [number, number, number] = [newStart[0] + object.components[0], newStart[1] + object.components[1], 0];
            updateObject(id, { start: newStart, end: newEnd });
        }
    };

    const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
        const target = e.target;
        let group = target;
        while (group && !group.id()) {
            group = group.getParent();
        }

        const id = group?.id();

        if ((mode === 'select' && e.evt.shiftKey) || mode === 'changeBasis') {
            if (id && (objects.get(id)?.type === 'vector' || objects.get(id)?.type === 'point')) {
                toggleMultiSelect(id);
            }
        } else {
            setSelectedObjectId(id || null);
        }
    };


    const canvasContainerStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // Ignore clicks on the container
    };

    const stageStyle: React.CSSProperties = {
        background: '#111',
        pointerEvents: 'auto', // But allow clicks on the canvas itself
    };

    return (
        <div style={canvasContainerStyle}>
            <Stage
                ref={stageRef}
                width={window.innerWidth}
                height={window.innerHeight}
                style={stageStyle}
                onClick={handleClick}
                onWheel={handleWheel}
                draggable={mode === 'select'}
                scaleX={stageState.scale}
                scaleY={-stageState.scale}
                x={stageState.x}
                y={stageState.y}
                onDragEnd={() => setStageState({ ...stageState, x: stageRef.current?.x() || 0, y: stageRef.current?.y() || 0 })}
            >
                <Layer key={objects.size}>
                    {!isStandardBasis && basisVectors.length > 0 ? (
                        <>
                            {drawBasisGrid(basisVectors)}
                            {drawBasisAxes(basisVectors, stageState.scale)}
                        </>
                    ) : (
                        drawGridAndAxes(window.innerWidth, window.innerHeight, stageState.scale, stageState.x, stageState.y)
                    )}

                    {Array.from(objects.values())
                        .filter(obj => obj.visible)
                        .map(obj => {
                            if (obj.type === 'vector') {
                                const isSelected = selectedObjectId === obj.id || multiSelection.includes(obj.id);
                                const isDraggable = mode === 'select';

                                return (
                                    <React.Fragment key={obj.id}>
                                        {drawSceneObject(obj, isSelected, stageState.scale, isDraggable, handleDragEnd)}
                                        {isDualSpaceVisible && isSelected && drawCovector(obj)}
                                    </React.Fragment>
                                );
                            }

                            const isSelected = selectedObjectId === obj.id || multiSelection.includes(obj.id);
                            return drawSceneObject(obj, isSelected, stageState.scale);
                        })}
                    {tempObjects.map(obj => drawSceneObject(obj, false, stageState.scale, false))}
                </Layer>
            </Stage>
        </div>
    );
};