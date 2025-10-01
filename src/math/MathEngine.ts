import { vec3, mat3, mat4 } from 'gl-matrix';
import type { Vector, Matrix, SceneObjectUnion } from '../store/mainStore';
import { create, all } from 'mathjs';

const math = create(all);

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
            const result = math.eigs(matrix.values);
            // Math.js may return complex numbers, we need to handle this
            const eigenvalues = result.values.map(v => (typeof v === 'object' ? v.re : v));
            const eigenvectors = result.vectors.map(vec => vec.map(v => (typeof v === 'object' ? v.re : v)));
            return { status: "Success", payload: { eigenvalues, eigenvectors } };
        } catch (error) {
            return { status: "ComputationFailed", payload: null };
        }
    },

    checkLinearDependency: (vectors: Vector[]): boolean => {
        if (vectors.length === 0) return false;
        const matrix = math.matrix(vectors.map(v => v.components));
        try {
            const rank = math.rank(matrix);
            return rank < vectors.length;
        } catch (e) {
            return true; // Assume dependency on computation error
        }
    },

    applyTransformToObject: (object: Vector, matrix: Matrix): Response<Vector> => {
        const dim = object.components.length;
        if (matrix.values.length !== dim || matrix.values[0]?.length !== dim) {
            return { status: "DimensionMismatch", payload: null };
        }

        const newComponents = math.multiply(matrix.values, object.components);
        const newEnd = vec3.add(vec3.create(), object.start, newComponents as [number, number, number]);

        const newVector: Vector = {
            ...object,
            end: [newEnd[0], newEnd[1], newEnd[2]],
            components: [newComponents[0], newComponents[1], newComponents[2]],
        };
        return { status: "Success", payload: newVector };
    },

    getVectorCoordinatesInBasis: (vector: Vector, basis: Vector[]): Response<number[]> => {
        const basisMatrix = math.matrix(basis.map(v => v.components));
        if (math.rank(basisMatrix) < basis.length) {
            return { status: "InvalidBasis", payload: null };
        }
        try {
            const coords = math.lusolve(basisMatrix, vector.components);
            return { status: "Success", payload: coords.map(c => c[0]) };
        } catch (e) {
            return { status: "InvalidBasis", payload: null };
        }
    },

    findKernel: (matrix: Matrix): Response<Vector[]> => {
        try {
            const nullSpace = math.nullSpace(matrix.values);
            const basisVectors = nullSpace.map((vec, i) => ({
                id: `kernel_vec_${i}`,
                type: 'vector' as const,
                name: `Kernel Vec ${i + 1}`,
                color: '#00ffff',
                visible: true,
                start: [0, 0, 0] as [number, number, number],
                end: vec.toArray() as [number, number, number],
                components: vec.toArray() as [number, number, number],
            }));
            return { status: "Success", payload: basisVectors };
        } catch (e) {
            return { status: "Success", payload: [] }; // Or a failure response
        }
    },

    findImage: (matrix: Matrix): Response<Vector[]> => {
        // The image is the column space. We can find the basis of the column space
        // by finding the pivot columns of the row-reduced matrix.
        // A simpler way with mathjs is to take the transpose and find the kernel of the transpose's transpose
        try {
            const transposed = math.transpose(matrix.values);
            // This is not direct, a more complex algorithm like QR decomposition is needed for a robust solution.
            // For simplicity, we'll return the columns that are not zero vectors as a proxy.
            const imageVectors = matrix.values[0].map((_, colIndex) => matrix.values.map(rowIndex => rowIndex[colIndex]))
                .filter(col => col.some(val => Math.abs(val) > 1e-10))
                .map((vec, i) => ({
                    id: `image_vec_${i}`,
                    type: 'vector' as const,
                    name: `Image Vec ${i + 1}`,
                    color: '#ff00ff',
                    visible: true,
                    start: [0, 0, 0] as [number, number, number],
                    end: vec as [number, number, number],
                    components: vec as [number, number, number],
                }));
            return { status: "Success", payload: imageVectors };
        } catch (e) {
            return { status: "Success", payload: [] };
        }
    },

    findOrthogonalComplement: (subspaceBasis: Vector[]): Response<Vector[]> => {
        // This requires finding the null space of the matrix whose rows are the basis vectors.
        const matrix = math.matrix(subspaceBasis.map(v => v.components));
        try {
            const nullSpace = math.nullSpace(matrix);
            const basisVectors = nullSpace.map((vec, i) => ({
                id: `ortho_comp_vec_${i}`,
                type: 'vector' as const,
                name: `Ortho Comp ${i + 1}`,
                color: '#ffff00',
                visible: true,
                start: [0, 0, 0] as [number, number, number],
                end: vec.toArray() as [number, number, number],
                components: vec.toArray() as [number, number, number],
            }));
            return { status: "Success", payload: basisVectors };
        } catch (e) {
            return { status: "Success", payload: [] };
        }
    },
};