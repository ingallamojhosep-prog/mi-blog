const BASE_POSTS = [{"type": "Informe", "date": "08 SEP 2026", "course": "Teoría General de Sistemas", "title": "Análisis de un sistema desde un enfoque integral", "summary": "Una revisión académica de componentes, relaciones, límites y retroalimentación para comprender un sistema como un conjunto organizado.", "tags": ["sistemas", "análisis", "universidad"]}, {"type": "Mapa mental", "date": "04 SEP 2026", "course": "Cálculo Diferencial e Integral", "title": "Conceptos clave para el estudio de funciones", "summary": "Síntesis visual de dominio, rango, comportamiento de funciones y relaciones importantes para el desarrollo del curso.", "tags": ["cálculo", "funciones", "resumen"]}, {"type": "Presentación", "date": "29 AGO 2026", "course": "Base de Datos", "title": "Modelo relacional y organización de la información", "summary": "Presentación sobre entidades, atributos, relaciones y buenas prácticas para estructurar información de manera consistente.", "tags": ["datos", "modelo relacional", "SQL"]}, {"type": "Investigación", "date": "22 AGO 2026", "course": "Metodología de la Investigación", "title": "Planteamiento de un problema académico", "summary": "Ejemplo aplicado de delimitación del problema, formulación de objetivos y organización de antecedentes para un trabajo universitario.", "tags": ["investigación", "objetivos", "metodología"]}, {"type": "Práctica", "date": "15 AGO 2026", "course": "Programación", "title": "Resolución estructurada de problemas con algoritmos", "summary": "Práctica enfocada en descomponer problemas, diseñar pseudocódigo y comprobar resultados antes de implementar una solución.", "tags": ["algoritmos", "programación", "lógica"]}, {"type": "Reflexión", "date": "09 AGO 2026", "course": "Formación General", "title": "Aprender, documentar y mejorar", "summary": "Reflexión breve sobre la importancia de registrar el proceso de aprendizaje y utilizar la retroalimentación para mejorar.", "tags": ["aprendizaje", "reflexión", "portafolio"]}];
const STORAGE_KEY = "blog_jhosep-inga_posts";
const COMMENT_PREFIX = "blog_jhosep-inga_comments_";
let activeType = "Todos";
let activeQuery = "";

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[c]);
}

function getPosts() {
  try {
    const custom = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return [...custom, ...BASE_POSTS];
  } catch(e) { return [...BASE_POSTS]; }
}

