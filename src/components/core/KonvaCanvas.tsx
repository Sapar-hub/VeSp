import React, { useRef } from 'react';
import { Stage, Layer, Group, Arrow, Line } from 'react-konva';
import useStore from '../../store/mainStore';
import Konva from 'konva';

export const KonvaCanvas: React.FC = () => {
    const { objects, selectedObjectId, multiSelection, setSelectedObjectId, updateObject, mode, toggleMultiSelect } = useStore();
    const stageRef = useRef<Konva.Stage>(null);

    const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
        const id = e.target.id();
        const object = objects.get(id);
        if (object && object.type === 'vector') {
            const newStart: [number, number, number] = [e.target.x(), e.target.y(), 0];
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

    return (
        <Stage
            ref={stageRef}
            width={window.innerWidth}
            height={window.innerHeight}
            style={{ background: '#111' }}
            onClick={handleClick}
            draggable={mode === 'select'}
        >
            <Layer>
                {/* Grid */}
                {Array.from({ length: 100 }).map((_, i) => (
                    <React.Fragment key={i}>
                        <Line points={[-window.innerWidth, i * 50 - window.innerHeight, window.innerWidth * 2, i * 50 - window.innerHeight]} stroke="#222" strokeWidth={1} />
                        <Line points={[i * 50 - window.innerWidth, -window.innerHeight, i * 50 - window.innerWidth, window.innerHeight * 2]} stroke="#222" strokeWidth={1} />
                    </React.Fragment>
                ))}
                <Line points={[-window.innerWidth, 0, window.innerWidth * 2, 0]} stroke="#555" strokeWidth={1} />
                <Line points={[0, -window.innerHeight, 0, window.innerHeight * 2]} stroke="#555" strokeWidth={1} />

                {Array.from(objects.values()).map(obj => {
                    if (obj.type === 'vector' && obj.visible) {
                        const isSelected = selectedObjectId === obj.id || multiSelection.includes(obj.id);
                        return (
                            <Group
                                key={obj.id}
                                id={obj.id}
                                x={obj.start[0]}
                                y={obj.start[1]}
                                draggable={mode === 'select'}
                                onDragEnd={handleDragEnd}
                                opacity={isSelected ? 1 : 0.7}
                            >
                                <Arrow
                                    points={[0, 0, obj.components[0], obj.components[1]]}
                                    pointerLength={10}
                                    pointerWidth={10}
                                    fill={obj.color}
                                    stroke={isSelected ? '#007bff' : obj.color}
                                    strokeWidth={isSelected ? 5 : 3}
                                />
                            </Group>
                        );
                    }
                    return null;
                })}
            </Layer>
        </Stage>
    );
};