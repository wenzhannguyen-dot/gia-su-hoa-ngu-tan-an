/* HSK1 3.0 – video for 课文. MP4 files remain external and share the HTML directory. */
(function () {
    'use strict';

    var pageName = decodeURIComponent(window.location.pathname.split('/').pop() || '');
    var matched = /^HSK3\.0-01\.(\d{2})\.html$/i.exec(pageName);
    if (!matched) return;
    var lessonNo = matched[1];

    // Override a lesson with its verified, exact MP4 filename when supplied.
    // E.g. "01": "actual-filename.mp4". Do not include unrelated HSK 2.0 media.
    var exactVideoFiles = {};
    var candidates = [
        exactVideoFiles[lessonNo],
        'HSK3.0-01.' + lessonNo + '.mp4',
        'HSK01.' + lessonNo + '.mp4'
    ].filter(function (name, index, all) {
        return typeof name === 'string' && name.toLowerCase().endsWith('.mp4')
            && all.indexOf(name) === index;
    });

    function initVideo() {
        var target = document.querySelector('#text .text-container');
        if (!target || document.getElementById('hsk1-30-video')) return;

        var holder = document.createElement('div');
        holder.id = 'hsk1-30-video';
        holder.style.cssText = 'display:none;width:100%;max-width:960px;margin:0 auto 20px;';
        var player = document.createElement('video');
        player.controls = true;
        player.playsInline = true;
        player.preload = 'metadata';
        player.setAttribute('aria-label', 'Video HSK1 3.0 - Bài ' + parseInt(lessonNo, 10));
        player.style.cssText = 'display:block;width:100%;height:auto;border-radius:8px;';
        holder.appendChild(player);
        target.insertBefore(holder, target.firstChild);

        var next = 0;
        function tryNext() {
            holder.style.display = 'none';
            if (next >= candidates.length) {
                player.removeAttribute('src');
                holder.remove();
                return;
            }
            player.src = './' + encodeURI(candidates[next++]);
            player.load();
        }
        player.addEventListener('loadedmetadata', function () {
            holder.style.display = 'block';
        });
        player.addEventListener('error', tryNext);
        tryNext();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVideo, { once: true });
    } else {
        initVideo();
    }
})();
