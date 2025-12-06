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
 * Creates a plane, line, or volume based on the vectors.
 */
export function drawSpan(vectors: Vector[], isLinearlyDependent: boolean): THREE.Mesh | THREE.Line {
    if (vectors.length === 0) {
        return new THREE.Mesh();
    }

    if (vectors.length === 1) {
        // Draw line representing span of single vector
        const v = vectors[0];
        // Create line extending in both directions from the vector start
        const dir = new THREE.Vector3(...v.components).normalize();
        const origin = new THREE.Vector3(...v.start);
        const start = origin.clone().add(dir.clone().multiplyScalar(-100));
        const end = origin.clone().add(dir.clone().multiplyScalar(100));
        
        const points = [start, end];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const color = isLinearlyDependent ? 0xff0000 : 0x00ff00;
        const material = new THREE.LineBasicMaterial({ 
            color: color, 
            transparent: true, 
            opacity: 0.5,
            linewidth: 2
        });
        return new THREE.Line(geometry, material);
    }

    if (vectors.length >= 2) {
        // For 2 vectors, determine if they span a line or a plane
        const v1 = new THREE.Vector3(...vectors[0].components).normalize();
        const v2 = new THREE.Vector3(...vectors[1].components).normalize();
        
        // Check if vectors are linearly dependent (parallel)
        const cross = new THREE.Vector3().crossVectors(v1, v2);
        const isParallel = cross.lengthSq() < 0.0001;
        
        if (isParallel) {
            // If parallel, span is still a line
            const v = vectors[0];
            const dir = new THREE.Vector3(...v.components).normalize();
            const origin = new THREE.Vector3(...v.start);
            const start = origin.clone().add(dir.clone().multiplyScalar(-100));
            const end = origin.clone().add(dir.clone().multiplyScalar(100));
            
            const points = [start, end];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ 
                color: 0xff0000, // Always red for dependent
                transparent: true, 
                opacity: 0.5,
                linewidth: 2
            });
            return new THREE.Line(geometry, material);
        } else {
            // Two independent vectors span a plane
            // Create a plane geometry centered at the average of the vector starts
            const avgPoint = new THREE.Vector3(
                (vectors[0].start[0] + vectors[1].start[0]) / 2,
                (vectors[0].start[1] + vectors[1].start[1]) / 2,
                (vectors[0].start[2] + vectors[1].start[2]) / 2
            );
            
            // Calculate normal to the plane
            const normal = new THREE.Vector3().crossVectors(v1, v2).normalize();
            
            // Create plane geometry
            const planeGeometry = new THREE.PlaneGeometry(50, 50, 20, 20);
            const color = isLinearlyDependent ? 0xff0000 : 0x00ff00;
            const planeMaterial = new THREE.MeshBasicMaterial({ 
                color: color, 
                side: THREE.DoubleSide, 
                transparent: true, 
                opacity: 0.3,
                wireframe: false
            });
            
            const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
            
            // Orient the plane according to the normal
            const quat = new THREE.Quaternion();
            quat.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
            planeMesh.quaternion.copy(quat);
            
            // Position at the average point
            planeMesh.position.copy(avgPoint);
            
            return planeMesh;
        }
    }
    
    // For more than 2 vectors, we could potentially span a 3D volume
    // For visualization purposes, we'll focus on the first two independent vectors
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

/**
 * Creates visual axes representing the new basis directions.
 */
export function drawBasisAxes(basis: Vector[]): THREE.Group {
    const group = new THREE.Group();
    const colors = [0xff0000, 0x00ff00, 0x0000ff]; // Red, Green, Blue for x, y, z
    const arrowLength = 3; // Length of the basis arrows

    basis.forEach((b, index) => {
        const dir = new THREE.Vector3().fromArray(b.components).normalize();
        const origin = new THREE.Vector3(0, 0, 0); // Basis vectors start at origin
        const color = colors[index % colors.length];

        const arrowHelper = new THREE.ArrowHelper(dir, origin, arrowLength, color, 0.3, 0.2);
        // arrowHelper.line.material.linewidth = 3; // Ignored by many renderers and causes TS issues
        group.add(arrowHelper);
    });

    return group;
}

/**
 * Creates a grid helper aligned with the provided basis vectors. Used for Passive Basis visualization.
 */
