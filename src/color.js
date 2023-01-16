/**
 * Simple color class for simple color manipulations.
 */
export class Color {
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    scale(t) {
        const r = this.r * t;
        const g = this.g * t;
        const b = this.b * t;
        const a = this.a * t;

        return new Color(r, g, b, a);
    }

    toString() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }

    static fromString(str) {
        const regex = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i;

        const match = regex.exec(str);
        if (match.length < 2) {
            console.log(`Color.fromString() -> invalid string color format ${str}`);

            return new Color();
        }

        const r = parseInt(match[1], 10);
        const g = parseInt(match[2], 10);
        const b = parseInt(match[3], 10);
        const a = 1; // TODO: can add alpha support if needed.

        return new Color(r, g, b, a);
    }
}
