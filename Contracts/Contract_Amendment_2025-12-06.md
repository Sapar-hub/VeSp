# Contract Amendment Proposal: Passive Basis Visualization & Critical Math Fixes

**Date:** 2025-12-06

**Author:** Technical Director (AI)

**Reason for Change:** 
1.  To formally adopt the "Passive View" for basis transformations (moving the grid, not the vector) as the standard visualization strategy, ensuring mathematical pedagogical correctness.
2.  To reject the proposed "Number Theory/Modular Arithmetic" expansion as it conflicts with the project's core Continuous Linear Algebra architecture.
3.  To document critical fixes applied to the `MathEngine` (Rank-based linear dependence, Complex Eigenvalue handling).

---

## 1. `RequirementsAnalysis.xml` Amendment

**Scenario SCN_008 (Basis Change)** is redefined to specify the "Passive" visualization approach.

### **Current:**
> "Увидеть, как объекты пересчитываются в новой системе координат" (Ambiguous)

### **Proposed:**
> "Пользователь переключает базис. Геометрические векторы остаются на месте. Сетка координат и оси перерисовываются (искажаются/поворачиваются), отражая новый базис. Координаты векторов в свойствах обновляются относительно нового базиса."

---

## 2. `DevelopmentPlan.xml` Amendment

### **Math Module (`MathEngine`)**
*   **`checkLinearDependency`**: Explicitly mandates Gaussian Elimination (Rank calculation) to handle >2 vectors correctly.
*   **`calculateEigen`**: Updated Return Contract. Now returns status `ComplexEigenvalues` instead of failing or returning incorrect Real casts for rotation matrices.

### **Rendering Module (`ObjectDrawer`)**
*   **New Function `drawBasisGrid`**:
    *   Input: `basis: Vector[]`
    *   Description: Draws a grid aligned with the provided basis vectors (instead of the standard Cartesian grid).
*   **New Function `drawBasisAxes`**:
    *   Input: `basis: Vector[]`
    *   Description: Draws the axes of the new basis, visually distinct from the global XYZ axes.

---

## 3. `Architecture.xml` Amendment

### **State Store**
*   **`visualizationMode`**: Logic updated to ensure "Passive" transformations do not mutate the `Vector.end` (World Space coordinates), but only the view/grid and the displayed "Component" values.
