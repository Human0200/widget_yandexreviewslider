const { ref, computed, onMounted, nextTick, createApp } = Vue

// Styles from Bitrix Constructor
const appEl = document.querySelector(".lsyr_attr-company-id").parentElement
const reviewBox = document.querySelector(".lsyr_review-box")
const reviewList = document.querySelector(".lsyr_review-list")

console.log("style:", reviewBox)
const anchor = document.querySelector(".lsyr_attr-company-id").parentElement
console.log("anchor:", anchor)
const initConfig = getConfig()
console.log("config:", initConfig)

function getConfig() {
    const companyIdEl = document.querySelector(".lsyr_attr-company-id")
    if (!companyIdEl) return null

    const sortColumnEl = document.querySelector(".lsyr_attr-sort-column")
    const hideNegativeEl = document.querySelector(
        "div[lsyr_attr-hide-negative]",
    )
    const limitEl = document.querySelector(".lsyr_attr-limit")
    const sortOrderEl = document.querySelector(".lsyr_attr-sort-order")
    const slideDesktopCountEl = document.querySelector(
        ".lsyr_attr-slide-desktop-count",
    )
    const slideMobileCountEl = document.querySelector(
        ".lsyr_attr-slide-mobile-count",
    )

    return {
        COMPANY_ID: companyIdEl.dataset.companyId ?? "",
        PROXY_URL:
            companyIdEl.dataset.proxyUrl ||
            "https://app.lead-space.ru/WidgetYandexReviews/api/proxy.php",
        SHOW_COUNT: companyIdEl.dataset.showCount || "SHOW_COUNT_REVIEWS",
        HIDE_LOGO: companyIdEl.dataset.hideLogo === "true",
        COLOR_BUTTONS: companyIdEl.dataset.colorButtons || "#007aff",
        COLOR_BUTTON: companyIdEl.dataset.colorButton || "#ffffff",
        SORT_COLUMN: sortColumnEl.dataset.sortColumn || "rating",
        SORT_ORDER: sortOrderEl.dataset.sortOrder || "desc",
        COLOR_BUTTON_TEXT: companyIdEl.dataset.colorButtonText || "#212121",
        SLIDE_DESKTOP_COUNT:
            parseInt(slideDesktopCountEl.dataset.slideDesktopCount) || 2,
        SLIDE_MOBILE_COUNT:
            parseInt(slideMobileCountEl.dataset.slideMobileCount) || 1,
        AUTOPLAY: companyIdEl.dataset.autoplay === "Y",
        AUTOPLAY_SPEED: parseInt(companyIdEl.dataset.autoplaySpeed) || 2000,
        LIMIT: limitEl ? parseInt(limitEl.dataset.limit) || 25 : 25,
        HIDE_NEGATIVE: hideNegativeEl
            ? hideNegativeEl.dataset.hideNegative === "true"
            : true,
        APP_STYLES: getStylesArray(appEl),
        REVIEW_BOX_STYLES: getStylesArray(reviewBox),
        REVIEW_LIST_STYLES: getStylesArray(reviewList),
        APP_CLASSES: "lsyr_app-body " + appEl.className,
        REVIEW_BOX_CLASSES: reviewBox.className,
        REVIEW_LIST_CLASSES: reviewList.className,
        YANDEX_MAP_SVG:
            companyIdEl.dataset.yandexMapSvg ||
            `<svg style="width: 80px;" width="138.89" height="28.203" version="1.1" viewBox="0 0 138.89 28.203" xmlns="http://www.w3.org/2000/svg">
 <g fill-rule="evenodd">
  <path d="m27.603 13.801c0-7.6225-6.1792-13.801-13.802-13.801s-13.802 6.1789-13.802 13.801c0 7.6222 6.1794 13.802 13.802 13.802s13.802-6.1793 13.802-13.802z" fill="#fc3f1d"/>
  <path d="m15.642 7.8207h-1.2652c-2.3577 0-3.5656 1.2075-3.5656 2.9332 0 1.9553 0.8626 2.8752 2.5881 4.0825l1.4377 0.978-4.1405 6.2106h-3.1054l3.7378-5.5209c-2.1281-1.5524-3.3354-3.0478-3.3354-5.5206 0-3.1628 2.1853-5.2907 6.3833-5.2907h4.1405v16.39h-2.8753z" fill="#fff"/>
  <path d="m43.617 0.0259c-6.1202 0-11.081 4.9608-11.081 11.081 0 3.0587 1.2397 5.8285 3.2437 7.8339 2.0054 2.0061 6.7289 4.9092 7.006 7.9567 0.0419 0.4572 0.3728 0.8313 0.8314 0.8313s0.7894-0.3741 0.8313-0.8313c0.2771-3.0475 5.0006-5.9506 7.006-7.9567 2.0041-2.0054 3.2437-4.7752 3.2437-7.8339 0-6.1202-4.9608-11.081-11.081-11.081z" fill="#f43"/>
  <path d="m43.617 14.986c2.1422 0 3.8782-1.7367 3.8782-3.8782 0-2.1422-1.736-3.8789-3.8782-3.8789s-3.8782 1.7367-3.8782 3.8789c0 2.1415 1.736 3.8782 3.8782 3.8782z" fill="#fff"/>
  <path d="m127.84 21.07h-1.6492v-4.8147h1.734c1.5261 0 2.4213 0.688 2.4213 2.4217 0 1.7336-0.9896 2.393-2.5061 2.393zm7.4906-12.22v15.028h3.5614v-15.028zm-12.692 0v15.028h5.4085c3.4957 0 5.9735-1.7901 5.9735-5.3235 0-3.3452-2.2139-5.1066-5.9171-5.1066h-1.9128v-4.5984zm-2.0917 2.8077v-2.8077h-11.919v2.8077h4.1837v12.221h3.5521v-12.221zm-19.259 9.7053c-1.8845 0-2.8451-1.5171-2.8451-4.9847 0-3.4954 1.0173-5.0125 3.0243-5.0125 1.9408 0 2.8927 1.5171 2.8927 4.9844 0 3.4957-1.0176 5.0128-3.0719 5.0128zm-3.109-12.513h-3.2885v19.353h3.5524v-6.0869c0.9045 1.338 2.2138 2.0543 3.7406 2.0543 3.458 0 5.851-2.7703 5.851-7.8205 0-5.0224-2.3273-7.7921-5.6725-7.7921-1.6766 0-3.0526 0.7724-4.0039 2.2328zm-9.705 11.439c-0.4524 0.6593-1.2909 1.1965-2.5441 1.1965-1.4888 0-2.2425-0.8385-2.2425-2.1201 0-1.7053 1.2251-2.3272 4.2778-2.3272h0.5088zm3.5521-6.6617c0-3.6369-1.8564-5.0128-5.6157-5.0128-2.3556 0-4.2115 0.7446-5.2861 1.3759v2.9585c0.9519-0.7253 3.0436-1.4981 4.8714-1.4981 1.6962 0 2.4783 0.5936 2.4783 2.2142v0.8291h-0.5749c-5.4368 0-7.8488 1.7997-7.8488 4.8433 0 3.0433 1.8467 4.7489 4.5983 4.7489 2.0914 0 2.9866-0.6877 3.6743-1.404h0.1511c0.028 0.386 0.1505 0.8949 0.2639 1.1965h3.467c-0.1224-1.2249-0.1788-2.4497-0.1788-3.6746zm-16.338 10.252h4.212l-7.3777-10.902 6.6898-9.8558h-3.6749l-6.4258 9.5542v-9.5542h-3.6088v20.757h3.6088v-9.7427z"/>
 </g>
</svg>
`,
        LOGO_SVG:
            companyIdEl.dataset.logoSvg ||
            `<svg style="width: 70px;" width="189" height="69" viewBox="0 0 189 69" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M189 64.552H174.88V40.0342H189V44.2938H180.078V49.677H188.38V53.9366H180.078V60.2589H189V64.552Z" fill="#232323"/>
<path d="M163.392 44.0086C161.436 44.0086 159.921 44.7464 158.848 46.2222C157.774 47.6868 157.238 49.7327 157.238 52.36C157.238 57.8271 159.289 60.5606 163.392 60.5606C165.114 60.5606 167.199 60.1302 169.648 59.2693V63.6295C167.635 64.468 165.388 64.8873 162.906 64.8873C159.34 64.8873 156.612 63.8084 154.722 61.6507C152.833 59.4817 151.888 56.3737 151.888 52.3265C151.888 49.7775 152.352 47.547 153.28 45.6353C154.208 43.7123 155.538 42.2421 157.271 41.2247C159.015 40.1962 161.056 39.6819 163.392 39.6819C165.774 39.6819 168.166 40.2577 170.57 41.4092L168.893 45.6353C167.976 45.1992 167.054 44.8191 166.126 44.4949C165.198 44.1707 164.287 44.0086 163.392 44.0086Z" fill="#232323"/>
<path d="M144.274 64.5518L142.497 58.7158H133.558L131.781 64.5518H126.179L134.833 39.9333H141.189L149.875 64.5518H144.274ZM141.256 54.3556C139.612 49.0674 138.684 46.0768 138.472 45.3836C138.271 44.6905 138.125 44.1426 138.036 43.7402C137.667 45.1712 136.61 48.7097 134.866 54.3556H141.256Z" fill="#232323"/>
<path d="M112.897 51.572H114.608C116.207 51.572 117.403 51.2589 118.197 50.6329C118.991 49.9956 119.387 49.0732 119.387 47.8658C119.387 46.6472 119.052 45.7472 118.381 45.1658C117.722 44.5845 116.682 44.2938 115.262 44.2938H112.897V51.572ZM124.636 47.6813C124.636 50.3198 123.809 52.3378 122.155 53.7353C120.511 55.1328 118.169 55.8316 115.128 55.8316H112.897V64.552H107.699V40.0342H115.53C118.504 40.0342 120.763 40.677 122.305 41.9627C123.859 43.2373 124.636 45.1435 124.636 47.6813Z" fill="#232323"/>
<path d="M103.255 57.7432C103.255 59.9569 102.455 61.701 100.857 62.9755C99.269 64.25 97.0554 64.8873 94.2156 64.8873C91.5995 64.8873 89.2852 64.3953 87.2728 63.4115V58.5817C88.9275 59.3196 90.325 59.8395 91.4653 60.1413C92.6169 60.4432 93.6678 60.5941 94.6181 60.5941C95.7585 60.5941 96.6305 60.3761 97.2342 59.9401C97.8491 59.5041 98.1566 58.8556 98.1566 57.9948C98.1566 57.514 98.0224 57.0892 97.7541 56.7203C97.4858 56.3401 97.0889 55.9768 96.5634 55.6302C96.0492 55.2836 94.9926 54.7302 93.3939 53.97C91.8958 53.2656 90.7722 52.5892 90.0231 51.9408C89.2741 51.2923 88.6759 50.5377 88.2287 49.6768C87.7815 48.816 87.5579 47.8098 87.5579 46.6582C87.5579 44.4893 88.2902 42.7843 89.7548 41.5434C91.2306 40.3024 93.2653 39.6819 95.8591 39.6819C97.1336 39.6819 98.3467 39.8328 99.4982 40.1347C100.661 40.4365 101.874 40.8614 103.137 41.4092L101.46 45.4508C100.152 44.9141 99.0678 44.5396 98.2069 44.3272C97.3572 44.1148 96.5187 44.0086 95.6914 44.0086C94.7075 44.0086 93.9529 44.2377 93.4274 44.6961C92.902 45.1545 92.6392 45.7526 92.6392 46.4905C92.6392 46.9489 92.7455 47.3514 92.9579 47.698C93.1703 48.0334 93.5057 48.3632 93.9641 48.6874C94.4336 49.0004 95.5349 49.5706 97.2678 50.3979C99.5597 51.4936 101.13 52.5948 101.98 53.7016C102.83 54.7973 103.255 56.1445 103.255 57.7432Z" fill="#232323"/>
<path d="M167.333 17.7131C167.333 21.7603 166.232 24.8571 164.03 27.0037C161.838 29.1391 158.68 30.2068 154.555 30.2068H147.763V5.68896H155.276C159.088 5.68896 162.051 6.74548 164.164 8.8585C166.277 10.9715 167.333 13.9231 167.333 17.7131ZM164.315 17.8137C164.315 14.6162 163.51 12.2069 161.9 10.5858C160.301 8.96471 157.92 8.15416 154.756 8.15416H150.614V27.7416H154.085C157.484 27.7416 160.038 26.9087 161.749 25.2428C163.459 23.5658 164.315 21.0895 164.315 17.8137Z" fill="#232323"/>
<path d="M141.44 30.2068L138.388 22.4087H128.561L125.542 30.2068H122.658L132.351 5.58838H134.749L144.392 30.2068H141.44ZM137.499 19.8429L134.648 12.2461C134.279 11.2846 133.899 10.1051 133.508 8.70761C133.262 9.78089 132.91 10.9604 132.451 12.2461L129.567 19.8429H137.499Z" fill="#232323"/>
<path d="M120.578 30.2068H106.91V5.68896H120.578V8.22124H109.761V16.1199H119.924V18.6354H109.761V27.6577H120.578V30.2068Z" fill="#232323"/>
<path d="M89.0675 30.2068V5.68896H91.9184V27.6242H102.735V30.2068H89.0675Z" fill="#232323"/>
<g clip-path="url(#clip0_431_17841)">
<path d="M18.7728 68.9149L55.7073 51.5843C62.5824 47.6331 62.5641 46.2289 55.5492 43.7306C51.7865 41.0924 48.0359 39.1411 44.34 40.3204L24.8333 49.6877C19.8548 52.4718 18.5722 55.9489 18.5843 59.663L18.7728 68.9149Z" fill="url(#paint0_linear_431_17841)"/>
<path d="M29.5929 16.4431C28.8513 17.3792 26.3711 20.7347 26.4806 25.6038C26.5049 26.8317 26.7541 30.6188 29.3801 33.8344C31.9758 37.0136 35.0698 37.3905 42.8081 39.7187C45.9995 40.6791 50.5828 42.1502 56.1084 44.2717C56.4975 44.3629 57.6585 44.685 58.5642 45.7853C59.6949 47.153 59.5976 48.7213 59.5733 49.0557C59.8833 48.7639 60.3271 48.3201 60.7891 47.7244C64.5457 42.8796 64.6248 34.3815 60.5885 30.637C59.6402 29.7617 59.0749 29.707 54.0781 27.9988C49.975 26.6007 46.7046 25.391 44.656 24.619C39.635 21.8897 34.6139 19.1664 29.5929 16.4431Z" fill="url(#paint1_linear_431_17841)"/>
<path d="M4.79163 1.8601C5.35087 1.84186 6.20798 1.82362 7.2596 1.79931C8.6638 1.77499 9.91602 1.75676 10.1896 1.75676C11.229 1.75068 16.086 1.73852 18.5843 4.16395C19.8913 5.42833 20.6025 7.1243 20.5599 10.6014C20.4505 18.8745 20.5052 23.5491 20.5842 26.3332C20.6086 27.1417 20.7423 31.5913 20.8639 37.6397C20.949 39.8645 20.949 39.3782 21.0462 41.907C21.2407 46.9523 21.2468 49.1711 21.4413 55.9307C21.4717 56.9884 21.5204 58.5506 21.5812 60.4593C21.569 60.5809 21.2894 63.4136 23.3501 64.8786C24.2801 65.5351 25.271 65.6263 25.7633 65.6324C25.04 66.2463 20.8943 69.6383 15.1802 68.8845C14.0739 68.7386 10.0619 68.2097 7.64256 65.0853C6.12895 63.134 5.94659 59.7238 5.58186 52.8974C5.50284 51.3716 5.41166 48.9158 5.36911 46.5572C5.32656 44.4418 5.32656 42.8796 5.32656 42.4784C5.3144 39.6396 5.19282 29.5184 4.79163 1.8601Z" fill="url(#paint2_linear_431_17841)"/>
<path d="M61.7435 0L33.2888 13.355C28.3164 16.7409 27.0642 18.522 33.4469 21.2088L44.65 24.619L55.6769 19.2393C60.6554 16.4552 61.938 12.9781 61.9259 9.26403L61.7435 0Z" fill="url(#paint3_linear_431_17841)"/>
</g>
<defs>
<linearGradient id="paint0_linear_431_17841" x1="18.4888" y1="54.731" x2="60.9758" y2="53.8733" gradientUnits="userSpaceOnUse">
<stop stop-color="#3B7CE7"/>
<stop offset="1.38522e-07" stop-color="#1864E3"/>
<stop offset="1" stop-color="#397DEE"/>
</linearGradient>
<linearGradient id="paint1_linear_431_17841" x1="26.6314" y1="33.1081" x2="63.4807" y2="32.3641" gradientUnits="userSpaceOnUse">
<stop stop-color="#0C5ADB"/>
<stop offset="1" stop-color="#00368E"/>
</linearGradient>
<linearGradient id="paint2_linear_431_17841" x1="5.14495" y1="35.5396" x2="25.1477" y2="35.1359" gradientUnits="userSpaceOnUse">
<stop stop-color="#0C5ADB"/>
<stop offset="1" stop-color="#0440A2"/>
</linearGradient>
<linearGradient id="paint3_linear_431_17841" x1="29.0005" y1="12.7962" x2="61.9873" y2="12.1303" gradientUnits="userSpaceOnUse">
<stop stop-color="#0C5ADB"/>
<stop offset="1.38522e-07" stop-color="#4184F3"/>
<stop offset="1" stop-color="#3D81F0"/>
</linearGradient>
<clipPath id="clip0_431_17841">
<rect width="69" height="69" fill="white"/>
</clipPath>
</defs>
</svg>
`,
    }
}