function setPosts(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function postCard(post, index) {
  const tags = (post.tags || []).slice(0,3).map(t => `<span>${escapeHTML(t)}</span>`).join("");
  return `
    <article class="post-card" data-post-index="${index}" tabindex="0">
      <div class="post-card-top">
        <span class="post-type">${escapeHTML(post.type)}</span>
        <span class="post-date">${escapeHTML(post.date)}</span>
      </div>
      <div class="post-course">${escapeHTML(post.course)}</div>
      <h3>${escapeHTML(post.title)}</h3>
      <p>${escapeHTML(post.summary)}</p>
      <div class="post-bottom">
        <div class="tags">${tags}</div>
        <button class="read-btn" type="button" aria-label="Abrir publicación">Leer <span>→</span></button>
      </div>
    </article>`;
}

function renderPosts() {
  const all = getPosts();
  const filtered = all.filter(p => {
    const typeOk = activeType === "Todos" || p.type === activeType;
    const text = `${p.title} ${p.summary} ${p.course} ${(p.tags||[]).join(" ")}`.toLowerCase();
    return typeOk && text.includes(activeQuery.toLowerCase());
  });
  const grid = document.getElementById("postsGrid");
  grid.innerHTML = filtered.map(p => postCard(p, all.indexOf(p))).join("");
  document.getElementById("emptyState").hidden = filtered.length > 0;
  document.querySelectorAll(".post-card").forEach(card => {
    const open = () => openPost(Number(card.dataset.postIndex));
    card.addEventListener("click", e => {
      if (!e.target.closest("button")) open();
    });
    card.querySelector(".read-btn").addEventListener("click", open);
    card.addEventListener("keydown", e => { if(e.key==="Enter") open(); });
  });
  const count = document.getElementById("postCount");
  if(count) count.textContent = all.length;
}

function openPost(index) {
  const post = getPosts()[index];
  if (!post) return;
  document.getElementById("articleType").textContent = post.type;
  document.getElementById("articleTitle").textContent = post.title;
  document.getElementById("articleCourse").textContent = post.course + " · " + post.date;
  document.getElementById("articleSummary").textContent = post.summary;
  document.getElementById("articleTags").innerHTML = (post.tags||[]).map(t=>`<span>${escapeHTML(t)}</span>`).join("");
  document.getElementById("articleDialog").dataset.postKey = encodeURIComponent(post.title);
  renderComments();
  document.getElementById("articleDialog").showModal();
}

function renderComments() {
  const dlg = document.getElementById("articleDialog");
  const key = COMMENT_PREFIX + dlg.dataset.postKey;
  let items = [];
  try { items = JSON.parse(localStorage.getItem(key) || "[]"); } catch(e){}
  const box = document.getElementById("commentsList");
  box.innerHTML = items.length ? items.map(c=>`
    <div class="comment"><strong>${escapeHTML(c.name)}</strong><span>${escapeHTML(c.date)}</span><p>${escapeHTML(c.text)}</p></div>
  `).join("") : `<p class="muted">Aún no hay comentarios en esta publicación.</p>`;
}

document.querySelectorAll("[data-filter]").forEach(btn => {
  btn.addEventListener("click", () => {
    activeType = btn.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach(b=>b.classList.toggle("active", b===btn));
    renderPosts();
  });
});
document.getElementById("searchInput")?.addEventListener("input", e => {
  activeQuery = e.target.value;
  renderPosts();
});

document.querySelectorAll("[data-open-new]").forEach(btn => btn.addEventListener("click", ()=>document.getElementById("newPostDialog").showModal()));
document.querySelectorAll("[data-close-dialog]").forEach(btn => btn.addEventListener("click", ()=>btn.closest("dialog").close()));

document.getElementById("newPostForm")?.addEventListener("submit", e => {
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  const custom = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  custom.unshift({
    type: fd.get("type"),
    date: new Date().toLocaleDateString("es-PE", {day:"2-digit",month:"short",year:"numeric"}).toUpperCase(),
    course: fd.get("course"),
    title: fd.get("title"),
    summary: fd.get("summary"),
    tags: String(fd.get("tags")||"").split(",").map(x=>x.trim()).filter(Boolean)
  });
  setPosts(custom);
  e.currentTarget.reset();
  document.getElementById("newPostDialog").close();
  renderPosts();
});

document.getElementById("commentForm")?.addEventListener("submit", e => {
  e.preventDefault();
  const dlg = document.getElementById("articleDialog");
  const key = COMMENT_PREFIX + dlg.dataset.postKey;
  const fd = new FormData(e.currentTarget);
  let items = [];
  try { items = JSON.parse(localStorage.getItem(key) || "[]"); } catch(err){}
  items.unshift({
    name: fd.get("name") || "Visitante",
    text: fd.get("text"),
    date: new Date().toLocaleDateString("es-PE")
  });
  localStorage.setItem(key, JSON.stringify(items));
  e.currentTarget.reset();
  renderComments();
});

const menuBtn = document.getElementById("menuToggle");
const nav = document.getElementById("mobileNav");
menuBtn?.addEventListener("click", ()=> {
  nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", nav.classList.contains("open"));
});
document.querySelectorAll("#mobileNav a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));

window.addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  const pct = max > 0 ? (scrollY/max)*100 : 0;
  const bar = document.getElementById("progress");
  if(bar) bar.style.width = pct + "%";
});

document.getElementById("year").textContent = new Date().getFullYear();
renderPosts();
