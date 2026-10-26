(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
  const API = (window.DOB98_API_BASE || 'http://localhost:3000/api').replace(/\/$/, '');
  const views = $$('[data-view]');
  let token = sessionStorage.getItem('dob98_user_token') || '';
  let currentUser = null;
  const topAuthActions = $('#top-auth-actions');
  function syncAuthButtons(){ if(topAuthActions) topAuthActions.hidden = Boolean(token) || sessionStorage.getItem('dob98_registered_this_session') === '1'; }
  let depositMethod='bKash', depositAmount=500, withdrawMethod='bKash', withdrawAmount=1000;
  const protectedPages = new Set(['dashboard','deposit','withdraw','deposit-history','withdraw-history','aviator','casino','sports']);
  function showPage(page, updateHash=true) {
    if (!views.some(v => v.dataset.view === page)) page = 'index';
    // Central guard: no account, no wallet actions, history, or game views.
    if (protectedPages.has(page) && !token) {
      page = 'login';
      setStatus($('#login-result'), 'Please register or login first to access games, deposit, withdraw, and account history.');
    }
    syncAuthButtons();
    views.forEach(v => { const active = v.dataset.view === page; v.classList.toggle('active', active); v.setAttribute('aria-hidden', active ? 'false' : 'true'); });
    $$('.nav [data-page]').forEach(a => a.classList.toggle('active', a.dataset.page === page));
    document.title = (page === 'index' ? 'Home' : page.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase())) + ' | DOB98';
    if (updateHash && location.hash !== '#'+page) history.pushState({page}, '', '#'+page);
    window.scrollTo(0,0);
    if (page === 'dashboard' || page === 'deposit-history' || page === 'withdraw-history') refreshAccount().catch(()=>{});
  }
  document.addEventListener('click', e => {
    const target = e.target instanceof Element ? e.target : e.target.parentElement;
    const link = target && target.closest('[data-page]'); if (!link) return;
    const page = link.dataset.page; if (!views.some(v => v.dataset.view === page)) return;
    e.preventDefault();
    if (page === 'login' && link.textContent.trim().toLowerCase()==='logout') { logout(); return; }
    showPage(page);
  });
  document.addEventListener('keydown', e => { if(e.key!=='Enter'&&e.key!==' ')return;const target=e.target instanceof Element?e.target.closest('[data-page][role="link"]'):null;if(!target)return;const page=target.dataset.page;if(!views.some(v=>v.dataset.view===page))return;e.preventDefault();showPage(page); });
  window.addEventListener('popstate',()=>showPage(location.hash.slice(1)||'index',false));
  window.addEventListener('hashchange',()=>showPage(location.hash.slice(1)||'index',false));
  function setStatus(el,msg,ok=false){if(!el)return;el.textContent=msg;el.style.color=ok?'#5cf0b3':'#ffcf5b';}
  async function api(path,opts={}) { const headers={'Content-Type':'application/json',...(opts.headers||{})};if(token)headers.Authorization='Bearer '+token;let r;try{r=await fetch(API+path,{...opts,headers})}catch(e){throw Error('Server/API connected নেই। API server চালু করে DOB98_API_BASE ঠিক করুন।')}const d=await r.json().catch(()=>({error:'Invalid server response'}));if(!r.ok)throw Error(d.error||'Request failed');return d; }
  function money(n){return '৳ '+Number(n||0).toLocaleString('en-BD',{minimumFractionDigits:2,maximumFractionDigits:2});}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function formatJoined(value){if(!value)return 'Member since: date unavailable';const date=new Date(value);if(Number.isNaN(date.getTime()))return 'Member since: date unavailable';return 'Member since: '+date.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});}
  function renderProfile(user){if(!user)return;const username=String(user.username||user.name||'User');const displayName=String(user.name||user.fullName||username);const avatar=$('#profile-avatar');if(avatar)avatar.textContent=(displayName.trim()[0]||username[0]||'U').toUpperCase();const name=$('#profile-name');if(name)name.textContent=displayName;const handle=$('#profile-username');if(handle)handle.textContent='@'+username;const joined=$('#profile-joined');if(joined)joined.textContent=formatJoined(user.createdAt||user.created_at||user.joinedAt||user.registeredAt);}
  async function refreshAccount(){if(!token)return;const d=await api('/me');currentUser=d.user;renderProfile(d.user);$('#wallet-balance') && ($('#wallet-balance').textContent=money(d.user.balance));$('#wallet-deposits')&&($('#wallet-deposits').textContent=money(d.user.totalDeposit));$('#wallet-withdrawals')&&($('#wallet-withdrawals').textContent=money(d.user.totalWithdraw));$('#account-message')&&($('#account-message').textContent='Logged in as '+d.user.username+'. Your wallet and history are synced with the server.');renderHistory('#deposit-history-rows',d.depositHistory||[],'deposit');renderHistory('#withdraw-history-rows',d.withdrawHistory||[],'withdraw');}
  function renderHistory(sel,rows,type){const body=$(sel);if(!body)return;body.replaceChildren();if(!rows.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=6;td.textContent='No requests yet.';tr.append(td);body.append(tr);return;}rows.forEach(x=>{const tr=document.createElement('tr');const vals=type==='deposit'?[x.id.slice(0,8),money(x.amount),x.method,x.trxId||'—',x.status,x.createdAt]:[x.id.slice(0,8),money(x.amount),x.method,(x.walletNumber||'').replace(/^(\d{3})\d{5}(\d{3})$/,'$1•••••$2'),x.status,x.createdAt];vals.forEach(v=>{const td=document.createElement('td');td.textContent=String(v??'—');tr.append(td)});body.append(tr);if(x.note){const noteTr=document.createElement('tr'),td=document.createElement('td');td.colSpan=6;td.textContent='Message to admin: '+x.note;td.style.color='#b8c9e1';noteTr.append(td);body.append(noteTr)}});}
  function logout(){token='';currentUser=null;sessionStorage.removeItem('dob98_user_token');sessionStorage.removeItem('dob98_registered_this_session');syncAuthButtons();showPage('index');setStatus($('#login-result'),'Logged out.',true);}
  function bindAmount(selector,key,callback){$$(selector).forEach(btn=>btn.addEventListener('click',()=>{callback(btn.dataset[key]);const parent=btn.parentElement;$$('.amount',parent).forEach(b=>b.classList.toggle('selected',b===btn));}));}
  bindAmount('[data-method]','method',v=>{depositMethod=v;$('#deposit-note')?.classList.toggle('hidden',v!=='Nagad');$('#deposit-fields')?.classList.toggle('hidden',v==='Nagad');});
  bindAmount('[data-amount]','amount',v=>depositAmount=Number(v));
  bindAmount('[data-wmethod]','wmethod',v=>{withdrawMethod=v;$('#withdraw-note')?.classList.toggle('hidden',v!=='Nagad');$('#withdraw-fields')?.classList.toggle('hidden',v==='Nagad');});
  bindAmount('[data-wamount]','wamount',v=>withdrawAmount=Number(v));
  $('#register-form')?.addEventListener('submit',async e=>{e.preventDefault();const email=$('#reg-email').value.trim(),username=$('#reg-username').value.trim(),password=$('#reg-password').value,confirm=$('#reg-confirm').value,hint=$('#password-hint');if(!/^[A-Za-z0-9]{3,24}$/.test(username)){setStatus(hint,'Username must be 3–24 letters/numbers only.');return;}if(password.length<6||password.length>72){setStatus(hint,'Password must be 6–72 characters. Letters and numbers are allowed.');return;}if(password!==confirm){setStatus(hint,'Passwords do not match.');return;}try{const d=await api('/auth/register',{method:'POST',body:JSON.stringify({email,username,password})});sessionStorage.setItem('dob98_registered_this_session','1');syncAuthButtons();setStatus(hint,d.message+' Then verify your Gmail and login using the link below.',true);}catch(err){setStatus(hint,err.message);}});
  $('#login-form')?.addEventListener('submit',async e=>{e.preventDefault();const identity=$('#login-identity').value.trim(),password=$('#login-password').value;try{const d=await api('/auth/login',{method:'POST',body:JSON.stringify({identity,password})});token=d.token;sessionStorage.setItem('dob98_user_token',token);sessionStorage.removeItem('dob98_registered_this_session');currentUser=d.user;syncAuthButtons();setStatus($('#login-result'),'Login successful.',true);await refreshAccount();showPage('dashboard');}catch(err){setStatus($('#login-result'),err.message);}});
  $('#reset-form')?.addEventListener('submit',async e=>{e.preventDefault();alert('Password reset endpoint is not fully implemented yet. Contact site admin.');});
  $('#deposit-form')?.addEventListener('submit',async e=>{e.preventDefault();const out=$('#deposit-result'),trxId=$('#deposit-trx').value.trim(),note=$('#deposit-message')?.value.trim()||'';if(!token){showPage('login');setStatus($('#login-result'),'Please login before submitting a deposit request.');return;}if(depositMethod!=='bKash'){setStatus(out,'Only bKash requests are currently available.');return;}try{const d=await api('/transactions/deposit',{method:'POST',body:JSON.stringify({amount:depositAmount,method:'bkash',trxId,note})});setStatus(out,d.message+' Admin approval হলে balance add হবে.',true);e.currentTarget.reset();await refreshAccount();showPage('deposit-history');}catch(err){setStatus(out,err.message);}});
  $('#withdraw-form')?.addEventListener('submit',async e=>{e.preventDefault();const out=$('#withdraw-result'),walletNumber=$('#withdraw-wallet').value.trim(),note=$('#withdraw-message')?.value.trim()||'';if(!token){showPage('login');setStatus($('#login-result'),'Please login before requesting a withdrawal.');return;}if(withdrawMethod!=='bKash'){setStatus(out,'Only bKash withdrawals are currently available.');return;}try{const d=await api('/transactions/withdraw',{method:'POST',body:JSON.stringify({amount:withdrawAmount,method:'bkash',walletNumber,note})});setStatus(out,d.message,true);e.currentTarget.reset();await refreshAccount();showPage('withdraw-history');}catch(err){setStatus(out,err.message);}});
  api('/public/settings').then(s=>{const field=$('#deposit-fields input[readonly]');if(field&&s.bkashNumber)field.value=s.bkashNumber;}).catch(()=>{});
  if(token)refreshAccount().catch(()=>{token='';sessionStorage.removeItem('dob98_user_token')});
  window.addEventListener('focus',()=>{if(token)refreshAccount().catch(()=>{});});
  syncAuthButtons();
  showPage(location.hash.slice(1)||'index',false);
})();
