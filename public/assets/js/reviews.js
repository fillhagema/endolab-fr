/* ==========================================================================
   EndoLab — paginated reviews widget
   Renders into any <div data-reviews data-total data-avg data-context>.
   Reviews are generated deterministically (seeded) so pagination is stable
   across reloads. 15 per page → 319 reviews = 22 pages.
   ========================================================================== */
(function () {
  const PER_PAGE = 15;

  // --- deterministic PRNG (mulberry32) ---
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const FIRST = ["Jean","Marc","Laurent","Philippe","Pascal","Eric","Thomas","Kevin","Nicolas","Bernard","Valentin","Quentin","Alex","Pierre","Michel","Julien","Olivier","Daniel","Christophe","Alain","Patrick","Luc","Romain","Benoit","Antoine","Didier","Serge","Hugo","Mathieu","Corinne","Nathalie","Sophie","Claire","Isabelle","Marie"];
  const LAST = "ABCDEFGHIJKLMNOPRSTVW".split("");
  const AVATAR = ["#002e4b","#172c40","#39a57b","#4888b1","#6d388b","#b5651d","#2e6e8e","#5a4b81"];

  const REVIEW_MEDIA = {
    vigormax: [
      "assets/img/7042faeaad5f41ba8026b088e4333ac6.thumbnail.0000000000.jpg",
      "assets/img/c75396c793ba41b59e4b89bc96ce7f3f.thumbnail.0000000000.jpg",
      "assets/img/07bff481f2bd4de9ac55152ded9332ee.thumbnail.0000000000.jpg",
      "assets/img/fenugreek_41.webp",
      "assets/img/fenugreek_33.webp",
      "assets/img/fenugreek_40.webp",
      "assets/img/fenugreek_42.webp",
      "assets/img/fenugreek_43.webp",
      "assets/img/fenugreek_28.webp",
      "assets/img/hf_20260415_051029_b45a9433-e503-47c8-8165-f4c65e7f9139.webp",
      "assets/img/vigormax-offer-bottle.png"
    ]
  };

  // body pools per context
  const POOL = {
    vigormax: {
      pos: [
        ["Conforme aux attentes", "Je ne pensais pas ressentir une difference aussi vite. Utilisation simple, discrete, et surtout beaucoup plus de confiance."],
        ["Une vraie surprise a 47 ans", "Je voulais une alternative simple aux pilules. La, c'est discret, rapide et sans attente interminable."],
        ["Discret et efficace", "Recu dans un emballage neutre en quelques jours. Produit conforme, facile a utiliser, exactement ce que je voulais."],
        ["Plus serein", "Ce qui m'a le plus marque, c'est la confiance retrouvee. Je me sens plus present dans les moments intimes."],
        ["Je me sens a nouveau moi-meme", "Simple a utiliser et tres discret. Ca m'a aide a retrouver de la spontaneite."],
        ["Moins de pression", "Avant je stressais trop. Avec VigorMax, je suis plus tranquille et plus sur de moi."],
        ["Ma femme l'a remarque", "Elle a remarque la difference avant meme que j'en parle. Ca veut tout dire."],
        ["Livraison rapide", "Commande recue rapidement, emballage neutre, aucun nom de produit visible."],
        ["Sceptique puis convaincu", "Je pensais que c'etait trop beau pour etre vrai. Finalement, tres bonne surprise."],
        ["Offre 1+1 parfaite", "J'ai pris l'offre achetez 1, recevez 1 offert. Tres content de l'avoir fait."],
        ["Fiable", "Je voulais quelque chose de simple et regulier. C'est exactement ce que j'ai trouve."],
        ["Confiance retrouvee", "Ce n'est pas seulement physique, ca change aussi la facon d'aborder le moment."],
        ["Mieux que les pilules pour moi", "Pas besoin d'attendre 30 minutes. L'utilisation est beaucoup plus simple."],
        ["Je recommande", "Pour les hommes de plus de 40 ans qui veulent retrouver de la spontaneite, ca vaut le test."],
        ["Simple et rapide", "Quelques pulvérisations selon les instructions, et c'est tout. Pas de prise de tete."],
        ["Notre complicite revient", "On avait perdu un peu de spontaneite. Ce produit nous a aides a relancer les choses."],
        ["Au-dessus de mes attentes", "Je voulais quelque chose de correct, j'ai eu mieux que ca. Tres satisfait."],
        ["Ca fait le travail", "Pas de blabla inutile. Produit simple, discret, et conforme a la promesse."]
      ],
      mid: [
        ["Bien apres quelques essais", "Fonctionne bien globalement. La premiere fois j'en ai mis trop peu, la deuxieme etait parfaite."],
        ["Bon produit", "Ce n'est pas magique, mais l'amelioration est nette. Je recommanderai."]
      ],
      neg: [
        ["Correct pour moi", "L'effet etait plus doux que prevu, mais le service client a ete reactif."],
        ["Livraison un peu longue", "Produit conforme, meme si la livraison a pris un peu plus de temps que prevu."]
      ]
    },
    helior: {
      pos: [
        ["Plus concentre", "Apres une semaine de port quotidien, je me sens plus pose l'apres-midi. C'est subtil mais agreable."],
        ["Plus d'energie stable", "Je me sens moins disperse dans la journee. Je garde mieux le cap au travail."],
        ["Je le porte tous les jours", "Confortable, discret et facile a oublier. Je le garde avec ma montre."],
        ["Belle qualite", "Plus lourd que prevu, dans le bon sens. Le bracelet fait premium et solide."],
        ["Plus calme", "Difficile a expliquer, mais je me sens plus en controle dans mes journees."],
        ["Tres bon bracelet", "Il ressemble a un bracelet normal, mais il me donne un vrai rappel de presence."],
        ["Meilleure routine", "Pas de pilules, juste un rituel simple au poignet. Ca me convient tres bien."],
        ["Difference notable", "Deux semaines que je le porte et ma femme me trouve plus calme et plus concentre."],
        ["Solide", "Porte a la salle et sous la douche, aucun souci. Il reste propre et beau."],
        ["Ca vaut le test", "J'etais sceptique sur l'hematite, mais j'aime vraiment le ressenti au quotidien."],
        ["Energie plus reguliere", "Je compte moins sur le cafe. Je me sens plus constant."],
        ["Bonne taille", "Il tient bien au poignet sans gener. Tres confortable."],
        ["Je me sens plus clair", "Petit objet au poignet, mais bon rappel mental pendant la journee."],
        ["Valide", "Trois semaines de port quotidien. Plus de concentration et meilleure humeur."],
        ["Premium et discret", "Le look est propre, masculin, facile a porter avec tout."],
        ["Rituel quotidien", "Je le mets chaque matin et ca me met dans le bon etat d'esprit."]
      ],
      mid: [
        ["Demande un peu de patience", "Il faut le porter plusieurs jours. Le ressenti est venu progressivement pour moi."],
        ["Beau bracelet", "Meme sans parler du ressenti, c'est un bracelet bien fini et agreable."]
      ],
      neg: [
        ["Subtil pour moi", "Le ressenti etait discret. Le bracelet reste beau et le support a ete reactif."],
        ["Taille ajustee", "Un peu large au debut, mais le service client m'a aide rapidement."]
      ]
    },
    store: {
      pos: [
        ["Tres bonne experience", "Commande simple, livraison discrete et rapide. Je recommanderai."],
        ["Rapide et discret", "Emballage neutre, arrive vite, exactement comme indique."],
        ["Service excellent", "J'avais une question avant de commander et ils ont repondu rapidement."],
        ["Boutique serieuse", "J'hesitais a commander ce type de produit en ligne. EndoLab rend tout simple et confidentiel."],
        ["Produits de qualite", "On sent le soin dans le produit et l'emballage."],
        ["Commande facile", "Prix clair, commande rapide, livraison propre. Rien a redire."],
        ["Marque fiable", "Deuxieme commande chez eux. Meme discretion, meme service."],
        ["Client satisfait", "De la commande a la livraison, tout s'est bien passe."],
        ["Je recommande", "Discret, rapide et serieux. J'en ai deja parle autour de moi."],
        ["Aucun souci", "Commande, expedition, reception : tout etait simple."]
      ],
      mid: [
        ["Bien dans l'ensemble", "Bons produits et service correct. Livraison un peu lente mais rien de grave."],
        ["Serieux", "Produit conforme et experience satisfaisante."]
      ],
      neg: [
        ["Bien au final", "La livraison a pris un peu plus de temps, mais le support m'a tenu informe."],
        ["Correct", "Experience correcte, la garantie m'a rassure avant de commander."]
      ]
    }
  };

  // optional closing sentences appended to 4–5★ reviews for variety
  const CLOSERS = [
    "", "", " Je recommanderai sans hesiter.", " Je recommande a ceux qui hesitent.",
    " Cinq etoiles pour moi.", " Tres satisfait.", " Livraison rapide et discrete.",
    " J'aurais aime le decouvrir plus tot.", " Le service client a aussi ete tres bien.",
    " Je l'ai deja recommande a un ami."
  ];

  function fmtDate(ts) {
    return new Date(ts).toLocaleDateString("fr-FR", { month: "short", day: "numeric", year: "numeric" });
  }

  function buildData(total, avg, ctx) {
    const rand = rng(total * 7 + ctx.length * 131 + 99);
    // distribution tuned to land near the requested average (~4.8)
    const dist = ctx === "vigormax" && total === 319
      ? null
      : [0.852, 0.099, 0.030, 0.011, 0.008]; // 5★..1★
    let counts = ctx === "vigormax" && total === 319
      ? [255, 64, 0, 0, 0]
      : dist.map(p => Math.round(total * p));
    counts[0] += total - counts.reduce((a, b) => a + b, 0);
    const pool = POOL[ctx] || POOL.store;
    const out = [];
    const now = Date.now();
    for (let star = 5; star >= 1; star--) {
      const n = counts[5 - star];
      const bucket = star >= 4 ? pool.pos : star === 3 ? pool.mid : pool.neg;
      for (let i = 0; i < n; i++) {
        // decouple title and body for far more variety, then maybe add a closer
        const title = bucket[Math.floor(rand() * bucket.length)][0];
        let body = bucket[Math.floor(rand() * bucket.length)][1];
        if (star >= 4) body += CLOSERS[Math.floor(rand() * CLOSERS.length)];
        const name = FIRST[Math.floor(rand() * FIRST.length)] + " " + LAST[Math.floor(rand() * LAST.length)] + ".";
        out.push({
          name,
          initial: name[0],
          color: AVATAR[Math.floor(rand() * AVATAR.length)],
          rating: star,
          verified: rand() > 0.12,
          title,
          body,
          ts: now - Math.floor(rand() * 330 + 1) * 86400000,
          media: ctx === "vigormax" && star >= 4 && rand() > 0.35
            ? REVIEW_MEDIA.vigormax[Math.floor(rand() * REVIEW_MEDIA.vigormax.length)]
            : null
        });
      }
    }
    // deterministic shuffle (Fisher–Yates with seeded rng)
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  const starStr = r => "★★★★★☆☆☆☆☆".slice(5 - r, 10 - r);

  function render(el) {
    const total = parseInt(el.dataset.total || "535", 10);
    const avg = el.dataset.avg || "4.8";
    const ctx = el.dataset.context || "store";
    let data = buildData(total, avg, ctx);
    const pages = Math.ceil(total / PER_PAGE);
    let page = 1;
    let sort = "recent";

    const dist = [5, 4, 3, 2, 1].map(s => data.filter(r => r.rating === s).length);

    function sortData() {
      if (sort === "recent") data.sort((a, b) => b.ts - a.ts);
      else if (sort === "high") data.sort((a, b) => b.rating - a.rating || b.ts - a.ts);
      else if (sort === "low") data.sort((a, b) => a.rating - b.rating || b.ts - a.ts);
    }
    sortData();

    function pagerHTML() {
      const btn = (p, label, opts = {}) =>
        `<button ${opts.disabled ? "disabled" : ""} class="${opts.active ? "is-active" : ""}" data-goto="${p}">${label || p}</button>`;
      let html = btn(page - 1, "‹ Prec.", { disabled: page === 1 });
      const win = [];
      const add = p => { if (p >= 1 && p <= pages && !win.includes(p)) win.push(p); };
      add(1); add(2); add(pages); add(pages - 1);
      for (let p = page - 1; p <= page + 1; p++) add(p);
      win.sort((a, b) => a - b);
      let prev = 0;
      win.forEach(p => {
        if (p - prev > 1) html += `<span class="okr-ellipsis">…</span>`;
        html += btn(p, null, { active: p === page });
        prev = p;
      });
      html += btn(page + 1, "Suiv. ›", { disabled: page === pages });
      return html;
    }

    function draw() {
      const start = (page - 1) * PER_PAGE;
      const slice = data.slice(start, start + PER_PAGE);
      el.querySelector(".okr__list").innerHTML = slice.map(r => `
        <div class="okr-item">
          <div class="okr-avatar" style="background:${r.color}">${r.initial}</div>
          <div>
            <div class="okr-head">
              <span class="okr-name">${r.name}</span>
              ${r.verified ? '<span class="okr-verified">✔ Achat verifie</span>' : ''}
              <span class="okr-date">${fmtDate(r.ts)}</span>
            </div>
            <div class="stars">${starStr(r.rating)}</div>
            <p class="okr-title">${r.title}</p>
            <p class="okr-body">${r.body}</p>
            ${r.media ? `<img class="okr-photo" src="${r.media}" alt="Photo d'avis client" loading="lazy">` : ""}
          </div>
        </div>`).join("");
      el.querySelector(".okr-pager").innerHTML = pagerHTML();
      el.querySelector(".okr-count").textContent =
        `${start + 1}-${Math.min(start + PER_PAGE, total)} sur ${total} avis · Page ${page} sur ${pages}`;
      el.querySelectorAll(".okr-pager [data-goto]").forEach(b =>
        b.addEventListener("click", () => {
          const p = parseInt(b.dataset.goto, 10);
          if (p >= 1 && p <= pages && p !== page) {
            page = p; draw();
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }));
    }

    el.innerHTML = `
      <div class="reviews-summary" style="margin-bottom:1rem">
        <div class="rating-score">
          <span class="num">${String(avg).replace(".", ",")}</span>
          <span class="stars">★★★★★</span>
          <span class="count">${total} avis</span>
        </div>
        <div class="bars">
          ${[5,4,3,2,1].map((s,i)=>`<div class="bar-row"><span class="lbl">${s} etoile${s>1?'s':''}</span><span class="bar"><i style="width:${Math.round(dist[i]/total*100)}%"></i></span><span class="lbl">${dist[i]}</span></div>`).join("")}
        </div>
        ${REVIEW_MEDIA[ctx] ? `<div class="review-photos">${REVIEW_MEDIA[ctx].slice(0,7).map(src => `<img src="${src}" alt="Photo client VigorMax" loading="lazy">`).join("")}</div>` : ""}
      </div>
      <div class="okr__top">
        <button class="btn btn--outline" type="button">Ecrire un avis</button>
        <div class="okr__toolbar">
          <label for="okr-sort-${ctx}" style="font-size:1.4rem;color:var(--muted)">Trier par</label>
          <select id="okr-sort-${ctx}" class="okr__sort">
            <option value="recent">Plus recents</option>
            <option value="high">Mieux notes</option>
            <option value="low">Moins bien notes</option>
          </select>
        </div>
      </div>
      <div class="okr__list"></div>
      <div class="okr-pager"></div>
      <div class="okr-count"></div>`;

    el.querySelector(".okr__sort").addEventListener("change", e => {
      sort = e.target.value; sortData(); page = 1; draw();
    });
    draw();
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-reviews]").forEach(render);
  });
})();
