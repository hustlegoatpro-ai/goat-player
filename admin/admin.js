(() => {
 const $=s=>document.querySelector(s), loginBox=$('#loginBox'), editor=$('#editor'), tracksEl=$('#tracks'), status=$('#status');
 let data={playerTitle:'Goat Player',startingVolume:.78,tracks:[]}, pending=null, uploadType='';

 const api=(url,opt={})=>fetch('../api/'+url,{credentials:'same-origin',...opt}).then(async r=>{const j=await r.json();if(!r.ok)throw new Error(j.error||'Request failed');return j});
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const render=()=>{
   tracksEl.innerHTML='';
   data.tracks.forEach((t,i)=>{
     const box=document.createElement('section');box.className='box track-editor';
     box.innerHTML=`<label>Title<input data-k="title" value="${esc(t.title)}"></label><label>Artist<input data-k="artist" value="${esc(t.artist)}"></label>
     <label class="wide">Audio path<input data-k="audio" value="${esc(t.audio)}"></label>
     <label class="wide">Artwork path<input data-k="artwork" value="${esc(t.artwork||'assets/goat-player-logo.png')}"></label>
     <div class="row wide"><button data-upload="audio">Upload Audio</button><button data-upload="artwork">Upload Artwork</button><button data-up>Move Up</button><button data-down>Move Down</button><button data-delete>Delete</button></div>`;
     box.querySelectorAll('input[data-k]').forEach(inp=>inp.oninput=()=>t[inp.dataset.k]=inp.value);
     box.querySelector('[data-upload="audio"]').onclick=()=>{pending={track:t,key:'audio'};uploadType='audio';$('#audioPicker').click()};
     box.querySelector('[data-upload="artwork"]').onclick=()=>{pending={track:t,key:'artwork'};uploadType='artwork';$('#artPicker').click()};
     box.querySelector('[data-delete]').onclick=()=>{data.tracks.splice(i,1);render()};
     box.querySelector('[data-up]').onclick=()=>{if(i>0){[data.tracks[i-1],data.tracks[i]]=[data.tracks[i],data.tracks[i-1]];render()}};
     box.querySelector('[data-down]').onclick=()=>{if(i<data.tracks.length-1){[data.tracks[i+1],data.tracks[i]]=[data.tracks[i],data.tracks[i+1]];render()}};
     tracksEl.appendChild(box);
   });
 };
 const upload=async file=>{
   const fd=new FormData();fd.append('type',uploadType);fd.append('file',file);status.textContent='Uploading…';
   try{const r=await api('upload.php',{method:'POST',body:fd});pending.track[pending.key]=r.path;status.textContent='Upload complete. Click Save & Publish.';render()}
   catch(e){status.textContent=e.message}
 };
 $('#audioPicker').onchange=e=>{if(e.target.files[0])upload(e.target.files[0]);e.target.value=''};
 $('#artPicker').onchange=e=>{if(e.target.files[0])upload(e.target.files[0]);e.target.value=''};
 $('#login').onclick=async()=>{try{await api('login.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:$('#password').value})});loginBox.hidden=true;editor.hidden=false;data=await api('player.php');render()}catch(e){alert(e.message)}};
 $('#add').onclick=()=>{data.tracks.push({id:'track-'+Date.now(),title:'New Song',artist:'Artist Name',audio:'',artwork:'assets/goat-player-logo.png'});render()};
 $('#save').onclick=async()=>{status.textContent='Publishing…';try{await api('save.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});status.textContent='Published. All devices and embeds now use this version.'}catch(e){status.textContent=e.message}};
 $('#logout').onclick=async()=>{await api('logout.php',{method:'POST'});location.reload()};
})();