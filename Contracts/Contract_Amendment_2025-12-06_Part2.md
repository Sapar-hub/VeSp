# Contract Amendment Proposal: Dual Space & Smart Grid Visualization

**Date:** 2025-12-06 (Amendment 2)

**Author:** Technical Director (AI)

**Reason for Change:** 
1.  To introduce "Dual Space" visualization (Covectors) as a core pedagogical feature.
2.  To implement "Smart Grid" logic that automatically switches between standard Cartesian grids and skewed Basis grids based on the script state.
3.  To update the UI contracts to reflect new toggles and coordinate displays.

---

## 1. `Architecture.xml` Amendment

### **State Store (`AppState`)**
*   **New Property:** `isDualSpaceVisible: boolean`
    *   Description: Global toggle for rendering covectors (parallel planes/lines) for selected vectors.
    *   Default: `false`

### **Components**
*   **`Toolbar`**: Added "Dual Space" toggle button contract.
*   **`VectorPropertiesEditor`**: Updated logic to compute and display `basisCoordinates` (Contravariant components) when a custom basis is active.

---

## 2. `DevelopmentPlan.xml` Amendment

### **Rendering Module**
*   **`ObjectDrawer` (3D) & `KonvaDrawer` (2D)**:
    *   **New Function `drawCovector`**:
        *   Input: `vector: Vector`
        *   Description: Renders the dual of the vector.
        *   3D Implementation: Stack of parallel semi-transparent planes perpendicular to $\mathbf{v}$, spaced by $1/||\mathbf{v}||$.
        *   2D Implementation: Stack of parallel dashed lines perpendicular to $\mathbf{v}$.

### **Math Module (`MathEngine`)**
*   **`getVectorCoordinatesInBasis`**:
    *   Contract reinforced to ensure robust solving of $\mathbf{B}\mathbf{c} = \mathbf{v}$ using Gaussian elimination, used dynamically by the UI.

---

## 3. `RequirementsAnalysis.xml` Amendment

### **New Scenario: SCN_021 (Dual Space)**
*   **Description:** User toggles "Dual Space" visualization to see the covector representation of a selected vector.
*   **Goal:** Visualize the concept of linear functionals as level sets (planes/lines) perpendicular to the vector arrow.
*   **Output:** Visual stack of planes/lines overlaid on the vector; density inversely proportional to vector length.

### **Updated Scenario: SCN_008 (Basis Change)**
*   **Refinement:** Explicitly mentions "Smart Grid" behavior — the grid automatically skews when variables named `x`, `y`, `z` in the script deviate from the standard basis.
