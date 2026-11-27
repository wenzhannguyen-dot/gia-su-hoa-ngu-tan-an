(()=>{
 const script=document.currentScript, root=document.documentElement;
 const key=script.dataset.key;
 document.addEventListener('DOMContentLoaded',()=>{
  for(const home of document.querySelectorAll('a.home-btn, a.home-link, button[data-home]')){
   if(home.textContent.trim()!=='Trang chủ'||!home.querySelector('i,svg'))continue;
   home.setAttribute('aria-label','Trang chủ');
   for(const node of home.childNodes){
    if(node.nodeType===Node.TEXT_NODE&&node.textContent.trim()==='Trang chủ')node.textContent='';
   }
  }
  for(const speed of document.querySelectorAll('select#audio-speed')){
   if(!speed.hasAttribute('aria-label'))speed.setAttribute('aria-label','Tốc độ');
  }
 },{once:true});
 if(location.protocol==='file:')return;
 try{if(sessionStorage.getItem(key)==='1')return}catch{}
 root.classList.add('lesson-access-locked');
 document.addEventListener('DOMContentLoaded',()=>{
  const dialog=document.createElement('dialog');
  dialog.className='lesson-access-dialog';
  dialog.innerHTML='<form><h2>Bài học có mật khẩu</h2><label>Mật khẩu <input type="password" autocomplete="current-password" required></label><p role="status"></p><button type="submit">Mở bài</button></form>';
  document.body.append(dialog);
  dialog.addEventListener('cancel',event=>event.preventDefault());
  dialog.showModal();
  const input=dialog.querySelector('input'), status=dialog.querySelector('[role=status]');
  dialog.querySelector('form').addEventListener('submit',async event=>{
   event.preventDefault();
   try{
    const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(input.value));
    const hash=Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');
    if(hash!==script.dataset.hash){status.textContent='Mật khẩu không đúng';input.select();return}
    try{sessionStorage.setItem(key,'1')}catch{}
    root.classList.remove('lesson-access-locked');
    dialog.close();
    dialog.remove();
   }catch{status.textContent='Không kiểm tra được mật khẩu'}
  });
 },{once:true});
})();