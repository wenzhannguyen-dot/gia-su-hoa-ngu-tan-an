/* HSK 3.0: topbar-only icon toggle, matching the SPA lessons. */
(function () {
  'use strict';
  function init() {
    var sidebar = document.querySelector('.main-container > .sidebar-left');
    var header = document.querySelector('.header');
    if (!sidebar || !header || document.getElementById('hsk-nav-toggle')) return;

    var css = document.createElement('style');
    css.id = 'hsk-nav-toggle-style';
    css.textContent = [
      '#hsk-nav-toggle{flex:0 0 42px!important;width:42px;height:40px;min-width:42px;max-width:42px;padding:0!important;margin:0 0 0 6px;border:1px solid rgba(255,255,255,.8);border-radius:7px;background:rgba(255,255,255,.15);color:#fff;font:20px Arial,sans-serif;cursor:pointer;display:inline-flex!important;align-items:center;justify-content:center;line-height:1;position:relative;z-index:1;box-shadow:none}',
      '#hsk-nav-toggle:hover{background:rgba(255,255,255,.28)}',
      '#hsk-nav-toggle:focus-visible{outline:3px solid #ffcb3d;outline-offset:2px}',
      'body.hsk-nav-collapsed .main-container > .sidebar-left{display:none!important}',
      'body.hsk-nav-collapsed .main-container{gap:0!important}',
      'body.hsk-nav-collapsed .main-container > :not(.sidebar-left){min-width:0;max-width:100%;flex:1 1 auto}',
      '@media(max-width:768px){#hsk-nav-toggle{order:0;flex:0 0 40px!important;width:40px;height:40px;min-width:40px;max-width:40px;margin-left:4px}}'
    ].join('');
    document.head.appendChild(css);

    if (!sidebar.id) sidebar.id = 'hsk-lesson-navigation';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'hsk-nav-toggle';
    btn.className = 'nav-toggle-header';
    btn.setAttribute('aria-controls', sidebar.id);

    var icon = document.createElement('i');
    icon.setAttribute('aria-hidden', 'true');
    btn.appendChild(icon);

    function refresh() {
      var collapsed = document.body.classList.contains('hsk-nav-collapsed');
      var label = collapsed ? 'Hiện điều hướng' : 'Ẩn điều hướng';
      btn.setAttribute('aria-expanded', String(!collapsed));
      btn.setAttribute('aria-label', label);
      btn.title = label;
      icon.className = collapsed ? 'bi bi-layout-sidebar-inset' : 'bi bi-layout-sidebar-inset-reverse';
    }

    btn.addEventListener('click', function () {
      document.body.classList.toggle('hsk-nav-collapsed');
      refresh();
    });
    header.appendChild(btn);
    if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) {
      document.body.classList.add('hsk-nav-collapsed');
    }
    refresh();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
