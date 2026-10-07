/**
 * ============================================================================
 * SNOW ANSHER 3D - SHADER ENGINE & GLSL POST-PROCESSING
 * Custom shaders for sparkling procedural snow, dynamic aurora borealis sky,
 * volumetric fog, ice crystal refraction, rainbow grind rails, and speed blur.
 * ============================================================================
 */

const SnowShaders = {
    // ─── PROCEDURAL SNOW TERRAIN SHADER WITH SPARKLE GLINT ───
    SnowTerrainShader: {
        uniforms: {
            uTime: { value: 0.0 },
            uSunDirection: { value: new THREE.Vector3(0.5, 0.8, -0.3).normalize() },
            uSunColor: { value: new THREE.Color(0xfff5e6) },
            uSkyColor: { value: new THREE.Color(0x89c7eb) },
            uGroundColor: { value: new THREE.Color(0xe8f4fc) },
            uShadowColor: { value: new THREE.Color(0x4a7599) },
            uSparkleScale: { value: 45.0 },
            uSparkleIntensity: { value: 1.8 },
            uFogColor: { value: new THREE.Color(0x9bd8f5) },
            uFogDensity: { value: 0.0025 }
        },
        vertexShader: `
            varying vec3 vWorldPosition;
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vViewPosition;

            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                vec4 worldPos = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPos.xyz;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform float uTime;
            uniform vec3 uSunDirection;
            uniform vec3 uSunColor;
            uniform vec3 uSkyColor;
            uniform vec3 uGroundColor;
            uniform vec3 uShadowColor;
            uniform float uSparkleScale;
            uniform float uSparkleIntensity;
            uniform vec3 uFogColor;
            uniform float uFogDensity;

            varying vec3 vWorldPosition;
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vViewPosition;

            // Pseudo-random noise for snow sparkle crystals
            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
            }

            float noise2D(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));
                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);
                vec3 lightDir = normalize(uSunDirection);

                // Diffuse lighting with half-Lambert for soft snow scattering
                float NdotL = dot(normal, lightDir);
                float diffuse = clamp(NdotL * 0.6 + 0.4, 0.0, 1.0);

                // Hemisphere sky ambient bounce
                float upFactor = clamp(normal.y * 0.5 + 0.5, 0.0, 1.0);
                vec3 ambient = mix(uShadowColor, uSkyColor, upFactor) * 0.55;

                // Main snow base color with subtle undulation modulation
                float macroNoise = noise2D(vWorldPosition.xz * 0.04);
                vec3 baseColor = mix(uGroundColor, vec3(1.0), macroNoise * 0.2);
                vec3 litColor = baseColor * (uSunColor * diffuse + ambient);

                // Snow crystal specular sparkle glints
                vec3 halfwayDir = normalize(lightDir + viewDir);
                float sparkleNoise = hash(floor(vWorldPosition.xz * uSparkleScale));
                float sparkleAngle = dot(normal, halfwayDir);
                float sparkle = pow(clamp(sparkleAngle, 0.0, 1.0), 32.0);
                sparkle *= step(0.85, sparkleNoise) * uSparkleIntensity;
                litColor += uSunColor * sparkle;

                // Subtle blue subsurface scattering simulation on slopes
                float rim = 1.0 - clamp(dot(viewDir, normal), 0.0, 1.0);
                litColor += uSkyColor * pow(rim, 3.0) * 0.25;

                // Distance Exponential Fog
                float depth = length(vViewPosition);
                float fogFactor = 1.0 - exp(-depth * depth * uFogDensity * uFogDensity * 1.442695);
                fogFactor = clamp(fogFactor, 0.0, 1.0);

                gl_FragColor = vec4(mix(litColor, uFogColor, fogFactor), 1.0);
            }
        `
    },

    // ─── DYNAMIC SKY & AURORA BOREALIS SHADER ───
    AuroraSkyShader: {
        uniforms: {
            uTime: { value: 0.0 },
            uTimeOfDay: { value: 0.5 }, // 0.0: Dawn, 0.3: Noon, 0.7: Sunset, 1.0: Night Aurora
            uSunPos: { value: new THREE.Vector3(0.0, 0.7, -0.7).normalize() },
            uAuroraStrength: { value: 0.8 },
            uStarIntensity: { value: 0.0 }
        },
        vertexShader: `
            varying vec3 vWorldPosition;
            varying vec3 vRayDir;

            void main() {
                vec4 worldPos = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPos.xyz;
                vRayDir = normalize(position);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uTime;
            uniform float uTimeOfDay;
            uniform vec3 uSunPos;
            uniform float uAuroraStrength;
            uniform float uStarIntensity;

            varying vec3 vWorldPosition;
            varying vec3 vRayDir;

            // Procedural noise for dancing Aurora ribbons
            float hash21(vec2 p) {
                p = fract(p * vec2(234.34, 435.345));
                p += dot(p, p + 34.23);
                return fract(p.x * p.y);
            }

            float auroraNoise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                float a = hash21(i);
                float b = hash21(i + vec2(1.0, 0.0));
                float c = hash21(i + vec2(0.0, 1.0));
                float d = hash21(i + vec2(1.0, 1.0));
                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }

            float fbmAurora(vec2 p) {
                float v = 0.0;
                float a = 0.5;
                mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
                for (int i = 0; i < 4; i++) {
                    v += a * auroraNoise(p);
                    p = rot * p * 2.0;
                    a *= 0.5;
                }
                return v;
            }

            void main() {
                vec3 dir = normalize(vRayDir);
                float height = dir.y;

                // Day sky colors
                vec3 dayZenith = vec3(0.12, 0.45, 0.85);
                vec3 dayHorizon = vec3(0.65, 0.85, 0.98);

                // Sunset colors
                vec3 sunsetZenith = vec3(0.2, 0.15, 0.45);
                vec3 sunsetHorizon = vec3(0.98, 0.45, 0.22);

                // Night colors
                vec3 nightZenith = vec3(0.02, 0.04, 0.12);
                vec3 nightHorizon = vec3(0.05, 0.12, 0.25);

                // Blend sky based on time of day
                vec3 currentZenith;
                vec3 currentHorizon;

                if (uTimeOfDay < 0.5) {
                    float t = uTimeOfDay * 2.0;
                    currentZenith = mix(dayZenith, sunsetZenith, t * 0.4);
                    currentHorizon = mix(dayHorizon, sunsetHorizon, t * 0.4);
                } else if (uTimeOfDay < 0.85) {
                    float t = (uTimeOfDay - 0.5) / 0.35;
                    currentZenith = mix(sunsetZenith, nightZenith, t);
                    currentHorizon = mix(sunsetHorizon, nightHorizon, t);
                } else {
                    currentZenith = nightZenith;
                    currentHorizon = nightHorizon;
                }

                float skyCurve = clamp(pow(max(0.0, height), 0.6), 0.0, 1.0);
                vec3 sky = mix(currentHorizon, currentZenith, skyCurve);

                // Sun disc & glow
                float sunDot = max(0.0, dot(dir, normalize(uSunPos)));
                float sunDisc = smoothstep(0.998, 0.9995, sunDot);
                float sunGlow = pow(sunDot, 8.0) * 0.4 + pow(sunDot, 64.0) * 0.6;
                vec3 sunColor = vec3(1.0, 0.95, 0.85) * (1.0 - smoothstep(0.7, 0.95, uTimeOfDay));
                sky += sunColor * (sunDisc * 2.0 + sunGlow * 0.6);

                // Night Stars
                if (uTimeOfDay > 0.6 && height > 0.05) {
                    vec2 starCoord = dir.xz / (dir.y + 0.1) * 180.0;
                    float starVal = hash21(floor(starCoord));
                    if (starVal > 0.988) {
                        float twinkle = sin(uTime * 4.0 + starVal * 62.8) * 0.3 + 0.7;
                        sky += vec3(twinkle * (uTimeOfDay - 0.6) * 2.5);
                    }
                }

                // Aurora Borealis curtains (active during night)
                if (uTimeOfDay > 0.7 && height > 0.1) {
                    vec2 uvAurora = dir.xz / (dir.y + 0.2) * 1.8;
                    uvAurora.y += uTime * 0.04;
                    float wave = fbmAurora(uvAurora + vec2(sin(uTime * 0.08) * 0.5, 0.0));
                    float curtain = smoothstep(0.4, 0.7, wave) * smoothstep(0.9, 0.5, wave);

                    vec3 auroraGreen = vec3(0.1, 0.95, 0.55);
                    vec3 auroraPurple = vec3(0.5, 0.1, 0.95);
                    vec3 auroraColor = mix(auroraGreen, auroraPurple, sin(uTime * 0.3 + uvAurora.x) * 0.5 + 0.5);

                    float fade = smoothstep(0.1, 0.35, height) * smoothstep(0.9, 0.5, height);
                    sky += auroraColor * curtain * fade * uAuroraStrength * ((uTimeOfDay - 0.7) / 0.3);
                }

                gl_FragColor = vec4(sky, 1.0);
            }
        `
    },

    // ─── ICE CRYSTALS & GLACIER TUNNEL REFRACTION SHADER ───
    IceCrystalShader: {
        uniforms: {
            uTime: { value: 0.0 },
            uBaseColor: { value: new THREE.Color(0x38ada9) },
            uHighlightColor: { value: new THREE.Color(0x78e08f) },
            uReflectivity: { value: 0.85 }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            varying vec3 vWorldPosition;

            void main() {
                vNormal = normalize(normalMatrix * normal);
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;
                vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform float uTime;
            uniform vec3 uBaseColor;
            uniform vec3 uHighlightColor;
            uniform float uReflectivity;

            varying vec3 vNormal;
            varying vec3 vViewPosition;
            varying vec3 vWorldPosition;

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);

                // Internal ice crystal caustic pulse
                float internalGlow = sin(vWorldPosition.y * 3.0 + uTime * 2.0) * 0.15 + 0.85;

                // Fresnel edge reflection
                float fresnel = pow(1.0 - max(0.0, dot(viewDir, normal)), 3.0);
                vec3 finalColor = mix(uBaseColor * internalGlow, uHighlightColor, fresnel * uReflectivity);

                // Specular glint
                vec3 lightDir = normalize(vec3(0.5, 1.0, 0.4));
                vec3 halfDir = normalize(lightDir + viewDir);
                float spec = pow(max(0.0, dot(normal, halfDir)), 64.0);
                finalColor += vec3(spec * 1.2);

                gl_FragColor = vec4(finalColor, 0.88);
            }
        `
    },

    // ─── RAINBOW GRIND RAIL SHADER ───
    RainbowRailShader: {
        uniforms: {
            uTime: { value: 0.0 }
        },
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vWorldPosition;

            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                vec4 worldPos = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPos.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uTime;
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vWorldPosition;

            vec3 rainbow(float t) {
                vec3 c = 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
                return c;
            }

            void main() {
                float wave = vWorldPosition.z * 0.1 - uTime * 3.0;
                vec3 col = rainbow(wave);
                float edge = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 1.0, 0.0))), 2.0);
                col += vec3(edge * 0.4);
                gl_FragColor = vec4(col, 0.95);
            }
        `
    },

    // ─── SPEED BLUR & SCREEN SHOCK POST-PROCESSING OVERLAY ───
    SpeedVortexShader: {
        uniforms: {
            uTime: { value: 0.0 },
            uSpeedRatio: { value: 0.0 }, // 0.0 to 1.0
            uBoostActive: { value: 0.0 },
            uResolution: { value: new THREE.Vector2(1920, 1080) }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uTime;
            uniform float uSpeedRatio;
            uniform float uBoostActive;
            uniform vec2 uResolution;
            varying vec2 vUv;

            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
            }

            void main() {
                vec2 center = vec2(0.5, 0.45);
                vec2 uv = vUv - center;
                float dist = length(uv);
                float angle = atan(uv.y, uv.x);

                // Dynamic anime speed lines at screen periphery
                float streak = hash(vec2(floor(angle * 60.0), floor(uTime * 25.0)));
                float lineMask = smoothstep(0.4, 0.8, dist) * step(0.65, streak);
                float intensity = lineMask * uSpeedRatio * 0.45;

                // Cyan/white boost warp
                vec3 speedColor = mix(vec3(0.85, 0.95, 1.0), vec3(0.0, 0.9, 1.0), uBoostActive);

                // Chromatic aberration at high speed
                float chroma = uSpeedRatio * 0.015 * smoothstep(0.3, 0.9, dist);

                gl_FragColor = vec4(speedColor * intensity, intensity * 0.8);
            }
        `
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SnowShaders;
}
