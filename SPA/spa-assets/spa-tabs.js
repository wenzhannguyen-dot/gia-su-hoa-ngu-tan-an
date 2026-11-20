(()=>{'use strict';
const q=(x,p=document)=>p.querySelector(x);
const qa=(x,p=document)=>Array.from(p.querySelectorAll(x));
function sections(){return qa('.content-body > .section-content').filter(el=>el.dataset.empty!=='true' && (el.querySelector('.phrase-line')||el.querySelector('.vocab-table tbody tr')||el.querySelector('.note-block')))}
function topicify(section){
 const box=q('.part-box',section);if(!box)return;
 const children=Array.from(box.children);
 const heads=children.filter(n=>n.classList.contains('part-title'));
 if(heads.length<2)return;
 // Each topical heading owns exactly the content that follows it, until next heading.
 const blocks=[];let current=null;
 children.forEach(node=>{
   if(node.classList.contains('part-title')){current={heading:node,nodes:[]};blocks.push(current)}
   else if(current)current.nodes.push(node);
 });
 const visible=blocks.filter(block=>block.nodes.some(n=>n.classList.contains('phrase-line')||n.classList.contains('vocab-table')||n.classList.contains('note-block')||n.classList.contains('context-note')||n.querySelector?.('.phrase-line, .vocab-table, .note-block')));
 if(visible.length<2)return;
 const tabBar=document.createElement('div');tabBar.className='spa-topic-tabs';tabBar.setAttribute('role','tablist');tabBar.setAttribute('aria-label','Chủ đề');
 visible.forEach((block,i)=>{
  const panel=document.createElement('div');panel.className='spa-topic-panel';panel.dataset.topic=i;panel.id=section.id+'-topic-'+i;panel.setAttribute('role','tabpanel');
  const label=block.heading.textContent.trim().replace(/^I[IVX]*\.\s*[^—]*—\s*/,'').trim();
  const button=document.createElement('button');button.type='button';button.className='spa-topic-tab';button.dataset.topic=i;button.textContent=label||'Chủ đề '+(i+1);button.setAttribute('role','tab');button.setAttribute('aria-controls',panel.id);
  button.onclick=()=>selectTopic(tabBar,box,i);
  tabBar.appendChild(button);block.heading.remove();block.nodes.forEach(node=>panel.appendChild(node));box.appendChild(panel);
 });
 // Discard only headings with no underlying lesson content, never a sample sentence or a vocabulary row.
 blocks.filter(block=>!visible.includes(block)).forEach(block=>{block.heading.remove();block.nodes.forEach(node=>box.insertBefore(node,tabBar))});
 box.prepend(tabBar);selectTopic(tabBar,box,0);
}
function selectTopic(tabBar,box,i){qa('.spa-topic-tab',tabBar).forEach(b=>{const active=Number(b.dataset.topic)===i;b.classList.toggle('active',active);b.setAttribute('aria-selected',active?'true':'false')});qa('.spa-topic-panel',box).forEach(panel=>panel.classList.toggle('active',Number(panel.dataset.topic)===i));if(window.speechSynthesis)window.speechSynthesis.cancel()}
function addSoundButtons(){qa('.phrase-line').forEach(line=>{const ch=q('.phrase-chinese',line);if(!ch)return;const text=ch.textContent.trim();if(!window.spaIsDialogue?.(text))return;line.classList.add('spa-speakable');line.setAttribute('role','button');line.setAttribute('tabindex','0');
const btn=document.createElement('button');btn.type='button';btn.className='spa-sound-btn';btn.textContent='🔊';btn.title='Nghe câu tiếng Trung';btn.setAttribute('aria-label','Nghe câu tiếng Trung');btn.onclick=e=>{e.stopPropagation();window.speakText?.(text)};line.insertBefore(btn,line.firstChild);
})}
function addVocabSoundButtons(){
 qa('.vocab-table tbody tr').forEach(tr=>{
  const cell=q('td.vocab-hanzi',tr)||tr.cells?.[1];
  if(!cell||q('.spa-vocab-audio',cell))return;
  const hanzi=cell.textContent.trim();
  if(!/[\u3400-\u9fff]/.test(hanzi))return;
  const btn=document.createElement('button');
  btn.type='button';btn.className='spa-vocab-audio';
  btn.textContent='🔊';btn.title='Nghe phát âm từ vựng';
  btn.setAttribute('aria-label','Nghe phát âm: '+hanzi);
  btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();window.speakVocabulary?.(hanzi)});
  cell.prepend(btn);
 });
}
document.addEventListener('DOMContentLoaded',()=>{sections().forEach(topicify);addSoundButtons();addVocabSoundButtons();});
})();