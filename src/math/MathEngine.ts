import { vec3 } from 'gl-matrix';
import type { Vector, Matrix, Point } from '../store/mainStore';
import { create, all, type MathJsStatic, type MathType } from 'mathjs';

const math = create(all) as MathJsStatic;
math.config({ number: 'number' }); // Ensure number type is 'number'

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
        } catch (_) {
            return { status: "ComputationFailed", payload: null };
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
        } catch (_) {
            return { status: "Singular", payload: null };
        }
    },

    calculateEigen: (matrix: Matrix): Response<{ eigenvectors: number[][], eigenvalues: number[] }> => {
        if (matrix.values.length !== matrix.values[0]?.length) {
            return { status: "NotSquareMatrix", payload: null };
        }
        try {
            const eigenResult = math.eigs(matrix.values);

            // Ensure values is an array of (number | math.Complex)
            const mapToNumOrComplex = (val: MathType): number | math.Complex => {
                if (math.isComplex(val)) return val;
                if (math.isBigNumber(val)) return val.toNumber();
                if (math.isFraction(val)) return val.valueOf() as number; // Convert fraction to number and cast
                if (math.isUnit(val)) return val.value as number; // Extract value from unit
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return math.number(val as any) as number; // Fallback for other MathTypes to number and cast
            };

            const rawValues = math.isMatrix(eigenResult.values) ? eigenResult.values.toArray() : eigenResult.values;
            const values: (number | math.Complex)[] = Array.isArray(rawValues) 
                ? rawValues.map(mapToNumOrComplex)
                : [mapToNumOrComplex(rawValues)];

            const rawEigenvectorsCollection = math.isMatrix(eigenResult.eigenvectors) ? eigenResult.eigenvectors.toArray() : eigenResult.eigenvectors;
            const eigenvectors: (number | math.Complex)[][] = Array.isArray(rawEigenvectorsCollection)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ? rawEigenvectorsCollection.map((item: any) => { // item could be an object {value, vector} or a MathType[]
                    const vectorArray = item.vector ? (math.isMatrix(item.vector) ? item.vector.toArray() : item.vector) : item;
                    return Array.isArray(vectorArray) ? vectorArray.map(mapToNumOrComplex) : [mapToNumOrComplex(vectorArray)];
                })
                : [[mapToNumOrComplex(rawEigenvectorsCollection)]];

            // Check for complex eigenvalues
            const hasComplex = values.some((v) => 
                typeof v === 'object' && 'im' in v && Math.abs((v as math.Complex).im) > 1e-10
            );

            if (hasComplex) {
                return { status: "ComplexEigenvalues", payload: null };
            }

            // Math.js may return complex numbers with 0 imaginary part, we need to handle this
            const eigenvalues = values.map((v) => (typeof v === 'object' && 're' in v && typeof (v as math.Complex).re === 'number' ? (v as math.Complex).re : v as number));
            const eigenvectorsAsNumbers = eigenvectors.map((vec) =>
                vec.map((v: number | math.Complex) => (typeof v === 'object' && 're' in v && typeof (v as math.Complex).re === 'number' ? (v as math.Complex).re : v as number))
            );
            return { status: "Success", payload: { eigenvalues, eigenvectors: eigenvectorsAsNumbers } };
        } catch (_) {
            return { status: "ComputationFailed", payload: null };
        }
    },

    checkLinearDependency: (vectors: Vector[]): boolean => {
        if (vectors.length === 0) return false;
        
        const numVectors = vectors.length;
        const dimension = vectors[0].components.length;

        // If we have more vectors than dimensions, they must be dependent
        if (numVectors > dimension) return true;

        // Construct matrix where vectors are columns
        // Matrix dimensions: [dimension x numVectors]
        const matrix: number[][] = [];
        for (let i = 0; i < dimension; i++) {
            matrix[i] = [];
            for (let j = 0; j < numVectors; j++) {
                matrix[i][j] = vectors[j].components[i];
            }
        }

        // Gaussian elimination to Row Echelon Form
        let pivotRow = 0;
        const numRows = dimension;
        const numCols = numVectors;

        for (let col = 0; col < numCols && pivotRow < numRows; col++) {
            // Find pivot in this column
            let maxRow = pivotRow;
            for (let i = pivotRow + 1; i < numRows; i++) {
                if (Math.abs(matrix[i][col]) > Math.abs(matrix[maxRow][col])) {
                    maxRow = i;
                }
            }

            // If pivot is zero (or close to it), this column adds no rank
            if (Math.abs(matrix[maxRow][col]) < 1e-10) {
                continue;
            }

            // Swap rows
            [matrix[pivotRow], matrix[maxRow]] = [matrix[maxRow], matrix[pivotRow]];

            // Eliminate rows below
            for (let i = pivotRow + 1; i < numRows; i++) {
                const factor = matrix[i][col] / matrix[pivotRow][col];
                // Optimized: Start from 'col' as previous entries are zero
                for (let j = col; j < numCols; j++) {
                    matrix[i][j] -= factor * matrix[pivotRow][j];
                }
            }

            pivotRow++;
        }

        // The rank is the number of non-zero rows (which equals pivotRow count here)
        const rank = pivotRow;

        // If Rank < Number of Vectors, they are linearly dependent
        return rank < numVectors;
    },

    applyTransformToObject: (object: Vector | Point, matrix: Matrix): Response<Vector | Point> => {
        if (object.type === 'vector') {
            const dim = object.components.length;
            if (matrix.values.length !== dim || matrix.values[0]?.length !== dim) {
                return { status: "DimensionMismatch", payload: null };
            }

            const newComponentsRaw = math.multiply(matrix.values, object.components);
            const newComponents = (Array.isArray(newComponentsRaw) ? newComponentsRaw : (newComponentsRaw as { toArray: () => number[] }).toArray()) as number[];

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
            const newPosition = (Array.isArray(newPositionRaw) ? newPositionRaw : (newPositionRaw as { toArray: () => number[] }).toArray()) as number[];

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
            const augmentedMatrix: number[][] = [];
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
        } catch (_) {
            return { status: "InvalidBasis", payload: null };
        }
    },

    findKernel: (matrix: Matrix): Response<Vector[]> => {
        console.log(matrix);
        try {
            // Implementation of null space calculation would go here
            // For now, returning empty array as a placeholder
            return { status: "Success", payload: [] };
        } catch (_) {
            return { status: "Success", payload: [] }; // Or a failure response
        }
    },

    findImage: (matrix: Matrix): Response<Vector[]> => {
        console.log(matrix);
        // The image (column space) of a matrix is the span of its column vectors
        try {
            // Placeholder implementation until nullSpace function is properly available
            return { status: "Success", payload: [] };
        } catch (_) {
            return { status: "Success", payload: [] };
        }
    },

    findOrthogonalComplement: (subspaceBasis: Vector[]): Response<Vector[]> => {
        console.log(subspaceBasis);
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
        } catch (_) {
            return { status: "ComputationFailed", payload: null };
        }
    },
};