#!/usr/bin/env python3
"""Build a single-file, zero-dependency HTML for Snow Ansher."""
import re
import pathlib

ROOT = pathlib.Path('/home/ansh/vscode/snowansher')

# Order of JS files as they appear in index.html
JS_FILES = [
    'js/Shaders.js',
    'js/AudioEngine.js',
    'js/AudioSynthesizerBank.js',
    'js/SoundtrackData.js',
    'js/RiderModel.js',
    'js/StuntAnimationLibrary.js',
    'js/SledCollection.js',
    'js/CosmeticsCatalog.js',
    'js/WorldEnvironment.js',
    'js/ProceduralDecorations.js',
    'js/SlopeTrackPatterns.js',
    'js/ObstaclesManager.js',
    'js/PowerupSystem.js',
    'js/TrickSystem.js',
    'js/ParticleEngine.js',
    'js/GamePhysics.js',
    'js/MultiplayerBotRiders.js',
    'js/AchievementsCatalog.js',
    'js/GameUI.js',
    'js/GhostRacer.js',
    'js/BiomesManager.js',
    'js/WeatherFX.js',
    'js/Customizer.js',
    'js/TelemetryAndLeaderboard.js',
    'js/TerrainBiomesMesher.js',
    'js/StuntComboEngine.js',
    'js/DailyChallenges.js',
    'js/VisualPostProcessor.js',
    'index.js',
]

def read_js(path):
    return ROOT.joinpath(path).read_text()

def build():
    # Read three.js
    three_js = ROOT.joinpath('three.r128.min.js').read_text()
    
    # Read and concatenate all game JS
    all_js = []
    for f in JS_FILES:
        code = read_js(f)
        all_js.append(f'\n// ==== {f} ====\n{code}')
    game_js = '\n'.join(all_js)
    
    # Read HTML
    html = ROOT.joinpath('index.html').read_text()
    
    # Remove external CSS links (FontAwesome, Google Fonts) - we'll use system fonts
    html = re.sub(r'<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/[^"]+">\s*', '', html)
    html = re.sub(r'<link rel="preconnect" href="https://fonts.googleapis.com">\s*', '', html)
    html = re.sub(r'<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\s*', '', html)
    html = re.sub(r'<link href="https://fonts.googleapis.com/css2\?family=[^"]+" rel="stylesheet">\s*', '', html)
    
    # Remove three.js script tag
    html = re.sub(r'<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\s*', '', html)
    
    # Remove all other script tags
    html = re.sub(r'<script src="js/[^"]+"></script>\s*', '', html)
    html = re.sub(r'<script src="index.js"></script>\s*', '', html)
    
    # Replace FontAwesome icons with inline SVG or text equivalents
    # The game uses: fa-shield-alt, fa-magnet, fa-rocket, fa-star, fa-arrow-left, fa-arrow-right, fa-arrow-up
    fa_replacements = {
        'fa-shield-alt': '🛡',
        'fa-magnet': '🧲',
        'fa-rocket': '🚀',
        'fa-star': '⭐',
        'fa-arrow-left': '←',
        'fa-arrow-right': '→',
        'fa-arrow-up': '↑',
    }
    for cls, char in fa_replacements.items():
        html = html.replace(f'class="fas {cls}"', f'class="fa-icon" style="font-family:inherit"')
        html = html.replace(f'class="fa {cls}"', f'class="fa-icon"')
        # Replace the <i> content
        html = re.sub(f'<i class="fas {cls}"></i>', char, html)
        html = re.sub(f'<i class="fa {cls}"></i>', char, html)
    
    # Inject the combined JS at the end of body, before closing </body>
    injection = f'\n    <script>\n// ==== THREE.js r128 (bundled) ====\n{three_js}\n{game_js}\n    </script>\n</body>'
    html = html.replace('</body>', injection)
    
    # Write nuclear version
    out = ROOT.joinpath('index-nuclear.html')
    out.write_text(html)
    print(f'Written: {out} ({out.stat().st_size / 1024:.0f} KB)')

if __name__ == '__main__':
    build()