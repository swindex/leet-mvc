// HTML module declarations
declare module '*.html' {
  const content: string;
  export = content;
}

declare module '*.png' {
  const content: string;
  export = content;
}

declare module '*.svg' {
  const content: string;
  export = content;
}

declare module '*.scss' {
  const content: any;
  export = content;
}

// Global declarations
declare var moment: any;

interface Window {
  plugins: any;
}

