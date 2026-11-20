(()=>{
'use strict';
const $=(q,p=document)=>p.querySelector(q), $$=(q,p=document)=>Array.from(p.querySelectorAll(q));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const id=(location.pathname.match(/SPA(\d{2})\.html$/i)||[])[1]||'00';


let arr=[],active=0,shown=false,dialog=null,openTab='search';
function scan(){arr=[];const seen=new Set();$$('.phrase-line').forEach((n)=>{const ch=$('.phrase-chinese',n)?.textContent.trim()||'',py=$('.phrase-pinyin',n)?.textContent.trim()||'',vi=$('.phrase-vietnamese',n)?.textContent.trim()||'';if(!/[\u3400-\u9fff]/.test(ch)||!window.spaIsDialogue?.(ch)||seen.has(ch))return;seen.add(ch);arr.push({ch,py,vi})});$$('.vocab-table tbody tr').forEach(n=>{const c=$$('td',n);if(c.length<4)return;const ch=c[1].textContent.trim();if(!/[\u3400-\u9fff]/.test(ch)||!window.spaIsDialogue?.(ch)||seen.has(ch))return;seen.add(ch);arr.push({ch,py:c[2].textContent.trim(),vi:c[3].textContent.trim(),vocab:true})})}
const play=ch=>{if(window.speakText)window.speakText(ch)};
const pane=name=>$('#spa-pro-'+name);
function activate(name){openTab=name;$$('.spa-tab').forEach(b=>b.classList.toggle('active',b.dataset.pro===name));$$('.spa-pane').forEach(n=>n.classList.toggle('active',n.id==='spa-pro-'+name)); ({dictation})[name]?.()}
function create(){dialog=$('#spa-study-modal');if(!dialog)return;scan();const tabs=$('.spa-tabs',dialog),work=$('.spa-work',dialog);if(!tabs||!work)return;
const additions=[['dictation','✍️ Chính tả']];
additions.forEach(([id,label])=>{const b=document.createElement('button');b.type='button';b.className='spa-tab';b.textContent=label;b.dataset.pro=id;b.onclick=()=>activate(id);tabs.appendChild(b);const p=document.createElement('div');p.id='spa-pro-'+id;p.className='spa-pane';work.appendChild(p)});
// Existing tabs use their original events, with a second event listener only to clear new pane selections.
$$('.spa-tab',dialog).filter(b=>!b.dataset.pro).forEach(b=>b.addEventListener('click',()=>$$('.spa-tab[data-pro]').forEach(t=>t.classList.remove('active'))));
const existingClose=$('#spa-close');existingClose?.addEventListener('click',()=>{shown=false});

// Opening tool refreshes data. No mutation of the original lesson HTML.
const original=$('.spa-study-button');original?.addEventListener('click',()=>{scan();shown=true});
}
function checkText(input,target){return input.trim().replace(/[\s，。！？、,.!?;:：；“”"'（）()\-—…]/g,'').normalize('NFKC')===target.trim().replace(/[\s，。！？、,.!?;:：；“”"'（）()\-—…]/g,'').normalize('NFKC')}
function dictation(){const n=pane('dictation');if(!arr.length){n.textContent='Không có nội dung để luyện.';return}active=Math.max(0,Math.min(active,arr.length-1));const x=arr[active];n.innerHTML=`<h3 class="spa-pro-head">Luyện nghe – viết chữ Hán</h3><div class="spa-pro-row"><span class="spa-pro-pill">${active+1} / ${arr.length}</span><button type="button" class="spa-action primary" id="spa-pro-hear">🔊 Nghe mẫu</button><button type="button" class="spa-action" id="spa-pro-showhint">Hiện nghĩa gợi ý</button></div><div class="spa-pro-card"><div id="spa-pro-hint" class="spa-pro-detail"></div><label for="spa-pro-answer" class="spa-pro-hint">Viết chữ Hán bạn nghe được</label><textarea rows="3" class="spa-pro-field" id="spa-pro-answer" spellcheck="false" lang="zh-CN" placeholder="Nhập chữ Hán tại đây..."></textarea></div><div class="spa-pro-row"><button type="button" class="spa-action primary" id="spa-pro-check">✓ Kiểm tra</button><button type="button" class="spa-action" id="spa-pro-reveal">Xem đáp án</button><button type="button" class="spa-action" id="spa-pro-next">Câu tiếp →</button></div><div class="spa-pro-feedback" id="spa-pro-feedback" aria-live="polite">Chưa kiểm tra.</div>`;
$('#spa-pro-hear').onclick=()=>play(x.ch);$('#spa-pro-showhint').onclick=()=>{$('#spa-pro-hint').textContent=x.vi};$('#spa-pro-reveal').onclick=()=>{$('#spa-pro-feedback').textContent=`${x.ch}\n${x.py}\n${x.vi}`};$('#spa-pro-check').onclick=()=>{const input=$('#spa-pro-answer').value;const ok=checkText(input,x.ch);$('#spa-pro-feedback').textContent=(ok?'✓ Chính xác!':'Chưa đúng. Đối chiếu:')+`\n${x.ch}\n${x.py}\n${x.vi}`};$('#spa-pro-next').onclick=()=>{active=(active+1)%arr.length;dictation()};$('#spa-pro-answer').focus()}
document.addEventListener('DOMContentLoaded',create);
})();
