/* =============================================
   ROMAY LEGAL — script.js
   Portal Jurídico de Autor con Panel Admin
   ============================================= */

"use strict";

/* ──────────────────────────────────────────────
   CREDENCIALES ADMIN
   Cambia estos valores por los tuyos reales.
   En producción usa variables de entorno.
────────────────────────────────────────────── */
const ADMIN_USER = "romaylegal";
const ADMIN_PASS = "Grover2026!";
const SESSION_KEY = "rl_admin_session";

/* ──────────────────────────────────────────────
   STORAGE HELPERS
────────────────────────────────────────────── */
const store = {
  get: (k, fallback = []) => {
    try { return JSON.parse(localStorage.getItem(k)) ?? fallback; }
    catch { return fallback; }
  },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

/* ──────────────────────────────────────────────
   INIT
────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  initIcons();
  initHeader();
  initDropdown();
  initBurger();
  initAuth();
  initArticleFilter();
  initContactForm();
  initScrollReveal();
  initAdmin();
});

/* ──────────────────────────────────────────────
   LUCIDE ICONS
────────────────────────────────────────────── */
function initIcons() {
  if (window.lucide) lucide.createIcons();
}
/* Re-render icons after dynamic DOM updates */
function refreshIcons() {
  if (window.lucide) lucide.createIcons();
}

/* ──────────────────────────────────────────────
   HEADER — sticky scroll shadow
────────────────────────────────────────────── */
function initHeader() {
  const header = document.getElementById("header");
  if (!header) return;
  // Header is sticky — already has shadow via CSS.
  // Active nav link tracking on scroll
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav__link:not(.nav__link--drop)");

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove("active"));
          const active = document.querySelector(`.nav__link[href="#${entry.target.id}"]`);
          if (active) active.classList.add("active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => obs.observe(s));
}

/* ──────────────────────────────────────────────
   DROPDOWN SERVICIOS
────────────────────────────────────────────── */
function initDropdown() {
  const dropdown = document.getElementById("nav-servicios");
  if (!dropdown) return;
  const btn = dropdown.querySelector(".nav__link--drop");

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle("open");
    btn.setAttribute("aria-expanded", isOpen);
  });

  // Close on outside click
  document.addEventListener("click", () => {
    dropdown.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
  });

  // Close on dropdown link click
  dropdown.querySelectorAll(".dropdown__menu a").forEach((a) => {
    a.addEventListener("click", () => {
      dropdown.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    });
  });
}

/* ──────────────────────────────────────────────
   BURGER MENU (móvil)
────────────────────────────────────────────── */
function initBurger() {
  const burger = document.getElementById("burger");
  const nav = document.getElementById("main-nav");
  if (!burger || !nav) return;

  burger.addEventListener("click", () => {
    const open = burger.classList.toggle("open");
    nav.classList.toggle("nav--open", open);
    burger.setAttribute("aria-expanded", open);
  });

  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      burger.classList.remove("open");
      nav.classList.remove("nav--open");
    });
  });
}

/* ──────────────────────────────────────────────
   AUTENTICACIÓN ADMIN
────────────────────────────────────────────── */
function isLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === "true";
}
function setLoggedIn(v) {
  if (v) sessionStorage.setItem(SESSION_KEY, "true");
  else    sessionStorage.removeItem(SESSION_KEY);
}

