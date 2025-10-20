declare module 'react-latex' {
  import { ComponentType, ReactNode } from 'react';
  
  interface LatexProps {
    children: string;
    [key: string]: any;
  }
  
  const Latex: ComponentType<LatexProps>;
  export default Latex;
}