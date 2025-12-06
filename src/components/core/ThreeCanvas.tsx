import React, { useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import useStore, { Vector, SceneObjectUnion } from '../../store/mainStore';
import * as ObjectDrawer from '../../rendering/ObjectDrawer';
import { InputController } from '../../io/InputController';
import * as THREE from 'three';

// Type guard to check if an object is a Vector
function isVector(object: SceneObjectUnion): object is Vector {
    return object.type === 'vector';
}

const Scene: React.FC<{ inputController: InputController | null }> = ({ inputController }) => {
    const { objects, selectedObjectId, multiSelection, isProjectionExplorerActive, tempObjects, basisVectorIds, isDualSpaceVisible } = useStore(state => ({
        objects: state.objects,
        selectedObjectId: state.selectedObjectId,
        multiSelection: state.multiSelection,
        isProjectionExplorerActive: state.isProjectionExplorerActive,
        tempObjects: state.tempObjects,
        basisVectorIds: state.basisVectorIds,
        isDualSpaceVisible: state.isDualSpaceVisible,
    }));
    const { scene, camera } = useThree();

    React.useEffect(() => {
        if (inputController) {
            inputController.setScene(scene);
            inputController.setCamera(camera);
        }
    }, [inputController, scene, camera]);

    const basisVectors = React.useMemo(() => {
        return basisVectorIds.map(id => objects.get(id)).filter((v): v is Vector => v?.type === 'vector');
    }, [basisVectorIds, objects]);

    // Check if the current basis is the standard basis (Identity)
    const isStandardBasis = React.useMemo(() => {
        if (basisVectors.length < 3) return false; // 3D Standard basis needs 3 vectors
        
        const x = basisVectors[0].components;
        const y = basisVectors[1].components;
        const z = basisVectors[2].components;

        const isIdentity = (v: [number, number, number], target: [number, number, number]) => 
            Math.abs(v[0] - target[0]) < 0.001 &&
            Math.abs(v[1] - target[1]) < 0.001 &&
            Math.abs(v[2] - target[2]) < 0.001;

        return isIdentity(x, [1, 0, 0]) && isIdentity(y, [0, 1, 0]) && isIdentity(z, [0, 0, 1]);
    }, [basisVectors]);

    return (
        <>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} />
            
            {!isStandardBasis && basisVectors.length > 0 ? (
                <>
                    <primitive object={ObjectDrawer.drawBasisGrid(basisVectors)} />
                    <primitive object={ObjectDrawer.drawBasisAxes(basisVectors)} />
                </>
            ) : (
                <Grid args={[100, 100]} infiniteGrid fadeDistance={50} />
            )}

            {Array.from(objects.values()).map(obj => {
                if (!obj.visible) return null;
                const isSelected = selectedObjectId === obj.id || multiSelection.includes(obj.id);
                switch (obj.type) {
                    case 'vector': {
                        const vec = ObjectDrawer.drawVector(obj);
                        let crossProductVisuals = null;

                        if (obj.derivation?.type === 'cross_product') {
                            const opA = Array.from(objects.values()).find(o => o.name === obj.derivation!.operands[0]) as Vector;
                            const opB = Array.from(objects.values()).find(o => o.name === obj.derivation!.operands[1]) as Vector;
                            
                            if (opA && opB) {
                                crossProductVisuals = <primitive object={ObjectDrawer.drawCrossProductVisuals(obj, opA, opB)} />;
                            }
                        }

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
                        return (
                            <React.Fragment key={obj.id}>
                                <primitive object={vec} />
                                {crossProductVisuals}
                                {isDualSpaceVisible && isSelected && <primitive object={ObjectDrawer.drawCovector(obj)} />}
                            </React.Fragment>
                        );
                    }
                    case 'point': {
                        const point = ObjectDrawer.drawPoint(obj);
                        if (isSelected) {
                            (point.material as THREE.MeshBasicMaterial).color.set('#007bff');
                        }
                        return <primitive key={obj.id} object={point} />;
                    }
                    default:
                        return null;
                }
            })}

            {isProjectionExplorerActive && <primitive object={ObjectDrawer.drawProjectionPlane()} />}
            {isProjectionExplorerActive && Array.from(objects.values()).filter(isVector).map(obj => (
                <React.Fragment key={`proj-${obj.id}`}>
                    <primitive object={ObjectDrawer.drawProjectedVector(obj)} />
                    <primitive object={ObjectDrawer.drawProjectionLine(obj.end, [obj.end[0], obj.end[1], 0])} />
                     <primitive object={ObjectDrawer.drawProjectionLine(obj.start, [obj.start[0], obj.start[1], 0])} />
                </React.Fragment>
            ))}

            {tempObjects.map(obj => {
                 if (!obj.visible) return null;
                 if (isVector(obj)) {
                     return <primitive key={obj.id} object={ObjectDrawer.drawVector(obj)} />;
                 }
                 return null;
            })}
        </>
    );
};

export const ThreeCanvas: React.FC = () => {
    const [inputController] = useState(() => new InputController(useStore.getState));

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
                onPointerDown={(e) => inputController.handlePointerDown(e.nativeEvent)}
                onPointerMove={(e) => inputController.handlePointerMove(e.nativeEvent)}
                onPointerUp={(e) => inputController.handlePointerUp(e.nativeEvent)}
            >
                <Scene inputController={inputController} />
                <OrbitControls makeDefault />
            </Canvas>
        </div>
    );
};