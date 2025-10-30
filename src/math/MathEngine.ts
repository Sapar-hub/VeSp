import { vec3 } from 'gl-matrix';
import type { Vector, Matrix, Point } from '../store/mainStore';
import { create, all, type MathJsStatic } from 'mathjs';

const math = create(all) as MathJsStatic;

type Success<T> = { status: "Success"; payload: T; };
type Failure = { status: string; payload: null; };
type Response<T> = Success<T> | Failure;

export const MathEngine = {
    addVectors: (v1: Vector, v2: Vector): Response<Vector> => {
        if (v1.components.length !== v2.components.length) {
            return { status: "DimensionMismatch", payload: null };
        }
        const result_comp = vec3.add(vec3.create(), v1.components, v2.components);
        const resultVector: Vector = {
            id: crypto.randomUUID(), type: 'vector', name: 'Sum', color: '#ffffff', visible: true,
            start: [0, 0, 0], end: [result_comp[0], result_comp[1], result_comp[2]],
            components: [result_comp[0], result_comp[1], result_comp[2]],
        };
        return { status: "Success", payload: resultVector };
    },

    subtractVectors: (v1: Vector, v2: Vector): Response<Vector> => {
        if (v1.components.length !== v2.components.length) {
            return { status: "DimensionMismatch", payload: null };
        }
        const result_comp = vec3.subtract(vec3.create(), v1.components, v2.components);
        const resultVector: Vector = {
            id: crypto.randomUUID(), type: 'vector', name: 'Difference', color: '#ffffff', visible: true,
            start: [0, 0, 0], end: [result_comp[0], result_comp[1], result_comp[2]],
            components: [result_comp[0], result_comp[1], result_comp[2]],
        };
        return { status: "Success", payload: resultVector };
    },

    dotProduct: (v1: Vector, v2: Vector): Response<number> => {
        if (v1.components.length !== v2.components.length) {
            return { status: "DimensionMismatch", payload: null };
        }
        const result = vec3.dot(v1.components, v2.components);
        return { status: "Success", payload: result };
    },

    crossProduct: (v1: Vector, v2: Vector): Response<[number, number, number]> => {
        if (v1.components.length !== 3 || v2.components.length !== 3) {
            return { status: "NotIn3D", payload: null };
        }
        const result_comp = vec3.cross(vec3.create(), v1.components, v2.components);
        return { status: "Success", payload: [result_comp[0], result_comp[1], result_comp[2]] };
    },

    multiplyMatrices: (m1: Matrix, m2: Matrix): Response<Matrix> => {
        try {
            const result_values = math.multiply(m1.values, m2.values);
            const resultMatrix: Matrix = {
                ...m1, id: crypto.randomUUID(), name: 'Product', values: result_values,
            };
            return { status: "Success", payload: resultMatrix };
        } catch (e) {
            return { status: "DimensionMismatch", payload: null };
        }
    },

    invertMatrix: (m: Matrix): Response<Matrix> => {
        if (m.values.length !== m.values[0]?.length) {
            return { status: "NotSquare", payload: null };
        }
        try {
            const inverted_values = math.inv(m.values);
            const resultMatrix: Matrix = { ...m, id: crypto.randomUUID(), name: 'Inverse', values: inverted_values };
            return { status: "Success", payload: resultMatrix };
        } catch (e) {
            return { status: "Singular", payload: null };
        }
    },

    calculateEigen: (matrix: Matrix): Response<{ eigenvectors: number[][], eigenvalues: number[] }> => {
        if (matrix.values.length !== matrix.values[0]?.length) {
            return { status: "NotSquareMatrix", payload: null };
        }
        try {
            const result = math.eigs(matrix.values) as any;
            // Math.js may return complex numbers, we need to handle this
            const eigenvalues = Array.isArray(result.values)
                ? result.values.map((v: any) => (typeof v === 'object' && v.re !== undefined ? v.re : v))
                : [];
            const eigenvectors = Array.isArray(result.eigenvectors)
                ? result.eigenvectors.map((vec: any) =>
                    Array.isArray(vec) ? vec.map((v: any) => (typeof v === 'object' && v.re !== undefined ? v.re : v)) : vec
                )
                : [];
            return { status: "Success", payload: { eigenvalues, eigenvectors } };
        } catch (error) {
            return { status: "ComputationFailed", payload: null };
        }
    },

    checkLinearDependency: (vectors: Vector[]): boolean => {
        if (vectors.length === 0) return false;
        // For now, a simple check for collinearity in 2D/3D
        if (vectors.length === 1) return false; // Single vector is always independent
        if (vectors.length === 2) {
            // Check if two vectors are scalar multiples of each other
            const v1 = vectors[0].components;
            const v2 = vectors[1].components;

            // Simple approach: check if one is a scalar multiple of the other
            let ratio: number | null = null;
            for (let i = 0; i < v1.length; i++) {
                if (Math.abs(v1[i]) > 1e-10) { // v1[i] is non-zero
                    if (Math.abs(v2[i]) < 1e-10) return false; // v2[i] is zero but v1[i] is not
                    const currentRatio = v2[i] / v1[i];
                    if (ratio === null) {
                        ratio = currentRatio;
                    } else if (Math.abs(currentRatio - ratio) > 1e-10) {
                        return false; // Ratios don't match
                    }
                } else if (Math.abs(v2[i]) > 1e-10) {
                    return false; // v1[i] is zero but v2[i] is not
                }
                // If both are zero, continue
            }
            return ratio !== null; // Linearly dependent if a consistent ratio exists
        }
        // For now, just return false for cases with more than 2 vectors
        return false;
    },

    applyTransformToObject: (object: Vector | Point, matrix: Matrix): Response<Vector | Point> => {
        if (object.type === 'vector') {
            const dim = object.components.length;
            if (matrix.values.length !== dim || matrix.values[0]?.length !== dim) {
                return { status: "DimensionMismatch", payload: null };
            }

            const newComponentsRaw = math.multiply(matrix.values, object.components);
            // Ensure it's a flat array
            const newComponents = (Array.isArray(newComponentsRaw) ? newComponentsRaw : [newComponentsRaw]) as number[];

            const newEnd = vec3.add(vec3.create(), object.start, [newComponents[0], newComponents[1], newComponents[2] || 0]);

            const newVector: Vector = {
                ...object,
                end: [newEnd[0], newEnd[1], newEnd[2]],
                components: [newComponents[0], newComponents[1], newComponents[2] || 0],
            };
            return { status: "Success", payload: newVector };
        } else if (object.type === 'point') {
            const dim = object.position.length;
            if (matrix.values.length !== dim || matrix.values[0]?.length !== dim) {
                return { status: "DimensionMismatch", payload: null };
            }

            const newPositionRaw = math.multiply(matrix.values, object.position);
            // Ensure it's a flat array
            const newPosition = (Array.isArray(newPositionRaw) ? newPositionRaw : [newPositionRaw]) as number[];

            const newPoint: Point = {
                ...object,
                position: [newPosition[0], newPosition[1], newPosition[2] || 0],
            };
            return { status: "Success", payload: newPoint };
        }
        return { status: "InvalidType", payload: null };
    },

    getVectorCoordinatesInBasis: (vector: Vector, basis: Vector[]): Response<number[]> => {
        if (basis.length === 0) {
            return { status: "InvalidBasis", payload: null };
        }

        // Check linear independence of basis vectors
        if (basis.length > 1) {
            // Use a local implementation of the check
            if (MathEngine.checkLinearDependency(basis)) {
                return { status: "InvalidBasis", payload: null };
            }
        }

        // Solve the system: basisMatrix * coords = vector
        // For now, we'll implement a simple version for 2D/3D
        try {
            // Convert basis vectors to a matrix
            const n = basis[0].components.length; // dimension
            if (basis.length !== n) {
                return { status: "InvalidBasis", payload: null }; // Basis must have n vectors for R^n
            }

            // Create matrix from basis vectors (as columns)
            const basisMatrix: number[][] = [];
            for (let i = 0; i < n; i++) {
                const row: number[] = [];
                for (let j = 0; j < n; j++) {
                    row.push(basis[j].components[i]);
                }
                basisMatrix.push(row);
            }

            // Now solve: basisMatrix * coords = vector.components
            // This requires matrix inversion: coords = inv(basisMatrix) * vector.components
            // Using a simple Gaussian elimination for now
            let augmentedMatrix: number[][] = [];
            for (let i = 0; i < n; i++) {
                augmentedMatrix.push([...basisMatrix[i], vector.components[i]]);
            }

            // Perform Gauss-Jordan elimination
            for (let i = 0; i < n; i++) {
                // Find pivot
                let maxRow = i;
                for (let k = i + 1; k < n; k++) {
                    if (Math.abs(augmentedMatrix[k][i]) > Math.abs(augmentedMatrix[maxRow][i])) {
                        maxRow = k;
                    }
                }
                [augmentedMatrix[i], augmentedMatrix[maxRow]] = [augmentedMatrix[maxRow], augmentedMatrix[i]];

                // Check if matrix is singular
                if (Math.abs(augmentedMatrix[i][i]) < 1e-10) {
                    return { status: "InvalidBasis", payload: null };
                }

                // Make all rows below this one 0 in current column
                for (let k = i + 1; k < n; k++) {
                    const factor = augmentedMatrix[k][i] / augmentedMatrix[i][i];
                    for (let j = i; j < n + 1; j++) {
                        augmentedMatrix[k][j] -= factor * augmentedMatrix[i][j];
                    }
                }
            }

            // Back substitution
            const solution: number[] = new Array(n).fill(0);
            for (let i = n - 1; i >= 0; i--) {
                solution[i] = augmentedMatrix[i][n];
                for (let j = i + 1; j < n; j++) {
                    solution[i] -= augmentedMatrix[i][j] * solution[j];
                }
                solution[i] /= augmentedMatrix[i][i];
            }

            return { status: "Success", payload: solution };
        } catch (e) {
            return { status: "InvalidBasis", payload: null };
        }
    },

    findKernel: (_matrix: Matrix): Response<Vector[]> => {
        try {
            // Implementation of null space calculation would go here
            // For now, returning empty array as a placeholder
            return { status: "Success", payload: [] };
        } catch (e) {
            return { status: "Success", payload: [] }; // Or a failure response
        }
    },

    findImage: (_matrix: Matrix): Response<Vector[]> => {
        // The image (column space) of a matrix is the span of its column vectors
        try {
            // Placeholder implementation until nullSpace function is properly available
            return { status: "Success", payload: [] };
        } catch (e) {
            return { status: "Success", payload: [] };
        }
    },

    findOrthogonalComplement: (_subspaceBasis: Vector[]): Response<Vector[]> => {
        // const matrix = subspaceBasis.map(v => v.components);
        try {
            // const nullSpace = math.nullSpace(matrix);
            // const basisVectors = nullSpace.map((vec: any, i: number) => ({
            //     id: `ortho_comp_vec_${i}`,
            //     type: 'vector' as const,
            //     name: `Ortho Comp ${i + 1}`,
            //     color: '#ffff00',
            //     visible: true,
            //     start: [0, 0, 0] as [number, number, number],
            //     end: vec.toArray() as [number, number, number],
            //     components: vec.toArray() as [number, number, number],
            // }));
            // return { status: "Success", payload: basisVectors };
            return { status: "Success", payload: [] };
        } catch (e) {
            return { status: "ComputationFailed", payload: null };
        }
    },
};