import { create, all, type MathJsStatic, MathNode } from 'mathjs';
import { SceneObject, Vector, Matrix, SceneObjectUnion } from '../store/mainStore';

const math = create(all) as MathJsStatic;

export const ExpressionEngine = {
    evaluate: (script: string, existingObjects: Map<string, SceneObject>, visualizationMode: 'tip-to-tail' | 'parallelogram' | 'none') => {
        const parser = math.parser();
        const newObjects = new Map<string, SceneObject>();
        const tempObjects: SceneObjectUnion[] = [];
        const errors = new Map<string, string>();
        const lines = script.split('\n');

        const getVector = (name: string): Vector | undefined => {
            const obj = newObjects.get(name) || existingObjects.get(name);
            if (obj?.type === 'vector') {
                return obj as Vector;
            }
            const parsed = parser.get(name);
            if (Array.isArray(parsed)) {
                return ExpressionEngine.createSceneObjectFromResult(name, parsed) as Vector;
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
                    const newObject = ExpressionEngine.createSceneObjectFromResult(varName, result);
                    if (newObject) {
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
            } catch (error: any) {
                errors.set(lineId, error.message);
            }
        });

        return { newObjects, tempObjects, errors };
    },

    createSceneObjectFromResult: (name: string, result: any): SceneObject | null => {
        // Use the object's name as its ID to prevent ID collisions
        const id = name;
    
        if (Array.isArray(result) || (result && typeof result.toArray === 'function')) {
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
                } as Matrix;
            } else {
                // Vector
                const components: [number, number, number] = [resultArray[0] || 0, resultArray[1] || 0, resultArray[2] || 0];
                return {
                    id,
                    type: 'vector',
                    name,
                    color: '#ff0000',
                    visible: true,
                    start: [0, 0, 0],
                    end: components,
                    components,
                } as Vector;
            }
        }
    
        return null;
    },
};
