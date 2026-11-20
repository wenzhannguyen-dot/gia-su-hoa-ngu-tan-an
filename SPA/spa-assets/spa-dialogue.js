(()=>{'use strict';
document.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('.phrase-line').forEach(line=>{
  const ch=line.querySelector('.phrase-chinese');if(!ch)return;
  const original=ch.textContent.trim();
  if(!window.spaIsDialogue?.(original)){
   line.style.cursor='default';return;
  }
  const colon=original.indexOf('：');
  if(colon>0&&colon<22){
    const gender=window.spaSpeakerGender?.(original);
    line.dataset.speakerGender=gender;
    // Chỉ đổi cách hiển thị vai; tuyệt đối không thay nguyên văn.
  }
  line.setAttribute('role','button');line.setAttribute('tabindex','0');
  const play=()=>window.speakText?.(original);
  if(!line.hasAttribute('onclick'))line.addEventListener('click',play);
  line.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();play()}});
 });
});})();