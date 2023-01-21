export class UIElement {
    #elements;

    constructor(selector) {
        this.#elements = window.document.querySelectorAll(selector);
        if (this.#elements.length === 0) {
            throw new Error(`No matching elements found for selector: ${selector}`);
        }
    }

    on(eventName, callback) {
        const elements = this.#elements;
        for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
            el.addEventListener(eventName, callback, false);
        }
    }
}
