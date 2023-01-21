/**
 * Simple color class for simple color manipulations.
 */
export class Color {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    scale(t) {
        const r = this.r * t;
        const g = this.g * t;
        const b = this.b * t;

        return new Color(r, g, b);
    }

    interpolate(t, rhs) {
        const r = this.r + t * (rhs.r - this.r);
        const g = this.g + t * (rhs.g - this.g);
        const b = this.b + t * (rhs.b - this.b);

        return new Color(r, g, b);
    }

    clone() {
        return new Color(this.r, this.g, this.b);
    }

    toString() {
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }

    static fromString(str) {
        const regex = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i;

        const match = regex.exec(str);
        if (match === null || match.length < 2) {
            console.warn(`Color.fromString() -> invalid string color format "${str}" returning red`);

            return new Color(255, 0, 0);
        }

        const r = parseInt(match[1], 10);
        const g = parseInt(match[2], 10);
        const b = parseInt(match[3], 10);

        return new Color(r, g, b);
    }
}
