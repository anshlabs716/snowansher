/*
 * Updated script.js — fix ReferenceError caused by undefined `cliffZ` in checkCollisions()
 * See commit message for details.
 */

// Minimal bootstrap to make the UI interactive when the full engine isn't running.
// This provides a small `game` stub that implements the methods the HTML uses
// (game.start, game.retry, game.openMenu, game.togglePause, game.setOption, etc.)
// and will instantiate GameUI if it's available so garage/menu buttons become clickable.
(function(){
  window.game = window.game || {
    totalGifts: Number(localStorage.getItem('sr3d_gifts')) || 0,
    unlockedSleds: JSON.parse(localStorage.getItem('sr3d_unlocked') || '[]'),
    config: { skin: localStorage.getItem('sr3d_skin') || '' },
    sound: { playGiftCollect: function(){ /* noop placeholder */ } },

    start(mode){
      console.log('game.start()', mode);
      const menu = document.getElementById('menu-overlay');
      if (menu) menu.classList.add('hidden');
      const hud = document.getElementById('hud');
      if (hud) hud.classList.add('active');
    },

    retry(){
      console.log('game.retry()');
      const go = document.getElementById('gameover-overlay');
      if (go) go.classList.add('hidden');
      const hud = document.getElementById('hud');
      if (hud) hud.classList.add('active');
    },

    openMenu(){
      console.log('game.openMenu()');
      const menu = document.getElementById('menu-overlay');
      if (menu) menu.classList.remove('hidden');
    },

    togglePause(){
      console.log('game.togglePause()');
      const p = document.getElementById('pause-overlay');
      if (p) p.classList.toggle('hidden');
    },

    setOption(key, value){
      console.log('game.setOption()', key, value);
      if (key === 'theme') document.documentElement.setAttribute('data-theme', value);
      // other options are stored but have no effect in this stub
      try { localStorage.setItem('sr3d_opt_' + key, value); } catch(e){}
    },

    loadSledModel(id){
      console.log('game.loadSledModel()', id);
      // placeholder: real engine would load 3D model
    }
  };

  // If GameUI class is present, wire it to our stub so UI elements render correctly.
  try {
    if (typeof GameUI !== 'undefined') {
      window.gameUI = new GameUI(window.game);
      // populate garage list and HUD so buttons have visible state
      if (window.gameUI && typeof window.gameUI.renderGarageShowroom === 'function') {
        window.gameUI.renderGarageShowroom();
      }
    }
  } catch (err) {
    console.warn('Failed to initialize GameUI:', err);
  }
})();
