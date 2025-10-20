# Contract Amendment Proposal: Multi-Line Expression Editor

**Date:** 2025-10-20

**Author:** Kilo Code

**Reason for Change:** The existing implementation of the expression input as a list of single-line inputs does not match the desired user workflow. The user has clarified that they expect a multi-line, script-like editor where dependent expressions can be written in a single block. This amendment updates the project contracts to reflect this new requirement.

---

## 1. `RequirementsAnalysis.xml` Amendment

The following `Scenario` (`SCN_015`) should be **updated** to reflect a multi-line script input.

### **Current `SCN_015`:**
```xml
<Scenario id="SCN_015">
    <Description>Пользователь вводит математическое выражение в левой панели для создания или изменения объекта.</Description>
    <Actor type="Student">
        <Name>Студент или любитель математики</Name>
    </Actor>
    <Action>
        <Verb>Вводит выражение</Verb>
        <Details>
            <Parameter name="Expression">Математическое выражение (например, `a = [1, 2]`, `b = a * 2`)</Parameter>
        </Details>
    </Action>
    <Goal>
        <Description>Создать или изменить объект на сцене с помощью математического выражения. Панель также отображает список всех объектов.</Description>
        <Output>
            <Status>ObjectCreatedOrUpdated</Status>
            <ObjectId>ID созданного или обновленного объекта</ObjectId>
            <VisualRepresentation>Графическое отображение объекта</VisualRepresentation>
            <Error>Сообщение об ошибке, если выражение неверно</Error>
        </Output>
    </Goal>
</Scenario>
```

### **Proposed `SCN_015`:**
```xml
<Scenario id="SCN_015">
    <Description>Пользователь вводит многострочный математический скрипт в левой панели для создания или изменения объектов.</Description>
    <Actor type="Student">
        <Name>Студент или любитель математики</Name>
    </Actor>
    <Action>
        <Verb>Вводит скрипт</Verb>
        <Details>
            <Parameter name="Script">Многострочный математический скрипт (например, `a = [1, 2]\nb = a * 2`)</Parameter>
        </Details>
    </Action>
    <Goal>
        <Description>Создать или изменить несколько объектов на сцене с помощью зависимых математических выражений. Панель также отображает список всех объектов.</Description>
        <Output>
            <Status>ObjectsCreatedOrUpdated</Status>
            <ObjectIds>ID созданных или обновленных объектов</ObjectIds>
            <VisualRepresentation>Графическое отображение объектов</VisualRepresentation>
            <Errors>Сообщения об ошибках для каждой неверной строки</Errors>
        </Output>
    </Goal>
</Scenario>
```

---

## 2. `Architecture.xml` Amendment

The `ExpressionInputPanel` component definition should be **updated** to reflect that it is a multi-line editor.

### **Current Component Definition:**
```xml
<Component id="ExpressionInputPanel">
    <Description>Сворачиваемая панель для ввода математических выражений и отображения списка объектов на сцене.</Description>
    <API><ExpressionInputPanel /></API>
</Component>
```

### **Proposed Component Definition:**
```xml
<Component id="ExpressionInputPanel">
    <Description>Сворачиваемая панель с многострочным текстовым полем для ввода математических скриптов. Отображает список объектов на сцене и ошибки вычислений. Оценивает скрипт автоматически по мере ввода.</Description>
    <API><ExpressionInputPanel /></API>
</Component>
```

---

## 3. `DevelopmentPlan.xml` Amendment

The `ExpressionInputPanel` React component and the `mainStore`'s state and actions need to be **updated**.

### **State Change in `mainStore.ts`:**
The `expressions` property in `AppState` should be changed from an array of objects to a single string.

-   **Current:** `<Property name="expressions" type="{ id: string, value: string }[]" .../>`
-   **Proposed:** `<Property name="expressions" type="string" description="A multi-line script of user-defined expressions."/>`

### **Action Changes in `mainStore.ts`:**
The actions for managing expressions should be simplified.
-   **Remove:** `addExpression`, `removeExpression`.
-   **Update:** `updateExpression` will now take a single string argument: `updateExpression(script: string)`.
-   **Update:** `evaluateExpressions` will now receive the single script string and be responsible for parsing it.

### **Component Logic Change in `ExpressionInputPanel.tsx`:**
The component will no longer map over an array. It will render a single `<textarea>` element. The `onChange` event of the text area will call the updated `updateExpression` action.

### **Proposed `ExpressionInputPanel` React Component Contract:**
```xml
<ReactComponent name="ExpressionInputPanel">
    <Logic>
        <Description>
            Отображает многострочное текстовое поле (`textarea`) для ввода скрипта.
            При изменении текста в поле вызывает экшен `updateExpression`, передавая все содержимое как единую строку.
            В `useEffect` с задержкой вызывает `evaluateExpressions` для обновления сцены.
            Отображает список всех объектов на сцене и ошибки, связанные с вычислением скрипта.
            Является сворачиваемой панелью.
        </Description>
    </Logic>
</ReactComponent>