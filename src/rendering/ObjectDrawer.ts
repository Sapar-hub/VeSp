import * as THREE from 'three';
import type { Vector, Point } from '../store/mainStore';

/**
 * Creates or updates a THREE.js object for a vector.
 * Uses THREE.ArrowHelper for visualization.
 */
export function drawVector(vectorData: Vector): THREE.ArrowHelper {
    const dir = new THREE.Vector3().fromArray(vectorData.components);
    const origin = new THREE.Vector3().fromArray(vectorData.start);
    const length = dir.length();
    dir.normalize();

    const arrowHelper = new THREE.ArrowHelper(dir, origin, length, vectorData.color, 0.2, 0.1);
    arrowHelper.userData = { id: vectorData.id, type: 'vector' };
    arrowHelper.name = vectorData.name;

    return arrowHelper;
}

/**
 * Visualizes the linear span of a set of vectors.
 * Creates a plane or a line based on the vectors.
 */
export function drawSpan(vectors: Vector[], isLinearlyDependent: boolean): THREE.Mesh | THREE.Line {
    if (vectors.length === 0) {
        return new THREE.Mesh();
    }

    if (vectors.length === 1) {
        const v = vectors[0];
        const dir = new THREE.Vector3().fromArray(v.components);
        const origin = new THREE.Vector3().fromArray(v.start);
        const points = [origin.clone().add(dir.clone().multiplyScalar(-100)), origin.clone().add(dir.clone().multiplyScalar(100))];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: isLinearlyDependent ? 0xff0000 : 0x00ff00, transparent: true, opacity: 0.5 });
        return new THREE.Line(geometry, material);
    }

    if (vectors.length >= 2) {
        const v1 = new THREE.Vector3().fromArray(vectors[0].components);
        const v2 = new THREE.Vector3().fromArray(vectors[1].components);
        
        const normal = new THREE.Vector3().crossVectors(v1, v2).normalize();
        
        if (normal.lengthSq() < 0.0001) {
             const v = vectors[0];
             const dir = new THREE.Vector3().fromArray(v.components);
             const origin = new THREE.Vector3().fromArray(v.start);
             const points = [origin.clone().add(dir.clone().multiplyScalar(-100)), origin.clone().add(dir.clone().multiplyScalar(100))];
             const geometry = new THREE.BufferGeometry().setFromPoints(points);
             const material = new THREE.LineBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 }); // Dependent color
             return new THREE.Line(geometry, material);
        }

        const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(normal, new THREE.Vector3().fromArray(vectors[0].start));
        const planeGeom = new THREE.PlaneGeometry(100, 100, 10, 10);
        const color = isLinearlyDependent ? 0xff0000 : 0x00ff00;
        const planeMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
        
        const planeMesh = new THREE.Mesh(planeGeom, planeMat);
        
        const coplanarPoint = new THREE.Vector3();
        plane.coplanarPoint(coplanarPoint);
        const focalPoint = new THREE.Vector3().addVectors(coplanarPoint, normal);
        planeMesh.lookAt(focalPoint);
        planeMesh.position.copy(coplanarPoint);

        return planeMesh;
    }
    
    return new THREE.Mesh();
}

/**
 * Creates a THREE.js object for a point.
 */
export function drawPoint(pointData: Point): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(0.1, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: pointData.color });
    const sphereMesh = new THREE.Mesh(geometry, material);
    sphereMesh.position.fromArray(pointData.position);
    sphereMesh.userData = { id: pointData.id, type: 'point' };
    sphereMesh.name = pointData.name;

    return sphereMesh;
}

/**
 * Creates a large, semi-transparent THREE.Mesh for the XY plane at z=0.
 */
export function drawProjectionPlane(): THREE.Mesh {
    const planeGeom = new THREE.PlaneGeometry(100, 100, 10, 10);
    const planeMat = new THREE.MeshBasicMaterial({ 
        color: 0xaaaaaa, 
        side: THREE.DoubleSide, 
        transparent: true, 
        opacity: 0.2 
    });
    const planeMesh = new THREE.Mesh(planeGeom, planeMat);
    planeMesh.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    planeMesh.position.z = 0;
    planeMesh.userData = { type: 'projection-plane' };
    return planeMesh;
}

/**
 * Takes a Vector object, calculates its projection onto the XY plane, 
 * and returns a THREE.ArrowHelper for the "shadow" vector.
 */
export function drawProjectedVector(vector: Vector): THREE.ArrowHelper {
    const startProjected = new THREE.Vector3(vector.start[0], vector.start[1], 0);
    const endProjected = new THREE.Vector3(vector.end[0], vector.end[1], 0);
    
    const dir = new THREE.Vector3().subVectors(endProjected, startProjected);
    const length = dir.length();
    dir.normalize();

    const arrowHelper = new THREE.ArrowHelper(dir, startProjected, length, vector.color, 0.15, 0.08);
    arrowHelper.userData = { id: vector.id, type: 'vector-projection' };
    return arrowHelper;
}

/**
 * Takes two 3D points (from, to) and returns a dotted THREE.Line 
 * to connect an object point to its projection.
 */
export function drawProjectionLine(from: [number, number, number], to: [number, number, number]): THREE.Line {
    const material = new THREE.LineDashedMaterial({ 
        color: 0x888888, 
        dashSize: 0.2, 
        gapSize: 0.1 
    });
    const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3().fromArray(from),
        new THREE.Vector3().fromArray(to)
    ]);
    const line = new THREE.Line(geometry, material);
    line.computeLineDistances(); // Important for dashed lines
    line.userData = { type: 'projection-visual' };
    return line;
}