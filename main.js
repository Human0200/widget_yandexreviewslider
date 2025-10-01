function $id(id){ const el=document.getElementById(id); if(!el){ console.warn('⛔ Не найден элемент #'+id); } return el; }
function setHref(id, url){ const el=$id(id); if(el) el.href = url; }

// Чтение конфигурации из data-атрибутов, установленных через Bitrix24 редактор
function getConfig() {
  const appBody = document.querySelector('.lsyr_app-body');
  if (!appBody) return null;

  const reviewBox = document.querySelector('.lsyr_review-box');
  const reviewList = document.querySelector('.lsyr_review-list'); 
  const ratingBadge = document.querySelector('.lsyr_business-summary-rating-badge-view__rating');
  const stars = document.querySelector('.lsyr_business-rating-badge-view__stars');

  if(parseInt(reviewBox.dataset.limit) > 50) reviewBox.dataset.limit = 50;

  return {
    COMPANY_ID: appBody.dataset.companyId,
    PROXY_URL: "https://app.lead-space.ru/WidgetYandexReviews/api/proxy.php",
    LIMIT: reviewBox ? parseInt(reviewBox.dataset.limit) || 25 : 25,
    HIDE_NEGATIVE: reviewList ? reviewList.dataset.hideNegative === "true" : true,
    SORT: {
      column: ratingBadge ? ratingBadge.dataset.sortColumn || "name" : "name",
      order: stars ? stars.dataset.sortOrder || "desc" : "desc"
    }
  };
}

const CONFIG = getConfig();
if (!CONFIG) {
  throw new Error('Конфигурация блока отзывов не загружена');
}

const MAPS_BASE = "https://yandex.ru/maps/org";

