// CoolestKidz — shared frontend
(function () {
  function getClient() {
    var cfg = window.COOLESTKIDZ_CONFIG || {};
    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY || !window.supabase) return null;
    return window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  }

  function formatPrice(n) {
    return new Intl.NumberFormat("fr-FR").format(n || 0) + " FCFA";
  }

  function escapeHtml(t) {
    var d = document.createElement("div");
    d.textContent = t || "";
    return d.innerHTML;
  }

  function normalizeCategory(cat) {
    var c = (cat || "").toLowerCase();
    if (c.indexOf("uni") !== -1 || c.indexOf("mixte") !== -1 || c.indexOf("both") !== -1) {
      return "Unisexe";
    }
    if (c.indexOf("femme") !== -1 || c.indexOf("women") !== -1 || c.indexOf("woman") !== -1) {
      return "Femme";
    }
    if (c.indexOf("enfant") !== -1 || c.indexOf("kids") !== -1 || c.indexOf("kid") !== -1) {
      return "Femme";
    }
    return "Homme";
  }

  function matchesShopCategory(productCat, shopCat) {
    var n = normalizeCategory(productCat);
    if (n === "Unisexe") return shopCat === "Homme" || shopCat === "Femme";
    return n === shopCat;
  }

  function displayCategory(cat) {
    var n = normalizeCategory(cat);
    if (n === "Unisexe") return "Unisexe";
    return n;
  }

  function qs(name) {
    return new URLSearchParams(location.search).get(name);
  }

  var header = document.getElementById("header");
  if (header) {
    window.addEventListener("scroll", function () {
      header.classList.toggle("scrolled", window.scrollY > 30);
    }, { passive: true });
  }

  var menuBtn = document.getElementById("menuToggle");
  var navMobile = document.getElementById("navMobile");
  if (menuBtn && navMobile) {
    var backdrop = document.getElementById("navBackdrop");
    if (!backdrop) {
      backdrop = document.createElement("button");
      backdrop.type = "button";
      backdrop.id = "navBackdrop";
      backdrop.className = "nav-backdrop";
      backdrop.setAttribute("aria-label", "Fermer le menu");
      document.body.appendChild(backdrop);
    }
    function closeMenu() {
      navMobile.classList.remove("open");
      backdrop.classList.remove("open");
      document.body.style.overflow = "";
    }
    function openMenu() {
      navMobile.classList.add("open");
      backdrop.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    menuBtn.addEventListener("click", function () {
      if (navMobile.classList.contains("open")) closeMenu();
      else openMenu();
    });
    backdrop.addEventListener("click", closeMenu);
    navMobile.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }

  var subBrandMap = {};

  async function loadSubBrandMap(client) {
    if (!client) return;
    try {
      var res = await client.from("sub_brands").select("id,name");
      if (res.error || !res.data) return;
      subBrandMap = {};
      res.data.forEach(function (s) {
        subBrandMap[s.id] = s.name;
      });
    } catch (e) {
      console.error(e);
    }
  }

  function productCard(p) {
    var cat = displayCategory(p.category);
    var img = p.image
      ? '<img src="' + escapeHtml(p.image) + '" alt="' + escapeHtml(p.name) + '" loading="lazy">'
      : '<div class="ph">' + escapeHtml(p.name) + "</div>";
    var badge = p.featured ? '<span class="product-badge">Nouveau</span>' : "";
    var subName = p.sub_brand_id ? subBrandMap[p.sub_brand_id] : null;
    // Sous-marque : lien vers la page de la ligne ; sinon fiche article
    var href = p.sub_brand_id
      ? "sous-marque.html?id=" + p.sub_brand_id
      : "produit.html?id=" + p.id;
    var titleHtml = subName
      ? '<div class="product-sub">' + escapeHtml(subName) + "</div>" +
        "<h3>" + escapeHtml(p.name) + "</h3>"
      : "<h3>" + escapeHtml(p.name) + "</h3>";
    return (
      '<a class="product-card" href="' + href + '">' +
      '<div class="product-img">' + img + badge + "</div>" +
      '<div class="product-info">' +
      '<div class="cat">' + escapeHtml(cat) + "</div>" +
      titleHtml +
      '<div class="price">' + formatPrice(p.price) + "</div>" +
      "</div></a>"
    );
  }

  var featured = document.getElementById("featuredGrid");
  if (featured) {
    (async function () {
      var client = getClient();
      if (!client) {
        featured.innerHTML = '<div class="empty">Configuration requise.</div>';
        return;
      }
      try {
        await loadSubBrandMap(client);
        var res = await client.from("products").select("*").order("id", { ascending: false }).limit(8);
        if (res.error) throw res.error;
        var list = res.data || [];
        featured.innerHTML = list.length
          ? list.map(productCard).join("")
          : '<div class="empty">Aucun article pour le moment.</div>';
      } catch (e) {
        console.error(e);
        featured.innerHTML = '<div class="empty">Impossible de charger.</div>';
      }
    })();
  }

  var grid = document.getElementById("productsGrid");
  if (grid && grid.dataset.category) {
    var cat = grid.dataset.category;
    (async function () {
      var client = getClient();
      if (!client) {
        grid.innerHTML = '<div class="empty">Configuration requise.</div>';
        return;
      }
      try {
        await loadSubBrandMap(client);
        var res = await client.from("products").select("*").order("id", { ascending: false });
        if (res.error) throw res.error;
        // Vue globale Homme/Femme : marque principale + sous-marques
        var list = (res.data || []).filter(function (p) {
          return matchesShopCategory(p.category, cat);
        });
        grid.innerHTML = list.length
          ? list.map(productCard).join("")
          : '<div class="empty">Aucun article dans cette collection.</div>';
      } catch (e) {
        console.error(e);
        grid.innerHTML = '<div class="empty">Impossible de charger.</div>';
      }
    })();
  }

  var pdp = document.getElementById("pdp");
  if (pdp) {
    var id = qs("id");
    (async function () {
      if (!id) {
        pdp.innerHTML = '<div class="empty">Article introuvable.</div>';
        return;
      }
      var client = getClient();
      if (!client) {
        pdp.innerHTML = '<div class="empty">Configuration requise.</div>';
        return;
      }
      try {
        var res = await client.from("products").select("*").eq("id", id).single();
        if (res.error || !res.data) throw res.error || new Error("not found");
        var data = res.data;
        var cat = displayCategory(data.category);
        document.title = (data.name || "Article") + " — CoolestKidz";
        var gal = data.gallery;
        if (typeof gal === "string") {
          try { gal = JSON.parse(gal); } catch (e) { gal = []; }
        }
        if (!Array.isArray(gal) || !gal.length) {
          gal = data.image
            ? [{ image: data.image, label: "", price: data.price }]
            : [];
        }
        var slides = gal.map(function (v) {
          var src = v.image || "";
          var lab = v.label
            ? '<span class="pdp-slide-label">' + escapeHtml(v.label) + "</span>"
            : "";
          var pr = v.price != null ? v.price : data.price;
          return (
            '<div class="pdp-slide" data-price="' + pr + '" data-label="' + escapeHtml(v.label || "") + '">' +
            (src
              ? '<img src="' + escapeHtml(src) + '" alt="">'
              : '<div class="ph">' + escapeHtml(data.name) + "</div>") +
            lab +
            "</div>"
          );
        }).join("");
        if (!slides) {
          slides =
            '<div class="pdp-slide" data-price="' +
            data.price +
            '"><div class="ph">' +
            escapeHtml(data.name) +
            "</div></div>";
        }
        var firstPrice = gal[0] && gal[0].price != null ? gal[0].price : data.price;
        var firstLabel = gal[0] && gal[0].label ? gal[0].label : "";
        pdp.innerHTML =
          '<div class="pdp-media">' +
          '<div class="pdp-gallery" id="pdpGallery">' +
          slides +
          "</div>" +
          (gal.length > 1
            ? '<p class="pdp-swipe-hint">← Glisser pour voir les variantes →</p>'
            : "") +
          "</div>" +
          '<div class="pdp-info">' +
          '<div class="cat">' +
          escapeHtml(cat) +
          "</div>" +
          "<h1>" +
          escapeHtml(data.name) +
          "</h1>" +
          '<div class="price" id="pdpPrice">' +
          formatPrice(firstPrice) +
          "</div>" +
          '<p class="pdp-variant-label" id="pdpVariantLabel">' +
          escapeHtml(firstLabel) +
          "</p>" +
          '<p class="desc">' +
          escapeHtml(data.description || "Pièce CoolestKidz — qualité premium.") +
          "</p>" +
          '<div class="pdp-actions">' +
          '<a class="btn btn-red" id="pdpWa" href="#" target="_blank" rel="noopener">Commander WhatsApp</a>' +
          '<a class="btn btn-outline-dark" href="' +
          (cat === "Femme" ? "femme.html" : "homme.html") +
          '">Retour</a>' +
          "</div></div>";

        function updatePdpVariant(price, label) {
          var priceEl = document.getElementById("pdpPrice");
          var labEl = document.getElementById("pdpVariantLabel");
          var wa = document.getElementById("pdpWa");
          if (priceEl) priceEl.textContent = formatPrice(price);
          if (labEl) labEl.textContent = label || "";
          if (wa) {
            var msg =
              "Bonjour CoolestKidz 👋\n\nJe suis intéressé(e) par cet article :\n" +
              data.name +
              (label ? "\nVariante : " + label : "") +
              "\nPrix : " +
              formatPrice(price) +
              "\n\nLien de l'article :\n" +
              (location.origin + "/produit.html?id=" + data.id);
            wa.href =
              "https://wa.me/237690100325?text=" + encodeURIComponent(msg);
          }
        }
        updatePdpVariant(firstPrice, firstLabel);

        var galleryEl = document.getElementById("pdpGallery");
        if (galleryEl && gal.length > 1) {
          var slidesEls = galleryEl.querySelectorAll(".pdp-slide");
          function syncFromScroll() {
            var mid = galleryEl.scrollLeft + galleryEl.clientWidth / 2;
            var best = slidesEls[0];
            var bestDist = Infinity;
            slidesEls.forEach(function (sl) {
              var center = sl.offsetLeft + sl.offsetWidth / 2;
              var d = Math.abs(center - mid);
              if (d < bestDist) {
                bestDist = d;
                best = sl;
              }
            });
            if (best) {
              updatePdpVariant(
                Number(best.getAttribute("data-price")) || data.price,
                best.getAttribute("data-label") || ""
              );
            }
          }
          galleryEl.addEventListener("scroll", syncFromScroll, {
            passive: true,
          });
        }
      } catch (e) {
        console.error(e);
        pdp.innerHTML = '<div class="empty">Article introuvable.</div>';
      }
    })();
  }

  var sbGridEl = document.getElementById("subbrandsGrid");
  if (sbGridEl) {
    (async function () {
      var client = getClient();
      if (!client) {
        sbGridEl.innerHTML = '<div class="empty">Configuration requise.</div>';
        return;
      }
      try {
        var res = await client.from("sub_brands").select("*").order("id");
        if (res.error) throw res.error;
        var list = res.data || [];
        if (!list.length) {
          sbGridEl.innerHTML = '<div class="empty">Aucune sous-marque pour le moment.</div>';
          return;
        }
        var isFull = location.pathname.indexOf("sous-marques") !== -1;
        var shown = isFull ? list : list.slice(0, 4);
        sbGridEl.innerHTML = shown
          .map(function (s) {
            var logo = s.logo
              ? '<div class="sb-card-img"><img src="' + escapeHtml(s.logo) + '" alt="' + escapeHtml(s.name) + '"></div>'
              : '<div class="sb-card-img"><div class="ph">' + escapeHtml((s.name || "?")[0]) + "</div></div>";
            return (
              '<a class="sb-card" href="sous-marque.html?id=' + s.id + '">' +
              logo +
              '<div class="sb-card-body">' +
              "<h3>" + escapeHtml(s.name) + "</h3>" +
              "<p>" + escapeHtml(s.description || "") + "</p>" +
              '<span class="sb-card-cta">Voir les articles →</span>' +
              "</div></a>"
            );
          })
          .join("");
      } catch (e) {
        console.error(e);
        sbGridEl.innerHTML = '<div class="empty">Impossible de charger.</div>';
      }
    })();
  }

  var sbTitle = document.getElementById("sbTitle");
  if (sbTitle) {
    var sbIdRaw = qs("id");
    var sbId = sbIdRaw ? Number(sbIdRaw) : NaN;
    var pgrid = document.getElementById("productsGrid");
    (async function () {
      var client = getClient();
      if (!client || !sbIdRaw || isNaN(sbId)) {
        if (pgrid) pgrid.innerHTML = '<div class="empty">Sous-marque introuvable.</div>';
        return;
      }
      try {
        var res = await client.from("sub_brands").select("*").eq("id", sbId).single();
        if (res.error || !res.data) throw res.error || new Error("not found");
        var sb = res.data;
        sbTitle.textContent = sb.name;
        var descEl = document.getElementById("sbDesc");
        if (descEl) descEl.textContent = sb.description || "";
        document.title = sb.name + " — CoolestKidz";
        var res2 = await client
          .from("products")
          .select("*")
          .eq("sub_brand_id", sbId)
          .order("id", { ascending: false });
        if (res2.error) throw res2.error;
        var list = res2.data || [];
        var titleEl = document.querySelector(".sb-products-title");
        if (titleEl) {
          titleEl.textContent =
            list.length
              ? "Articles de cette ligne (" + list.length + ")"
              : "Articles de cette ligne";
        }
        if (pgrid) {
          pgrid.innerHTML = list.length
            ? list.map(function (p) {
                // Sur la page sous-marque : ouvrir la fiche article
                var card = productCard(p);
                return card.replace(
                  /href="sous-marque\.html\?id=\d+"/,
                  'href="produit.html?id=' + p.id + '"'
                );
              }).join("")
            : '<div class="empty">Aucun article lié à cette sous-marque pour le moment.<br><small>Dans l’admin → Sous-marques → Ouvrir → « + Article ».</small></div>';
        }
      } catch (e) {
        console.error(e);
        if (pgrid) pgrid.innerHTML = '<div class="empty">Impossible de charger cette sous-marque.</div>';
      }
    })();
  }

  var contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = contactForm.querySelector('button[type="submit"]');
      if (btn) {
        var t = btn.textContent;
        btn.textContent = "Message envoyé";
        btn.disabled = true;
        setTimeout(function () {
          btn.textContent = t;
          btn.disabled = false;
          contactForm.reset();
        }, 2500);
      }
    });
  }


  // Images cartes Homme / Femme (admin configurable)
  (async function () {
    var hommeBg = document.getElementById("catHommeBg");
    var femmeBg = document.getElementById("catFemmeBg");
    if (!hommeBg && !femmeBg) return;
    var client = getClient();
    if (!client) return;
    try {
      var res = await client.from("site_settings").select("key,value").in("key", [
        "cat_homme_image",
        "cat_femme_image"
      ]);
      if (res.error || !res.data) return;
      res.data.forEach(function (row) {
        if (!row.value) return;
        if (row.key === "cat_homme_image" && hommeBg) {
          hommeBg.style.backgroundImage = "url('" + row.value + "')";
        }
        if (row.key === "cat_femme_image" && femmeBg) {
          femmeBg.style.backgroundImage = "url('" + row.value + "')";
        }
      });
    } catch (e) {
      console.error(e);
    }
  })();

  // Brand videos: autoplay loop (muted)
  document.querySelectorAll(".brand-video").forEach(function (v) {
    v.muted = true;
    var tryPlay = function () {
      v.play().catch(function () {});
    };
    v.addEventListener("loadeddata", tryPlay);
    tryPlay();
  });
})();
