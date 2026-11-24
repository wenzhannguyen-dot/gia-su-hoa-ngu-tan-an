/* HSK 3.0: optional lesson navigation panel. No lesson content is modified. */
(function () {
  'use strict';
  function init() {
    var sidebar = document.querySelector('.main-container > .sidebar-left');
    if (!sidebar || document.getElementById('hsk-nav-toggle')) return;
    var css = document.createElement('style');
    css.id = 'hsk-nav-toggle-style';
    css.textContent = [
      '#hsk-nav-toggle{position:fixed;left:12px;bottom:14px;z-index:950;display:inline-flex;align-items:center;justify-content:center;gap:6px;background:#174d8d;color:#fff;border:2px solid #fff;border-radius:24px;padding:10px 14px;box-shadow:0 2px 12px #0004;font:600 13px Arial,sans-serif;cursor:pointer;min-height:44px;max-width:calc(100vw - 24px)}',
      '#hsk-nav-toggle:focus-visible{outline:3px solid #ffcb3d;outline-offset:2px}',
      'body.hsk-nav-collapsed .main-container > .sidebar-left{display:none!important}',
      'body.hsk-nav-collapsed .main-container{gap:0!important}',
      'body.hsk-nav-collapsed .main-container > :not(.sidebar-left){min-width:0;max-width:100%;flex:1 1 auto}',
      '@media(max-width:768px){#hsk-nav-toggle{bottom:calc(12px + env(safe-area-inset-bottom,0px));left:10px;padding:9px 12px}body.hsk-nav-collapsed .main-container>.sidebar-left{display:none!important}}'
    ].join('');
    document.head.appendChild(css);
    if (!sidebar.id) sidebar.id = 'hsk-lesson-navigation';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'hsk-nav-toggle';
    btn.setAttribute('aria-controls', sidebar.id);
    function refresh() {
      var collapsed = document.body.classList.contains('hsk-nav-collapsed');
      btn.setAttribute('aria-expanded', String(!collapsed));
      btn.textContent = collapsed ? '☰ Hiện mục lục' : '× Ẩn mục lục';
      btn.title = collapsed ? 'Hiện điều hướng bài học' : 'Ẩn điều hướng bài học';
    }
    btn.addEventListener('click', function () {
      document.body.classList.toggle('hsk-nav-collapsed');
      refresh();
    });
    document.body.appendChild(btn);
    if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) {
      document.body.classList.add('hsk-nav-collapsed');
    }
    refresh();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