function initAuth() {
  const btnLogin  = document.getElementById("btn-login");
  const btnLogout = document.getElementById("btn-logout");
  const btnPanel  = document.getElementById("btn-panel");

  syncAuthUI();

  // Abrir modal login
  btnLogin?.addEventListener("click", () => openModal("modal-login"));

  // Cerrar sesión
  btnLogout?.addEventListener("click", () => {
    setLoggedIn(false);
    syncAuthUI();
    closeModal("modal-admin");
  });

  // Abrir panel
  btnPanel?.addEventListener("click", (e) => {
    e.preventDefault();
    openModal("modal-admin");
  });

  // Login form submit
  document.getElementById("login-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = document.getElementById("admin-user").value.trim();
    const pass = document.getElementById("admin-pass").value;
    const err  = document.getElementById("login-error");

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      setLoggedIn(true);
      syncAuthUI();
      closeModal("modal-login");
      openModal("modal-admin");
      e.target.reset();
      err.classList.add("hidden");
    } else {
      err.classList.remove("hidden");
      document.getElementById("admin-pass").value = "";
      document.getElementById("admin-pass").focus();
    }
  });

  // Cerrar modales con botón X
  document.getElementById("modal-close-login")?.addEventListener("click", () => closeModal("modal-login"));
  document.getElementById("modal-close-admin")?.addEventListener("click", () => closeModal("modal-admin"));

  // Cerrar al hacer clic en el overlay
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // ESC cierra
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-overlay:not(.hidden)").forEach((m) =>
        closeModal(m.id)
      );
    }
  });
}

function syncAuthUI() {
  const guest = document.getElementById("auth-guest");
  const admin = document.getElementById("auth-admin");
  if (!guest || !admin) return;
  if (isLoggedIn()) {
    guest.classList.add("hidden");
    admin.classList.remove("hidden");
  } else {
    guest.classList.remove("hidden");
    admin.classList.add("hidden");
  }
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    // Focus first input
    const first = el.querySelector("input, button");
    first?.focus();
  }
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.add("hidden");
    // Only restore scroll if no other modal open
    if (!document.querySelector(".modal-overlay:not(.hidden)")) {
      document.body.style.overflow = "";
    }
  }
}

/* ──────────────────────────────────────────────
   FILTRO ARTÍCULOS
────────────────────────────────────────────── */
function initArticleFilter() {
  const filterBar = document.getElementById("art-filters");
  const grid = document.getElementById("articles-grid");
  if (!filterBar || !grid) return;

  filterBar.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;

    filterBar.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const cat = btn.dataset.cat;
    grid.querySelectorAll(".art-card").forEach((card) => {
      const show = cat === "todos" || card.dataset.cat === cat;
      card.classList.toggle("hidden", !show);
    });
  });
}

/* ──────────────────────────────────────────────
   FORMULARIO CONTACTO — Formspree
────────────────────────────────────────────── */
function initContactForm() {
  const form = document.getElementById("contact-form");
  const successDiv = document.getElementById("form-success");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const submitBtn = document.getElementById("form-submit-btn");
    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Enviando...';

    const formData = new FormData(form);

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        form.classList.add("hidden");
        successDiv.classList.remove("hidden");
        refreshIcons();
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.errors?.[0]?.message || "Error al enviar");
      }
    } catch (err) {
      alert("Hubo un problema al enviar tu mensaje. Por favor escríbeme directamente a groverrojas07@gmail.com");
      submitBtn.innerHTML = originalHTML;
      submitBtn.disabled = false;
      refreshIcons();
    }
  });
}

/* ──────────────────────────────────────────────
   SCROLL REVEAL
────────────────────────────────────────────── */
function initScrollReveal() {
  const els = document.querySelectorAll(".art-card, .book-card, .svc-card, .hero__author, .hero__content");
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal", "revealed");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  els.forEach((el) => {
    el.classList.add("reveal");
    obs.observe(el);
  });
}

/* ──────────────────────────────────────────────
   PANEL ADMIN — CRUD
────────────────────────────────────────────── */
function initAdmin() {
  initAdminTabs();
  initArticlesCRUD();
  initBooksCRUD();
}

/* Tabs */
function initAdminTabs() {
  const tabs = document.querySelectorAll(".admin-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      document.querySelectorAll(".admin-panel").forEach((p) => p.classList.remove("active"));
      const target = document.getElementById(`panel-${tab.dataset.tab}`);
      if (target) target.classList.add("active");
    });
  });
}

