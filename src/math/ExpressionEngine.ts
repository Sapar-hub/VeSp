import { create, all, type MathJsStatic, type MathType } from 'mathjs';
import { SceneObject, Vector, Matrix as SceneMatrix, SceneObjectUnion } from '../store/mainStore'; // Renamed Matrix to SceneMatrix

const math = create(all) as MathJsStatic;

// Preserve original functions
const originalMultiply = math.multiply;
const originalPow = math.pow;

// Override standard functions to support vector shorthand syntax
math.import({
    multiply: function (a: MathType, b: MathType) { // Use MathType
        const isVectorLike = (val: MathType): boolean => { // Use MathType
            if (Array.isArray(val) && (val.length === 2 || val.length === 3)) {
                return true;
            }
            // Check if it's a math.js Matrix representing a 1D vector
            if (math.isMatrix(val)) {
                const size = val.size(); // Use .size() method
                if (size.length === 1 && (size[0] === 2 || size[0] === 3)) { // 1D vector
                    return true;
                }
            }
            return false;
        };

        const getArrayFromVectorLike = (val: MathType): number[] => {
            if (Array.isArray(val)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return val.map(v => math.number(v as any));
            }
            if (math.isMatrix(val)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return val.toArray().map((v: MathType) => math.number(v as any)); // Change 'any' to 'MathType'
            }
            return [];
        };

        const isVectorA = isVectorLike(a);
        const isVectorB = isVectorLike(b);

        if (isVectorA && isVectorB) {
            const arrA = getArrayFromVectorLike(a);
            const arrB = getArrayFromVectorLike(b);

            // Pad 2D vectors to 3D for cross product
            const vecA = arrA.length === 2 ? [...arrA, 0] : arrA;
            const vecB = arrB.length === 2 ? [...arrB, 0] : arrB;
            return math.cross(vecA, vecB);
        }
        
        // Fallback to standard multiplication (scalar, matrix, element-wise)
        return originalMultiply(a, b);
    },
    pow: function (a: MathType, b: MathType) { // Use MathType
        // Check if both are vectors (1D arrays)
        const isVectorA = Array.isArray(a);
        const isVectorB = Array.isArray(b);

        if (isVectorA && isVectorB) {
            return math.dot(a, b);
        }
        
        // Fallback to standard power
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return originalPow(a as any, b as any); // Cast to any to bypass type check for originalPow
    }
}, { override: true });