export function drawBasisGrid(basis: Vector[], size: number = 10, divisions: number = 10): THREE.Group {
    const group = new THREE.Group();
    const color = 0xcccccc; // Light grey for the grid lines

    if (basis.length < 1) {
        return group;
    }

    const b1 = new THREE.Vector3().fromArray(basis[0].components);
    const b2 = basis.length > 1 ? new THREE.Vector3().fromArray(basis[1].components) : new THREE.Vector3(0, 1, 0);
    const b3 = basis.length > 2 ? new THREE.Vector3().fromArray(basis[2].components) : new THREE.Vector3(0, 0, 1);

    const step = size / divisions;

    // Draw lines parallel to b1 and b2 (for a 2D plane grid)
    for (let i = -divisions / 2; i <= divisions / 2; i++) {
        for (let j = -divisions / 2; j <= divisions / 2; j++) {
            // Lines parallel to b1 (varying c2)
            if (i === 0) { // Highlight central axes
                const materialX = new THREE.LineBasicMaterial({ color: 0xffaaaa, linewidth: 2 });
                const pointsX = [
                    b1.clone().multiplyScalar(-size / 2).add(b2.clone().multiplyScalar(step * j)),
                    b1.clone().multiplyScalar(size / 2).add(b2.clone().multiplyScalar(step * j))
                ];
                const geometryX = new THREE.BufferGeometry().setFromPoints(pointsX);
                group.add(new THREE.Line(geometryX, materialX));
            } else {
                const materialX = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.5 });
                const pointsX = [
                    b1.clone().multiplyScalar(-size / 2).add(b2.clone().multiplyScalar(step * j)),
                    b1.clone().multiplyScalar(size / 2).add(b2.clone().multiplyScalar(step * j))
                ];
                const geometryX = new THREE.BufferGeometry().setFromPoints(pointsX);
                group.add(new THREE.Line(geometryX, materialX));
            }

            // Lines parallel to b2 (varying c1)
            if (j === 0) { // Highlight central axes
                const materialY = new THREE.LineBasicMaterial({ color: 0xaaffaa, linewidth: 2 });
                const pointsY = [
                    b2.clone().multiplyScalar(-size / 2).add(b1.clone().multiplyScalar(step * i)),
                    b2.clone().multiplyScalar(size / 2).add(b1.clone().multiplyScalar(step * i))
                ];
                const geometryY = new THREE.BufferGeometry().setFromPoints(pointsY);
                group.add(new THREE.Line(geometryY, materialY));
            } else {
                const materialY = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.5 });
                const pointsY = [
                    b2.clone().multiplyScalar(-size / 2).add(b1.clone().multiplyScalar(step * i)),
                    b2.clone().multiplyScalar(size / 2).add(b1.clone().multiplyScalar(step * i))
                ];
                const geometryY = new THREE.BufferGeometry().setFromPoints(pointsY);
                group.add(new THREE.Line(geometryY, materialY));
            }
        }
    }

    // If there are 3 basis vectors, add lines parallel to b3
    if (basis.length > 2) {
        for (let i = -divisions / 2; i <= divisions / 2; i++) {
            for (let j = -divisions / 2; j <= divisions / 2; j++) {
                // Lines parallel to b3 (varying c1 and c2)
                const materialZ = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.5 });
                const pointsZ = [
                    b3.clone().multiplyScalar(-size / 2).add(b1.clone().multiplyScalar(step * i)).add(b2.clone().multiplyScalar(step * j)),
                    b3.clone().multiplyScalar(size / 2).add(b1.clone().multiplyScalar(step * i)).add(b2.clone().multiplyScalar(step * j))
                ];
                const geometryZ = new THREE.BufferGeometry().setFromPoints(pointsZ);
                group.add(new THREE.Line(geometryZ, materialZ));
            }
        }
    }

    return group;
}

// Shared geometry to avoid recreation (optimization)
const sharedPlaneGeometry = new THREE.PlaneGeometry(20, 20);

/**
 * Visualizes the dual of a vector (covector) as a stack of parallel planes perpendicular to the vector.
 * Spacing between planes is 1 / ||v||.
 */