/* ── ARTÍCULOS CRUD ── */
const ART_KEY = "rl_articles";

function initArticlesCRUD() {
  renderArticlesTable();

  // Nuevo artículo
  document.getElementById("btn-new-article")?.addEventListener("click", () => {
    resetArticleForm();
    document.getElementById("article-form").classList.remove("hidden");
  });
  // Cancelar
  document.getElementById("btn-cancel-article")?.addEventListener("click", () => {
    document.getElementById("article-form").classList.add("hidden");
  });
  // Guardar
  document.getElementById("article-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    saveArticle();
  });
}

function resetArticleForm() {
  document.getElementById("art-id").value = "";
  document.getElementById("art-title").value = "";
  document.getElementById("art-summary").value = "";
  document.getElementById("art-content").value = "";
  document.getElementById("art-cat").value = "penal";
}

function saveArticle() {
  const id      = document.getElementById("art-id").value;
  const title   = document.getElementById("art-title").value.trim();
  const summary = document.getElementById("art-summary").value.trim();
  const content = document.getElementById("art-content").value.trim();
  const cat     = document.getElementById("art-cat").value;

  if (!title || !summary) {
    alert("Por favor completa los campos obligatorios (Título y Resumen).");
    return;
  }

  const articles = store.get(ART_KEY);
  const now = new Date().toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" });

  if (id) {
    // Editar
    const idx = articles.findIndex((a) => a.id === id);
    if (idx !== -1) {
      articles[idx] = { ...articles[idx], title, summary, content, cat };
    }
  } else {
    // Nuevo
    articles.unshift({ id: Date.now().toString(), title, summary, content, cat, date: now });
  }

  store.set(ART_KEY, articles);
  document.getElementById("article-form").classList.add("hidden");
  resetArticleForm();
  renderArticlesTable();
  renderPublicArticles(); // Actualiza la sección pública
}

function deleteArticle(id) {
  if (!confirm("¿Eliminar este artículo? No se puede deshacer.")) return;
  const articles = store.get(ART_KEY).filter((a) => a.id !== id);
  store.set(ART_KEY, articles);
  renderArticlesTable();
  renderPublicArticles();
}

function editArticle(id) {
  const art = store.get(ART_KEY).find((a) => a.id === id);
  if (!art) return;
  document.getElementById("art-id").value      = art.id;
  document.getElementById("art-title").value   = art.title;
  document.getElementById("art-summary").value = art.summary;
  document.getElementById("art-content").value = art.content || "";
  document.getElementById("art-cat").value     = art.cat;
  document.getElementById("article-form").classList.remove("hidden");
  document.getElementById("article-form").scrollIntoView({ behavior: "smooth" });
}

