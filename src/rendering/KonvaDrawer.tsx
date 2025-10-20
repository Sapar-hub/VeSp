import React from 'react';
import { Group, Arrow, Circle, Line, Text } from 'react-konva';
import type { SceneObjectUnion, Vector, Point } from '../store/mainStore';
import Konva from 'konva';

const PIXELS_PER_UNIT = 50;

export function drawGridAndAxes(
    width: number,
    height: number,
    scale: number,
    offsetX: number,
    offsetY: number
) {
    const lines = [];
    const step = PIXELS_PER_UNIT; // Grid step is constant in world units

    // Create a transform to convert from screen to world coordinates
    const transform = new Konva.Transform();
    transform.translate(offsetX, offsetY);
    transform.scale(scale, -scale); // Y is inverted
    transform.invert();

    const topLeft = transform.point({ x: 0, y: 0 });
    const bottomRight = transform.point({ x: width, y: height });

    // Vertical lines and labels
    const startX = Math.floor(topLeft.x / step);
    const endX = Math.ceil(bottomRight.x / step);
    for (let i = startX; i <= endX; i++) {
        const x = i * step;
        const isAxis = i === 0;
        lines.push(
            <Line
                key={`v-${i}`}
                points={[x, topLeft.y, x, bottomRight.y]}
                stroke={isAxis ? '#777' : '#333'}
                strokeWidth={isAxis ? 2 / scale : 1 / scale}
            />
        );
        if (!isAxis) {
            lines.push(
                <Text key={`vt-${i}`} x={x + 4 / scale} y={4 / scale} text={String(i)} fill="#555" fontSize={12 / scale} scaleY={-1} />
            );
        }
    }

    // Horizontal lines and labels
    const startY = Math.floor(bottomRight.y / step);
    const endY = Math.ceil(topLeft.y / step);
    for (let i = startY; i <= endY; i++) {
        const y = i * step;
        const isAxis = i === 0;
        lines.push(
            <Line
                key={`h-${i}`}
                points={[topLeft.x, y, bottomRight.x, y]}
                stroke={isAxis ? '#777' : '#333'}
                strokeWidth={isAxis ? 2 / scale : 1 / scale}
            />
        );
        if (!isAxis) {
            lines.push(
                <Text key={`ht-${i}`} x={4 / scale} y={y + 4 / scale} text={String(i)} fill="#555" fontSize={12 / scale} scaleY={-1} />
            );
        }
    }

    return lines;
}


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
