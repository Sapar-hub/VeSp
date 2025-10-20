# Contract Amendment Proposal: Visualization for Expression Script Operations

**Date:** 2025-10-21

**Author:** Kilo Code

**Reason for Change:** To enhance the educational value of the application, the expression script editor will be updated to visualize mathematical operations (e.g., vector addition) directly on the canvas. This will provide students with immediate geometric feedback, connecting the symbolic representation to its visual counterpart.

---

## 1. `Architecture.xml` Amendment

The `AppState` data model in `Architecture.xml` needs to be updated to include a property for storing temporary "ghost" objects used for visualization.

### **`AppState` Model Change:**
A new property, `tempObjects`, will be added to the `AppState` model.

-   **Proposed:** `<Property name="tempObjects" type="SceneObjectUnion[]" description="Temporary objects for visualization (e.g., ghost vectors for tip-to-tail addition)."/>`

---

## 2. `DevelopmentPlan.xml` Amendment

The `ExpressionEngine` service and the `mainStore` state and actions need to be updated to support this new feature.

### **`ExpressionEngine.ts` Service Change:**
The `evaluate` method in the `ExpressionEngine` will be updated to return not only the calculated objects and errors but also the temporary visualization objects.

-   **Current `evaluate` Output:** `{ newObjects: Map<string, SceneObject>, errors: Map<string, string> }`
-   **Proposed `evaluate` Output:** `{ newObjects: Map<string, SceneObject>, tempObjects: SceneObjectUnion[], errors: Map<string, string> }`

### **`mainStore.ts` State and Action Changes:**
The `AppState` will include the new `tempObjects` property. The `evaluateExpressions` action will be updated to handle the new data from the `ExpressionEngine`.

-   **State:** The `tempObjects` property will be added to the `AppState` interface.
-   **`evaluateExpressions` Action:** This action will now receive `tempObjects` from the `ExpressionEngine` and update the `tempObjects` state property accordingly.

### **Rendering Module Changes (`KonvaCanvas.tsx` & `ThreeCanvas.tsx`):**
The rendering components will be updated to read the `tempObjects` array from the `useStore` and render them on the canvas. These temporary objects will be styled differently (e.g., dashed lines or semi-transparent) to distinguish them from the primary scene objects.