function renderArticlesTable() {
  const tbody = document.getElementById("articles-tbody");
  if (!tbody) return;
  const articles = store.get(ART_KEY);

  if (articles.length === 0) {
    tbody.innerHTML = '<tr class="no-data"><td colspan="4">No hay artículos publicados.</td></tr>';
    return;
  }

  const catLabels = { penal: "Penal", laboral: "Laboral", criminologia: "Criminología", criminalistica: "Criminalística" };

  tbody.innerHTML = articles.map((a) => `
    <tr>
      <td><strong>${escHtml(a.title)}</strong></td>
      <td><span class="pill pill--${a.cat}">${catLabels[a.cat] || a.cat}</span></td>
      <td>${escHtml(a.date || "—")}</td>
      <td>
        <div class="tbl-actions">
          <button class="tbl-btn tbl-btn--edit" onclick="editArticle('${a.id}')" title="Editar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="tbl-btn tbl-btn--del" onclick="deleteArticle('${a.id}')" title="Eliminar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join("");
}

/* Renderizar artículos del localStorage en la sección pública */
function renderPublicArticles() {
  const grid = document.getElementById("articles-grid");
  if (!grid) return;
  const stored = store.get(ART_KEY);
  if (stored.length === 0) return; // Mantiene artículos de muestra del HTML

  const catLabels = { penal: "Derecho Penal", laboral: "Derecho Laboral", criminologia: "Criminología", criminalistica: "Criminalística" };
  const catClass  = { penal: "cat--penal", laboral: "cat--laboral", criminologia: "cat--criminologia", criminalistica: "cat--criminalistica" };

  // Agrega al principio del grid
  const existing = Array.from(grid.querySelectorAll(".art-card[data-dynamic]"));
  existing.forEach((el) => el.remove());

  const fragment = document.createDocumentFragment();
  stored.forEach((a) => {
    const el = document.createElement("article");
    el.className = "art-card";
    el.dataset.cat = a.cat;
    el.dataset.dynamic = "1";
    el.innerHTML = `
      <div class="art-card__img-wrap">
        <span class="art-card__cat ${catClass[a.cat] || ""}">${catLabels[a.cat] || a.cat}</span>
      </div>
      <div class="art-card__body">
        <time class="art-card__date">${escHtml(a.date || "")}</time>
        <h3 class="art-card__title">${escHtml(a.title)}</h3>
        <p class="art-card__summary">${escHtml(a.summary)}</p>
        <a href="#" class="art-card__link">Leer artículo <i data-lucide="arrow-right"></i></a>
      </div>
    `;
    fragment.prepend(el);
  });

  grid.insertBefore(fragment, grid.firstChild);
  refreshIcons();
}

/* ── LIBROS / RECURSOS CRUD ── */
const BOOK_KEY = "rl_books";

function initBooksCRUD() {
  renderBooksTable();

  document.getElementById("btn-new-book")?.addEventListener("click", () => {
    resetBookForm();
    document.getElementById("book-form").classList.remove("hidden");
  });
  document.getElementById("btn-cancel-book")?.addEventListener("click", () => {
    document.getElementById("book-form").classList.add("hidden");
  });
  document.getElementById("book-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    saveBook();
  });
}

function resetBookForm() {
  document.getElementById("book-id").value    = "";
  document.getElementById("book-title").value = "";
  document.getElementById("book-type").value  = "Guía";
  document.getElementById("book-price").value = "";
  document.getElementById("book-url").value   = "";
  document.getElementById("book-desc").value  = "";
}

function saveBook() {
  const id    = document.getElementById("book-id").value;
  const title = document.getElementById("book-title").value.trim();
  const type  = document.getElementById("book-type").value;
  const price = parseFloat(document.getElementById("book-price").value) || 0;
  const url   = document.getElementById("book-url").value.trim();
  const desc  = document.getElementById("book-desc").value.trim();

  if (!title) {
    alert("El título es obligatorio.");
    return;
  }

  const books = store.get(BOOK_KEY);

  if (id) {
    const idx = books.findIndex((b) => b.id === id);
    if (idx !== -1) books[idx] = { ...books[idx], title, type, price, url, desc };
  } else {
    books.unshift({ id: Date.now().toString(), title, type, price, url, desc });
  }

  store.set(BOOK_KEY, books);
  document.getElementById("book-form").classList.add("hidden");
  resetBookForm();
  renderBooksTable();
  renderPublicBooks();
}

function deleteBook(id) {
  if (!confirm("¿Eliminar este recurso?")) return;
  const books = store.get(BOOK_KEY).filter((b) => b.id !== id);
  store.set(BOOK_KEY, books);
  renderBooksTable();
  renderPublicBooks();
}

function editBook(id) {
  const book = store.get(BOOK_KEY).find((b) => b.id === id);
  if (!book) return;
  document.getElementById("book-id").value    = book.id;
  document.getElementById("book-title").value = book.title;
  document.getElementById("book-type").value  = book.type;
  document.getElementById("book-price").value = book.price;
  document.getElementById("book-url").value   = book.url || "";
  document.getElementById("book-desc").value  = book.desc || "";
  document.getElementById("book-form").classList.remove("hidden");
  document.getElementById("book-form").scrollIntoView({ behavior: "smooth" });
}

function renderBooksTable() {
  const tbody = document.getElementById("books-tbody");
  if (!tbody) return;
  const books = store.get(BOOK_KEY);

  if (books.length === 0) {
    tbody.innerHTML = '<tr class="no-data"><td colspan="4">No hay recursos publicados.</td></tr>';
    return;
  }

  tbody.innerHTML = books.map((b) => `
    <tr>
      <td><strong>${escHtml(b.title)}</strong></td>
      <td>${escHtml(b.type)}</td>
      <td>${b.price === 0 ? '<span style="color:#16a34a;font-weight:700">Gratis</span>' : `S/ ${Number(b.price).toFixed(2)}`}</td>
      <td>
        <div class="tbl-actions">
          <button class="tbl-btn tbl-btn--edit" onclick="editBook('${b.id}')" title="Editar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="tbl-btn tbl-btn--del" onclick="deleteBook('${b.id}')" title="Eliminar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join("");
}

/* Renderizar libros del localStorage en la vitrina pública */
function renderPublicBooks() {
  const grid = document.getElementById("books-grid");
  if (!grid) return;
  const stored = store.get(BOOK_KEY);
  if (stored.length === 0) return;

  // Solo añade los dinámicos al principio; mantiene los de muestra
  grid.querySelectorAll(".book-card[data-dynamic]").forEach((el) => el.remove());

  const fragment = document.createDocumentFragment();
  stored.forEach((b) => {
    const el = document.createElement("div");
    el.className = "book-card";
    el.dataset.dynamic = "1";
    el.innerHTML = `
      <div class="book-card__cover">
        <i data-lucide="file-text"></i>
        <span class="book-card__type">PDF · ${escHtml(b.type)}</span>
      </div>
      <div class="book-card__body">
        <h3>${escHtml(b.title)}</h3>
        <p>${escHtml(b.desc || "")}</p>
        <div class="book-card__footer">
          <span class="book-card__price ${b.price === 0 ? "free" : ""}">
            ${b.price === 0 ? "Gratis" : `S/ ${Number(b.price).toFixed(2)}`}
          </span>
          ${b.url
            ? `<a href="${escHtml(b.url)}" target="_blank" rel="noopener" class="btn btn--primary btn--sm">
                <i data-lucide="${b.price === 0 ? "download" : "shopping-cart"}"></i>
                ${b.price === 0 ? "Descargar" : "Adquirir"}
               </a>`
            : `<span class="btn btn--sm" style="background:var(--surface-2);color:var(--text-3)">Próximamente</span>`}
        </div>
      </div>
    `;
    fragment.prepend(el);
  });

  grid.insertBefore(fragment, grid.firstChild);
  refreshIcons();
}

/* ──────────────────────────────────────────────
   UTILIDAD — escape HTML para prevenir XSS
────────────────────────────────────────────── */
function escHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ──────────────────────────────────────────────
   Exponer funciones de CRUD al scope global
   (llamadas desde onclick en la tabla)
────────────────────────────────────────────── */
window.editArticle  = editArticle;
window.deleteArticle = deleteArticle;
window.editBook     = editBook;
window.deleteBook   = deleteBook;

/* ──────────────────────────────────────────────
   Cargar datos guardados al iniciar
────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  renderPublicArticles();
  renderPublicBooks();
});

/* ──────────────────────────────────────────────
   CSS helper para spinner en botón submit
────────────────────────────────────────────── */
const spinStyle = document.createElement("style");
spinStyle.textContent = `
  .spin { animation: spinAnim .8s linear infinite; display:inline-block; }
  @keyframes spinAnim { to { transform: rotate(360deg); } }
`;
document.head.appendChild(spinStyle);
