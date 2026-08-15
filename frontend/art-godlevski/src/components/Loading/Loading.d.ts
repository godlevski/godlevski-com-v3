import { CSSProperties } from 'react';

interface LoadingProps {
  className?: string;
  scheme?: 'black' | 'white' | 'blue';
  size?: 'large' | 'medium' | 'small';
  position?: 'centered' | 'flat';
  style?: CSSProperties;
}

declare const Loading: (props: LoadingProps) => JSX.Element;
export default Loading;
