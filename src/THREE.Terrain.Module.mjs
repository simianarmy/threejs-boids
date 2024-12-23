/**
 * THREE.Terrain.js 2.0.0-20220705
 *
 * @license MIT
 */
import * as THREE from 'three';

class Grad {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    dot2(x, y) {
        return this.x * x + this.y * y;
    }

    dot3(x, y, z) {
        return this.x * x + this.y * y + this.z * z;
    }
}

const grad3 = [
    new Grad(1, 1, 0), new Grad(-1, 1, 0), new Grad(1, -1, 0), new Grad(-1, -1, 0),
    new Grad(1, 0, 1), new Grad(-1, 0, 1), new Grad(1, 0, -1), new Grad(-1, 0, -1),
    new Grad(0, 1, 1), new Grad(0, -1, 1), new Grad(0, 1, -1), new Grad(0, -1, -1)
];

const p = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103,
    30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94,
    252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171,
    168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122,
    60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161,
    1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159,
    86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147,
    118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183,
    170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129,
    22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
    251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239,
    107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4,
    150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215,
    61, 156, 180
];

const perm = new Array(512);
const gradP = new Array(512);

export function seed(seedValue) {
    if (seedValue > 0 && seedValue < 1) {
        seedValue *= 65536;
    }

    seedValue = Math.floor(seedValue);
    if (seedValue < 256) {
        seedValue |= seedValue << 8;
    }

    for (let i = 0; i < 256; i++) {
        const v = i & 1 ? p[i] ^ (seedValue & 255) : p[i] ^ ((seedValue >> 8) & 255);
        perm[i] = perm[i + 256] = v;
        gradP[i] = gradP[i + 256] = grad3[v % 12];
    }
}


seed(Math.random());

const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;
const F3 = 1 / 3;
const G3 = 1 / 6;

export function simplex(xin, yin) {
    let n0, n1, n2;
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const x0 = xin - i + t;
    const y0 = yin - j + t;

    let i1, j1;
    if (x0 > y0) {
        i1 = 1; j1 = 0;
    } else {
        i1 = 0; j1 = 1;
    }

    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;

    const gi0 = gradP[i + perm[j]];
    const gi1 = gradP[i + i1 + perm[j + j1]];
    const gi2 = gradP[i + 1 + perm[j + 1]];

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 < 0) {
        n0 = 0;
    } else {
        t0 *= t0;
        n0 = t0 * t0 * gi0.dot2(x0, y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 < 0) {
        n1 = 0;
    } else {
        t1 *= t1;
        n1 = t1 * t1 * gi1.dot2(x1, y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 < 0) {
        n2 = 0;
    } else {
        t2 *= t2;
        n2 = t2 * t2 * gi2.dot2(x2, y2);
    }

    return 70 * (n0 + n1 + n2);
}

function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a, b, t) {
    return (1 - t) * a + t * b;
}

export function perlin(x, y) {
    const X = Math.floor(x);
    const Y = Math.floor(y);

    x = x - X;
    y = y - Y;

    const xi = X & 255;
    const yi = Y & 255;

    const n00 = gradP[xi + perm[yi]].dot2(x, y);
    const n01 = gradP[xi + perm[yi + 1]].dot2(x, y - 1);
    const n10 = gradP[xi + 1 + perm[yi]].dot2(x - 1, y);
    const n11 = gradP[xi + 1 + perm[yi + 1]].dot2(x - 1, y - 1);

    const u = fade(x);

    return lerp(
        lerp(n00, n10, u),
        lerp(n01, n11, u),
        fade(y)
    );
}
export default class Terrain {
    constructor(options = {}) {
        const defaultOptions = {
            after: null,
            easing: Terrain.Linear,
            heightmap: Terrain.DiamondSquare,
            material: null,
            maxHeight: 100,
            minHeight: -100,
            optimization: Terrain.NONE,
            frequency: 2.5,
            steps: 1,
            stretch: true,
            turbulent: false,
            xSegments: 63,
            xSize: 1024,
            ySegments: 63,
            ySize: 1024,
        };

        this.options = { ...defaultOptions, ...options };
        this.options.material = this.options.material || new THREE.MeshBasicMaterial({ color: 0xee6633 });

        this.scene = new THREE.Object3D();
        this.scene.rotation.x = -0.5 * Math.PI;

        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(this.options.xSize, this.options.ySize, this.options.xSegments, this.options.ySegments),
            this.options.material
        );

        const zs = Terrain.toArray1D(this.mesh.geometry.attributes.position.array);
        if (this.options.heightmap instanceof HTMLCanvasElement || this.options.heightmap instanceof Image) {
            Terrain.fromHeightmap(zs, this.options);
        } else if (typeof this.options.heightmap === 'function') {
            this.options.heightmap(zs, this.options);
        } else {
            console.warn('An invalid value was passed for `options.heightmap`: ' + this.options.heightmap);
        }
        Terrain.fromArray1D(this.mesh.geometry.attributes.position.array, zs);
        Terrain.Normalize(this.mesh, this.options);

