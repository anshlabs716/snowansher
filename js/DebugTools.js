/**
 * ============================================================================
 * SNOW ANSHER 3D - DEBUG & BOOT-FAILURE TOOLS
 *
 * These used to live at the bottom of script.js and ran for EVERY player: the
 * diagnostics panel popped up over the menu after 3 seconds, and a big blue
 * "START GAME" button and a gear badge sat on top of the HUD for the whole run.
 *
 * Now they stay out of the way unless something is actually wrong:
 *   - error log        : always on (silent, just remembers recent errors)
 *   - diagnostics panel: opens on boot failure, or on purpose with ` / F3 / ?debug
 *   - emergency start  : only offered when the game object failed to boot
 *   - gear badge       : only with ?debug in the URL
 * ============================================================================
 */
(function () {
    'use strict';

    const DEBUG = /[?&]debug\b/.test(location.search);

    // ---- Error log (always on) ----------------------------------------------
    window.__snowErrs = [];
    window.addEventListener('error', function (e) {
        const line = (e && e.message ? e.message : String(e))
            + ' @ ' + (e && e.filename ? e.filename : '') + ':' + (e && e.lineno ? e.lineno : '?');
        window.__snowErrs.push(line);
        if (window.__snowErrs.length > 40) window.__snowErrs.shift();
        console.error('[SnowAnsher] uncaught error:', line);
    });

    function bootFailed() {
        return !window.game || window.game.dead === true;
    }

    // ---- Diagnostics panel --------------------------------------------------
    window.__snowDiag = function () {
        const existing = document.getElementById('snow-diag');
        if (existing) { existing.remove(); return; }
        const g = window.game;

        let glInfo = 'probe failed';
        try {
            const c = document.createElement('canvas');
            const gl = c.getContext('webgl2') || c.getContext('webgl');
            if (!gl) {
                glInfo = 'NO WebGL CONTEXT -- 3D cannot run here';
            } else {
                const ext = gl.getExtension('WEBGL_debug_renderer_info');
                glInfo = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'WebGL available';
            }
        } catch (e) { glInfo = 'WebGL threw: ' + (e && e.message ? e.message : e); }

        let ls = 'ok';
        try {
            localStorage.setItem('__snowprobe', '1');
            localStorage.removeItem('__snowprobe');
        } catch (e) { ls = 'BLOCKED: ' + (e && e.message ? e.message : e); }

        const errList = window.__snowErrs.length
            ? window.__snowErrs.slice(-8).map(function (e) { return '* ' + e; }).join('\n')
            : 'none recorded';

        const d = document.createElement('div');
        d.id = 'snow-diag';
        d.style.cssText = 'position:fixed;top:10px;left:10px;z-index:2147483649;'
            + 'max-width:440px;background:rgba(4,12,24,.97);color:#dff0ff;'
            + 'border:1px solid #2b4a6b;border-radius:10px;padding:14px 16px;'
            + 'font:12px/1.55 system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.6);'
            + 'white-space:pre-wrap;word-break:break-word;';
        d.textContent =
            'Snow Ansher diagnostics\n\n'
            + 'boot:         ' + (g ? 'OK -- game object exists' : 'FAILED -- no game object') + '\n'
            + 'state:        dead=' + (g ? g.dead : '?') + '  running=' + (g ? g.running : '?') + '\n'
            + 'three.js:     ' + (typeof THREE !== 'undefined' ? 'loaded' : 'NOT LOADED') + '\n'
            + 'WebGL:        ' + glInfo + '\n'
            + 'localStorage: ' + ls + '\n'
            + 'browser:      ' + navigator.userAgent + '\n\n'
            + 'errors (' + window.__snowErrs.length + '):\n' + errList + '\n\n';

        const bar = document.createElement('div');
        bar.style.cssText = 'margin-top:4px;display:flex;gap:8px;flex-wrap:wrap';
        const mkBtn = function (label, bg, fn) {
            const b = document.createElement('button');
            b.textContent = label;
            b.style.cssText = 'cursor:pointer;background:' + bg + ';color:#fff;border:0;'
                + 'border-radius:6px;padding:8px 14px;font-weight:700;font-size:12px';
            b.addEventListener('click', fn);
            return b;
        };
        bar.appendChild(mkBtn('Force start', '#2f7dff', function () { if (g && g.start) g.start('easy'); }));
        bar.appendChild(mkBtn('Reload', '#33475f', function () { location.reload(); }));
        bar.appendChild(mkBtn('Close', '#33475f', function () { d.remove(); }));
        d.appendChild(bar);
        document.body.appendChild(d);
    };

    // Hotkey: ` or F3 opens the panel on purpose
    window.addEventListener('keydown', function (e) {
        if (e.key === '`' || e.key === 'F3') { e.preventDefault(); window.__snowDiag(); }
    });

    function addEmergencyStart() {
        if (document.getElementById('snow-emergency-start')) return;
        const btn = document.createElement('button');
        btn.id = 'snow-emergency-start';
        btn.textContent = 'Start game';
        btn.title = 'Emergency start -- the menu failed to load';
        btn.style.cssText = 'position:fixed;bottom:10px;left:10px;z-index:2147483648;'
            + 'background:#2f7dff;color:#fff;border:0;border-radius:8px;'
            + 'padding:12px 18px;font-weight:700;font-size:14px;cursor:pointer;'
            + 'box-shadow:0 4px 20px rgba(0,0,0,.5);';
        btn.addEventListener('click', function () {
            if (window.game && window.game.start && !window.game.dead) {
                window.game.start('easy');
                btn.remove();
            } else {
                window.__snowDiag();
            }
        });
        document.body.appendChild(btn);
    }

    function addGearBadge() {
        const badge = document.createElement('button');
        badge.textContent = '\u2699';
        badge.title = 'Snow Ansher diagnostics (or press `)';
        badge.style.cssText = 'position:fixed;bottom:10px;right:10px;z-index:2147483649;'
            + 'width:34px;height:34px;border-radius:50%;border:1px solid #2b4a6b;'
            + 'background:rgba(4,12,24,.9);color:#9fd0ff;cursor:pointer;font-size:16px;'
            + 'line-height:1;opacity:.7;padding:0;';
        badge.addEventListener('click', function () { window.__snowDiag(); });
        document.body.appendChild(badge);
    }

    function init() {
        if (DEBUG) addGearBadge();

        // Give the game a moment to boot, then only intervene if it did not.
        setTimeout(function () {
            if (bootFailed()) {
                addEmergencyStart();
                if (!document.getElementById('snow-diag')) window.__snowDiag();
            }
        }, 3000);
    }

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
