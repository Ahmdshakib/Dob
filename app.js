/* DOB98 local demo auth: records stay in this browser only; not suitable for production. */
(() => {
 'use strict';
 const API=(window.DOB98_API_BASE||'http://localhost:3000/api').replace(/\/$/,'');
 let token=sessionStorage.getItem('dob98_token')||'';
 let me=null,toastTimer;
 const USERS_KEY='dob98_local_users_v1', CURRENT_KEY='dob98_local_current_v1';
 const getUsers=()=>{try{return JSON.parse(localStorage.getItem(USERS_KEY)||'[]')}catch{return []}};
 const setUsers=x=>localStorage.setItem(USERS_KEY,JSON.stringify(x));
 const norm=x=>String(x||'').trim().toLowerCase();
 const hashlessNote='Local demo mode: account data is stored only in this browser.';
 const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
 const money=n=>'৳ '+Number(n||0).toLocaleString('en-BD',{minimumFractionDigits:2,maximumFractionDigits:2});
 function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3200)}
 async function api(path,opts={}){const headers={'Content-Type':'application/json',...(opts.headers||{})};if(token)headers.Authorization='Bearer '+token;let res;try{res=await fetch(API+path,{...opts,headers})}catch(e){throw Error('API is unreachable. Start the backend and check DOB98_API_BASE.')}const data=await res.json().catch(()=>({error:'Invalid server response'}));if(!res.ok)throw Error(data.error||'Request failed');return data}
 function message(form,msg,ok=false){const el=$('.form-msg',form);if(el){el.textContent=msg;el.style.color=ok?'#5cf0b3':'#ffcf5b'}}
 function validStrong(p){return p.length>=12&&/[a-z]/.test(p)&&/[A-Z]/.test(p)&&/[0-9]/.test(p)&&/[^A-Za-z0-9]/.test(p)}
 $('#menuToggle').addEventListener('click',()=>$('#mainNav').classList.toggle('open'));
 $$('#mainNav a').forEach(a=>a.addEventListener('click',()=>$('#mainNav').classList.remove('open')));
 $$('[data-page]').forEach(b=>b.addEventListener('click',()=>location.hash='#'+b.dataset.page));
 $$('[data-scroll]').forEach(b=>b.addEventListener('click',()=>location.hash='#'+b.dataset.scroll));
 $('#registerForm').addEventListener('submit',e=>{e.preventDefault();const f=e.currentTarget,d=Object.fromEntries(new FormData(f));
 if(!/^[^\\s@]+@gmail\\.com$/i.test(d.email)){message(f,'শুধু সঠিক Gmail ব্যবহার করুন।');return}
 if(!/^[a-zA-Z0-9_]{3,24}$/.test(d.username)){message(f,'Username 3–24 অক্ষর; ইংরেজি অক্ষর, সংখ্যা ও _ ব্যবহার করুন।');return}
 if(d.password.length<6){message(f,'Password কমপক্ষে ৬ অক্ষরের দিন।');return}
 if(d.password!==d.confirmPassword){message(f,'দুটি Password মেলেনি।');return}
 const users=getUsers();if(users.some(u=>norm(u.email)===norm(d.email))){message(f,'এই Gmail আগেই ব্যবহার হয়েছে।');return}
 if(users.some(u=>norm(u.username)===norm(d.username))){message(f,'এই Username আগেই ব্যবহার হয়েছে।');return}
 users.push({email:d.email.trim(),username:d.username.trim(),password:d.password,balance:0,totalDeposit:0,totalWithdraw:0,bonus:0,createdAt:new Date().toISOString()});setUsers(users);f.reset();message(f,'Registration সফল হয়েছে। এখন Login করুন।',true);toast('Account created.');location.hash='#login';
 });
 $('#loginForm').addEventListener('submit',e=>{e.preventDefault();const f=e.currentTarget,d=Object.fromEntries(new FormData(f)),identity=norm(d.identity);
 const u=getUsers().find(x=>norm(x.email)===identity||norm(x.username)===identity);
 if(!u||u.password!==d.password){message(f,'Gmail/Username অথবা Password ভুল।');toast('Login তথ্য ভুল।');return}
 me={...u,emailVerified:true};localStorage.setItem(CURRENT_KEY,JSON.stringify({email:u.email}));token='local-demo';sessionStorage.setItem('dob98_token',token);refreshView();message(f,'Login সফল হয়েছে।',true);toast('Welcome back, '+u.username);location.hash='#dashboard';
 });
 $('#forgotForm').addEventListener('submit',e=>{e.preventDefault();message(e.currentTarget,'এই offline demo-তে email reset পাঠানো যায় না। Password মনে না থাকলে local account মুছে নতুন করে register করতে হবে।')});
 $('#logoutBtn').addEventListener('click',()=>{token='';me=null;sessionStorage.removeItem('dob98_token');localStorage.removeItem(CURRENT_KEY);refreshView();toast('Logged out.');location.hash='#home'});
 function refresh(){let saved=null;try{saved=JSON.parse(localStorage.getItem(CURRENT_KEY)||'null')}catch{};me=saved?getUsers().find(u=>norm(u.email)===norm(saved.email))||null:null;refreshView();const bk=$('#bkashNumber');if(bk)bk.textContent='Demo mode — payment processing unavailable';}
 function refreshView(){const auth=!!me;$('#userName').textContent=auth?me.username:'guest';$('#headerBalance').textContent=money(auth?me.balance:0);$('#dashBalance').textContent=money(auth?me.balance:0);$('#totalDeposit').textContent=money(auth?me.totalDeposit:0);$('#totalWithdraw').textContent=money(auth?me.totalWithdraw:0);$('#totalBonus').textContent=money(auth?me.bonus:0);$('#profileMessage').textContent=auth?`${me.username} · ${me.email} · ${me.emailVerified?'Email verified':'Email verification required'}`:'Sign in to view your account details.'}
 function renderMe(r){refreshView();fillRows('#depositRows',r.depositHistory||[],'deposit');fillRows('#withdrawRows',r.withdrawHistory||[],'withdraw')}
 function fillRows(sel,rows,type){const body=$(sel);body.replaceChildren();if(!rows.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=6;td.className='empty';td.textContent='No transactions yet.';tr.append(td);body.append(tr);return}for(const x of rows){const vals=type==='deposit'?[x.id,money(x.amount),x.method,x.trxId||'—',x.status,x.createdAt]:[x.id,money(x.amount),x.method,(x.walletNumber||'').replace(/^(\d{3})\d{5}(\d{3})$/,'$1•••••$2'),x.status,x.createdAt];const tr=document.createElement('tr');vals.forEach((v,i)=>{const td=document.createElement('td');if(i===4){const span=document.createElement('span');span.className='status '+String(v).toLowerCase();span.textContent=v;td.append(span)}else td.textContent=String(v??'—');tr.append(td)});body.append(tr)}}
 $$('.amount-options').forEach(group=>{group.addEventListener('click',e=>{const b=e.target.closest('[data-amount]');if(!b)return;$$('button',group).forEach(x=>x.classList.toggle('selected',x===b));const input=group.parentElement.querySelector('input[name="amount"]');if(input)input.value=b.dataset.amount})});
 $('#depositForm').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,d=Object.fromEntries(new FormData(f));if(!me){message(f,'Please login first.');return}if(d.method==='nagad'){message(f,'Nagad not available.');return}message(f,'Offline demo: Deposit request পাঠাতে backend/server লাগবে। কোনো টাকা জমা হয়নি।');});
 $('#withdrawForm').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,d=Object.fromEntries(new FormData(f));if(!me){message(f,'Please login first.');return}if(d.method==='nagad'){message(f,'Nagad not available.');return}message(f,'Offline demo: Withdraw request পাঠাতে backend/server লাগবে। কোনো টাকা পাঠানো হয়নি।');});
 // Local visual demo only. These controls never call the wallet API and cannot cash out real funds.
 let demoBet=null,flightTimer=null,mult=1;
 $$('[data-step]').forEach(b=>b.addEventListener('click',()=>{const el=$('#betAmount');el.value=Math.max(10,Math.min(5000,Number(el.value||100)+Number(b.dataset.step)))}));
 $('#betBtn').addEventListener('click',()=>{if(demoBet){toast('A demo bet is already active.');return}const amount=Number($('#betAmount').value);if(!Number.isFinite(amount)||amount<10||amount>5000){toast('Demo bet must be between ৳10 and ৳5,000.');return}demoBet=amount;mult=1;$('#multiplier').textContent='1.00x';$('#flightStatus').textContent='Demo flight running — play credits only';$('#betBtn').disabled=true;$('#cashoutBtn').disabled=false;let t=Date.now();flightTimer=setInterval(()=>{mult=Math.exp((Date.now()-t)/10000*.06);$('#multiplier').textContent=mult.toFixed(2)+'x';$('#flight-plane').style.left=Math.min(75,(Date.now()-t)/80)+'%';if(mult>2.1){clearInterval(flightTimer);demoBet=null;$('#flightStatus').textContent='Demo round ended — no wallet changes';$('#betBtn').disabled=false;$('#cashoutBtn').disabled=true;toast('Demo round ended. No funds were moved.')}},100)});
 $('#cashoutBtn').addEventListener('click',()=>{if(!demoBet)return;clearInterval(flightTimer);demoBet=null;$('#flightStatus').textContent='Demo cashout — no wallet changes';$('#betBtn').disabled=false;$('#cashoutBtn').disabled=true;toast('Demo cashout only. No funds were moved.')});
 refresh();
})();