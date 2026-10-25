(() => {
  "use strict";
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
  const views = $$("[data-view]");
  function showPage(page, updateHash=true) {
    if (!views.some(v => v.dataset.view === page)) page = "index";
    views.forEach(v => {
      const active = v.dataset.view === page;
      v.classList.toggle("active", active);
      v.setAttribute("aria-hidden", active ? "false" : "true");
    });
    $$(".nav [data-page]").forEach(a => a.classList.toggle("active", a.dataset.page === page));
    document.title = (page === "index" ? "Home" : page.replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase())) + " | DOB98";
    if (updateHash && location.hash !== "#" + page) history.pushState({page}, "", "#" + page);
    window.scrollTo(0,0);
  }
  // Event delegation handles clicks on nested icons/text as well as the link itself.
  document.addEventListener("click", e => {
    const target = e.target instanceof Element ? e.target : e.target.parentElement;
    const link = target && target.closest("[data-page]");
    if (!link) return;
    const page = link.dataset.page;
    if (!views.some(v => v.dataset.view === page)) return;
    e.preventDefault();
    showPage(page);
  });
  window.addEventListener("popstate", () => showPage(location.hash.slice(1) || "index", false));
  window.addEventListener("hashchange", () => showPage(location.hash.slice(1) || "index", false));

  let depositMethod="bKash", depositAmount=500, withdrawMethod="bKash", withdrawAmount=1000;
  function bindAmount(selector, key, callback) {
    $$(selector).forEach(btn => btn.addEventListener("click", () => {
      callback(btn.dataset[key]);
      const parent = btn.parentElement;
      $$(".amount", parent).forEach(b => b.classList.toggle("selected", b === btn));
    }));
  }
  bindAmount("[data-method]", "method", value => {
    depositMethod=value;
    $("#deposit-note")?.classList.toggle("hidden", value !== "Nagad");
    $("#deposit-fields")?.classList.toggle("hidden", value === "Nagad");
  });
  bindAmount("[data-amount]", "amount", value => depositAmount=Number(value));
  bindAmount("[data-wmethod]", "wmethod", value => {
    withdrawMethod=value;
    $("#withdraw-note")?.classList.toggle("hidden", value !== "Nagad");
    $("#withdraw-fields")?.classList.toggle("hidden", value === "Nagad");
  });
  bindAmount("[data-wamount]", "wamount", value => withdrawAmount=Number(value));
  $("#deposit-form")?.addEventListener("submit", e => {
    e.preventDefault();
    const out=$("#deposit-result"), trx=$("#deposit-trx")?.value.trim() || "";
    if (depositMethod !== "bKash") { if(out) out.textContent="Nagad not available."; return; }
    if (!trx) { if(out) out.textContent="Enter the transaction ID."; return; }
    if(out) out.textContent=`Demo request: ৳${depositAmount} via bKash. Payment is not verified or saved by this UI.`;
  });
  $("#withdraw-form")?.addEventListener("submit", e => {
    e.preventDefault();
    const out=$("#withdraw-result"), wallet=$("#withdraw-wallet")?.value.trim() || "";
    if (withdrawMethod !== "bKash") { if(out) out.textContent="Nagad not available."; return; }
    if (!/^\d{11}$/.test(wallet)) { if(out) out.textContent="Enter a valid 11-digit wallet number."; return; }
    if(out) out.textContent=`Demo request: ৳${withdrawAmount} to ${wallet.slice(0,3)}••••••${wallet.slice(-2)}. No balance is deducted or request saved.`;
  });
  $("#register-form")?.addEventListener("submit", e => {
    e.preventDefault();
    const email=$("#reg-email")?.value.trim() || "", password=$("#reg-password")?.value || "", confirm=$("#reg-confirm")?.value || "", hint=$("#password-hint");
    if (!/^[^\s@]+@gmail\.com$/i.test(email)) { if(hint) hint.textContent="Please enter a valid Gmail address."; return; }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}/.test(password)) { if(hint) hint.textContent="Password needs 10+ chars, uppercase, lowercase, number and symbol."; return; }
    if (password !== confirm) { if(hint) hint.textContent="Passwords do not match."; return; }
    if(hint) hint.textContent="Validation passed locally. Connect server API to create an account and verify email.";
  });
  $("#login-form")?.addEventListener("submit", e => { e.preventDefault(); alert("Login UI only: secure authentication API is not connected."); });
  $("#reset-form")?.addEventListener("submit", e => { e.preventDefault(); alert("Password reset UI only: email service and secure reset API are not connected."); });
  showPage(location.hash.slice(1) || "index", false);
})();