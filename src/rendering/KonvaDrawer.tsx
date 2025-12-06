// import React from 'react';
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
    const zComponent = components[2] || 0;
    
    const planarLengthSq = scaledComponents[0] * scaledComponents[0] + scaledComponents[1] * scaledComponents[1];
    const isPerpendicular = planarLengthSq < 4 && Math.abs(zComponent) > 0.1;

    return (
        <Group
            key={id}
            id={id}
            x={scaledStart[0]}
            y={scaledStart[1]}
            draggable={isDraggable}
            onDragEnd={onDragEnd}
        >
            {isPerpendicular ? (
                // Draw symbol for vector pointing in/out of screen
                <Group>
                    <Circle
                        radius={8}
                        stroke={isSelected ? '#007bff' : color}
                        strokeWidth={2}
                        fill="transparent"
                    />
                    {zComponent > 0 ? (
                        // Dot for "out of screen"
                        <Circle
                            radius={2}
                            fill={isSelected ? '#007bff' : color}
                        />
                    ) : (
                        // X for "into screen"
                        <Group>
                            <Line points={[-4, -4, 4, 4]} stroke={isSelected ? '#007bff' : color} strokeWidth={2} />
                            <Line points={[4, -4, -4, 4]} stroke={isSelected ? '#007bff' : color} strokeWidth={2} />
                        </Group>
                    )}
                </Group>
            ) : (
                <Arrow
                    points={[0, 0, scaledComponents[0], scaledComponents[1]]}
                    pointerLength={10}
                    pointerWidth={10}
                    fill={isSelected ? '#007bff' : color}
                    stroke={isSelected ? '#007bff' : color}
                    strokeWidth={isSelected ? 3 : 2}
                />
            )}
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

export function drawBasisAxes(basis: Vector[]): JSX.Element[] {
    const axes: JSX.Element[] = [];
    const colors = ['#FF0000', '#00FF00', '#0000FF']; // Red, Green, Blue for x, y, z

    basis.forEach((b, index) => {
        const scaledComponents = [b.components[0] * PIXELS_PER_UNIT, b.components[1] * PIXELS_PER_UNIT];
        const color = colors[index % colors.length];

        axes.push(
            <Arrow
                key={`basis-axis-${b.id}`}
                points={[0, 0, scaledComponents[0], scaledComponents[1]]}
                pointerLength={10}
                pointerWidth={10}
                fill={color}
                stroke={color}
                strokeWidth={3}
            />
        );
    });

    return axes;
}

export function drawBasisGrid(basis: Vector[], size: number = 10, divisions: number = 10): JSX.Element[] {
    const gridLines: JSX.Element[] = [];
    const color = '#666666'; // Darker grey for the grid lines
    const highlightColor = '#AAAAAA'; // Lighter grey for central lines
    const strokeWidth = 1;
    const highlightStrokeWidth = 2;

    if (basis.length < 1) {
        return gridLines;
    }

    const b1 = [basis[0].components[0] * PIXELS_PER_UNIT, basis[0].components[1] * PIXELS_PER_UNIT];
    const b2 = basis.length > 1 ? [basis[1].components[0] * PIXELS_PER_UNIT, basis[1].components[1] * PIXELS_PER_UNIT] : [0, PIXELS_PER_UNIT];

    const step = size / divisions;
    const halfDivisions = divisions / 2;

    for (let i = -halfDivisions; i <= halfDivisions; i++) {
        for (let j = -halfDivisions; j <= halfDivisions; j++) {
            // Lines parallel to b1
            const startX = b1[0] * (-halfDivisions) + b2[0] * (j * step);
            const startY = b1[1] * (-halfDivisions) + b2[1] * (j * step);
            const endX = b1[0] * (halfDivisions) + b2[0] * (j * step);
            const endY = b1[1] * (halfDivisions) + b2[1] * (j * step);

            gridLines.push(
                <Line
                    key={`basis-grid-h-${i}-${j}`}
                    points={[startX, startY, endX, endY]}
                    stroke={j === 0 ? highlightColor : color}
                    strokeWidth={j === 0 ? highlightStrokeWidth : strokeWidth}
                    opacity={0.6}
                />
            );

            // Lines parallel to b2
            const startX2 = b2[0] * (-halfDivisions) + b1[0] * (i * step);
            const startY2 = b2[1] * (-halfDivisions) + b1[1] * (i * step);
            const endX2 = b2[0] * (halfDivisions) + b1[0] * (i * step);
            const endY2 = b2[1] * (halfDivisions) + b1[1] * (i * step);

            gridLines.push(
                <Line
                    key={`basis-grid-v-${i}-${j}`}
                    points={[startX2, startY2, endX2, endY2]}
                    stroke={i === 0 ? highlightColor : color}
                    strokeWidth={i === 0 ? highlightStrokeWidth : strokeWidth}
                    opacity={0.6}
                />
            );
        }
    }
    
    // Konva doesn't have a built-in Group, but a JSX.Element[] can be wrapped by a React.Fragment
    return gridLines;
}

export function drawCovector(vector: Vector): JSX.Element[] {
    const lines: JSX.Element[] = [];
    const { id, components, color } = vector;
    
    // Calculate length in simulation units
    const length = Math.sqrt(components[0] * components[0] + components[1] * components[1]);
    if (length < 0.001) return lines;

    const spacing = 1 / length;
    const spacingPixels = spacing * PIXELS_PER_UNIT;
    const numLines = 5;
    const lineLengthPixels = 500; // Make them long enough to cover screen mostly

    // Normalized direction vector
    const dx = components[0] / length;
    const dy = components[1] / length;

    // Perpendicular direction (-dy, dx)
    const perpX = -dy;
    const perpY = dx;

    for (let i = -numLines; i <= numLines; i++) {
        // Center point of the line along the vector direction
        const centerX = dx * (i * spacingPixels);
        const centerY = dy * (i * spacingPixels);

        // Start and end points of the line (perpendicular)
        const x1 = centerX - perpX * lineLengthPixels;
        const y1 = centerY - perpY * lineLengthPixels;
        const x2 = centerX + perpX * lineLengthPixels;
        const y2 = centerY + perpY * lineLengthPixels;

        lines.push(
            <Line
                key={`covector-${id}-${i}`}
                points={[x1, y1, x2, y2]}
                stroke={color}
                strokeWidth={1}
                dash={[10, 5]} // Dashed lines for covectors
                opacity={0.6}
            />
        );
    }

    return lines;
}