function getStylesArray(el) {
    const styleArray = Array.from(el.style).map((prop) => {
        return { property: prop, value: el.style.getPropertyValue(prop) }
    })

    return styleArray
        .filter((item) => item.value)
        .map((item) => `${item.property}: ${item.value}`)
}

const App = {
    name: "YandexReviewsWidget",
    setup() {
        // Reactive state
        const company = ref({
            name: "",
            rating: "5.0",
            reviews_count: 0,
            countmarks: 0,
        })
        const reviews = ref([])
        const loading = ref(true)
        const error = ref(null)
        const slickInitialized = ref(false)

        // Configuration
        const config = ref(null)
        const MAPS_BASE = "https://yandex.ru/maps/org"

        // Computed properties
        const companyReviewsUrl = computed(() =>
            config.value
                ? `${MAPS_BASE}/${config.value.COMPANY_ID}/reviews/`
                : "#",
        )

        const urlForLeaveReview = computed(() =>
            config.value
                ? //https://yandex.ru/maps/org/45616405414/reviews/?add-review=true
                  `${MAPS_BASE}/${config.value.COMPANY_ID}/reviews/?add-review=true`
                : "#",
        )

        const fullStarsCount = computed(() =>
            Math.floor(parseFloat(company.value.rating)),
        )

        const halfStarsCount = computed(() => {
            const rating = parseFloat(company.value.rating)
            return rating - Math.floor(rating) >= 0.5 ? 1 : 0
        })

        const emptyStarsCount = computed(
            () => 5 - fullStarsCount.value - halfStarsCount.value,
        )

        // Helper functions

        function resolveProxyUrl() {
            const p = (config.value.PROXY_URL || "").trim()
            if (/^https?:\/\//i.test(p)) return p
            if (p.startsWith("/")) return location.origin + p
            const basePath = location.pathname.replace(/\/[^\/]*$/, "/")
            return location.origin + basePath + p
        }

        function buildUrl(action) {
            const u = new URL(resolveProxyUrl())
            u.searchParams.set("ACTION", action)
            u.searchParams.set("COMPANY_ID", config.value.COMPANY_ID)
            return u.toString()
        }

        async function fetchJson(url) {
            const res = await fetch(url, {
                headers: {
                    Accept: "application/json",
                    "Cache-Control": "no-cache",
                },
            })

            const ct = (res.headers.get("content-type") || "").toLowerCase()
            const raw = await res.text()

            if (!res.ok) {
                throw new Error(
                    `HTTP ${res.status}. Body preview: ${raw.slice(0, 220)}`,
                )
            }

            let json
            try {
                json = JSON.parse(raw)
            } catch (e) {
                throw new Error(
                    `Ответ не JSON. Content-Type: ${ct || "n/a"}. Превью: ${raw.slice(0, 220)}`,
                )
            }

            if (!json || (json.status && json.status !== "success")) {
                throw new Error(
                    json && (json.message || json.error)
                        ? json.message || json.error
                        : "Некорректный JSON-ответ от сервера",
                )
            }

            return json.data || json
        }

        function mapCompany(raw) {
            const ratingNum = Number(raw.rating ?? 5) || 5
            return {
                name: raw.name || "",
                rating: Number.isInteger(ratingNum)
                    ? String(ratingNum)
                    : ratingNum.toFixed(1),
                reviews_count: raw.reviews_count ?? raw.countreviews ?? 0,
                countmarks: raw.countmarks ?? raw.reviews_count ?? 0,
            }
        }

        function mapReview(r) {
            const ts =
                Number(r.timestamp ?? Date.now() / 1000) ||
                Math.floor(Date.now() / 1000)
            const date =
                r.date || new Date(ts * 1000).toISOString().slice(0, 10)
            return {
                name: r.name || "Пользователь",
                image: r.image || r.avatar || "",
                rating: Number(r.rating ?? 5) || 5,
                timestamp: ts,
                date: date,
                text: r.text || "",
            }
        }

        function sortAndFilter(rs) {
            let res = rs.slice()
            if (config.value.HIDE_NEGATIVE)
                res = res.filter((x) => x.rating >= 4)
            if (config.value.LIMIT) res = res.slice(0, config.value.LIMIT)
            if (config.value.SORT_COLUMN === "name") {
                if (config.value.SORT_ORDER === "desc") {
                    res.sort((a, b) => b.name.localeCompare(a.name))
                } else {
                    res.sort((a, b) => a.name.localeCompare(b.name))
                }
            } else {
                if (config.value.SORT_ORDER === "desc") {
                    res.sort((a, b) => b.rating - a.rating)
                } else {
                    res.sort((a, b) => a.rating - b.rating)
                }
            }

            return res
        }

        async function preflight() {
            if (location.protocol === "file:") {
                throw new Error(
                    "Открой через http:// или https:// (сейчас file://). Иначе запросы к proxy не работают.",
                )
            }

            const test = new URL(resolveProxyUrl())
            test.searchParams.set("TEST", "1")

            const r = await fetch(test, {
                headers: { Accept: "application/json" },
            })
            const t = await r.text()
            if (!r.ok || !/^\s*\{/.test(t)) {
                throw new Error(
                    "Прокси недоступен или вернул не JSON: " +
                        r.status +
                        " " +
                        t.slice(0, 200),
                )
            }
        }

        // Initialize Slick slider
        function initSlick() {
            if (
                slickInitialized.value ||
                !window.jQuery ||
                !window.jQuery.fn.slick
            ) {
                console.warn("jQuery or Slick not available")
                return
            }

            nextTick(() => {
                const $ = window.jQuery

                console.log("jQuery loaded:", typeof $ !== "undefined")
                console.log("Slick loaded:", typeof $.fn.slick !== "undefined")
                console.log("Starting slider initialization")

                // Initialize readmore
                if ($.fn.readmore) {
                    $(".lsyr_items-text").readmore({
                        collapsedHeight: 40,
                    })
                    console.log("Readmore initialized")
                } else {
                    console.log("Readmore not available")
                }

                // Check if slider element exists
                const lsyrSliderElement = $(".lsyr_regular")
                console.log(
                    "Slider element found:",
                    lsyrSliderElement.length > 0,
                )

                if (
                    lsyrSliderElement.length > 0 &&
                    typeof $.fn.slick !== "undefined"
                ) {
                    // Destroy existing slider if present
                    if (lsyrSliderElement.hasClass("slick-initialized")) {
                        lsyrSliderElement.slick("unslick")
                        console.log("Destroyed existing slider")
                    }

                    try {
                        const sliderConfig = {
                            dots: true,
                            infinite: true,
                            slidesToShow: config.value.SLIDE_DESKTOP_COUNT,
                            slidesToScroll: 1,
                            prevArrow: $(".lsyr_button-prev"),
                            nextArrow: $(".lsyr_button-next"),
                            appendDots: $(".lsyr_pagination"),
                            adaptiveHeight: true,
                            responsive: [
                                {
                                    breakpoint: 800,
                                    settings: {
                                        slidesToShow:
                                            config.value.SLIDE_MOBILE_COUNT,
                                        slidesToScroll: 1,
                                        dots: false,
                                        vertical: true,
                                        verticalSwiping: true,
                                        // adaptiveHeight: true,
                                    },
                                },
                            ],
                        }

                        if (config.value.AUTOPLAY) {
                            sliderConfig.autoplay = true
                            sliderConfig.autoplaySpeed =
                                config.value.AUTOPLAY_SPEED
                        }

                        const lsyrCarouselWidget =
                            lsyrSliderElement.slick(sliderConfig)

                        console.log("Slick slider initialized successfully")

                        // Mobile events
                        if (window.matchMedia("(max-width: 800px)").matches) {
                            console.log(
                                "Mobile detected, setting up mobile events",
                            )

                            $(document).on(
                                "click",
                                ".lsyr-readmore, .lsyr-readless",
                                function (event) {
                                    if (!event.originalEvent) {
                                        return
                                    }
                                    setTimeout(function () {
                                        lsyrCarouselWidget.slick("setPosition")
                                    }, 250)
                                },
                            )

                            lsyrCarouselWidget.on("beforeChange", function () {
                                $(".lsyr-readless").each(function () {
                                    $(this).trigger("click")
                                })
                            })
                        }

                        // Save slider reference globally for debugging
                        window.lsyrReviewsSlider = lsyrCarouselWidget
                        slickInitialized.value = true
                    } catch (errorMsg) {
                        console.error(
                            "Error initializing slick slider:",
                            errorMsg,
                        )
                    }
                } else {
                    console.error(
                        "Slick slider not available or element not found",
                    )
                }
            })
        }

        // Load data
        async function loadData() {
            try {
                loading.value = true
                error.value = null

                await preflight()

                // Load company data
                const companyRaw = await fetchJson(
                    buildUrl("PARSE_COMPANY_DIRECT"),
                )
                company.value = mapCompany(companyRaw)

                // Load reviews
                const reviewsRaw = await fetchJson(
                    buildUrl("PARSE_REVIEWS_DIRECT"),
                )
                const mappedReviews = (
                    Array.isArray(reviewsRaw)
                        ? reviewsRaw
                        : reviewsRaw.items || []
                ).map(mapReview)
                reviews.value = sortAndFilter(mappedReviews)

                // Initialize slick after data is loaded
                nextTick(() => {
                    setTimeout(initSlick, 150)
                })
            } catch (e) {
                console.error("Ошибка загрузки отзывов:", e)
                error.value = e.message || "Неизвестная ошибка"
            } finally {
                loading.value = false
            }
        }

        // Lifecycle hooks
        onMounted(async () => {
            config.value = initConfig

            if (!config.value) {
                error.value = "Конфигурация блока отзывов не загружена"
                loading.value = false
                return
            }

            await loadData()
        })

        const dynamicStyles = computed(
            () => `
.lsyr_review-bottom .lsyr_button-next:hover,
.lsyr_review-bottom .lsyr_button-prev:hover {
    background-color: ${config.value.COLOR_BUTTONS} !important;
    color: #ffffff !important;
}
.slick-dots li.slick-active button {
    background: ${config.value.COLOR_BUTTONS};
}
.lsyr_app-body a.lsyr_reviews-btn {
    color: ${config.value.COLOR_BUTTON_TEXT} !important;
    background-color: ${config.value.COLOR_BUTTON};
}
`,
        )

        return {
            // State
            company,
            reviews,
            loading,
            error,
            config,

            // Computed
            companyReviewsUrl,
            urlForLeaveReview,
            fullStarsCount,
            halfStarsCount,
            emptyStarsCount,

            // Constants
            MAPS_BASE,

            // Computed
            dynamicStyles,
        }
    },

    template: `
    <div :class="config?.APP_CLASSES ?? 'lsyr_app-body'" :style="config?.APP_STYLES ?? ''">
      <!-- Loading state -->
      <div v-if="loading" style="padding: 40px; text-align: center;">
        <div>Загрузка отзывов...</div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" style="padding: 12px; color: #b00; background: #fff3f3; border: 1px solid #ffd0d0; border-radius: 6px;">
        Ошибка загрузки: {{ error }}
      </div>

      <!-- Content -->
      <template v-else>
        <component
            is="style"
            v-if="config"
            v-html="dynamicStyles"
        />

    <div :class="config?.REVIEW_BOX_CLASSES ?? 'lsyr_review-box lsyr_review-unselectable'" :style="config?.REVIEW_BOX_STYLES ?? '--bg: #fafafa'">
          <div class="lsyr_business-summary-rating-badge-view__rating">
            {{ company.name }}
            <br>
            <br>
            {{ company.rating }} из 5
          </div>

          <div class="lsyr_business-rating-badge-view__stars">
            <!-- Full stars -->
            <span
              v-for="n in fullStarsCount"
              :key="'full-' + n"
              class="inline-image _loaded icon lsyr_business-rating-badge-view__star _full"
              aria-hidden="true"
              role="button"
              tabindex="-1"
              style="font-size: 0px; line-height: 0;"
            >
              <svg width="22" height="22" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M7.985 11.65l-3.707 2.265a.546.546 0 0 1-.814-.598l1.075-4.282L1.42 6.609a.546.546 0 0 1 .29-.976l4.08-.336 1.7-3.966a.546.546 0 0 1 1.004.001l1.687 3.965 4.107.337c.496.04.684.67.29.976l-3.131 2.425 1.073 4.285a.546.546 0 0 1-.814.598L7.985 11.65z" fill="currentColor"/>
              </svg>
            </span>

            <!-- Half star -->
            <span
              v-if="halfStarsCount"
              class="inline-image _loaded icon lsyr_business-rating-badge-view__star _half"
              aria-hidden="true"
              role="button"
              tabindex="-1"
              style="font-size: 0px; line-height: 0;"
            >
              <svg width="22" height="22" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M7.985 11.65l-3.707 2.266a.546.546 0 0 1-.814-.598l1.075-4.282L1.42 6.609a.546.546 0 0 1 .29-.975l4.08-.336 1.7-3.966a.546.546 0 0 1 1.004.001l1.687 3.965 4.107.337c.496.04.684.67.29.975l-3.131 2.426 1.073 4.284a.546.546 0 0 1-.814.6l-3.722-2.27z" fill="#CCC"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M4.278 13.915l3.707-2.266V1a.538.538 0 0 0-.494.33l-1.7 3.967-4.08.336a.546.546 0 0 0-.29.975l3.118 2.427-1.075 4.282a.546.546 0 0 0 .814.598z" fill="#FC0"/>
              </svg>
            </span>

            <!-- Empty stars -->
            <span
              v-for="n in emptyStarsCount"
              :key="'empty-' + n"
              class="inline-image _loaded icon lsyr_business-rating-badge-view__star _empty"
              aria-hidden="true"
              role="button"
              tabindex="-1"
              style="font-size: 0px; line-height: 0;"
            >
              <svg width="22" height="22" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M7.985 11.65l-3.707 2.265a.546.546 0 0 1-.814-.598l1.075-4.282L1.42 6.609a.546.546 0 0 1 .29-.976l4.08-.336 1.7-3.966a.546.546 0 0 1 1.004.001l1.687 3.965 4.107.337c.496.04.684.67.29.976l-3.131 2.425 1.073 4.285a.546.546 0 0 1-.814.598L7.985 11.65z" fill="currentColor"/>
              </svg>
            </span>
          </div>

          <a target="_blank" :href="companyReviewsUrl">
            <div v-if="config.YANDEX_MAP_SVG" v-html="config.YANDEX_MAP_SVG"></div>
          </a>

          <!-- Show count reviews -->
          <div v-if="config.SHOW_COUNT === 'SHOW_COUNT_REVIEWS'" class="lsyr_reviews-count">
            <a target="_blank" :href="companyReviewsUrl">
              на основе {{ company.reviews_count }} отзывов
            </a>
          </div>

          <!-- Show count marks -->
          <div v-if="config.SHOW_COUNT === 'SHOW_COUNT_MARKS'" class="lsyr_reviews-count">
            <a target="_blank" :href="urlForLeaveReview">
              на {{ company.countmarks }}
            </a>
          </div>

          <a
            target="_blank"
            :href="urlForLeaveReview"
            class="lsyr_reviews-btn lsyr_reviews-btn-form"
            rel="nofollow noreferrer noopener"
          >
            Оставить отзыв
          </a>
        </div>

        <div style="min-width: 0; width: 100%;">
          <div :class="config?.REVIEW_LIST_CLASSES ?? lsyr_review-list" :style="config?.REVIEW_LIST_STYLES ?? ''">
            <div class="lsyr_regular">
              <!-- Review slides -->
              <div
                v-for="(review, index) in reviews"
                :key="index"
                class="lsyr_slide"
              >
                <div class="lsyr_review-item">
                  <div class="lsyr_business-review-view__info">
                    <div class="lsyr_business-review-view__author-container">
                      <div class="lsyr_business-review-view__author-image">
                        <div
                          class="lsyr_user-icon-view__icon"
                          :style="review.image ? { backgroundImage: 'url(' + review.image + ')' } : {}"
                        ></div>
                      </div>
                      <div class="lsyr_business-review-view__author-info">
                        <div class="ls_business-review-view__author-name">
                          {{ review.name }}
                        </div>
                      </div>
                    </div>

                    <div class="lsyr_business-review-view__header">
                      <div class="lsyr_business-review-view__rating">
                        <div class="lsyr_business-rating-badge-view _size_m _weight_medium">
                          <div class="lsyr_business-rating-badge-view__stars">
                            <template v-for="n in 5" :key="n">
                              <span
                                v-if="n <= review.rating"
                                class="inline-image _loaded icon lsyr_business-rating-badge-view__star _full"
                                aria-hidden="true"
                                role="button"
                                tabindex="-1"
                                style="font-size: 0px; line-height: 0;"
                              >
                                <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                  <path fill-rule="evenodd" clip-rule="evenodd" d="M7.985 11.65l-3.707 2.265a.546.546 0 0 1-.814-.598l1.075-4.282L1.42 6.609a.546.546 0 0 1 .29-.976l4.08-.336 1.7-3.966a.546.546 0 0 1 1.004.001l1.687 3.965 4.107.337c.496.04.684.67.29.976l-3.131 2.425 1.073 4.285a.546.546 0 0 1-.814.598L7.985 11.65z" fill="currentColor"/>
                                </svg>
                              </span>
                              <span
                                v-else
                                class="inline-image _loaded icon lsyr_business-rating-badge-view__star _empty"
                                aria-hidden="true"
                                role="button"
                                tabindex="-1"
                                style="font-size: 0px; line-height: 0;"
                              >
                                <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                  <path fill-rule="evenodd" clip-rule="evenodd" d="M7.985 11.65l-3.707 2.265a.546.546 0 0 1-.814-.598l1.075-4.282L1.42 6.609a.546.546 0 0 1 .29-.976l4.08-.336 1.7-3.966a.546.546 0 0 1 1.004.001l1.687 3.965 4.107.337c.496.04.684.67.29.976l-3.131 2.425 1.073 4.285a.546.546 0 0 1-.814.598L7.985 11.65z" fill="currentColor"/>
                                </svg>
                              </span>
                            </template>
                          </div>
                        </div>
                      </div>
                      <span class="lsyr_business-review-view__date">{{ review.date }}</span>
                    </div>

                    <div dir="auto" class="lsyr_business-review-view__body">
                      <div class="lsyr_items-text">
                        {{ review.text }}
                      </div>
                      <a
                        target="_blank"
                        :href="companyReviewsUrl"
                        class="lsyr_review-source-link"
                      >
                        Отзыв Яндекс-Карты
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="lsyr_review-bottom">
            <div class="lsyr_buttons">
              <div class="lsyr_button-prev" tabindex="0" role="button" aria-label="Previous slide">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="height: 12px">
                  <path d="m70.143 97.5-44.71-44.711a3.943 3.943 0 0 1 0-5.578l44.71-44.711 5.579 5.579-41.922 41.921 41.922 41.922z"/>
                </svg>
              </div>
              <div class="lsyr_button-next" tabindex="0" role="button" aria-label="Next slide">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="height: 12px;">
                  <path d="m70.143 97.5-44.71-44.711a3.943 3.943 0 0 1 0-5.578l44.71-44.711 5.579 5.579-41.922 41.921 41.922 41.922z"/>
                </svg>
              </div>
            </div>
            <div class="lsyr_pagination lsyr_pagination-clickable lsyr_pagination-bullets lsyr_pagination-horizontal">
            </div>
            <div v-if="!config.HIDE_LOGO" class="lsyr_business-review-view_copy">
              <div>Разработано</div>
              <a href="https://lead-space.ru/?utm_source=marketplace.1c-bitrix" target="_blank">
                <div v-if="config.LOGO_SVG" v-html="config.LOGO_SVG"></div>
              </a>
            </div>
          </div>
        </div>
      </template>
    </div>
  `,
}

createApp(App).mount(anchor.parentElement)
