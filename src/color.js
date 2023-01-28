/**
 * Simple color class for simple color manipulations.
 */
export class Color {
    /**
     * @param r {Number}
     * @param g {Number}
     * @param b {Number}
     * @param a {Number=}
     */
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a || 255;
    }

    scale(t, alpha) {
        const r = this.r * t;
        const g = this.g * t;
        const b = this.b * t;
        let a = this.a;
        if (alpha === true) {
            a = this.a * t;
        }


        return new Color(r, g, b, a);
    }

    interpolate(t, rhs, alpha) {
        const r = this.r + t * (rhs.r - this.r);
        const g = this.g + t * (rhs.g - this.g);
        const b = this.b + t * (rhs.b - this.b);
        let a = this.a;
        if (alpha === true) {
            a = this.a + t * (rhs.a - this.a);
        }

        return new Color(r, g, b, a);
    }

    clone() {
        return new Color(this.r, this.g, this.b, this.a);
    }

    toString() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
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
        const a = 255;

        return new Color(r, g, b, a);
    }
}
