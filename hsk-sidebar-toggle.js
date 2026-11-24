/* HSK 3.0 shared topbar navigation button and responsive header.
   Intentionally does not edit lesson content, audio, video or links. */
(function () {
  'use strict';
  function init() {
    var sidebar = document.querySelector('.main-container > .sidebar-left');
    var header = document.querySelector('.header');
    if (!sidebar || !header || document.getElementById('hsk-nav-toggle')) return;

    var css = document.createElement('style');
    css.id = 'hsk-nav-toggle-style';
    css.textContent = [
      /* Header grows in height and wraps instead of covering interactive controls. */
      '.header{position:sticky!important;top:0!important;left:auto!important;right:auto!important;height:auto!important;min-height:70px!important;width:100%!important;max-width:100%!important;display:flex!important;flex-wrap:wrap!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;padding:8px 12px!important;box-sizing:border-box!important;overflow:visible!important}',
      '.header>.logo{flex:0 1 auto!important;min-width:0!important;max-width:100%!important}',
      '.header .logo-text{min-width:0!important;overflow-wrap:anywhere}',
      '.header>.lesson-title{flex:1 1 210px!important;min-width:0!important;max-width:100%!important;white-space:normal!important;overflow-wrap:anywhere!important;line-height:1.35!important;padding:4px 6px!important;margin:0!important}',
      '.header>div:not(.logo):not(.lesson-title){flex:0 1 auto;min-width:0!important;max-width:100%!important;display:flex!important;flex-wrap:wrap!important;align-items:center!important;gap:6px!important}',
      '.header a,.header button,.header select{flex-shrink:0;position:relative;z-index:1}',
      '.header select{max-width:calc(100vw - 36px)!important}',
      '.main-container{padding-top:12px!important}',
      '.main-container>.sidebar-left{top:calc(var(--hsk-topbar-height,70px) + 10px)!important;max-height:calc(100dvh - var(--hsk-topbar-height,70px) - 20px)}',
      /* SPA-style icon-only button: always 40px and never truncated. */
      '#hsk-nav-toggle{order:6;flex:0 0 40px!important;width:40px!important;height:40px!important;min-width:40px!important;max-width:40px!important;min-height:40px!important;padding:0!important;margin:0!important;border:1px solid rgba(255,255,255,.8);border-radius:7px;background:rgba(255,255,255,.15);color:#fff;font:20px Arial,sans-serif;cursor:pointer;display:inline-flex!important;align-items:center;justify-content:center;line-height:1;position:relative;z-index:1;box-shadow:none}',
      '.header a.hsk-home-icon{display:inline-flex!important;align-items:center!important;justify-content:center!important;flex:0 0 40px!important;width:40px!important;min-width:40px!important;height:40px!important;padding:0!important;margin:0!important;gap:0!important;border-radius:7px!important;white-space:nowrap!important;line-height:1!important;text-decoration:none!important}',
      '.header a.hsk-home-icon i{font-size:19px!important;margin:0!important;line-height:1!important}',
      '.header select#audio-speed{flex:0 0 auto!important;min-width:68px!important;min-height:40px!important;padding:5px 6px!important;border-radius:7px!important;cursor:pointer!important}',
      '#hsk-nav-toggle:hover{background:rgba(255,255,255,.28)}',
      '#hsk-nav-toggle:focus-visible{outline:3px solid #ffcb3d;outline-offset:2px}',
      'body.hsk-nav-collapsed .main-container>.sidebar-left{display:none!important}',
      'body.hsk-nav-collapsed .main-container{gap:0!important}',
      'body.hsk-nav-collapsed .main-container>:not(.sidebar-left){min-width:0;max-width:100%;flex:1 1 auto}',
      '@media(max-width:1100px){.header>.logo{order:0}.header>div:not(.logo):not(.lesson-title){order:4}.header>.lesson-title{order:10!important;flex:0 0 100%!important;width:100%!important;text-align:center!important}.header .logo-text p{display:none!important}}',
      '@media(max-width:480px){.header{gap:6px!important;padding:6px 8px!important}.header>.logo{flex:1 1 140px!important}.header .logo-text h1{font-size:12px!important}.header>.lesson-title{font-size:13px!important}.header>div:not(.logo):not(.lesson-title){gap:5px!important}#hsk-nav-toggle{order:6!important}}',
      /* In extreme zoom/landscape, do not pin a tall header over the lesson. */
      '@media(max-height:520px){.header{position:relative!important}.main-container>.sidebar-left{top:0!important;max-height:none!important}}'
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
    /* Topbar: keep only usable controls; preserve original links and audio handler. */
    var homeLinks = header.querySelectorAll('a[href]');
    Array.prototype.forEach.call(homeLinks, function (link) {
      var href = link.getAttribute('href') || '';
      if (!/^HSK0[123]-3\\.0\\.html(?:[?#].*)?$/i.test(href)) return;
      var iconEl = link.querySelector('i.bi-house-door, i.bi-house');
      if (!iconEl) return;
      Array.prototype.forEach.call(link.childNodes, function (node) {
        if (node !== iconEl) link.removeChild(node);
      });
      link.classList.add('hsk-home-icon');
      link.setAttribute('aria-label', 'Trang chủ');
      link.title = 'Trang chủ';
    });
    var speedSelect = header.querySelector('select#audio-speed');
    if (speedSelect) {
      speedSelect.setAttribute('aria-label', 'Tốc độ phát âm thanh');
      speedSelect.title = 'Chọn tốc độ phát âm thanh';
      var speedContainer = speedSelect.parentElement;
      if (speedContainer) {
        Array.prototype.forEach.call(speedContainer.children, function (child) {
          if (child.tagName === 'SPAN' && /^Tốc độ\\s*:?$/i.test((child.textContent || '').trim())) {
            child.remove();
          }
        });
      }
    }
    header.appendChild(btn);

    /* Keep the sticky sidebar below a header that can change height on zoom. */
    function syncHeaderHeight() {
      document.documentElement.style.setProperty('--hsk-topbar-height', Math.ceil(header.getBoundingClientRect().height) + 'px');
    }
    if (window.ResizeObserver) {
      var observer = new ResizeObserver(syncHeaderHeight);
      observer.observe(header);
    }
    window.addEventListener('resize', syncHeaderHeight, { passive: true });
    syncHeaderHeight();

    if (window.matchMedia && window.matchMedia('(max-width:768px)').matches) {
      document.body.classList.add('hsk-nav-collapsed');
    }
    refresh();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
