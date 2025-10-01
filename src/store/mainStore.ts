import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { temporal } from 'zundo';
import { MathEngine } from '../math/MathEngine';
import { produce } from 'immer';

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
    undo: () => void;
    redo: () => void;
}

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
                viewMode: '3d',
                basisVectorIds: [],
                cameraState: { position: [5, 5, 10], target: [0, 0, 0] },
                visualizationMode: 'tip-to-tail',
                tempObjects: [],
                notifications: [],

                // --- ACTIONS IMPLEMENTATION ---
                createObject: (type, properties) => {
                    const id = crypto.randomUUID();
                    let newObject: SceneObjectUnion;

                    switch (type) {
                        case 'vector':
                            const start: [number, number, number] = properties?.start ?? [0, 0, 0];
                            const end: [number, number, number] = properties?.end ?? [2, 2, 0];
                            newObject = {
                                id,
                                type: 'vector',
                                name: `Vector ${get().objects.size + 1}`,
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
                                name: `Point ${get().objects.size + 1}`,
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
                                name: `Matrix ${get().objects.size + 1}`,
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
                            if (objectToUpdate.type === 'vector' && (properties.start || properties.end)) {
                                const vec = objectToUpdate as Vector;
                                vec.components = [vec.end[0] - vec.start[0], vec.end[1] - vec.start[1], vec.end[2] - vec.start[2]];
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
                        state.multiSelection = state.multiSelection.filter(id => id !== objectId);
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
                        for (const [id, obj] of state.objects.entries()) {
                            if (obj.type === 'vector') {
                                const result = MathEngine.applyTransformToObject(obj, transformMatrix);
                                if (result.status === 'Success' && result.payload) {
                                    state.objects.set(id, result.payload);
                                }
                            }
                        }
                    }));
                },

                toggleProjectionExplorer: () => {
                    set(state => ({ isProjectionExplorerActive: !state.isProjectionExplorerActive }));
                },

                setViewMode: (mode) => {
                    set({ viewMode: mode });
                },

                setBasis: (basisVectorIds) => {
                    set({ basisVectorIds });
                },

                addNotification: (message, type) => {
                    const id = crypto.randomUUID();
                    set(produce(state => {
                        state.notifications.push({ id, message, type });
                    }));
                },

                removeNotification: (notificationId) => {
                    set(produce(state => {
                        state.notifications = state.notifications.filter(n => n.id !== notificationId);
                    }));
                },

                setVisualizationMode: (mode) => {
                    set({ visualizationMode: mode });
                },

                setTempObjects: (objects) => {
                    set({ tempObjects: objects });
                },

                toggleMultiSelect: (objectId) => {
                    set(produce(state => {
                        const index = state.multiSelection.indexOf(objectId);
                        if (index > -1) {
                            state.multiSelection.splice(index, 1);
                        } else {
                            state.multiSelection.push(objectId);
                        }
                        state.selectedObjectId = null;
                    }));
                },

                clearMultiSelection: () => {
                    set({ multiSelection: [] });
                },
                undo: () => get().temporal.undo(),
                redo: () => get().temporal.redo(),
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