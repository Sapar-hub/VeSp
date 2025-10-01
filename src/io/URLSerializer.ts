import useStore from '../store/mainStore';
import type { AppState, SceneObjectUnion } from '../store/mainStore';

// A serializable version of the state
interface SerializableState {
    objects: [string, SceneObjectUnion][];
    cameraState: { position: [number, number, number], target: [number, number, number] };
    mode: 'select' | 'addVector' | 'transform' | 'changeBasis';
    multiSelection: string[];
    isProjectionExplorerActive: boolean;
    viewMode: '2d' | '3d';
    basisVectorIds: string[];
    visualizationMode: 'none' | 'tip-to-tail' | 'parallelogram';
}

export const URLSerializer = {
    serializeStateToURL: (): string => {
        const state = useStore.getState();
        
        const serializableState: SerializableState = {
            objects: Array.from(state.objects.entries()),
            cameraState: state.cameraState,
            mode: state.mode,
            multiSelection: state.multiSelection,
            isProjectionExplorerActive: state.isProjectionExplorerActive,
            viewMode: state.viewMode,
            basisVectorIds: state.basisVectorIds,
            visualizationMode: state.visualizationMode,
        };

        try {
            const json = JSON.stringify(serializableState);
            const compressed = btoa(json);
            const urlParams = new URLSearchParams();
            urlParams.set('scene', compressed);
            return `?${urlParams.toString()}`;
        } catch (error) {
            console.error("Failed to serialize state:", error);
            return "";
        }
    },

    deserializeStateFromURL: (): { status: string, payload: Partial<AppState> | null } => {
        const urlParams = new URLSearchParams(window.location.search);
        const compressedState = urlParams.get('scene');

        if (!compressedState) {
            return { status: "NoStateInURL", payload: null };
        }

        try {
            const json = atob(compressedState);
            const loadedState = JSON.parse(json) as SerializableState;

            const deserializedState: Partial<AppState> = {
                objects: new Map(loadedState.objects),
                cameraState: loadedState.cameraState,
                mode: loadedState.mode,
                multiSelection: loadedState.multiSelection,
                isProjectionExplorerActive: loadedState.isProjectionExplorerActive,
                viewMode: loadedState.viewMode,
                basisVectorIds: loadedState.basisVectorIds,
                visualizationMode: loadedState.visualizationMode,
            };
            
            return { status: "Success", payload: deserializedState };
        } catch (error) {
            console.error("Failed to deserialize state:", error);
            return { status: "ParseError", payload: null };
        }
    },

    subscribeToStoreChanges: () => {
        let debounceHandle: number;
        const unsubscribe = useStore.subscribe((state, prevState) => {
            // Simple deep-ish compare to avoid loops with deserialization
            if (JSON.stringify(state.objects) !== JSON.stringify(prevState.objects) || state.cameraState !== prevState.cameraState) {
                clearTimeout(debounceHandle);
                debounceHandle = window.setTimeout(() => {
                    const newUrl = URLSerializer.serializeStateToURL();
                    window.history.replaceState(null, '', window.location.pathname + newUrl);
                }, 500);
            }
        });
        return unsubscribe;
    },

    loadFromURL: () => {
        const result = URLSerializer.deserializeStateFromURL();
        if (result && result.status === 'Success' && result.payload) {
            useStore.setState(result.payload);
        }
    }
};