// Остальные функции остаются без изменений...
function resolveProxyUrl() {
  const p = (CONFIG.PROXY_URL||"").trim();
  if (/^https?:\/\//i.test(p)) return p;
  if (p.startsWith("/")) return location.origin + p;
  const basePath = location.pathname.replace(/\/[^\/]*$/, "/");
  return location.origin + basePath + p;
}

function buildUrl(action){
  const u = new URL(resolveProxyUrl());
  u.searchParams.set("ACTION", action);
  u.searchParams.set("COMPANY_ID", CONFIG.COMPANY_ID);
  return u.toString();
}

async function fetchJson(url){
  try {
    const res = await fetch(url, { 
      headers: { 
        Accept: "application/json",
        'Cache-Control': 'no-cache'
      } 
    });
    
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    const raw = await res.text();
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}. Body preview: ${raw.slice(0,220)}`);
    }
    
    let json;
    try { 
      json = JSON.parse(raw); 
    } catch (e) { 
      throw new Error(`Ответ не JSON. Content-Type: ${ct || "n/a"}. Превью: ${raw.slice(0,220)}`); 
    }
    
    if (!json || (json.status && json.status !== "success")) {
      throw new Error(json && (json.message || json.error) ? json.message || json.error : "Некорректный JSON-ответ от сервера");
    }
    
    return json.data || json;
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error);
    throw error;
  }
}

function generateStars(rating, size = 16) {
  const fullStars = Math.floor(rating);
  const hasHalf = (rating - fullStars) >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
  let html = '';
  
  for (let i = 0; i < fullStars; i++) {
    html += `<span class="inline-image _loaded icon lsyr_business-rating-badge-view__star _full" aria-hidden="true" role="button" tabindex="-1" style="font-size: 0px; line-height: 0;">
      <svg width="${size}" height="${size}" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M7.985 11.65l-3.707 2.265a.546.546 0 0 1-.814-.598l1.075-4.282L1.42 6.609a.546.546 0 0 1-.29-.976l4.08-.336 1.7-3.966a.546.546 0 0 1 1.004.001l1.687 3.965 4.107.337c.496.04.684.67.29.976l-3.131 2.425 1.073 4.285a.546.546 0 0 1-.814.598L7.985 11.65z" fill="#FC0"/>
      </svg>
    </span>`;
  }
  
  if (hasHalf) {
    html += `<span class="inline-image _loaded icon lsyr_business-rating-badge-view__star _half" aria-hidden="true" role="button" tabindex="-1" style="font-size: 0px; line-height: 0;">
      <svg width="${size}" height="${size}" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M7.985 11.65l-3.707 2.266a.546.546 0 0 1-.814-.598l1.075-4.282L1.42 6.609a.546.546 0 0 1 .29-.975l4.08-.336 1.7-3.966a.546.546 0 0 1 1.004.001l1.687 3.965 4.107.337c.496.04.684.67.29.975l-3.131 2.426 1.073 4.284a.546.546 0 0 1-.814.6l-3.722-2.27z" fill="#CCC"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M4.278 13.915l3.707-2.266V1a.538.538 0 0 0-.494.33l-1.7 3.967-4.08.336a.546.546 0 0 0-.29.975l3.118 2.427-1.075 4.282a.546.546 0 0 0 .814.598z" fill="#FC0"/>
      </svg>
    </span>`;
  }
  
  for (let i = 0; i < emptyStars; i++) {
    html += `<span class="inline-image _loaded icon lsyr_business-rating-badge-view__star _empty" aria-hidden="true" role="button" tabindex="-1" style="font-size: 0px; line-height: 0;">
      <svg width="${size}" height="${size}" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M7.985 11.65l-3.707 2.265a.546.546 0 0 1-.814-.598l1.075-4.282L1.42 6.609a.546.546 0 0 1 .29-.976l4.08-.336 1.7-3.966a.546.546 0 0 1 1.004.001l1.687 3.965 4.107.337c.496.04.684.67.29.976l-3.131 2.425 1.073 4.285a.546.546 0 0 1-.814.598L7.985 11.65z" fill="#E6E6E6"/>
      </svg>
    </span>`;
  }
  
  return html;
}

function mapCompany(raw){
  const ratingNum = Number(raw.rating ?? 5) || 5;
  return { 
    name: raw.name || "", 
    rating: Number.isInteger(ratingNum) ? String(ratingNum) : ratingNum.toFixed(1), 
    reviews_count: raw.reviews_count ?? raw.countmarks ?? 0 
  };
}

function mapReview(r){
  const ts = Number(r.timestamp ?? Date.now()/1000) || Math.floor(Date.now()/1000);
  const date = r.date || new Date(ts*1000).toISOString().slice(0,10);
  return { 
    name: r.name || "Пользователь", 
    image: r.image || r.avatar || "", 
    rating: Number(r.rating ?? 5) || 5, 
    timestamp: ts, 
    date: date, 
    text: r.text || "" 
  };
}

function sortAndFilter(rs){
  let res = rs.slice();
  if (CONFIG.HIDE_NEGATIVE) res = res.filter(x => x.rating >= 4);
  if (CONFIG.LIMIT) res = res.slice(0, CONFIG.LIMIT);
  return res;
}

function escapeHtml(s){ 
  return (s || "").replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); 
}

function slideTemplate(r){
  const avatar = r.image 
    ? `<div class="lsyr_user-icon-view__icon" style="background-image:url(${escapeHtml(r.image)})"></div>` 
    : `<div class="lsyr_user-icon-view__icon"></div>`;
  
  return `
    <div class="lsyr_slide">
      <div class="lsyr_review-item">
        <div class="lsyr_business-review-view__info">
          <div class="lsyr_business-review-view__author-container">
            <div class="lsyr_business-review-view__author-image">
              ${avatar}
            </div>
            <div class="lsyr_business-review-view__author-info">
              <div class="ls_business-review-view__author-name">${escapeHtml(r.name)}</div>
            </div>
          </div>
          <div class="lsyr_business-review-view__header">
            <div class="lsyr_business-review-view__rating">
              <div class="lsyr_business-rating-badge-view _size_m _weight_medium">
                <div class="lsyr_business-rating-badge-view__stars">
                  ${generateStars(r.rating)}
                </div>
              </div>
            </div>
            <span class="lsyr_business-review-view__date">${escapeHtml(r.date)}</span>
          </div>
          <div dir="auto" class="lsyr_business-review-view__body">
            <div class="lsyr_items-text" data-readmore="true" data-collapsed-height="120">
              ${escapeHtml(r.text)}
            </div>
            <a target="_blank" href="${MAPS_BASE}/${CONFIG.COMPANY_ID}/reviews/" class="lsyr_review-source-link">Отзыв Яндекс-Карты</a>
          </div>
        </div>
      </div>
    </div>`;
}

function initReadmore() {
  document.querySelectorAll('[data-readmore="true"]').forEach(el => {
    const collapsedHeight = parseInt(el.dataset.collapsedHeight) || 120;
    if (el.scrollHeight > collapsedHeight + 20) {
      el.style.maxHeight = collapsedHeight + 'px';
      el.style.overflow = 'hidden';
      el.style.position = 'relative';
      
      const readmoreBtn = document.createElement('a');
      readmoreBtn.href = 'javascript:void(0)';
      readmoreBtn.textContent = 'Показать полностью';
      readmoreBtn.className = 'lsyr-readmore';
      readmoreBtn.style.display = 'block';
      readmoreBtn.style.marginTop = '8px';
      readmoreBtn.style.fontSize = '14px';
      readmoreBtn.style.color = '#007aff';
      readmoreBtn.style.textDecoration = 'none';
      
      let isExpanded = false;
      readmoreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isExpanded) {
          el.style.maxHeight = collapsedHeight + 'px';
          readmoreBtn.textContent = 'Показать полностью';
          isExpanded = false;
        } else {
          el.style.maxHeight = 'none';
          readmoreBtn.textContent = 'Скрыть';
          isExpanded = true;
        }
      });
      
      el.parentNode.insertBefore(readmoreBtn, el.nextSibling);
    }
  });
}

function initSlider(){
  const track = document.getElementById("track");
  const prev = document.getElementById("prev");
  const next = document.getElementById("next");
  const pag = document.getElementById("pagination");
  const slides = Array.from(track.children);
  
  if (!slides.length) return;
  
  function spv(){ 
    return window.innerWidth >= 1024 ? 3 : (window.innerWidth >= 700 ? 2 : 1); 
  }
  
  let current = 0;
  
  function pages(){ 
    return Math.max(1, Math.ceil(slides.length / spv())); 
  }
  
  function goTo(p){
    const page = Math.max(0, Math.min(pages() - 1, p));
    current = page;
    const slideWidth = 100 / spv();
    const offset = -(page * spv() * slideWidth);
    track.style.transform = `translateX(${offset}%)`;
    update();
  }
  
  function rebuildPag(){
    pag.innerHTML = "";
    for (let i = 0; i < pages(); i++){
      const b = document.createElement("span");
      b.className = "lsyr_pagination-bullet" + (i === current ? " lsyr_pagination-bullet-active" : "");
      b.addEventListener("click", () => goTo(i));
      pag.appendChild(b);
    }
  }
  
  function update(){
    Array.from(pag.children).forEach((b, i) => 
      b.classList.toggle("lsyr_pagination-bullet-active", i === current));
    prev.disabled = current === 0;
    next.disabled = current >= pages() - 1;
  }
  
  window.addEventListener("resize", () => { 
    rebuildPag(); 
    goTo(Math.min(current, pages() - 1)); 
  });
  
  prev.addEventListener("click", () => goTo(current - 1));
  next.addEventListener("click", () => goTo(current + 1));
  
  rebuildPag(); 
  goTo(0);
}

async function preflight(){
  if (location.protocol === "file:") {
    const msg = "Открой через http:// или https:// (сейчас file://). Иначе запросы к proxy не работают.";
    const track = document.getElementById("track");
    if (track) track.innerHTML = '<div style="padding:12px;color:#b00">'+msg+'</div>';
    throw new Error("file-scheme");
  }
  
  const test = new URL(resolveProxyUrl());
  test.searchParams.set("TEST", "1");
  
  try {
    const r = await fetch(test, { headers: { Accept: "application/json" } });
    const t = await r.text();
    if (!r.ok || !/^\s*\{/.test(t)) {
      throw new Error("Прокси недоступен или вернул не JSON: " + r.status + " " + t.slice(0,200));
    }
  } catch (error) {
    console.error('Ошибка проверки прокси:', error);
    throw error;
  }
}

async function main(){
  try {
    await preflight();
    
    // Загрузка данных компании
    const companyRaw = await fetchJson(buildUrl("PARSE_COMPANY_DIRECT"));
    const company = mapCompany(companyRaw);
    
    // Обновление информации о компании
    document.getElementById("companyName").textContent = company.name;
    document.getElementById("companyRating").textContent = company.rating;
    document.getElementById("companyStars").innerHTML = generateStars(parseFloat(company.rating), 22);
    document.getElementById("companyCounts").innerHTML = 
      `<a target="_blank" href="${MAPS_BASE}/${CONFIG.COMPANY_ID}/reviews/">на основе ${company.reviews_count} отзывов</a>`;
    
    // Установка ссылок
    const companyUrl = `${MAPS_BASE}/${CONFIG.COMPANY_ID}/`;
    const reviewsUrl = `${MAPS_BASE}/${CONFIG.COMPANY_ID}/reviews/`;
    const addReviewUrl = `${MAPS_BASE}/${CONFIG.COMPANY_ID}/add-review/`;
    
    setHref("companyMapLink", companyUrl);
    setHref("companyCountsLink", reviewsUrl);
    setHref("companyReviewLink", addReviewUrl);
    
    // Загрузка и отображение отзывов
    const reviewsRaw = await fetchJson(buildUrl("PARSE_REVIEWS_DIRECT"));
    const reviews = sortAndFilter(
      (Array.isArray(reviewsRaw) ? reviewsRaw : reviewsRaw.items || [])
        .map(mapReview)
    );
    
    const track = document.getElementById("track");
    track.innerHTML = reviews.map(slideTemplate).join("");
    
    initReadmore();
    initSlider();
    
  } catch (e) {
    console.error('Ошибка загрузки отзывов:', e);
    const el = document.getElementById("track");
    if(el) {
      el.innerHTML = 
        '<div style="padding:12px;color:#b00;background:#fff3f3;border:1px solid #ffd0d0;border-radius:6px">' +
        'Ошибка загрузки: ' + (e && e.message ? e.message : e) + 
        '</div>';
    }
  }
}

// Запуск при загрузке DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}