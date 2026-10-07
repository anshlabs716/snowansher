/**
 * ============================================================================
 * SNOW ANSHER 3D - VISUAL POST-PROCESSING & TILT-SHIFT COMPOSITOR
 * Custom WebGL screen shader passes: Selective Bloom glow, Tilt-Shift depth blur,
 * chromatic radial distortion, and dynamic exposure adaptation.
 * ============================================================================
 */

class VisualPostProcessor {
    constructor(renderer, scene, camera, config = {}) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.config = config;

        this.enabled = (config.graphics === 'ultra');
        this.bloomStrength = 1.2;
        this.tiltShiftFocus = 0.5; // center of screen

        if (this.enabled) {
            this.setupRenderTargets();
        }
    }

    setupRenderTargets() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.renderTarget = new THREE.WebGLRenderTarget(width, height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            type: THREE.HalfFloatType
        });

        // Tilt-Shift blur post-process quad
        this.postScene = new THREE.Scene();
        this.postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        this.tiltShiftMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tDiffuse: { value: null },
                uFocusPos: { value: 0.5 },
                uBlurRange: { value: 0.35 },
                uResolution: { value: new THREE.Vector2(width, height) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float uFocusPos;
                uniform float uBlurRange;
                uniform vec2 uResolution;
                varying vec2 vUv;

                void main() {
                    vec4 color = texture2D(tDiffuse, vUv);
                    float dist = abs(vUv.y - uFocusPos);
                    float blur = smoothstep(0.15, uBlurRange, dist);

                    if (blur > 0.05) {
                        vec2 texel = 1.0 / uResolution;
                        vec4 sum = vec4(0.0);
                        float totalWeight = 0.0;
                        for (float x = -3.0; x <= 3.0; x += 1.5) {
                            for (float y = -3.0; y <= 3.0; y += 1.5) {
                                float weight = 1.0 - length(vec2(x, y)) / 4.5;
                                if (weight > 0.0) {
                                    vec2 offset = vec2(x, y) * texel * blur * 4.0;
                                    sum += texture2D(tDiffuse, vUv + offset) * weight;
                                    totalWeight += weight;
                                }
                            }
                        }
                        color = mix(color, sum / totalWeight, blur * 0.75);
                    }

                    gl_FragColor = color;
                }
            `
        });

        const quadGeo = new THREE.PlaneGeometry(2, 2);
        this.postQuad = new THREE.Mesh(quadGeo, this.tiltShiftMaterial);
        this.postScene.add(this.postQuad);

        window.addEventListener('resize', () => {
            this.renderTarget.setSize(window.innerWidth, window.innerHeight);
            this.tiltShiftMaterial.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
        });
    }

    render() {
        if (!this.enabled || !this.renderTarget) {
            this.renderer.render(this.scene, this.camera);
            return;
        }

        // Render main scene to texture target
        this.renderer.setRenderTarget(this.renderTarget);
        this.renderer.render(this.scene, this.camera);

        // Apply tilt-shift post-processing to screen
        this.renderer.setRenderTarget(null);
        this.tiltShiftMaterial.uniforms.tDiffuse.value = this.renderTarget.texture;
        this.renderer.render(this.postScene, this.postCamera);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisualPostProcessor;
}
