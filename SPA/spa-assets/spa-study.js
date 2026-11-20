(()=>{
'use strict';
const $=(s,root=document)=>root.querySelector(s), $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
const lessonId=(location.pathname.match(/SPA(\d{2})\.html$/i)||[])[1]||'00';
const key='spa-study-progress-'+lessonId;
const zh=/[\u3400-\u9fff]/;
let pendingAudioResolve=null;let items=[],pos=0,mode='cards',questions=[],qi=0,score=0,answered=false,playing=false,stopping=false,voice=null,media=null,recorded=null,recorder=null,recognizer=null,ttsPending=null;
let state={learned:[],speed:0.9,repeat:2};try{state={...state,...JSON.parse(localStorage.getItem(key)||'{}')}}catch(e){}
const persist=()=>{try{localStorage.setItem(key,JSON.stringify(state))}catch(e){}};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n};
function voiceList(){return ('speechSynthesis' in window)?speechSynthesis.getVoices().filter(v=>/^(zh[-_]CN|cmn[-_]Hans[-_]CN)$/i.test(v.lang)):[]}
function voiceGender(v){const n=v.name.toLowerCase();if(/xiaoxiao|xiaoyi|xiaohan|huihui|yaoyao|tingting|female|woman|woman|n[uü]sheng|女声|女聲|meijia|lili|xiaomo|xiaorui|xiaoqiu|xiaoshuang|xiaorou/.test(n))return 'female';if(/yunxi|yunyang|yunjian|yunye|kangkang|male|man|nansheng|男声|男聲|david|xiaobei|xiaogang|xiaoming|yunhao|yunze/.test(n))return 'male';return ''}
function pickVoice(gender='female'){
 const voices=voiceList();let saved='';try{saved=localStorage.getItem('spa-voice-'+gender)||''}catch(e){}
 const preferred=voices.filter(v=>voiceGender(v)===gender);
 voice=preferred.find(v=>v.name===saved)||preferred.find(v=>/xiaoxiao|yunxi|yunyang|xiaoyi/i.test(v.name))||preferred[0]||voices[0]||null;
 return voice;
}
function speakStatus(msg){const st=$('#spa-study-status');if(st)st.textContent='';const detailed=$('#spa-audio-status');if(detailed)detailed.textContent=''}
function stopAudio(){stopping=true;playing=false;if(media){media.pause();media.removeAttribute('src');media.load();media=null}if(pendingAudioResolve){pendingAudioResolve(false);pendingAudioResolve=null}if('speechSynthesis' in window)speechSynthesis.cancel();if(ttsPending){ttsPending(false);ttsPending=null}const btn=$('#spa-play-list');if(btn)btn.textContent='▶ Luyện nghe liên tục'}
function roleOf(text){const m=String(text||'').trim().match(/^([^：:]{1,24})[：:]/);return m?m[1]:''}
function contentOf(text){return String(text||'').trim().replace(/^[^：:]{1,24}[：:]\s*(?=[\u3400-\u9fff])/,'').replace(/（[^）]*）|\([^)]*\)/g,'').trim()}
function speakerGender(text){const role=roleOf(text);if(/接待|按摩师|美容师|技师|服务员|前台|员工|护理师/.test(role))return 'female';if(/先生|男士|男顾客/.test(role))return 'male';if(/女士|小姐|夫人|女顾客/.test(role))return 'female';if(/顾客|客人|客户/.test(role))return 'male';return 'female'}
function isDialogue(text){const content=contentOf(text);return /[\u3400-\u9fff]/.test(content)&&(/[。！？?!]/.test(content)||!!roleOf(text))}
function localMp3(text){return `audio/spa/SPA${lessonId}/`+String(text).trim().replace(/[\\/:*?"<>|]/g,'_').slice(0,90)+'.mp3'}
function audioPlayback(src){return new Promise(resolve=>{let done=false;const audio=new Audio(src);media=audio;const finish=ok=>{if(done)return;done=true;if(media===audio)media=null;if(pendingAudioResolve===finish)pendingAudioResolve=null;audio.onended=null;audio.onerror=null;resolve(ok)};pendingAudioResolve=finish;audio.playbackRate=Number(state.speed)||1;audio.onended=()=>finish(true);audio.onerror=()=>finish(false);audio.play().catch(()=>finish(false))})}
function synthSpeech(text,gender){return new Promise(resolve=>{if(!('speechSynthesis' in window)){resolve(false);return}const chosen=pickVoice(gender); // Nếu máy chưa liệt kê giọng, vẫn yêu cầu trình duyệt phát zh-CN.
const u=new SpeechSynthesisUtterance(contentOf(text));u.lang='zh-CN';if(chosen)u.voice=chosen;u.rate=Number(state.speed)||.9;u.pitch=1;
let done=false;const finish=ok=>{if(done)return;done=true;ttsPending=null;resolve(ok)};ttsPending=finish;
u.onend=()=>finish(true);u.onerror=()=>finish(false);
speechSynthesis.cancel();setTimeout(()=>{if(!stopping)try{speechSynthesis.speak(u)}catch(e){finish(false)}else finish(false)},60);
})}
async function speak(text){if(!isDialogue(text))return false;stopAudio();stopping=false;
 const phrase=contentOf(text),gender=speakerGender(text);
 // MP3: ưu tiên tệp đặt theo câu thoại, sau đó hỗ trợ quy ước tên cũ.
 let ok=false;const mp3=window.SPA_AUDIO_FILES||[];if(mp3.includes(localMp3(phrase)))ok=await audioPlayback(localMp3(phrase));if(!ok&&phrase!==text&&!stopping&&mp3.includes(localMp3(text)))ok=await audioPlayback(localMp3(text));
 if(ok)return true;if(stopping)return false;return synthSpeech(phrase,gender)
}
window.spaIsDialogue=isDialogue;window.spaContentOf=contentOf;window.spaSpeakerGender=speakerGender;
// Từ vựng là đơn vị học riêng: không áp dụng bộ lọc câu hội thoại.
async function speakVocabulary(raw){
 const term=String(raw||'').trim().replace(/^[^：:]{1,24}[：:]\s*(?=[\u3400-\u9fff])/,'');
 if(!zh.test(term))return false;
 stopAudio();stopping=false;
 // Chỉ đọc đúng chữ Hán của ô từ vựng, không đọc STT, Pinyin, nghĩa hay tên nhóm.
 // Hỗ trợ MP3 theo tên từ khi được cung cấp, còn lại dùng giọng Quan thoại zh-CN.
 const mp3=window.SPA_AUDIO_FILES||[];
 const file=localMp3(term);let ok=false;
 if(mp3.includes(file))ok=await audioPlayback(file);
 if(ok)return true;if(stopping)return false;
 return synthSpeech(term,'female');
}
window.speakVocabulary=speakVocabulary;
window.speakText=txt=>{speak(txt)};window.speakChinese=txt=>{speak(txt)};
function prepareItems(){items=[];const seen=new Set();$$('#section-0 .phrase-line').forEach((node)=>{const ch=$('.phrase-chinese',node)?.textContent?.trim(),py=$('.phrase-pinyin',node)?.textContent?.trim()||'',vi=$('.phrase-vietnamese',node)?.textContent?.trim()||'';if(!ch||!zh.test(ch)||!isDialogue(ch)||seen.has(ch))return;seen.add(ch);items.push({ch,py,vi})});if(!items.length)$$('.phrase-line').forEach(node=>{const ch=$('.phrase-chinese',node)?.textContent?.trim(),py=$('.phrase-pinyin',node)?.textContent?.trim()||'',vi=$('.phrase-vietnamese',node)?.textContent?.trim()||'';if(ch&&isDialogue(ch)&&!seen.has(ch)){seen.add(ch);items.push({ch,py,vi})}})}
function settingsHtml(){return `<div class="spa-controls"><label class="spa-control-label">Tốc độ <select id="spa-speed"><option value="0.75">Chậm 0,75×</option><option value="0.9">Vừa 0,9×</option><option value="1">Bình thường 1×</option></select></label><label class="spa-control-label">Lặp mỗi câu <select id="spa-repeat"><option value="1">1 lần</option><option value="2">2 lần</option><option value="3">3 lần</option></select></label></div>`}
function initUI(){const tools=$('.tools-section');if(!tools)return;const b=el('button','tool-btn spa-study-button','🎓 Bộ công cụ luyện tập');b.type='button';b.onclick=open;tools.appendChild(b);
const wrapper=el('div','spa-modal');wrapper.id='spa-study-modal';wrapper.innerHTML=`<div class="spa-panel" role="dialog" aria-modal="true" aria-label="Bộ công cụ học SPA"><div class="spa-panel-top"><h2>🎓 LUYỆN TẬP BÀI ${esc(lessonId)} · SPA</h2><button id="spa-close" class="spa-close" type="button">✕ Đóng</button></div><div class="spa-tabs"><button class="spa-tab active" data-pane="cards">🗂 Thẻ học</button><button class="spa-tab" data-pane="listen">🎧 Luyện nghe</button><button class="spa-tab" data-pane="quiz">✅ Trắc nghiệm</button><button class="spa-tab" data-pane="speak">🎙 Luyện nói</button></div><div class="spa-work"><div id="spa-pane-cards" class="spa-pane active"></div><div id="spa-pane-listen" class="spa-pane"></div><div id="spa-pane-quiz" class="spa-pane"></div><div id="spa-pane-speak" class="spa-pane"></div></div></div>`;
document.body.appendChild(wrapper);$('#spa-close').onclick=close;wrapper.addEventListener('click',e=>{if(e.target===wrapper)close()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&wrapper.classList.contains('open'))close()});$$('.spa-tab',wrapper).forEach(x=>x.onclick=()=>switchPane(x.dataset.pane));

}
function open(){prepareItems();$('#spa-study-modal').classList.add('open');document.body.style.overflow='hidden';switchPane('cards')}
function close(){stopAudio();if(recorder&&recorder.state==='recording')recorder.stop();if(recognizer)try{recognizer.stop()}catch(e){}$('#spa-study-modal').classList.remove('open');document.body.style.overflow='';}
function switchPane(p){stopAudio();mode=p;$$('.spa-tab').forEach(b=>b.classList.toggle('active',b.dataset.pane===p));$$('.spa-pane').forEach(n=>n.classList.toggle('active',n.id==='spa-pane-'+p));({cards:renderCards,listen:renderListen,quiz:renderQuiz,speak:renderSpeaking})[p]?.()}
const current=()=>items[Math.max(0,Math.min(pos,items.length-1))];
function cardHtml(item,show=true){return item?`<div class="spa-hanzi" lang="zh-CN">${esc(item.ch)}</div>${show?`<div class="spa-pinyin">${esc(item.py)}</div><div class="spa-meaning">${esc(item.vi)}</div>`:''}`:'Chưa có câu tiếng Trung trong bài này.'}
function progressText(){return `Đã học ${state.learned.filter(x=>items.some(it=>it.ch===x)).length}/${items.length} câu`}
function renderCards(){const node=$('#spa-pane-cards');if(!items.length){node.textContent='Bài học chưa có mẫu câu để làm thẻ.';return}pos=Math.max(0,Math.min(pos,items.length-1));const it=current();node.innerHTML=`<div class="spa-progress"><div style="width:${(state.learned.filter(x=>items.some(it=>it.ch===x)).length/items.length*100).toFixed(1)}%"></div></div><div class="spa-small" id="spa-progress-label">${progressText()} · Câu ${pos+1}/${items.length}</div><div class="spa-card" id="spa-card">${cardHtml(it,false)}</div><div class="spa-actions"><button class="spa-action primary" id="spa-flip">👁 Lật thẻ</button><button class="spa-action" id="spa-card-audio">🔊 Nghe</button><button class="spa-action" id="spa-learned">${state.learned.includes(it.ch)?'✓ Đã thuộc':'☆ Đánh dấu đã thuộc'}</button></div><div class="spa-actions"><button class="spa-action" id="spa-prev">← Trước</button><button class="spa-action" id="spa-next">Tiếp →</button><button class="spa-action" id="spa-shuffle">Xáo trộn</button></div>`;
$('#spa-flip').onclick=()=>{$('#spa-card').innerHTML=cardHtml(it,true)};$('#spa-card-audio').onclick=()=>speak(it.ch);$('#spa-learned').onclick=()=>{state.learned=state.learned.includes(it.ch)?state.learned.filter(s=>s!==it.ch):[...state.learned,it.ch];persist();renderCards()};$('#spa-prev').onclick=()=>{pos=(pos-1+items.length)%items.length;renderCards()};$('#spa-next').onclick=()=>{pos=(pos+1)%items.length;renderCards()};$('#spa-shuffle').onclick=()=>{pos=Math.floor(Math.random()*items.length);renderCards()}}
function wait(ms){return new Promise(r=>setTimeout(r,ms))}
function renderListen(){const node=$('#spa-pane-listen');node.innerHTML=`${settingsHtml()}<div class="spa-card" id="spa-listen-card"></div><div class="spa-actions"><button class="spa-action primary" id="spa-play-one">🔊 Nghe câu này</button><button class="spa-action primary" id="spa-play-list">▶ Luyện nghe liên tục</button><button class="spa-action" id="spa-stop">■ Dừng</button><button class="spa-action" id="spa-list-prev">←</button><button class="spa-action" id="spa-list-next">→</button></div><div class="spa-controls"><label><input type="checkbox" id="spa-hide-answer"/> Che Pinyin và nghĩa Việt</label></div><p class="spa-small" id="spa-list-n"></p>`;bindSettings();const refresh=()=>{$('#spa-listen-card').innerHTML=cardHtml(current(),!$('#spa-hide-answer').checked);$('#spa-list-n').textContent=`Câu ${pos+1}/${items.length}`};refresh();$('#spa-hide-answer').onchange=refresh;$('#spa-play-one').onclick=()=>speak(current().ch);$('#spa-stop').onclick=stopAudio;$('#spa-list-prev').onclick=()=>{stopAudio();pos=(pos-1+items.length)%items.length;refresh()};$('#spa-list-next').onclick=()=>{stopAudio();pos=(pos+1)%items.length;refresh()};$('#spa-play-list').onclick=async()=>{if(playing){stopAudio();return}stopping=false;playing=true;$('#spa-play-list').textContent='■ Dừng nghe liên tục';for(let i=pos;i<items.length&&!stopping;i++){pos=i;refresh();for(let j=0;j<Number(state.repeat)&&!stopping;j++){let ok=await playSequential(items[i].ch);if(!ok){stopAudio();return}await wait(450)}}stopAudio()};}
async function playSequential(txt){return await speak(txt)}
function bindSettings(){const speed=$('#spa-speed'),repeat=$('#spa-repeat');speed.value=String(state.speed);repeat.value=String(state.repeat);speed.onchange=()=>{state.speed=Number(speed.value);persist()};repeat.onchange=()=>{state.repeat=Number(repeat.value);persist()}}
function buildQuiz(){const available=items.filter(x=>x.vi);questions=available.map(x=>{const distractors=[...new Set(available.filter(i=>i.ch!==x.ch).map(i=>i.vi))].sort(()=>Math.random()-.5).slice(0,3);const options=[x.vi,...distractors].sort(()=>Math.random()-.5);return {x,options}}).filter(q=>q.options.length>=2).sort(()=>Math.random()-.5).slice(0,Math.min(12,available.length));qi=0;score=0;answered=false}
function renderQuiz(){const node=$('#spa-pane-quiz');node.innerHTML='<div id="spa-quiz-stage"></div>';buildQuiz();quizStep()}
function quizStep(){const n=$('#spa-quiz-stage');if(!questions.length){n.textContent='Không đủ câu có nghĩa Việt để tạo trắc nghiệm.';return}if(qi>=questions.length){n.innerHTML=`<div class="spa-card"><h3>Hoàn thành!</h3><div class="spa-hanzi">${score}/${questions.length}</div><p>${Math.round(score/questions.length*100)}% trả lời đúng</p></div><button class="spa-action primary" id="spa-retry">Làm lại</button>`;$('#spa-retry').onclick=()=>{buildQuiz();quizStep()};return}const q=questions[qi];answered=false;n.innerHTML=`<div class="spa-small">Câu ${qi+1}/${questions.length} · Đúng ${score}</div><div class="spa-question" lang="zh-CN">${esc(q.x.ch)}</div><button class="spa-action" id="spa-quiz-audio">🔊 Nghe câu hỏi</button><div id="spa-options">${q.options.map((x,i)=>`<button class="spa-choice" data-i="${i}">${esc(x)}</button>`).join('')}</div><div id="spa-quiz-feedback" class="spa-feedback">Chọn một đáp án.</div><button id="spa-quiz-next" class="spa-action primary" disabled>Câu tiếp theo →</button>`;$('#spa-quiz-audio').onclick=()=>speak(q.x.ch);$$('.spa-choice').forEach(btn=>btn.onclick=()=>{if(answered)return;answered=true;const answer=q.options[Number(btn.dataset.i)];if(answer===q.x.vi)score++;$$('.spa-choice').forEach(b=>{b.disabled=true;if(q.options[Number(b.dataset.i)]===q.x.vi)b.classList.add('correct');else if(b===btn)b.classList.add('wrong')});$('#spa-quiz-feedback').textContent=answer===q.x.vi?'✓ Chính xác!':'Đáp án đúng: '+q.x.vi;$('#spa-quiz-next').disabled=false});$('#spa-quiz-next').onclick=()=>{qi++;quizStep()}}
function renderSpeaking(){const node=$('#spa-pane-speak');node.innerHTML=`<div class="spa-card" id="spa-speak-card">${cardHtml(current())}</div><div class="spa-actions"><button class="spa-action primary" id="spa-speak-model">🔊 Nghe mẫu</button><button class="spa-action" id="spa-speak-voice">🎤 Bắt đầu nhận dạng</button><button class="spa-action" id="spa-speak-next">Câu khác →</button></div><div class="spa-feedback" id="spa-speak-result">Nhấn micro để luyện nói theo câu mẫu.</div>`;
$('#spa-speak-model').onclick=()=>speak(current().ch);$('#spa-speak-next').onclick=()=>{pos=(pos+1)%items.length;renderSpeaking()};$('#spa-speak-voice').onclick=()=>{const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Speech){$('#spa-speak-result').textContent='Thiết bị chưa hỗ trợ luyện nói bằng micro.';return}try{recognizer=new Speech();recognizer.lang='zh-CN';recognizer.continuous=false;recognizer.interimResults=false;recognizer.onresult=e=>{const said=e.results[0][0].transcript;$('#spa-speak-result').textContent='Máy nhận được: '+said+' | Câu mẫu: '+current().ch};recognizer.onerror=e=>{$('#spa-speak-result').textContent='Không nhận dạng được: '+e.error};recognizer.start();$('#spa-speak-result').textContent='Đang nghe... Nói rõ tiếng Trung vào micro.'}catch(e){$('#spa-speak-result').textContent='Chưa thể mở micro: '+e.message}}}
document.addEventListener('DOMContentLoaded',()=>{prepareItems();initUI()});
})();
