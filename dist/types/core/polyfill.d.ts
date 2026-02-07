declare global {
    interface Window {
        empty: (value: any) => boolean;
        device?: {
            platform: string;
            model: string;
        };
        platform?: string;
        requestAnimationFrame: (callback: FrameRequestCallback) => number;
        cancelAnimationFrame: (handle: number) => void;
    }
    interface Element {
        repaint(): void;
    }
}
declare const _default: () => void;
export default _default;
