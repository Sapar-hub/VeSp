import React from 'react';
import { Group, Arrow, Circle } from 'react-konva';
import type { SceneObjectUnion, Vector, Point } from '../store/mainStore';
import Konva from 'konva';

const PIXELS_PER_UNIT = 50;

export function drawSceneObject(
    obj: SceneObjectUnion,
    isSelected: boolean,
    isDraggable: boolean = false,
    onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void
) {
    switch (obj.type) {
        case 'vector':
            return drawVector(obj, isSelected, isDraggable, onDragEnd);
        case 'point':
            return drawPoint(obj, isSelected);
        default:
            return null;
    }
}

function drawVector(
    vector: Vector,
    isSelected: boolean,
    isDraggable: boolean,
    onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void
) {
    const { id, start, components, color } = vector;
    const scaledStart = [start[0] * PIXELS_PER_UNIT, start[1] * PIXELS_PER_UNIT];
    const scaledComponents = [components[0] * PIXELS_PER_UNIT, components[1] * PIXELS_PER_UNIT];

    return (
        <Group
            key={id}
            id={id}
            x={scaledStart[0]}
            y={scaledStart[1]}
            draggable={isDraggable}
            onDragEnd={onDragEnd}
        >
            <Arrow
                points={[0, 0, scaledComponents[0], scaledComponents[1]]}
                pointerLength={10}
                pointerWidth={10}
                fill={isSelected ? '#007bff' : color}
                stroke={isSelected ? '#007bff' : color}
                strokeWidth={isSelected ? 3 : 2}
            />
        </Group>
    );
}

function drawPoint(point: Point, isSelected: boolean) {
    const { id, position, color } = point;
    const scaledPosition = [position[0] * PIXELS_PER_UNIT, position[1] * PIXELS_PER_UNIT];

    return (
        <Circle
            key={id}
            id={id}
            x={scaledPosition[0]}
            y={scaledPosition[1]}
            radius={5}
            fill={isSelected ? '#007bff' : color}
        />
    );
}
