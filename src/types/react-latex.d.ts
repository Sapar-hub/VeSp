declare module 'react-latex' {
  import { ComponentType } from 'react';
  
  interface LatexProps {
    children: string;
    displayMode?: boolean;
    leqno?: boolean;
    fleqn?: boolean;
    throwOnError?: boolean;
    errorColor?: string;
    macros?: Record<string, string>;
    strict?: boolean | string | ((errorCode: string, errorMsg: string, token: string) => boolean | string);
    trust?: boolean | ((context: { command: string; url: string; protocol: string }) => boolean);
    output?: 'html' | 'mathml' | 'htmlAndMathml';
  }
  
  const Latex: ComponentType<LatexProps>;
  export default Latex;
}