        this.scene.add(this.mesh);
    }

    getScene() {
        return this.scene;
    }

    static Normalize(mesh, options) {
        const zs = Terrain.toArray1D(mesh.geometry.attributes.position.array);
        if (options.turbulent) {
            Terrain.Turbulence(zs, options);
        }
        if (options.steps > 1) {
            Terrain.Step(zs, options.steps);
            Terrain.Smooth(zs, options);
        }

        Terrain.Clamp(zs, options);

        if (typeof options.after === 'function') {
            options.after(zs, options);
        }
        Terrain.fromArray1D(mesh.geometry.attributes.position.array, zs);

        mesh.geometry.computeBoundingSphere();
        mesh.geometry.computeVertexNormals();
    }

    static toArray1D(vertices) {
        const tgt = new Float32Array(vertices.length / 3);
        for (let i = 0, l = tgt.length; i < l; i++) {
            tgt[i] = vertices[i * 3 + 2];
        }
        return tgt;
    }

    static fromArray1D(vertices, src) {
        for (let i = 0, l = Math.min(vertices.length / 3, src.length); i < l; i++) {
            vertices[i * 3 + 2] = src[i];
        }
    }

    static Clamp(g, options) {
        let min = Infinity;
        let max = -Infinity;
        const l = g.length;

        options.easing = options.easing || Terrain.Linear;
        for (let i = 0; i < l; i++) {
            if (g[i] < min) min = g[i];
            if (g[i] > max) max = g[i];
        }

        const actualRange = max - min;
        const optMax = typeof options.maxHeight !== 'number' ? max : options.maxHeight;
        const optMin = typeof options.minHeight !== 'number' ? min : options.minHeight;
        const targetMax = options.stretch ? optMax : (max < optMax ? max : optMax);
        const targetMin = options.stretch ? optMin : (min > optMin ? min : optMin);
        const range = targetMax - targetMin;

        if (targetMax < targetMin) {
            targetMax = optMax;
        }

        for (let i = 0; i < l; i++) {
            g[i] = options.easing((g[i] - min) / actualRange) * range + optMin;
        }
    }

    static Turbulence(g, options) {
        const range = options.maxHeight - options.minHeight;
        for (let i = 0, l = g.length; i < l; i++) {
            g[i] = options.minHeight + Math.abs((g[i] - options.minHeight) * 2 - range);
        }
    }

    static Step(g, levels) {
        const l = g.length;
        const heights = new Array(l);
        const buckets = new Array(levels);
        const inc = Math.floor(l / levels);

        if (typeof levels === 'undefined') {
            levels = Math.floor(Math.pow(l * 0.5, 0.25));
        }

        for (let i = 0; i < l; i++) {
            heights[i] = g[i];
        }

        heights.sort((a, b) => a - b);

        for (let i = 0; i < levels; i++) {
            const subset = heights.slice(i * inc, (i + 1) * inc);
            const sum = subset.reduce((a, b) => a + b, 0);
            const avg = sum / subset.length;

            buckets[i] = {
                min: subset[0],
                max: subset[subset.length - 1],
                avg: avg
            };
        }

        for (let i = 0; i < l; i++) {
            const startHeight = g[i];
            for (let j = 0; j < levels; j++) {
                if (startHeight >= buckets[j].min && startHeight <= buckets[j].max) {
                    g[i] = buckets[j].avg;
                    break;
                }
            }
        }
    }

    static Smooth(g, options, weight = 0) {
        const heightmap = new Float32Array(g.length);
        const xl = options.xSegments + 1;
        const yl = options.ySegments + 1;

        for (let i = 0; i < xl; i++) {
            for (let j = 0; j < yl; j++) {
                let sum = 0;
                let c = 0;
                for (let n = -1; n <= 1; n++) {
                    for (let m = -1; m <= 1; m++) {
                        const key = (j + n) * xl + i + m;
                        if (typeof g[key] !== 'undefined' && i + m >= 0 && j + n >= 0 && i + m < xl && j + n < yl) {
                            sum += g[key];
                            c++;
                        }
                    }
                }
                heightmap[j * xl + i] = sum / c;
            }
        }

        const w = 1 / (1 + weight);
        for (let k = 0, l = g.length; k < l; k++) {
            g[k] = (heightmap[k] + g[k] * weight) * w;
        }
    }

    static fromHeightmap(g, options) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const rows = options.ySegments + 1;
        const cols = options.xSegments + 1;
        const spread = options.maxHeight - options.minHeight;

        canvas.width = cols;
        canvas.height = rows;
        context.drawImage(options.heightmap, 0, 0, canvas.width, canvas.height);
        const data = context.getImageData(0, 0, canvas.width, canvas.height).data;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const i = row * cols + col;
                const idx = i * 4;
                g[i] = (data[idx] + data[idx + 1] + data[idx + 2]) / 765 * spread + options.minHeight;
            }
        }
    }

    static toHeightmap(g, options) {
        const hasMax = typeof options.maxHeight !== 'undefined';
        const hasMin = typeof options.minHeight !== 'undefined';
        let max = hasMax ? options.maxHeight : -Infinity;
        let min = hasMin ? options.minHeight : Infinity;

        if (!hasMax || !hasMin) {
            let max2 = max;
            let min2 = min;
            for (let k = 2, l = g.length; k < l; k += 3) {
                if (g[k] > max2) max2 = g[k];
                if (g[k] < min2) min2 = g[k];
            }
            if (!hasMax) max = max2;
            if (!hasMin) min = min2;
        }

        const canvas = options.heightmap instanceof HTMLCanvasElement ? options.heightmap : document.createElement('canvas');
        const context = canvas.getContext('2d');
        const rows = options.ySegments + 1;
        const cols = options.xSegments + 1;
        const spread = max - min;

        canvas.width = cols;
        canvas.height = rows;
        const d = context.createImageData(canvas.width, canvas.height);
        const data = d.data;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const i = row * cols + col;
                const idx = i * 4;
                data[idx] = data[idx + 1] = data[idx + 2] = Math.round(((g[i * 3 + 2] - min) / spread) * 255);
                data[idx + 3] = 255;
            }
        }
        context.putImageData(d, 0, 0);
        return canvas;
    }

    static Linear(x) {
        return x;
    }

    static EaseIn(x) {
        return x * x;
    }

    static EaseOut(x) {
        return -x * (x - 2);
    }

    static EaseInOut(x) {
        return x * x * (3 - 2 * x);
    }

    static InEaseOut(x) {
        const y = 2 * x - 1;
        return 0.5 * y * y * y + 0.5;
    }

    static EaseInWeak(x) {
        return Math.pow(x, 1.55);
    }

    static EaseInStrong(x) {
        return x * x * x * x * x * x * x;
    }

    static Edges(g, options, direction, distance, easing, edges) {
        var numXSegments = Math.floor(distance / (options.xSize / options.xSegments)) || 1,
            numYSegments = Math.floor(distance / (options.ySize / options.ySegments)) || 1,
            peak = direction ? options.maxHeight : options.minHeight,
            max = direction ? Math.max : Math.min,
            xl = options.xSegments + 1,
            yl = options.ySegments + 1,
            i, j, multiplier, k1, k2;
        easing = easing || Terrain.EaseInOut;
        if (typeof edges !== 'object') {
            edges = {top: true, bottom: true, left: true, right: true};
        }
        for (i = 0; i < xl; i++) {
            for (j = 0; j < numYSegments; j++) {
                multiplier = easing(1 - j / numYSegments);
                k1 = j * xl + i;
                k2 = (options.ySegments - j) * xl + i;
                if (edges.top) {
                    g[k1] = max(g[k1], (peak - g[k1]) * multiplier + g[k1]);
                }
                if (edges.bottom) {
                    g[k2] = max(g[k2], (peak - g[k2]) * multiplier + g[k2]);
                }
            }
        }
        for (i = 0; i < yl; i++) {
            for (j = 0; j < numXSegments; j++) {
                multiplier = easing(1 - j / numXSegments);
                k1 = i * xl + j;
                k2 = (options.ySegments - i) * xl + (options.xSegments - j);
                if (edges.left) {
                    g[k1] = max(g[k1], (peak - g[k1]) * multiplier + g[k1]);
                }
                if (edges.right) {
                    g[k2] = max(g[k2], (peak - g[k2]) * multiplier + g[k2]);
                }
            }
        }
        Terrain.Clamp(g, {
            maxHeight: options.maxHeight,
            minHeight: options.minHeight,
            stretch: true,
        });
    }

    static RadialEdges(g, options, direction, distance, easing) {
        var peak = direction ? options.maxHeight : options.minHeight,
            max = direction ? Math.max : Math.min,
            xl = (options.xSegments + 1),
            yl = (options.ySegments + 1),
            xl2 = xl * 0.5,
            yl2 = yl * 0.5,
            xSegmentSize = options.xSize / options.xSegments,
            ySegmentSize = options.ySize / options.ySegments,
            edgeRadius = Math.min(options.xSize, options.ySize) * 0.5 - distance,
            i, j, multiplier, k, vertexDistance;
        for (i = 0; i < xl; i++) {
            for (j = 0; j < yl2; j++) {
                k = j * xl + i;
                vertexDistance = Math.min(edgeRadius, Math.sqrt((xl2 - i) * xSegmentSize * (xl2 - i) * xSegmentSize + (yl2 - j) * ySegmentSize * (yl2 - j) * ySegmentSize) - distance);
                if (vertexDistance < 0) continue;
                multiplier = easing(vertexDistance / edgeRadius);
                g[k] = max(g[k], (peak - g[k]) * multiplier + g[k]);
                // Use symmetry to reduce the number of iterations.
                k = (options.ySegments - j) * xl + i;
                g[k] = max(g[k], (peak - g[k]) * multiplier + g[k]);
            }
        }
    }

    static Smooth(g, options, weight) {
        var heightmap = new Float32Array(g.length);
        for (var i = 0, xl = options.xSegments + 1, yl = options.ySegments + 1; i < xl; i++) {
            for (var j = 0; j < yl; j++) {
                var sum = 0,
                    c = 0;
                for (var n = -1; n <= 1; n++) {
                    for (var m = -1; m <= 1; m++) {
                        var key = (j + n) * xl + i + m;
                        if (typeof g[key] !== 'undefined' && i + m >= 0 && j + n >= 0 && i + m < xl && j + n < yl) {
                            sum += g[key];
                            c++;
                        }
                    }
                }
                heightmap[j * xl + i] = sum / c;
            }
        }
        weight = weight || 0;
        var w = 1 / (1 + weight);
        for (var k = 0, l = g.length; k < l; k++) {
            g[k] = (heightmap[k] + g[k] * weight) * w;
        }
    }

    static SmoothMedian(g, options) {
        var heightmap = new Float32Array(g.length),
            neighborValues = [],
            neighborKeys = [],
            sortByValue = function(a, b) {
                return neighborValues[a] - neighborValues[b];
            };
        for (var i = 0, xl = options.xSegments + 1, yl = options.ySegments + 1; i < xl; i++) {
            for (var j = 0; j < yl; j++) {
                neighborValues.length = 0;
                neighborKeys.length = 0;
                for (var n = -1; n <= 1; n++) {
                    for (var m = -1; m <= 1; m++) {
                        var key = (j + n) * xl + i + m;
                        if (typeof g[key] !== 'undefined' && i + m >= 0 && j + n >= 0 && i + m < xl && j + n < yl) {
                            neighborValues.push(g[key]);
                            neighborKeys.push(key);
                        }
                    }
                }
                neighborKeys.sort(sortByValue);
                var halfKey = Math.floor(neighborKeys.length * 0.5),
                    median;
                if (neighborKeys.length % 2 === 1) {
                    median = g[neighborKeys[halfKey]];
                } else {
                    median = (g[neighborKeys[halfKey - 1]] + g[neighborKeys[halfKey]]) * 0.5;
                }
                heightmap[j * xl + i] = median;
            }
        }
        for (var k = 0, l = g.length; k < l; k++) {
            g[k] = heightmap[k];
        }
    }

    static SmoothConservative(g, options, multiplier) {
        var heightmap = new Float32Array(g.length);
        for (var i = 0, xl = options.xSegments + 1, yl = options.ySegments + 1; i < xl; i++) {
            for (var j = 0; j < yl; j++) {
                var max = -Infinity,
                    min = Infinity;
                for (var n = -1; n <= 1; n++) {
                    for (var m = -1; m <= 1; m++) {
                        var key = (j + n) * xl + i + m;
                        if (typeof g[key] !== 'undefined' && n && m && i + m >= 0 && j + n >= 0 && i + m < xl && j + n < yl) {
                            if (g[key] < min) min = g[key];
                            if (g[key] > max) max = g[key];
                        }
                    }
                }
                var kk = j * xl + i;
                if (typeof multiplier === 'number') {
                    var halfdiff = (max - min) * 0.5,
                        middle = min + halfdiff;
                    max = middle + halfdiff * multiplier;
                    min = middle - halfdiff * multiplier;
                }
                heightmap[kk] = g[kk] > max ? max : (g[kk] < min ? min : g[kk]);
            }
        }
        for (var k = 0, l = g.length; k < l; k++) {
            g[k] = heightmap[k];
        }
    }

    static Step(g, levels) {
        var i = 0,
            j = 0,
            l = g.length,
            inc = Math.floor(l / levels),
            heights = new Array(l),
            buckets = new Array(levels);
        if (typeof levels === 'undefined') {
            levels = Math.floor(Math.pow(l * 0.5, 0.25));
        }
        for (i = 0; i < l; i++) {
            heights[i] = g[i];
        }
        heights.sort(function(a, b) {
            return a - b;
        });
        for (i = 0; i < levels; i++) {
            var subset = heights.slice(i * inc, (i + 1) * inc),
                sum = 0,
                bl = subset.length;
            for (j = 0; j < bl; j++) {
                sum += subset[j];
            }
            buckets[i] = {
                min: subset[0],
                max: subset[subset.length - 1],
                avg: sum / bl,
            };
        }
        for (i = 0; i < l; i++) {
            var startHeight = g[i];
            for (j = 0; j < levels; j++) {
                if (startHeight >= buckets[j].min && startHeight <= buckets[j].max) {
                    g[i] = buckets[j].avg;
                    break;
                }
            }
        }
    }

    static Turbulence(g, options) {
        var range = options.maxHeight - options.minHeight;
        for (var i = 0, l = g.length; i < l; i++) {
            g[i] = options.minHeight + Math.abs((g[i] - options.minHeight) * 2 - range);
        }
    }

    static MultiPass(g, options, passes) {
        var clonedOptions = {};
        for (var opt in options) {
            if (options.hasOwnProperty(opt)) {
                clonedOptions[opt] = options[opt];
            }
        }
        var range = options.maxHeight - options.minHeight;
        for (var i = 0, l = passes.length; i < l; i++) {
            var amp = typeof passes[i].amplitude === 'undefined' ? 1 : passes[i].amplitude,
                move = 0.5 * (range - range * amp);
            clonedOptions.maxHeight = options.maxHeight - move;
            clonedOptions.minHeight = options.minHeight + move;
            clonedOptions.frequency = typeof passes[i].frequency === 'undefined' ? options.frequency : passes[i].frequency;
            passes[i].method(g, clonedOptions);
        }
    }

    static Curve(g, options, curve) {
        var range = (options.maxHeight - options.minHeight) * 0.5,
            scalar = options.frequency / (Math.min(options.xSegments, options.ySegments) + 1);
        for (var i = 0, xl = options.xSegments + 1, yl = options.ySegments + 1; i < xl; i++) {
            for (var j = 0; j < yl; j++) {
                g[j * xl + i] += curve(i * scalar, j * scalar) * range;
            }
        }
    }

    static Cosine(g, options) {
        var amplitude = (options.maxHeight - options.minHeight) * 0.5,
            frequencyScalar = options.frequency * Math.PI / (Math.min(options.xSegments, options.ySegments) + 1),
            phase = Math.random() * Math.PI * 2;
        for (var i = 0, xl = options.xSegments + 1; i < xl; i++) {
            for (var j = 0, yl = options.ySegments + 1; j < yl; j++) {
                g[j * xl + i] += amplitude * (Math.cos(i * frequencyScalar + phase) + Math.cos(j * frequencyScalar + phase));
            }
        }
    }

    static CosineLayers(g, options) {
        Terrain.MultiPass(g, options, [
            { method: Terrain.Cosine,                   frequency:  2.5 },
            { method: Terrain.Cosine, amplitude: 0.1,   frequency:  12  },
            { method: Terrain.Cosine, amplitude: 0.05,  frequency:  15  },
            { method: Terrain.Cosine, amplitude: 0.025, frequency:  20  },
        ]);
    }

    static DiamondSquare(g, options) {
        var segments = THREE.MathUtils.ceilPowerOfTwo(Math.max(options.xSegments, options.ySegments) + 1);
        var size = segments + 1,
            heightmap = [],
            smoothing = (options.maxHeight - options.minHeight),
            i,
            j,
            xl = options.xSegments + 1,
            yl = options.ySegments + 1;
        for (i = 0; i <= segments; i++) {
            heightmap[i] = new Float64Array(segments + 1);
        }
        for (var l = segments; l >= 2; l /= 2) {
            var half = Math.round(l * 0.5),
                whole = Math.round(l),
                x,
                y,
                avg,
                d,
                e;
            smoothing /= 2;
            for (x = 0; x < segments; x += whole) {
                for (y = 0; y < segments; y += whole) {
                    d = Math.random() * smoothing * 2 - smoothing;
                    avg = heightmap[x][y] + heightmap[x + whole][y] + heightmap[x][y + whole] + heightmap[x + whole][y + whole];
                    avg *= 0.25;
                    heightmap[x + half][y + half] = avg + d;
                }
            }
            for (x = 0; x < segments; x += half) {
                for (y = (x + half) % l; y < segments; y += l) {
                    d = Math.random() * smoothing * 2 - smoothing;
                    avg = heightmap[(x - half + size) % size][y] + heightmap[(x + half) % size][y] + heightmap[x][(y + half) % size] + heightmap[x][(y - half + size) % size];
                    avg *= 0.25;
                    avg += d;
                    heightmap[x][y] = avg;
                    if (x === 0) heightmap[segments][y] = avg;
                    if (y === 0) heightmap[x][segments] = avg;
                }
            }
        }
        for (i = 0; i < xl; i++) {
            for (j = 0; j < yl; j++) {
                g[j * xl + i] += heightmap[i][j];
            }
        }
    }

    static Fault(g, options) {
        var d = Math.sqrt(options.xSegments * options.xSegments + options.ySegments * options.ySegments),
            iterations = d * options.frequency,
            range = (options.maxHeight - options.minHeight) * 0.5,
            displacement = range / iterations,
            smoothDistance = Math.min(options.xSize / options.xSegments, options.ySize / options.ySegments) * options.frequency;
        for (var k = 0; k < iterations; k++) {
            var v = Math.random(),
                a = Math.sin(v * Math.PI * 2),
                b = Math.cos(v * Math.PI * 2),
                c = Math.random() * d - d * 0.5;
            for (var i = 0, xl = options.xSegments + 1; i < xl; i++) {
                for (var j = 0, yl = options.ySegments + 1; j < yl; j++) {
                    var distance = a * i + b * j - c;
                    if (distance > smoothDistance) {
                        g[j * xl + i] += displacement;
                    } else if (distance < -smoothDistance) {
                        g[j * xl + i] -= displacement;
                    } else {
                        g[j * xl + i] += Math.cos(distance / smoothDistance * Math.PI * 2) * displacement;
                    }
                }
            }
        }
    }

    static Hill(g, options, feature, shape) {
        var frequency = options.frequency * 2,
            numFeatures = frequency * frequency * 10,
            heightRange = options.maxHeight - options.minHeight,
            minHeight = heightRange / (frequency * frequency),
            maxHeight = heightRange / frequency,
            smallerSideLength = Math.min(options.xSize, options.ySize),
            minRadius = smallerSideLength / (frequency * frequency),
            maxRadius = smallerSideLength / frequency;
        feature = feature || Terrain.Influences.Hill;
        var coords = { x: 0, y: 0 };
        for (var i = 0; i < numFeatures; i++) {
            var radius = Math.random() * (maxRadius - minRadius) + minRadius,
                height = Math.random() * (maxHeight - minHeight) + minHeight;
            var min = 0 - radius,
                maxX = options.xSize + radius,
                maxY = options.ySize + radius;
            coords.x = Math.random();
            coords.y = Math.random();
            if (typeof shape === 'function') shape(coords);
            Terrain.Influence(
                g, options,
                feature,
                coords.x, coords.y,
                radius, height,
                THREE.AdditiveBlending,
                Terrain.EaseInStrong
            );
        }
    }

    static HillIsland(g, options, feature) {
        var island = function(coords) {
            var theta = Math.random() * Math.PI * 2;
            coords.x = 0.5 + Math.cos(theta) * coords.x * 0.4;
            coords.y = 0.5 + Math.sin(theta) * coords.y * 0.4;
        };
        Terrain.Hill(g, options, feature, island);
    }

    static Particles(g, options) {
        function deposit(g, i, j, xl, displacement) {
            var currentKey = j * xl + i;
            for (var k = 0; k < 3; k++) {
                var r = Math.floor(Math.random() * 8);
                switch (r) {
                    case 0:
                        i++;
                        break;
                    case 1:
                        i--;
                        break;
                    case 2:
                        j++;
                        break;
                    case 3:
                        j--;
                        break;
                    case 4:
                        i++;
                        j++;
                        break;
                    case 5:
                        i++;
                        j--;
                        break;
                    case 6:
                        i--;
                        j++;
                        break;
                    case 7:
                        i--;
                        j--;
                        break;
                }
                var neighborKey = j * xl + i;
                if (typeof g[neighborKey] !== 'undefined') {
                    if (g[neighborKey] < g[currentKey]) {
                        deposit(g, i, j, xl, displacement);
                        return;
                    }
                } else if (Math.random() < 0.2) {
                    g[currentKey] += displacement;
                    return;
                }
            }
            g[currentKey] += displacement;
        }

        var iterations = Math.sqrt(options.xSegments * options.xSegments + options.ySegments * options.ySegments) * options.frequency * 300,
            xl = options.xSegments + 1,
            displacement = (options.maxHeight - options.minHeight) / iterations * 1000,
            i = Math.floor(Math.random() * options.xSegments),
            j = Math.floor(Math.random() * options.ySegments),
            xDeviation = Math.random() * 0.2 - 0.1,
            yDeviation = Math.random() * 0.2 - 0.1;
        for (var k = 0; k < iterations; k++) {
            deposit(g, i, j, xl, displacement);
            var d = Math.random() * Math.PI * 2;
            if (k % 1000 === 0) {
                xDeviation = Math.random() * 0.2 - 0.1;
                yDeviation = Math.random() * 0.2 - 0.1;
            }
            if (k % 100 === 0) {
                i = Math.floor(options.xSegments * (0.5 + xDeviation) + Math.cos(d) * Math.random() * options.xSegments * (0.5 - Math.abs(xDeviation)));
                j = Math.floor(options.ySegments * (0.5 + yDeviation) + Math.sin(d) * Math.random() * options.ySegments * (0.5 - Math.abs(yDeviation)));
            }
        }
    }

    static Perlin(g, options) {
        seed(Math.random());
        var range = (options.maxHeight - options.minHeight) * 0.5,
            divisor = (Math.min(options.xSegments, options.ySegments) + 1) / options.frequency;
        for (var i = 0, xl = options.xSegments + 1; i < xl; i++) {
            for (var j = 0, yl = options.ySegments + 1; j < yl; j++) {
                g[j * xl + i] += perlin(i / divisor, j / divisor) * range;
            }
        }
    }

    static PerlinDiamond(g, options) {
        Terrain.MultiPass(g, options, [
            { method: Terrain.Perlin },
            { method: Terrain.DiamondSquare, amplitude: 0.75 },
            { method: function(g, o) { return Terrain.SmoothMedian(g, o); } },
        ]);
    }

    static PerlinLayers(g, options) {
        Terrain.MultiPass(g, options, [
            { method: Terrain.Perlin,                  frequency:  1.25 },
            { method: Terrain.Perlin, amplitude: 0.05, frequency:  2.5  },
            { method: Terrain.Perlin, amplitude: 0.35, frequency:  5    },
            { method: Terrain.Perlin, amplitude: 0.15, frequency: 10    },
        ]);
    }

    static Simplex(g, options) {
        seed(Math.random());
        var range = (options.maxHeight - options.minHeight) * 0.5,
            divisor = (Math.min(options.xSegments, options.ySegments) + 1) * 2 / options.frequency;
        for (var i = 0, xl = options.xSegments + 1; i < xl; i++) {
            for (var j = 0, yl = options.ySegments + 1; j < yl; j++) {
                g[j * xl + i] += simplex(i / divisor, j / divisor) * range;
            }
        }
    }

    static SimplexLayers(g, options) {
        Terrain.MultiPass(g, options, [
            { method: Terrain.Simplex,                    frequency:  1.25 },
            { method: Terrain.Simplex, amplitude: 0.5,    frequency:  2.5  },
            { method: Terrain.Simplex, amplitude: 0.25,   frequency:  5    },
            { method: Terrain.Simplex, amplitude: 0.125,  frequency: 10    },
            { method: Terrain.Simplex, amplitude: 0.0625, frequency: 20    },
        ]);
    }

    static Value(g, options) {
        function WhiteNoise(g, options, scale, segments, range, data) {
            if (scale > segments) return;
            var i = 0,
                j = 0,
                xl = segments,
                yl = segments,
                inc = Math.floor(segments / scale),
                lastX = -inc,
                lastY = -inc;
            for (i = 0; i <= xl; i += inc) {
                for (j = 0; j <= yl; j += inc) {
                    var k = j * xl + i;
                    data[k] = Math.random() * range;
                    if (lastX < 0 && lastY < 0) continue;
                    var t = data[k],
                        l = data[j * xl + (i - inc)] || t,
                        b = data[(j - inc) * xl + i] || t,
                        c = data[(j - inc) * xl + (i - inc)] || t;
                    for (var x = lastX; x < i; x++) {
                        for (var y = lastY; y < j; y++) {
                            if (x === lastX && y === lastY) continue;
                            var z = y * xl + x;
                            if (z < 0) continue;
                            var px = ((x - lastX) / inc),
                                py = ((y - lastY) / inc),
                                r1 = px * b + (1 - px) * c,
                                r2 = px * t + (1 - px) * l;
                            data[z] = py * r2 + (1 - py) * r1;
                        }
                    }
                    lastY = j;
                }
                lastX = i;
                lastY = -inc;
            }
            for (i = 0, xl = options.xSegments + 1; i < xl; i++) {
                for (j = 0, yl = options.ySegments + 1; j < yl; j++) {
                    var kg = j * xl + i,
                        kd = j * segments + i;
                    g[kg] += data[kd];
                }
            }
        }
        var segments = THREE.MathUtils.ceilPowerOfTwo(Math.max(options.xSegments, options.ySegments) + 1);
        var data = new Float64Array((segments + 1) * (segments + 1));
        var range = options.maxHeight - options.minHeight;
        for (var i = 2; i < 7; i++) {
            WhiteNoise(g, options, Math.pow(2, i), segments, range * Math.pow(2, 2.4 - i * 1.2), data);
        }
        Terrain.Clamp(g, {
            maxHeight: options.maxHeight,
            minHeight: options.minHeight,
            stretch: true,
        });
    }

    static Weierstrass(g, options) {
        var range = (options.maxHeight - options.minHeight) * 0.5,
            dir1 = Math.random() < 0.5 ? 1 : -1,
            dir2 = Math.random() < 0.5 ? 1 : -1,
            r11 = 0.5 + Math.random() * 1.0,
            r12 = 0.5 + Math.random() * 1.0,
            r13 = 0.025 + Math.random() * 0.10,
            r14 = -1.0 + Math.random() * 2.0,
            r21 = 0.5 + Math.random() * 1.0,
            r22 = 0.5 + Math.random() * 1.0,
            r23 = 0.025 + Math.random() * 0.10,
            r24 = -1.0 + Math.random() * 2.0;
        for (var i = 0, xl = options.xSegments + 1; i < xl; i++) {
            for (var j = 0, yl = options.ySegments + 1; j < yl; j++) {
                var sum = 0;
                for (var k = 0; k < 20; k++) {
                    var x = Math.pow(1 + r11, -k) * Math.sin(Math.pow(1 + r12, k) * (i + 0.25 * Math.cos(j) + r14 * j) * r13);
                    var y = Math.pow(1 + r21, -k) * Math.sin(Math.pow(1 + r22, k) * (j + 0.25 * Math.cos(i) + r24 * i) * r23);
                    sum -= Math.exp(dir1 * x * x + dir2 * y * y);
                }
                g[j * xl + i] += sum * range;
            }
        }
        Terrain.Clamp(g, options);
    }

    static generateBlendedMaterial(textures, material) {
        function glslifyNumber(n) {
            return n === (n | 0) ? n + '.0' : n + '';
        }

        var declare = '',
            assign = '',
            t0Repeat = textures[0].texture.repeat,
            t0Offset = textures[0].texture.offset;
        for (var i = 0, l = textures.length; i < l; i++) {
            textures[i].texture.wrapS = textures[i].wrapT = THREE.RepeatWrapping;
            textures[i].texture.needsUpdate = true;

            declare += 'uniform sampler2D texture_' + i + ';\n';
            if (i !== 0) {
                var v = textures[i].levels,
                    p = textures[i].glsl,
                    useLevels = typeof v !== 'undefined',
                    tiRepeat = textures[i].texture.repeat,
                    tiOffset = textures[i].texture.offset;
                if (useLevels) {
                    if (v[1] - v[0] < 1) v[0] -= 1;
                    if (v[3] - v[2] < 1) v[3] += 1;
                    for (var j = 0; j < v.length; j++) {
                        v[j] = glslifyNumber(v[j]);
                    }
                }
                var blendAmount = !useLevels ? p :
                    '1.0 - smoothstep(' + v[0] + ', ' + v[1] + ', vPosition.z) + smoothstep(' + v[2] + ', ' + v[3] + ', vPosition.z)';
                assign += '        color = mix( ' +
                    'texture2D( texture_' + i + ', MyvUv * vec2( ' + glslifyNumber(tiRepeat.x) + ', ' + glslifyNumber(tiRepeat.y) + ' ) + vec2( ' + glslifyNumber(tiOffset.x) + ', ' + glslifyNumber(tiOffset.y) + ' ) ), ' +
                    'color, ' +
                    'max(min(' + blendAmount + ', 1.0), 0.0)' +
                    ');\n';
            }
        }

        var fragBlend = 'float slope = acos(max(min(dot(myNormal, vec3(0.0, 0.0, 1.0)), 1.0), -1.0));\n' +
            '    diffuseColor = vec4( diffuse, opacity );\n' +
            '    vec4 color = texture2D( texture_0, MyvUv * vec2( ' + glslifyNumber(t0Repeat.x) + ', ' + glslifyNumber(t0Repeat.y) + ' ) + vec2( ' + glslifyNumber(t0Offset.x) + ', ' + glslifyNumber(t0Offset.y) + ' ) ); // base\n' +
                assign +
            '    diffuseColor = color;\n';

        var fragPars = declare + '\n' +
                'varying vec2 MyvUv;\n' +
                'varying vec3 vPosition;\n' +
                'varying vec3 myNormal;\n';

        var mat = material || new THREE.MeshLambertMaterial();
        mat.onBeforeCompile = function(shader) {
            shader.vertexShader = shader.vertexShader.replace('#include <common>',
                'varying vec2 MyvUv;\nvarying vec3 vPosition;\nvarying vec3 myNormal;\n#include <common>');
            shader.vertexShader = shader.vertexShader.replace('#include <uv_vertex>',
                'MyvUv = uv;\nvPosition = position;\nmyNormal = normal;\n#include <uv_vertex>');

            shader.fragmentShader = shader.fragmentShader.replace('#include <common>', fragPars + '\n#include <common>');
            shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', fragBlend);

            for (var i = 0, l = textures.length; i < l; i++) {
                shader.uniforms['texture_' + i] = {
                    type: 't',
                    value: textures[i].texture,
                };
            }
        };

        return mat;
    }

    static ScatterMeshes(geometry, options) {
        if (!options.mesh) {
            console.error('options.mesh is required for Terrain.ScatterMeshes but was not passed');
            return;
        }
        if (!options.scene) {
            options.scene = new THREE.Object3D();
        }
        var defaultOptions = {
            spread: 0.025,
            smoothSpread: 0,
            sizeVariance: 0.1,
            randomness: Math.random,
            maxSlope: 0.6283185307179586,
            maxTilt: Infinity,
            w: 0,
            h: 0,
        };
        for (var opt in defaultOptions) {
            if (defaultOptions.hasOwnProperty(opt)) {
                options[opt] = typeof options[opt] === 'undefined' ? defaultOptions[opt] : options[opt];
            }
        }

        var spreadIsNumber = typeof options.spread === 'number',
            randomHeightmap,
            randomness,
            spreadRange = 1 / options.smoothSpread,
            doubleSizeVariance = options.sizeVariance * 2,
            vertex1 = new THREE.Vector3(),
            vertex2 = new THREE.Vector3(),
            vertex3 = new THREE.Vector3(),
            faceNormal = new THREE.Vector3(),
            up = options.mesh.up.clone().applyAxisAngle(new THREE.Vector3(1, 0, 0), 0.5 * Math.PI);
        if (spreadIsNumber) {
            randomHeightmap = options.randomness();
            randomness = typeof randomHeightmap === 'number' ? Math.random : function(k) {
                return randomHeightmap[k];
            };
        }

        geometry = geometry.toNonIndexed();
        var gArray = geometry.attributes.position.array;
        for (var i = 0; i < geometry.attributes.position.array.length; i += 9) {
            vertex1.set(gArray[i + 0], gArray[i + 1], gArray[i + 2]);
            vertex2.set(gArray[i + 3], gArray[i + 4], gArray[i + 5]);
            vertex3.set(gArray[i + 6], gArray[i + 7], gArray[i + 8]);
            THREE.Triangle.getNormal(vertex1, vertex2, vertex3, faceNormal);

            var place = false;
            if (spreadIsNumber) {
                var rv = randomness(i / 9);
                if (rv < options.spread) {
                    place = true;
                } else if (rv < options.spread + options.smoothSpread) {
                    place = Terrain.EaseInOut((rv - options.spread) * spreadRange) * options.spread > Math.random();
                }
            } else {
                place = options.spread(vertex1, i / 9, faceNormal, i);
            }
            if (place) {
                if (faceNormal.angleTo(up) > options.maxSlope) {
                    continue;
                }
                var mesh = options.mesh.clone();
                mesh.position.addVectors(vertex1, vertex2).add(vertex3).divideScalar(3);
                if (options.maxTilt > 0) {
                    var normal = mesh.position.clone().add(faceNormal);
                    mesh.lookAt(normal);
                    var tiltAngle = faceNormal.angleTo(up);
                    if (tiltAngle > options.maxTilt) {
                        var ratio = options.maxTilt / tiltAngle;
                        mesh.rotation.x *= ratio;
                        mesh.rotation.y *= ratio;
                        mesh.rotation.z *= ratio;
                    }
                }
                mesh.rotation.x += 90 / 180 * Math.PI;
                mesh.rotateY(Math.random() * 2 * Math.PI);
                if (options.sizeVariance) {
                    var variance = Math.random() * doubleSizeVariance - options.sizeVariance;
                    mesh.scale.x = mesh.scale.z = 1 + variance;
                    mesh.scale.y += variance;
                }
                mesh.updateMatrix();
                options.scene.add(mesh);
            }
        }

        return options.scene;
    }

    static ScatterHelper(method, options, skip, threshold) {
        skip = skip || 1;
        threshold = threshold || 0.25;
        options.frequency = options.frequency || 2.5;

        var clonedOptions = {};
        for (var opt in options) {
            if (options.hasOwnProperty(opt)) {
                clonedOptions[opt] = options[opt];
            }
        }

        clonedOptions.xSegments *= 2;
        clonedOptions.stretch = true;
        clonedOptions.maxHeight = 1;
        clonedOptions.minHeight = 0;
        var heightmap = Terrain.heightmapArray(method, clonedOptions);

        for (var i = 0, l = heightmap.length; i < l; i++) {
            if (i % skip || Math.random() > threshold) {
                heightmap[i] = 1;
            }
        }
        return function() {
            return heightmap;
        };
    }

    static Influence(g, options, f, x, y, r, h, t, e) {
        f = f || Terrain.Influences.Hill;
        x = typeof x === 'undefined' ? 0.5 : x;
        y = typeof y === 'undefined' ? 0.5 : y;
        r = typeof r === 'undefined' ? 64 : r;
        h = typeof h === 'undefined' ? 64 : h;
        t = typeof t === 'undefined' ? THREE.NormalBlending : t;
        e = e || Terrain.EaseIn;
        var xl = options.xSegments + 1,
            yl = options.ySegments + 1,
            vx = xl * x,
            vy = yl * y,
            xw = options.xSize / options.xSegments,
            yw = options.ySize / options.ySegments,
            rx = r / xw,
            ry = r / yw,
            r1 = 1 / r,
            xs = Math.ceil(vx - rx),
            xe = Math.floor(vx + rx),
            ys = Math.ceil(vy - ry),
            ye = Math.floor(vy + ry);
        for (var i = xs; i < xe; i++) {
            for (var j = ys; j < ye; j++) {
                var k = j * xl + i,
                    fdx = (i - vx) * xw,
                    fdy = (j - vy) * yw,
                    fd = Math.sqrt(fdx * fdx + fdy * fdy),
                    fdr = fd * r1,
                    fdxr = fdx * r1,
                    fdyr = fdy * r1,
                    d = f(fdr, fdxr, fdyr) * h * (1 - e(fdr, fdxr, fdyr));
                if (fd > r || typeof g[k] == 'undefined') continue;
                if (t === THREE.AdditiveBlending) g[k] += d;
                else if (t === THREE.SubtractiveBlending) g[k] -= d;
                else if (t === THREE.MultiplyBlending) g[k] *= d;
                else if (t === THREE.NoBlending) g[k] = d;
                else if (t === THREE.NormalBlending) g[k] = e(fdr, fdxr, fdyr) * g[k] + d;
                else if (typeof t === 'function') g[k] = t(g[k].z, d, fdr, fdxr, fdyr);
            }
        }
    }

    static Influences = {
        Mesa: function(x) {
            return 1.25 * Math.min(0.8, Math.exp(-(x * x)));
        },
        Hole: function(x) {
            return -Terrain.Influences.Mesa(x);
        },
        Hill: function(x) {
            return x < 0 ? (x + 1) * (x + 1) * (3 - 2 * (x + 1)) : 1 - x * x * (3 - 2 * x);
        },
        Valley: function(x) {
            return -Terrain.Influences.Hill(x);
        },
        Dome: function(x) {
            return -(x + 1) * (x - 1);
        },
        Flat: function(x) {
            return 0;
        },
        Volcano: function(x) {
            return 0.94 - 0.32 * (Math.abs(2 * x) + Math.cos(2 * Math.PI * Math.abs(x) + 0.4));
        },
    };
}




export { Terrain };
