/**
 * A simple class to handle registering events on DOM elements.
 */
export class UIControlElement {
    #elements = {};

    /**
     * The constructor expects the selector for all elements
     * we want to register events on.
     * The elements must have a data-action attribute that will then
     * be used to register to specific events on it.
     *
     * @param selector {String}
     */
    constructor(selector) {
        const elements = window.document.querySelectorAll(selector);
        if (elements.length === 0) {
            throw new Error(`No matching elements found for selector: "${selector}"`);
        }

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const action = element.attributes['data-action'];
            if (action === undefined || action === null) continue;

            const value = action.value;
            if (typeof value === 'string' && value !== '') {
                this.#elements[value] = element;
            }
        }
    }

    /**
     * Adds a listener for a specific action.
     *
     * @param action {String}
     * @param eventName {String}
     * @param callback {Function}
     */
    on(action, eventName, callback) {
        if (this.#elements[action] === undefined) {
            throw new Error(`No matching action found: "${action}"`);
        }

        this.#elements[action].addEventListener(eventName, callback, false);
    }
}
