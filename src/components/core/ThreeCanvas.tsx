import React, { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import useStore, { Vector } from '../../store/mainStore';
import * as ObjectDrawer from '../../rendering/ObjectDrawer';
import { InputController } from '../../io/InputController';
import * as THREE from 'three';

const Scene: React.FC<{ inputController: InputController | null }> = ({ inputController }) => {
    const { objects, selectedObjectId, multiSelection, isProjectionExplorerActive, tempObjects } = useStore(state => ({
        objects: state.objects,
        selectedObjectId: state.selectedObjectId,
        multiSelection: state.multiSelection,
        isProjectionExplorerActive: state.isProjectionExplorerActive,
        tempObjects: state.tempObjects,
    }));
    const { scene, camera } = useThree();

    useEffect(() => {
        if (inputController) {
            inputController.setScene(scene);
            inputController.setCamera(camera);
        }
    }, [inputController, scene, camera]);

    return (
        <>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} />
            <Grid args={[100, 100]} infiniteGrid fadeDistance={50} />

            {Array.from(objects.values()).map(obj => {
                if (!obj.visible) return null;
                const isSelected = selectedObjectId === obj.id || multiSelection.includes(obj.id);
                switch (obj.type) {
                    case 'vector':
                        const vec = ObjectDrawer.drawVector(obj);
                        if (isSelected) {
                            const arrow = vec.children[0] as THREE.Mesh;
                            if (arrow.material && Array.isArray(arrow.material)) {
                                arrow.material.forEach(mat => (mat as THREE.MeshBasicMaterial).color.set('#007bff'));
                            } else if (arrow.material) {
                                (arrow.material as THREE.MeshBasicMaterial).color.set('#007bff');
                            }
                            
                            if (vec.children[1]) {
                                const line = vec.children[1] as THREE.Line;
                                if (line.material && Array.isArray(line.material)) {
                                    line.material.forEach(mat => (mat as THREE.LineBasicMaterial).color.set('#007bff'));
                                } else if (line.material) {
                                    (line.material as THREE.LineBasicMaterial).color.set('#007bff');
                                }
                            }
                        }
                        return <primitive key={obj.id} object={vec} />;
                    case 'point':
                        const point = ObjectDrawer.drawPoint(obj);
                        if (isSelected) {
                            (point.material as THREE.MeshBasicMaterial).color.set('#007bff');
                        }
                        return <primitive key={obj.id} object={point} />;
                    default:
                        return null;
                }
            })}

            {isProjectionExplorerActive && <primitive object={ObjectDrawer.drawProjectionPlane()} />}
            {isProjectionExplorerActive && Array.from(objects.values()).filter(o => o.type === 'vector').map(obj => (
                <React.Fragment key={`proj-${obj.id}`}>
                    <primitive object={ObjectDrawer.drawProjectedVector(obj as Vector)} />
                    <primitive object={ObjectDrawer.drawProjectionLine(obj.end, [obj.end[0], obj.end[1], 0])} />
                     <primitive object={ObjectDrawer.drawProjectionLine(obj.start, [obj.start[0], obj.start[1], 0])} />
                </React.Fragment>
            ))}

            {tempObjects.map(obj => {
                 if (!obj.visible) return null;
                 if (obj.type === 'vector') {
                     return <primitive key={obj.id} object={ObjectDrawer.drawVector(obj as Vector)} />;
                 }
                 return null;
            })}
        </>
    );
};

export const ThreeCanvas: React.FC = () => {
    const inputController = useRef<InputController | null>(null);

    useEffect(() => {
        inputController.current = new InputController(useStore);
    }, []);

    const canvasContainerStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // Ignore clicks on the container
    };

    const canvasStyle: React.CSSProperties = {
        background: '#111',
        pointerEvents: 'auto', // But allow clicks on the canvas itself
    };

    return (
        <div style={canvasContainerStyle}>
            <Canvas
                camera={{ position: [5, 5, 10], fov: 60 }}
                style={canvasStyle}
                onPointerDown={(e: React.PointerEvent) => inputController.current?.handlePointerDown(e as any)}
                onPointerMove={(e: React.PointerEvent) => inputController.current?.handlePointerMove(e as any)}
                onPointerUp={(e: React.PointerEvent) => inputController.current?.handlePointerUp(e as any)}
            >
                <Scene inputController={inputController.current} />
                <OrbitControls makeDefault />
            </Canvas>
        </div>
    );
};