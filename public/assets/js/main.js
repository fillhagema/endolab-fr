/* ==========================================================================
   EndoLab replica — interactions
   ========================================================================== */

/* -----------------------------------------------------------------------
   CONFIG  ▸  Lien de paiement / redirection panier.
   Tous les boutons avec data-buy utilisent ce lien.
   ----------------------------------------------------------------------- */
const ENDOLAB = {
  REDIRECT_URL: "https://www.nhlv1trk.com/FK33BSS/C7HGJNG/?sub3=VIGORMAX%20%E2%80%93%20ACTION%20RAPIDE,%20SANS%20PILULES&sub4=https://santeliia.com/cdn/shop/files/BurhshPro_-_2025-08-08T175454.083.png",
  COUNTDOWN_RESETS_DAILY: true // counts down to local midnight, then restarts
};

document.addEventListener("DOMContentLoaded", () => {
  wirePurchaseButtons();
  startCountdown();
  initDrawers();
  initGallery();
  initVideoProof();
  initAccordions();
  initForms();
  initPopup();
  initScrollTop();
  initReveal();
  buildMarquees();
});

/* ---------- Purchase buttons → single redirect constant ---------- */
function buyHandler(e){
  if (e) e.preventDefault();
  const url = ENDOLAB.REDIRECT_URL;
  if (!url || url === "#"){
    alert("Ajoutez votre lien de paiement dans assets/js/main.js → ENDOLAB.REDIRECT_URL");
    return;
  }
  window.location.href = url;
}
// expose pour les boutons injectes dynamiquement si besoin
window.ENDOLAB_BUY = buyHandler;

function wirePurchaseButtons(){
  document.querySelectorAll("[data-buy]").forEach(el => el.addEventListener("click", buyHandler));
}

/* ---------- Countdown (rolling, to local midnight) ---------- */
function startCountdown(){
  const root = document.querySelector("[data-countdown]");
  if (!root) return;
  const h = root.querySelector("[data-h]"), m = root.querySelector("[data-m]"), s = root.querySelector("[data-s]");
  const target = () => { const t = new Date(); t.setHours(24,0,0,0); return t; };
  let end = target();
  const tick = () => {
    let diff = end - new Date();
    if (diff <= 0){ end = target(); diff = end - new Date(); }
    const totalH = Math.floor(diff/3.6e6);
    const mm = Math.floor(diff%3.6e6/6e4);
    const ss = Math.floor(diff%6e4/1e3);
    if (h) h.textContent = String(totalH).padStart(2,"0");
    if (m) m.textContent = String(mm).padStart(2,"0");
    if (s) s.textContent = String(ss).padStart(2,"0");
  };
  tick();
  setInterval(tick, 1000);
}

/* ---------- Drawers (mobile menu + cart) & overlay ---------- */
function initDrawers(){
  const overlay = document.querySelector("[data-overlay]");
  const open = (sel) => {
    const d = document.querySelector(sel);
    if (!d) return;
    d.classList.add("is-open");
    overlay && overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  };
  const closeAll = () => {
    document.querySelectorAll(".drawer.is-open").forEach(d => d.classList.remove("is-open"));
    overlay && overlay.classList.remove("is-open");
    document.body.style.overflow = "";
  };
  document.querySelectorAll("[data-open-menu]").forEach(b => b.addEventListener("click", () => open("[data-menu-drawer]")));
  document.querySelectorAll("[data-open-cart]").forEach(b => b.addEventListener("click", () => open("[data-cart-drawer]")));
  document.querySelectorAll("[data-close-drawer]").forEach(b => b.addEventListener("click", closeAll));
  overlay && overlay.addEventListener("click", closeAll);
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeAll(); });
}

