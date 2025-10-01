import * as THREE from 'three';
import useStore, { AppState } from '../store/mainStore';
import type { StoreApi } from 'zustand';

type ZustandStore = StoreApi<AppState & any>;

export class InputController {
    private store: ZustandStore;
    private raycaster = new THREE.Raycaster();
    private pointer = new THREE.Vector2();
    private camera: THREE.Camera | null = null;
    private scene: THREE.Scene | null = null;
    private isDragging = false;
    private dragStartPoint: THREE.Vector3 | null = null;
    private newObjectId: string | null = null;

    constructor(store: ZustandStore) {
        this.store = store;
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

    public handlePointerDown(event: PointerEvent) {
        if (!this.camera || !this.scene) return;
        this.updatePointer(event);
        this.raycaster.setFromCamera(this.pointer, this.camera);

        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        const { getState } = this.store;
        const { mode, toggleMultiSelect, setSelectedObjectId, createObject } = getState();

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
                if (getState().objects.get(objectId)?.type === 'vector' || getState().objects.get(objectId)?.type === 'point') {
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
                    start: this.dragStartPoint.toArray(),
                    end: this.dragStartPoint.toArray(),
                });
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
            this.store.getState().updateObject(this.newObjectId, { end: currentPoint.toArray() });
        }
    }

    public handlePointerUp(event: PointerEvent) {
        if (this.isDragging) {
            this.isDragging = false;
            this.dragStartPoint = null;
            this.newObjectId = null;
            this.store.getState().setMode('select');
        }
    }
}