export const ExpressionEngine = {
    evaluate: (script: string, existingObjects: Map<string, SceneObject>, visualizationMode: 'tip-to-tail' | 'parallelogram' | 'none') => {
        const parser = math.parser();
        const newObjects = new Map<string, SceneObjectUnion>();
        const tempObjects: SceneObjectUnion[] = [];
        const errors = new Map<string, string>();
        const lines = script.split('\n');

        // Pre-populate parser with existing objects
        existingObjects.forEach((obj) => {
            if (obj.type === 'vector') {
                parser.set(obj.name, (obj as Vector).components);
            } else if (obj.type === 'matrix') {
                parser.set(obj.name, (obj as SceneMatrix).values); // Use SceneMatrix
            } else if (obj.type === 'point') {
                parser.set(obj.name, (obj as unknown as { position: number[] }).position);
            }
        });
        // Also pre-populate with new objects created in this evaluation run so far
        // (This is handled by parser.set inside the loop, but good to note)

        const getVector = (name: string): Vector | undefined => {
            const obj = newObjects.get(name) || existingObjects.get(name);
            if (obj?.type === 'vector') {
                return obj as Vector;
            }
            const parsed = parser.get(name);
            if (Array.isArray(parsed) || math.isMatrix(parsed)) { // Check for math.Matrix too
                const parsedArray = Array.isArray(parsed) ? parsed : parsed.toArray();
                return ExpressionEngine.createSceneObjectFromResult(name, parsedArray) as Vector;
            }
            return undefined;
        };

        lines.forEach((line, index) => {
            const lineId = `line-${index}`;
            if (!line.trim()) return;

            try {
                const node = math.parse(line);
                const result = node.evaluate(parser.getAll());

                if (math.isAssignmentNode(node)) {
                    const varName = node.name;
                    
                    let derivation: Vector['derivation'] | undefined = undefined;

                    // Detect Cross Product for derivation metadata
                    if (math.isOperatorNode(node.value) && node.value.op === '*') {
                        const args = node.value.args;
                        if (args.length === 2 && math.isSymbolNode(args[0]) && math.isSymbolNode(args[1])) {
                            // Check if both operands are vectors in the current scope
                            const leftVal = parser.get(args[0].name);
                            const rightVal = parser.get(args[1].name);
                            if ((Array.isArray(leftVal) || math.isMatrix(leftVal)) && (Array.isArray(rightVal) || math.isMatrix(rightVal))) {
                                derivation = {
                                    type: 'cross_product',
                                    operands: [args[0].name, args[1].name]
                                };
                            }
                        }
                    }

                    const newObject = ExpressionEngine.createSceneObjectFromResult(varName, result, derivation);
                    if (newObject) {
                        // Check if object with this name already exists to preserve ID
                        // (Simple matching by name for now, ideally we track IDs)
                        const existingId = Array.from(existingObjects.values()).find(o => o.name === varName)?.id 
                                        || Array.from(newObjects.values()).find(o => o.name === varName)?.id;
                        
                        if (existingId) {
                            newObject.id = existingId;
                        }

                        newObjects.set(newObject.id, newObject);
                        parser.set(varName, result);

                        // Visualization logic
                        if (visualizationMode !== 'none' && math.isOperatorNode(node.value) && newObject.type === 'vector') {
                            const opNode = node.value;
                            if ((opNode.op === '+' || opNode.op === '-') && opNode.args.length === 2) {
                                const leftNode = opNode.args[0];
                                const rightNode = opNode.args[1];
                                if (math.isSymbolNode(leftNode) && math.isSymbolNode(rightNode)) {
                                    const left = getVector(leftNode.name);
                                    let right = getVector(rightNode.name);

                                    if (left && right) {
                                        if (opNode.op === '-') {
                                            // Create a negated version of the right vector for visualization
                                            right = { ...right, id: `neg-${right.id}`, components: [-right.components[0], -right.components[1], -right.components[2]] };
                                        }

                                        if (visualizationMode === 'tip-to-tail') {
                                            const ghostVector: Vector = { ...right, id: `ghost-${right.id}`, start: left.end, end: [left.end[0] + right.components[0], left.end[1] + right.components[1], left.end[2] + right.components[2]], color: '#aaa' };
                                            tempObjects.push(ghostVector);
                                        } else if (visualizationMode === 'parallelogram') {
                                            const ghostA: Vector = { ...left, id: `ghost-a-${left.id}`, start: right.end, end: [right.end[0] + left.components[0], right.end[1] + left.components[1], right.end[2] + left.components[2]], color: '#aaa' };
                                            const ghostC: Vector = { ...right, id: `ghost-c-${right.id}`, start: left.end, end: [left.end[0] + right.components[0], left.end[1] + right.components[1], left.end[2] + right.components[2]], color: '#aaa' };
                                            tempObjects.push(ghostA, ghostC);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (error: unknown) {
                errors.set(lineId, error instanceof Error ? error.message : String(error));
            }
        });

        return { newObjects, tempObjects, errors };
    },

    createSceneObjectFromResult: (name: string, result: unknown, derivation?: Vector['derivation']): SceneObjectUnion | null => {
        // Use the object's name as its ID base (collisions handled in evaluate)
        const id = name; // Placeholder ID

        if (Array.isArray(result) || (math.isMatrix(result) && result.size().length <= 2)) { // Check for math.Matrix and its dimensions
            const resultArray = Array.isArray(result) ? result : result.toArray();

            if (resultArray.length > 0 && Array.isArray(resultArray[0])) {
                // Matrix
                return {
                    id,
                    type: 'matrix',
                    name,
                    color: '#00ff00',
                    visible: true,
                    values: resultArray,
                } as SceneMatrix; // Cast to SceneMatrix
            } else {
                // Vector
                const components: [number, number, number] = [resultArray[0] || 0, resultArray[1] || 0, resultArray[2] || 0];
                return {
                    id,
                    type: 'vector',
                    name,
                    color: derivation?.type === 'cross_product' ? '#ffa500' : '#ff0000', // Orange for cross product
                    visible: true,
                    start: [0, 0, 0],
                    end: components,
                    components,
                    derivation,
                } as Vector;
            }
        }

        return null;
    },
};