/* ---------- Galerie produit ---------- */
function initGallery(){
  const gallery = document.querySelector("[data-gallery]");
  if (!gallery) return;
  const main = gallery.querySelector("[data-gallery-main] img");
  gallery.querySelectorAll("[data-thumb]").forEach(btn => {
    btn.addEventListener("click", () => {
      const src = btn.querySelector("img").getAttribute("src");
      main.setAttribute("src", src);
      gallery.querySelectorAll("[data-thumb]").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
    });
  });
}

/* ---------- Temoignages video ---------- */
function initVideoProof(){
  document.querySelectorAll("[data-video-card]").forEach(card => {
    const img = card.querySelector("img");
    const video = card.querySelector("video");
    const motionSrc = card.dataset.motionSrc;
    const posterSrc = img && (img.dataset.posterSrc || img.getAttribute("src"));

    const pauseCard = (item) => {
      const itemVideo = item.querySelector("video");
      const itemImg = item.querySelector("img");
      item.classList.remove("is-playing");
      item.setAttribute("aria-pressed", "false");
      if (itemVideo) itemVideo.pause();
      if (itemImg && itemImg.dataset.posterSrc) itemImg.setAttribute("src", itemImg.dataset.posterSrc);
    };

    card.addEventListener("click", () => {
      const isPlaying = card.classList.contains("is-playing");
      document.querySelectorAll("[data-video-card].is-playing").forEach(pauseCard);
      if (isPlaying) return;

      card.classList.add("is-playing");
      card.setAttribute("aria-pressed", "true");
      if (video) {
        video.play().catch(() => pauseCard(card));
      } else if (img && motionSrc) {
        img.setAttribute("src", motionSrc);
        img.dataset.posterSrc = posterSrc;
      }
    });
  });
}

/* ---------- Accordions (details / guarantee / FAQ) ---------- */
function initAccordions(){
  document.querySelectorAll(".acc__head").forEach(head => {
    head.addEventListener("click", () => {
      const item = head.closest(".acc__item");
      const panel = item.querySelector(".acc__panel");
      const open = item.classList.toggle("is-open");
      panel.style.maxHeight = open ? panel.scrollHeight + "px" : null;
    });
  });
}

/* ---------- Formulaires ---------- */
function initForms(){
  document.querySelectorAll("[data-fakeform]").forEach(form => {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const msg = form.querySelector("[data-form-msg]");
      form.querySelectorAll("input,textarea,button").forEach(el => el.disabled = true);
      if (msg){ msg.hidden = false; }
      else { form.innerHTML = '<p style="color:var(--green);font-weight:600;margin:0">Merci, vous etes inscrit. 🎉</p>'; }
    });
  });
}

/* ---------- Promo popup (shows once per session, after 6s) ---------- */
function initPopup(){
  const popup = document.querySelector("[data-popup]");
  if (!popup) return;
  const close = () => popup.classList.remove("is-open");
  popup.querySelectorAll("[data-popup-close]").forEach(b => b.addEventListener("click", close));
  popup.addEventListener("click", e => { if (e.target === popup) close(); });
}

/* ---------- Scroll-to-top ---------- */
function initScrollTop(){
  const btn = document.querySelector("[data-to-top]");
  if (!btn) return;
  btn.addEventListener("click", () => window.scrollTo({top:0,behavior:"smooth"}));
  window.addEventListener("scroll", () => btn.classList.toggle("is-visible", window.scrollY > 600), {passive:true});
}

/* ---------- Reveal on scroll ---------- */
function initReveal(){
  const els = document.querySelectorAll(".reveal");
  if (!els.length || !("IntersectionObserver" in window)){ els.forEach(e=>e.classList.add("is-in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting){ en.target.classList.add("is-in"); io.unobserve(en.target); } });
  }, {threshold:.12});
  els.forEach(e => io.observe(e));
}

/* ---------- Duplicate marquee content for seamless loop ---------- */
function buildMarquees(){
  document.querySelectorAll(".marquee__track").forEach(track => {
    track.innerHTML += track.innerHTML;
  });
}
