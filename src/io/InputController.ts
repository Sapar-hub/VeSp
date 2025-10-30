import * as THREE from 'three';
import { AppState, Actions, Vector } from '../store/mainStore';
// import type { StoreApi } from 'zustand';

export class InputController {
    private getStoreState: () => (AppState & Actions);
    // private subscribeToStore: (callback: () => void) => () => void;
    private raycaster = new THREE.Raycaster();
    private pointer = new THREE.Vector2();
    private camera: THREE.Camera | null = null;
    private scene: THREE.Scene | null = null;
    private isDragging = false;
    private dragStartPoint: THREE.Vector3 | null = null;
    private newObjectId: string | null = null;

    constructor(getStore: () => (AppState & Actions)) {
        this.getStoreState = getStore;
        // this.subscribeToStore = (callback) => useStore.subscribe(callback);
    }

    public setCamera(camera: THREE.Camera) {
        this.camera = camera;
    }

    public setScene(scene: THREE.Scene) {
        this.scene = scene;
    }

    private updatePointer(event: PointerEvent) {
        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    private getState() {
        return this.getStoreState();
    }

    public handlePointerDown(event: PointerEvent) {
        if (!this.camera || !this.scene) return;
        this.updatePointer(event);
        this.raycaster.setFromCamera(this.pointer, this.camera);

        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        const state = this.getState();
        const { mode, toggleMultiSelect, setSelectedObjectId, createObject } = state;

        let clickedObject: THREE.Object3D | null = null;
        for (const intersect of intersects) {
            let obj = intersect.object;
            while (obj.parent && !obj.userData.id) {
                obj = obj.parent;
            }
            if (obj.userData.id) {
                clickedObject = obj;
                break;
            }
        }

        if (clickedObject) {
            const objectId = clickedObject.userData.id;
            if ((mode === 'select' && event.shiftKey) || mode === 'changeBasis') {
                if (this.getState().objects.get(objectId)?.type === 'vector' || this.getState().objects.get(objectId)?.type === 'point') {
                    toggleMultiSelect(objectId);
                }
            } else {
                setSelectedObjectId(objectId);
            }
        } else {
            const isProjectionPlane = intersects.some(i => i.object.userData.type === 'projection-plane');
            if (isProjectionPlane || intersects.length === 0) {
                setSelectedObjectId(null);
            }
        }

        if (mode === 'addVector') {
            this.isDragging = true;
            const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
            this.raycaster.ray.intersectPlane(plane, this.dragStartPoint = new THREE.Vector3());

            if (this.dragStartPoint) {
                const { payload: id } = createObject('vector', {
                    start: this.dragStartPoint.toArray() as [number, number, number],
                    end: this.dragStartPoint.toArray() as [number, number, number],
                } as Partial<Vector>);
                this.newObjectId = id;
                setSelectedObjectId(id);
            }
        }
    }

    public handlePointerMove(event: PointerEvent) {
        if (!this.isDragging || !this.dragStartPoint || !this.newObjectId || !this.camera) return;
        this.updatePointer(event);
        this.raycaster.setFromCamera(this.pointer, this.camera);

        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const currentPoint = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(plane, currentPoint);

        if (currentPoint) {
            this.getState().updateObject(this.newObjectId, { end: currentPoint.toArray() as [number, number, number] });
        }
    }

    public handlePointerUp(_event: PointerEvent) {
        if (this.isDragging) {
            this.isDragging = false;
            this.dragStartPoint = null;
            this.newObjectId = null;
            this.getState().setMode('select');
        }
    }
}