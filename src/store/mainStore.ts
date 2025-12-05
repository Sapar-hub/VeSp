import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { temporal } from 'zundo';
import { MathEngine } from '../math/MathEngine';
import { produce } from 'immer';
import { ExpressionEngine } from '../math/ExpressionEngine';

// --- DATA MODELS from Architecture.xml ---

export interface SceneObject {
    id: string;
    name: string;
    type: 'vector' | 'point' | 'matrix';
    color: string;
    visible: boolean;
}

export interface Vector extends SceneObject {
    type: 'vector';
    start: [number, number, number];
    end: [number, number, number];
    components: [number, number, number]; // Cached value (end - start)
}

export interface Point extends SceneObject {
    type: 'point';
    position: [number, number, number];
}

export interface Matrix extends SceneObject {
    type: 'matrix';
    values: number[][];
}

export type SceneObjectUnion = Vector | Point | Matrix;

export interface Notification {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

export interface AppState {
    objects: Map<string, SceneObjectUnion>;
    selectedObjectId: string | null;
    multiSelection: string[];
    mode: 'select' | 'addVector' | 'transform' | 'changeBasis';
    isProjectionExplorerActive: boolean;
    viewMode: '2d' | '3d';
    basisVectorIds: string[];
    cameraState: { position: [number, number, number], target: [number, number, number] };
    visualizationMode: 'none' | 'tip-to-tail' | 'parallelogram';
    tempObjects: SceneObjectUnion[];
    notifications: Notification[];
    expressions: string;
    expressionErrors: Map<string, string>;
}

// --- ACTIONS ---

export interface Actions {
    createObject: (type: 'vector' | 'point' | 'matrix', properties?: Partial<Omit<SceneObjectUnion, 'id' | 'type'>>) => { status: "Success"; payload: string; } | { status: "InvalidType"; payload: null; };
    updateObject: (objectId: string, properties: Partial<SceneObjectUnion>) => { status: "Success"; } | { status: "NotFound"; };
    deleteObject: (objectId: string) => void;
    setSelectedObjectId: (objectId: string | null) => void;
    setMode: (mode: 'select' | 'addVector' | 'transform' | 'changeBasis') => void;
    applySceneTransform: (transformMatrix: Matrix) => void;
    toggleProjectionExplorer: () => void;
    setViewMode: (mode: '2d' | '3d') => void;
    setBasis: (basisVectorIds: string[]) => void;
    addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
    removeNotification: (notificationId: string) => void;
    setVisualizationMode: (mode: 'none' | 'tip-to-tail' | 'parallelogram') => void;
    setTempObjects: (objects: SceneObjectUnion[]) => void;
    toggleMultiSelect: (objectId: string) => void;
    clearMultiSelection: () => void;
    updateExpression: (script: string) => void;
    evaluateExpressions: () => void;
    getSceneAsJson: () => any;
    loadSceneFromJson: (json: any) => void;
    undo: () => void;
    redo: () => void;
}

const updateExpressionsWithScene = (state: AppState) => {
    const nonExpressionObjects = Array.from(state.objects.values()).filter(obj => {
        const isExpression = state.expressions.includes(`${obj.name} =`);
        return !isExpression;
    });

    const newExpressions = nonExpressionObjects.map(obj => {
        if (obj.type === 'vector') {
            return `${obj.name} = [${obj.components.join(', ')}]`;
        }
        return ''; // Or handle other types
    }).filter(Boolean);

    // This is a simplified approach; a more robust solution would merge existing and new expressions.
    state.expressions = state.expressions + '\n' + newExpressions.join('\n');
};


// --- ZUSTAND STORE from DevelopmentPlan.xml ---

const useStore = create<AppState & Actions>()(
    devtools(
        temporal(
            (set, get) => ({
                // --- INITIAL STATE ---
                objects: new Map(),
                selectedObjectId: null,
                multiSelection: [],
                mode: 'select',
                isProjectionExplorerActive: false,
                viewMode: '2d',
                basisVectorIds: [],
                cameraState: { position: [5, 5, 10], target: [0, 0, 0] },
                visualizationMode: 'tip-to-tail',
                tempObjects: [],
                notifications: [],
                expressions: 'a = [2, 0]\nb = [0, 2]\nc = a + b',
                expressionErrors: new Map(),

                // --- ACTIONS IMPLEMENTATION ---
                updateExpression: (script) => {
                    set({ expressions: script });
                },

                evaluateExpressions: () => {
                    const { expressions, objects, visualizationMode } = get();
                    const { newObjects, tempObjects, errors } = ExpressionEngine.evaluate(expressions, objects, visualizationMode);

                    set(produce(state => {
                        // const expressionNames = new Set(
                        //     expressions.split('\n').map(line => line.match(/^([a-zA-Z_][a-zA-Z_0-9]*)\s*=/)).filter(Boolean).map(m => m![1])
                        // );

                        // Re-evaluate all objects from the script
                        const newObjectsMap = new Map<string, SceneObjectUnion>();

                        // Add the newly evaluated objects
                        for (const [id, obj] of newObjects.entries()) {
                            newObjectsMap.set(id, obj as SceneObjectUnion);
                        }

                        state.objects = newObjectsMap;
                        state.tempObjects = tempObjects;
                        state.expressionErrors = errors;
                    }));
                },
                createObject: (type, properties) => {
                    const id = crypto.randomUUID();
                    let newObject: SceneObjectUnion;

                    switch (type) {
                        case 'vector':
                            const start: [number, number, number] = (properties as Partial<Vector>)?.start ?? [0, 0, 0];
                            const end: [number, number, number] = (properties as Partial<Vector>)?.end ?? [2, 2, 0];
                            newObject = {
                                id,
                                type: 'vector',
                                name: `v${get().objects.size + 1}`,
                                color: '#ff0000',
                                visible: true,
                                start,
                                end,
                                components: [end[0] - start[0], end[1] - start[1], end[2] - start[2]],
                                ...properties
                            } as Vector;
                            break;
                        case 'point':
                            newObject = {
                                id,
                                type: 'point',
                                name: `p${get().objects.size + 1}`,
                                color: '#0000ff',
                                visible: true,
                                position: [1, 1, 1],
                                ...properties
                            } as Point;
                            break;
                        case 'matrix':
                            newObject = {
                                id,
                                type: 'matrix',
                                name: `m${get().objects.size + 1}`,
                                color: '#00ff00',
                                visible: false,
                                values: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
                                ...properties
                            } as Matrix;
                            break;
                        default:
                            return { status: "InvalidType", payload: null };
                    }

                    set(produce(state => {
                        state.objects.set(id, newObject);
                        if (newObject.type === 'vector') {
                            const newExpression = `${newObject.name} = [${newObject.components.join(', ')}]`;
                            state.expressions = state.expressions ? `${state.expressions}\n${newExpression}` : newExpression;
                        }
                    }));

                    return { status: "Success", payload: id };
                },

                updateObject: (objectId, properties) => {
                    if (!get().objects.has(objectId)) {
                        return { status: "NotFound" };
                    }

                    set(produce(state => {
                        const objectToUpdate = state.objects.get(objectId);
                        if (objectToUpdate) {
                            Object.assign(objectToUpdate, properties);
                            if (objectToUpdate.type === 'vector') {
                                const vec = objectToUpdate as Vector;
                                if ((properties as Partial<Vector>).start || (properties as Partial<Vector>).end) {
                                    vec.components = [vec.end[0] - vec.start[0], vec.end[1] - vec.start[1], vec.end[2] - vec.start[2]];
                                }
                                updateExpressionsWithScene(state);
                            }
                        }
                    }));

                    return { status: "Success" };
                },

                deleteObject: (objectId: string) => {
                    set(produce(state => {
                        state.objects.delete(objectId);
                        if (state.selectedObjectId === objectId) {
                            state.selectedObjectId = null;
                        }
                        state.multiSelection = state.multiSelection.filter((id: string) => id !== objectId);
                        updateExpressionsWithScene(state);
                    }));
                },

                setSelectedObjectId: (objectId) => {
                    set({ selectedObjectId: objectId, multiSelection: [] });
                },

                setMode: (mode) => {
                    set({ mode });
                },

                applySceneTransform: (transformMatrix) => {
                    set(produce(state => {
                        // Create a new Map to ensure React detects the change
                        const newObjectsMap = new Map(state.objects);

                        for (const [id, obj] of state.objects.entries()) {
                            if (obj.type === 'vector') {
                                const result = MathEngine.applyTransformToObject(obj, transformMatrix);
                                if (result.status === 'Success' && result.payload) {
                                    newObjectsMap.set(id, result.payload);
                                }
                            }
                        }

                        state.objects = newObjectsMap;
                    }));
                },

                toggleProjectionExplorer: () => {
                    set(state => ({ isProjectionExplorerActive: !state.isProjectionExplorerActive }));
                },

                setViewMode: (mode) => {
                    set({ viewMode: mode });
                },

                setBasis: (basisVectorIds) => {
                    // Validate the new basis
                    if (basisVectorIds.length < 2 || basisVectorIds.length > 3) {
                        get().addNotification('A basis must consist of 2 or 3 vectors', 'error');
                        return;
                    }

                    // Get the actual vector objects
                    const vectors = basisVectorIds.map(id => get().objects.get(id)).filter(v => v?.type === 'vector') as Vector[];

                    if (vectors.length !== basisVectorIds.length) {
                        get().addNotification('Some selected IDs are not vectors', 'error');
                        return;
                    }

                    // Check if vectors are linearly independent
                    if (MathEngine.checkLinearDependency(vectors)) {
                        get().addNotification('Selected vectors are linearly dependent and cannot form a basis', 'error');
                        return;
                    }

                    set({ basisVectorIds });
                    get().addNotification(`Basis set with ${basisVectorIds.length} vectors`, 'success');
                },

                transformObjectToBasis: (objectId: string, targetBasisIds: string[]) => {
                    const state = get();
                    const object = state.objects.get(objectId);
                    if (!object || object.type !== 'vector') {
                        state.addNotification('Can only transform vectors to a new basis', 'error');
                        return;
                    }

                    const targetBasisVectors = targetBasisIds.map((id: string) => state.objects.get(id)).filter((v): v is Vector => v?.type === 'vector');
                    if (targetBasisVectors.length !== targetBasisIds.length) {
                        state.addNotification('Target basis contains non-vector objects', 'error');
                        return;
                    }

                    const result = MathEngine.getVectorCoordinatesInBasis(object as Vector, targetBasisVectors);
                    if (result.status === 'Success' && result.payload) {
                        // Update the object to reflect its coordinates in the new basis
                        // For now, this could involve creating a new representation of the vector
                        // in the coordinates of the new basis
                        state.addNotification(`Transformed vector to new basis successfully`, 'info');
                    } else {
                        state.addNotification('Failed to transform vector to new basis', 'error');
                    }
                },

                addNotification: (message, type) => {
                    const id = crypto.randomUUID();
                    set(produce(state => {
                        state.notifications = [...state.notifications, { id, message, type }];
                    }));
                },

                removeNotification: (notificationId: string) => {
                    set(produce(state => {
                        state.notifications = state.notifications.filter((n: { id: string; }) => n.id !== notificationId);
                    }));
                },

                clearMultiSelection: () => {
                    set({ multiSelection: [] });
                },

                setVisualizationMode: (mode) => {
                    set({ visualizationMode: mode });
                    get().evaluateExpressions();
                },

                setTempObjects: (objects) => {
                    set({ tempObjects: objects });
                },

                toggleMultiSelect: (objectId: string) => {
                    set(produce(state => {
                        const index = state.multiSelection.indexOf(objectId);
                        let newMultiSelection;
                        if (index > -1) {
                            newMultiSelection = state.multiSelection.filter((id: string) => id !== objectId);
                        } else {
                            newMultiSelection = [...state.multiSelection, objectId];
                        }
                        state.multiSelection = newMultiSelection;
                        state.selectedObjectId = null;
                    }));
                },

                getSceneAsJson: () => {
                    const state = get();
                    const serializableState = {
                        objects: Array.from(state.objects.values()),
                        selectedObjectId: state.selectedObjectId,
                        multiSelection: state.multiSelection,
                        mode: state.mode,
                        isProjectionExplorerActive: state.isProjectionExplorerActive,
                        viewMode: state.viewMode,
                        basisVectorIds: state.basisVectorIds,
                        cameraState: state.cameraState,
                        visualizationMode: state.visualizationMode,
                        expressions: state.expressions,
                    };
                    return serializableState;
                },

                loadSceneFromJson: (json: any) => {
                    if (!json) {
                        console.error("Failed to load scene: Scene data is empty or invalid.");
                        return;
                    }
                    set(produce(state => {
                        state.objects = new Map((json.objects || []).map((obj: SceneObjectUnion) => [obj.id, obj]));
                        state.selectedObjectId = json.selectedObjectId || null;
                        state.multiSelection = json.multiSelection || [];
                        state.mode = json.mode || 'select';
                        state.isProjectionExplorerActive = json.isProjectionExplorerActive || false;
                        state.viewMode = json.viewMode || '2d';
                        state.basisVectorIds = json.basisVectorIds || [];
                        state.cameraState = json.cameraState || { position: [5, 5, 10], target: [0, 0, 0] };
                        state.visualizationMode = json.visualizationMode || 'tip-to-tail';
                        state.expressions = json.expressions || '';
                        state.expressionErrors = new Map(); // Clear errors on load
                        state.tempObjects = []; // Clear temp objects on load
                        state.notifications = []; // Clear notifications on load
                    }));
                    get().evaluateExpressions(); // Re-evaluate expressions after loading
                },

                undo: () => get().undo(),
                redo: () => get().redo(),
            }),
            {
                partialize: (state) => {
                    const { notifications, tempObjects, ...rest } = state;
                    return rest;
                },
            }
        )
    )
);

export default useStore;