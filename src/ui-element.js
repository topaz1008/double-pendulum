export class UIElement {
    #elements;

    constructor(selector) {
        this.#elements = window.document.querySelectorAll(selector);
        if (this.#elements.length === 0) {
            throw new Error(`No matching elements found for selector: ${selector}`);
        }
    }

    on(eventName, callback) {
        // TODO: Add the action here too so outside callers
        //       need to add one listener per action
        const elements = this.#elements;
        for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
            el.addEventListener(eventName, callback, false);
        }
    }
}
