# Contract Amendment Proposal: Component Improvement and Visual Redesign

**Date:** 2025-10-15

**Author:** Sapar (based on TZ: 15.10.25.md)

**Reason for Change:** To improve code maintainability by refactoring the `InspectorPanel` and to enhance the user experience through a consistent visual redesign, as specified in the Technical Assignment dated 15.10.25.

---

## 1. `Architecture.xml` Amendment

### **Visual Design Standards**
A new section `<VisualDesignStandards>` must be added (or updated) in `Architecture.xml` to define the strict visual rules.

-   **Color Palette:**
    -   Primary: `#007bff`
    -   Secondary: `#6c757d`
    -   Background: `rgba(30, 30, 30, 0.9)`
    -   Text: `#e0e0e0`
    -   Error: `#c0392b`
    -   Selection: `#007bff`
-   **Spacing:**
    -   Panel Padding: `15px`
    -   Section Padding: `10px`
    -   Button Margins: `4px 2px`
    -   Button Padding: `8px 12px`
    -   Input Margins: `8px`
-   **Visual Elements:**
    -   Border Radius: `8px`
    -   Border: `1px solid rgba(255, 255, 255, 0.1)`
    -   Backdrop Filter: `blur(10px)`

### **Component Refactoring**
The `InspectorPanel` component in the `UI` module needs to be decomposed.

-   **`InspectorPanel`**: Main container.
-   **New Sub-components**:
    -   `ObjectPropertiesPanel`: General properties (name, color, visible).
    -   `MultiSelectionPanel`: Multi-object operations.
    -   `MathOperationsPanel`: Math operations.
    -   `VectorPropertiesEditor`: Vector-specifics.
    -   `MatrixPropertiesEditor`: Matrix-specifics.

---

## 2. `DevelopmentPlan.xml` Amendment

### **UI Module Updates**
The `UI` module section must be updated to include contracts for the new sub-components.

#### **`InspectorPanel.tsx`**
-   **Logic Update**: Should now act as a coordinator/layout component, delegating specific editing tasks to sub-components.

#### **New Component Contracts**
-   **`ObjectPropertiesPanel.tsx`**:
    -   Props: `selectedObject: SceneObjectUnion`
    -   Logic: Edit name, color, visibility.
-   **`MultiSelectionPanel.tsx`**:
    -   Props: `selectedObjectIds: string[]`
    -   Logic: Batch operations.
-   **`MathOperationsPanel.tsx`**:
    -   Props: `selectedObject: SceneObject | null`
    -   Logic: Context-aware math operations.
-   **`VectorPropertiesEditor.tsx`**:
    -   Props: `selectedVector: Vector`
    -   Logic: Edit coordinates/components.
-   **`MatrixPropertiesEditor.tsx`**:
    -   Props: `selectedMatrix: Matrix`
    -   Logic: Edit matrix values, "Apply Transform".

---

## 3. `RequirementsAnalysis.xml` Amendment

### **New Scenarios**
-   **SCN_013 (Visual Consistency)**: User interacts with UI and sees consistent design.
-   **SCN_014 (Inspector Refactoring)**: User uses the improved InspectorPanel.
