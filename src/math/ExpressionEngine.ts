import { create, all, type MathJsStatic } from 'mathjs';
import useStore, { AppState, SceneObject, Vector, Matrix } from '../store/mainStore';

const math = create(all) as MathJsStatic;

export const ExpressionEngine = {
    evaluateExpressions: (expressions: { id: string, value: string }[], objects: Map<string, SceneObject>) => {
        const parser = math.parser();
        const newObjects = new Map<string, SceneObject>();
        const errors = new Map<string, string>();

        // First, define existing objects as variables in the parser
        for (const [id, obj] of objects.entries()) {
            if (obj.type === 'vector') {
                parser.set(obj.name, (obj as Vector).components);
            } else if (obj.type === 'matrix') {
                parser.set(obj.name, (obj as Matrix).values);
            }
        }

        // Evaluate each expression
        for (const expr of expressions) {
            if (!expr.value.trim()) continue;

            try {
                const result = parser.evaluate(expr.value);

                // Check if the expression is an assignment
                const assignmentMatch = expr.value.match(/^([a-zA-Z_][a-zA-Z_0-9]*)\s*=/);
                if (assignmentMatch) {
                    const varName = assignmentMatch[1];
                    const newObject = ExpressionEngine.createSceneObjectFromResult(varName, result);
                    if (newObject) {
                        newObjects.set(newObject.id, newObject);
                    }
                }
            } catch (error: any) {
                errors.set(expr.id, error.message);
            }
        }

        return { newObjects, errors };
    },

    createSceneObjectFromResult: (name: string, result: any): SceneObject | null => {
        const id = name; // Use the variable name as the object ID for now

        if (Array.isArray(result)) {
            if (result.length > 0 && Array.isArray(result[0])) {
                // This is a matrix
                return {
                    id,
                    type: 'matrix',
                    name,
                    color: '#00ff00',
                    visible: true,
                    values: result,
                } as Matrix;
            } else {
                // This is a vector
                const components: [number, number, number] = [result[0] || 0, result[1] || 0, result[2] || 0];
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
