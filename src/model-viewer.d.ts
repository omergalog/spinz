declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      src?: string;
      alt?: string;
      'auto-rotate'?: boolean | string;
      'camera-controls'?: boolean | string;
      'shadow-intensity'?: string;
      exposure?: string;
      style?: React.CSSProperties;
      'rotation-per-second'?: string;
      'field-of-view'?: string;
      'min-camera-orbit'?: string;
      'max-camera-orbit'?: string;
      'camera-orbit'?: string;
      poster?: string;
      loading?: string;
    };
  }
}
