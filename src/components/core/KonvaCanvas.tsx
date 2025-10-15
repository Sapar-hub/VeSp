import React, { useRef, useState } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import useStore from '../../store/mainStore';
import Konva from 'konva';
import { drawSceneObject } from '../../rendering/KonvaDrawer.tsx';

const PIXELS_PER_UNIT = 50;

export const KonvaCanvas: React.FC = () => {
    const { objects, selectedObjectId, multiSelection, setSelectedObjectId, updateObject, mode, toggleMultiSelect } = useStore(state => ({
        objects: state.objects,
        selectedObjectId: state.selectedObjectId,
        multiSelection: state.multiSelection,
        setSelectedObjectId: state.setSelectedObjectId,
        updateObject: state.updateObject,
        mode: state.mode,
        toggleMultiSelect: state.toggleMultiSelect,
    }));
    const stageRef = useRef<Konva.Stage>(null);
    const [stageState, setStageState] = useState({ scale: 1, x: 0, y: 0 });

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

    const renderGrid = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const { scale, x, y } = stageState;

        const lines = [];

        const scaledSpacing = PIXELS_PER_UNIT * scale;
        const offsetX = x % scaledSpacing;
        const offsetY = y % scaledSpacing;

        const numLinesX = Math.ceil(width / scaledSpacing) + 1;
        const numLinesY = Math.ceil(height / scaledSpacing) + 1;

        for (let i = 0; i < numLinesX; i++) {
            const lineX = i * scaledSpacing + offsetX;
            lines.push(<Line key={`v-${i}`} points={[lineX, 0, lineX, height]} stroke="#222" strokeWidth={1} />);
        }

        for (let i = 0; i < numLinesY; i++) {
            const lineY = i * scaledSpacing + offsetY;
            lines.push(<Line key={`h-${i}`} points={[0, lineY, width, lineY]} stroke="#222" strokeWidth={1} />);
        }

        // Axes
        lines.push(<Line key="axis-x" points={[0, y, width, y]} stroke="#555" strokeWidth={1 / scale} />);
        lines.push(<Line key="axis-y" points={[x, 0, x, height]} stroke="#555" strokeWidth={1 / scale} />);

        return lines;
    };

    return (
        <Stage
            ref={stageRef}
            width={window.innerWidth}
            height={window.innerHeight}
            style={{ background: '#111' }}
            onClick={handleClick}
            onWheel={handleWheel}
            draggable={mode === 'select'}
            scaleX={stageState.scale}
            scaleY={stageState.scale}
            x={stageState.x}
            y={stageState.y}
            onDragEnd={() => setStageState({ ...stageState, x: stageRef.current?.x() || 0, y: stageRef.current?.y() || 0 })}
        >
            <Layer>
                {renderGrid()}

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
    );
};