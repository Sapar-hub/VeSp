import { create, all, type MathJsStatic } from 'mathjs';
import useStore, { AppState, SceneObject, Vector, Matrix } from '../store/mainStore';

const math = create(all) as MathJsStatic;

export const ExpressionEngine = {
    evaluate: (script: string, existingObjects: Map<string, SceneObject>) => {
        const parser = math.parser();
        const newObjects = new Map<string, SceneObject>();
        const errors = new Map<string, string>();
        const lines = script.split('\n');

        // Pre-define existing objects in the parser scope if they are not defined in the script
        const scriptDefinedNames = new Set(
            lines.map(line => line.match(/^([a-zA-Z_][a-zA-Z_0-9]*)\s*=/)).filter(Boolean).map(m => m![1])
        );
        for (const obj of existingObjects.values()) {
            if (!scriptDefinedNames.has(obj.name)) {
                if (obj.type === 'vector') {
                    parser.set(obj.name, (obj as Vector).components);
                } else if (obj.type === 'matrix') {
                    parser.set(obj.name, (obj as Matrix).values);
                }
            }
        }

        lines.forEach((line, index) => {
            const lineId = `line-${index}`;
            if (!line.trim()) return;

            try {
                const result = parser.evaluate(line);
                const assignmentMatch = line.match(/^([a-zA-Z_][a-zA-Z_0-9]*)\s*=/);

                if (assignmentMatch) {
                    const varName = assignmentMatch[1];
                    const newObject = ExpressionEngine.createSceneObjectFromResult(varName, result);
                    if (newObject) {
                        newObjects.set(newObject.id, newObject);
                        // Update parser for subsequent lines
                        if (newObject.type === 'vector') {
                            parser.set(newObject.name, (newObject as Vector).components);
                        } else if (newObject.type === 'matrix') {
                            parser.set(newObject.name, (newObject as Matrix).values);
                        }
                    }
                }
            } catch (error: any) {
                errors.set(lineId, error.message);
            }
        });

        return { newObjects, errors };
    },

    createSceneObjectFromResult: (name: string, result: any): SceneObject | null => {
        // Use the object's name as its ID to prevent ID collisions
        const id = name;
    
        if (Array.isArray(result) || result.isMatrix) {
            const resultArray = result.isMatrix ? result.toArray() : result;
    
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
