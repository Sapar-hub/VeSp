# Contract Amendment Proposal: Cross Product Visualization & Syntax

**Date:** 2025-12-06 (Amendment 3)

**Author:** Technical Director (AI)

**Reason for Change:** 
1.  To implement specific visualization requests for the Cross Product operation.
2.  To formalize the user's custom syntax (`*` for cross product, `**` for dot product).
3.  To track the derivation of vectors to enable context-aware visualizations (like the right-hand rule arc).

---

## 1. `Architecture.xml` Amendment

### **Data Models (`Vector`)**
*   **New Property:** `derivation?: { type: 'cross_product' | 'other', operands: [string, string] }`
    *   Description: Stores metadata about how the vector was created. Specifically used to link a cross-product vector back to its parents for visualization purposes.

---

## 2. `DevelopmentPlan.xml` Amendment

### **Expression Engine**
*   **Custom Syntax:**
    *   `a * b` -> Interpreted as **Cross Product** if `a` and `b` are vectors. (Overrides standard `multiply` for these types).
    *   `a ** b` -> Interpreted as **Dot Product** if `a` and `b` are vectors. (Overrides standard `pow` for these types).
*   **Derivation Tracking:**
    *   The `ExpressionEngine` must detect when a cross product is evaluated and populate the `derivation` field of the resulting vector.

### **Rendering Module**
*   **`ObjectDrawer` (3D)**:
    *   **New Function `drawCrossProductVisuals`**:
        *   Input: `resultVector: Vector`, `operandA: Vector`, `operandB: Vector`
        *   Description: Renders the pedagogical hints for a cross product:
            1.  **Plane Highlight:** A semi-transparent parallelogram spanned by operands A and B.
            2.  **Orientation Hint:** A curved arrow (arc) indicating the rotation from A to B (Right-Hand Rule).

---

## 3. `RequirementsAnalysis.xml` Amendment

### **Updated Scenario: SCN_007 (Cross Product)**
*   **Action:** User inputs expression using `*` syntax (e.g., `c = a * b`).
*   **Goal:** Visualize the resulting orthogonal vector AND the geometric context.
*   **Output:**
    *   Result vector `c`.
    *   Persistent visual hint: The parallelogram spanned by `a` and `b`.
    *   Persistent visual hint: An arc from `a` to `b` showing the direction of rotation.
