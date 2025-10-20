import React, { useRef, useState } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import useStore from '../../store/mainStore';
import Konva from 'konva';
import { drawSceneObject, drawGridAndAxes } from '../../rendering/KonvaDrawer.tsx';

const PIXELS_PER_UNIT = 50;

export const KonvaCanvas: React.FC = () => {
    const { objects, selectedObjectId, multiSelection, setSelectedObjectId, updateObject, mode, toggleMultiSelect } = useStore(state => state);
    const stageRef = useRef<Konva.Stage>(null);
    const [stageState, setStageState] = useState({
        scale: 1,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    });

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
            const newStart: [number, number, number] = [e.target.x() / PIXELS_PER_UNIT, -e.target.y() / PIXELS_PER_UNIT, 0];
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
                    {drawGridAndAxes(window.innerWidth, window.innerHeight, stageState.scale, stageState.x, stageState.y)}

                    {Array.from(objects.values())
                        .filter(obj => obj.visible)
                        .map(obj => {
                            if (obj.type === 'vector') {
                                const isSelected = selectedObjectId === obj.id || multiSelection.includes(obj.id);
                                const isDraggable = mode === 'select';
                                
                                return drawSceneObject(obj, isSelected, isDraggable, handleDragEnd);
                            }
                            
                            const isSelected = selectedObjectId === obj.id || multiSelection.includes(obj.id);
                            return drawSceneObject(obj, isSelected);
                        })}
                </Layer>
            </Stage>
        </div>
    );
};