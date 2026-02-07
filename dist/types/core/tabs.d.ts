export declare const Tabs: {
    activate: (this_ctrl: HTMLElement | undefined) => void;
    activate_by_id: (id: string) => void;
    hide_all: (parent: HTMLElement) => void;
    /**
     * Initialize tabs
     * @param tabButtons - the tab-buttons container
     */
    init: (tabButtons: HTMLElement) => void;
    isActive: (el: HTMLElement) => boolean;
    setActive: (el: HTMLElement) => void;
    setInActive: (el: HTMLElement) => void;
};