export function drawCovector(vector: Vector): THREE.Group {
    const group = new THREE.Group();
    const v = new THREE.Vector3().fromArray(vector.components);
    const length = v.length();

    if (length < 0.001) return group; 

    const spacing = 1 / length;
    const viewRadius = 20; // Draw planes within this distance from origin
    
    // Calculate how many planes fit in the view radius
    // Clamp to avoid performance issues with tiny spacing (huge vectors) or infinite loops
    let numPlanes = Math.ceil(viewRadius / spacing);
    if (numPlanes > 50) numPlanes = 50; 

    const color = vector.color; 

    // Create a material for the planes
    const material = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.15, // Slightly more transparent since there might be many
        depthWrite: false, // Optimization for transparent objects
    });

    // Direction to orient planes (normal = v)
    const zAxis = new THREE.Vector3(0, 0, 1);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(zAxis, v.clone().normalize());
    
    // Shared edges geometry logic is tricky because we need to rotate it. 
    // Better to create edges helper once per plane or skip edges if too many.
    // Let's keep edges but only for a reasonable number of planes to avoid clutter.
    const showEdges = numPlanes < 20;
    let edgesGeometry: THREE.EdgesGeometry | null = null;
    if (showEdges) {
         edgesGeometry = new THREE.EdgesGeometry(sharedPlaneGeometry);
    }

    for (let i = -numPlanes; i <= numPlanes; i++) {
        const plane = new THREE.Mesh(sharedPlaneGeometry, material);
        
        plane.setRotationFromQuaternion(quaternion);

        const position = v.clone().normalize().multiplyScalar(i * spacing);
        plane.position.copy(position);

        group.add(plane);

        if (showEdges && edgesGeometry) {
            const line = new THREE.LineSegments(edgesGeometry, new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.4 }));
            line.setRotationFromQuaternion(quaternion);
            line.position.copy(position);
            group.add(line);
        }
    }

    return group;
}

/**
 * Renders visual hints for cross product: a spanned parallelogram and an orientation arc.
 */
export function drawCrossProductVisuals(_resultVector: Vector, operandA: Vector, operandB: Vector): THREE.Group {
    const group = new THREE.Group();
    
    // 1. Draw Parallelogram (Plane spanned by A and B)
    // We assume all vectors start at the same point (usually origin or resultVector.start)
    // But strictly, cross product is about direction. Let's assume they share a tail.
    const origin = new THREE.Vector3().fromArray(operandA.start);
    const vA = new THREE.Vector3().fromArray(operandA.components);
    const vB = new THREE.Vector3().fromArray(operandB.components);

    // Vertices: Origin, A, A+B, B
    const p0 = origin.clone();
    const p1 = origin.clone().add(vA);
    const p2 = origin.clone().add(vA).add(vB);
    const p3 = origin.clone().add(vB);

    const planeGeometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
        p0.x, p0.y, p0.z,
        p1.x, p1.y, p1.z,
        p3.x, p3.y, p3.z,
        p1.x, p1.y, p1.z,
        p2.x, p2.y, p2.z,
        p3.x, p3.y, p3.z
    ]);
    planeGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    
    const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00, // Yellowish highlight
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.2
    });
    
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    group.add(plane);

    // 2. Draw Orientation Arc (Right-Hand Rule Hint)
    // Draw an arc from A to B
    const normal = new THREE.Vector3().crossVectors(vA, vB).normalize();
    const angle = vA.angleTo(vB);
    
        // If vectors are parallel, no arc
    
        if (angle < 0.01 || Math.PI - angle < 0.01) { // Check for near-parallel/anti-parallel
    
            return group;
    
        }
    
    
    
    const arcRadius = 0.2; // Fixed small radius for the hint arc
    const arcSegments = 32;
    const arcColor = 0x00ff00; // Green for the arc

    // Remove angleOffset to make the arc extend fully
    const effectiveAngle = angle; 

    if (effectiveAngle <= 0) { // If angle is too small, don't draw arc
        return group;
    }

    const points: THREE.Vector3[] = [];
    const vA_normalized = vA.clone().normalize();
    
    for (let i = 0; i <= arcSegments; i++) {
        const t = i / arcSegments;
        const currentAngle = effectiveAngle * t; // Use effectiveAngle
        
        const rotatedVector = vA_normalized.clone().applyAxisAngle(normal, currentAngle);
        points.push(origin.clone().add(rotatedVector.multiplyScalar(arcRadius)));
    }

    const arcGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const arcMaterial = new THREE.LineBasicMaterial({ color: arcColor });
    const arcLine = new THREE.Line(arcGeometry, arcMaterial);
    group.add(arcLine);

    // Arrowhead for the arc (Right-Hand Rule Hint)
    if (points.length >= 2) {
        // The last point of the arc is the intended location for the arrowhead's tip
        const lastArcPoint = points[points.length - 1];
        const secondLastArcPoint = points[points.length - 2];
        const arrowDirection = lastArcPoint.clone().sub(secondLastArcPoint).normalize();

        const arrowHeadLength = arcRadius * 0.3; // Make arrowhead length proportional to arc radius
        const arrowHeadWidth = arcRadius * 0.15;

        // Position the arrowhead such that its base is precisely at 'lastArcPoint'.
        const arrowOrigin = lastArcPoint.clone();

        // Create an ArrowHelper with stemLength 0, so only the head is drawn.
        const arrowHelper = new THREE.ArrowHelper(arrowDirection, arrowOrigin, 0, arcColor, arrowHeadLength, arrowHeadWidth);
        group.add(arrowHelper);
    }

    return group;
}
    
    