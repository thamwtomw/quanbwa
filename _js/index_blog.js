const DEFAULT_TITLE = 'Archive of QUÁN BỰA -  AN HOÀNG TRUNG TƯỚNG';

var DEFAULT_SLOGAN = '<p>(2008 - 2009) Quán Bựa của công dân ngoan hiền An Hoàng Trung Tướng chầu mừng các Ông Lừa Bà Lừa</p>';
DEFAULT_SLOGAN += '<p>(2009 - 2012) Ở đây có những thông tin mà đồng chí nào chưa đủ chín chắn và khách quan để đọc và ngẫm nghĩ về chúng một cách thấu đáo và nghiêm túc hoàn toàn không nên liếc qua</p>';
DEFAULT_SLOGAN += '<p>(2012 - 2022) SỐNG DAI SỐNG KHỎE SỐNG TINHHOA CHO LÀMVIỆC VÀ HỌCHÀNH VÀ HƯỞNGTHỤ</p>';
DEFAULT_SLOGAN += '<p>(2022-2026) GO FUCK YOURSELF VOVA</p>';
DEFAULT_SLOGAN += '<p>(2026-) HERE STANDING BESIDE OUR IRANIAN BUDDIES</p>';


const FOOTER_LINKS = [
    "http://vn.360plus.yahoo.com/an_hoang_trung_tuong/",
    "https://quanbua2.wordpress.com/",
    "https://quanbua2.blogspot.com/",
    "https://an-hoang-trung-tuong.blogspot.com/",
    "https://an-hoang-trung-tuong-2014.blogspot.com/"
];


/**
 * Apply style and script
 */
headerAlt();
async function headerAlt() {
    // Remove head
    //document.head.innerHTML = '';
    document.querySelectorAll('script').forEach(script => script.remove());
    const metaData = {
        "viewport": "width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no, viewport-fit=contain",
        "mobile-web-app-capable": "yes",
        "apple-mobile-web-app-capable": "yes",
        "apple-mobile-web-app-status-bar-style": "default",
        "apple-mobile-web-app-title": "AHTT (2004-2025)",
        "theme-color": "#000"
    };

    Object.entries(metaData).forEach(([name, content]) => {
        const meta = document.createElement('meta');

        if (name === "charset") {
            meta.setAttribute('charset', content);
        } else if (name === "Content-Type") {
            meta.setAttribute('http-equiv', name);
            meta.setAttribute('content', content);
        } else {
            meta.setAttribute('name', name);
            meta.setAttribute('content', content);
        }

        document.head.appendChild(meta);
    });

    // Set Title
    document.title = `${document.querySelector('.post-summary') ? document.querySelector('.post-summary').textContent + ' - ' + DEFAULT_TITLE : DEFAULT_TITLE}`;

    const
        BODY_HEADER = document.querySelector('.header'),
        BODY_FOOTER = document.querySelector('.footer');
    // Set Body Header
    if (BODY_HEADER) {
        BODY_HEADER.innerHTML = `<h2><a href="../../">${DEFAULT_TITLE}</a></h2>`;
    }

    // Footer
    if (BODY_FOOTER) {
        BODY_FOOTER.innerHTML = `<h6>${DEFAULT_SLOGAN}</h6><h6>Thank @LìuTìu, @Anh-Búa(-s), and @ANHOÀNGTRUNGTƯỚNG very mucho</h6><h6>@THĂMTƠM</h6>`;
        const nav = document.createElement('nav');
        nav.className = 'footer-links';

        FOOTER_LINKS.forEach(url => {
            const a = document.createElement('a');
            a.href = url;
            a.textContent = new URL(url).hostname;
            a.target = "_blank";
            nav.appendChild(a);
        });

        BODY_FOOTER.appendChild(nav);
    }

}



/**
 * Fetch JSON
 */

const CURRENT_VERSION = '2026.v1.0'; // Increment this to force a refresh

const STORAGE_KEY = 'JSON_POST_DATA';
const VERSION_KEY = 'JSON_POST_VERSION';
const BWA_STORAGE_KEY = 'BWA_DATA';

//const JSON_PATH = `../_data/${CURRENT_VERSION}.json`;
//const JS_URL = new URL(import.meta.url);
//const JSON_URL = new URL(JSON_PATH, JS_URL);https://cdn.jsdelivr.net/gh/thamwtomw/quanbwa@raw/refs/heads/main/_data/2026.v1.0.json
const JSON_URL = 'https://cdn.jsdelivr.net/gh/thamwtomw/quanbwa/_data/2026.v1.0.json';
const BWA_URL = 'https://cdn.jsdelivr.net/gh/asinerum/project/team/buas.json';

let JSON_POST_DATA = [];
let BWA_DATA = null;

async function fetchJSON() {
    try {
        const savedVersion = localStorage.getItem(VERSION_KEY);
        const cachedPostData = localStorage.getItem(STORAGE_KEY);
        const cachedBwaData = localStorage.getItem(BWA_STORAGE_KEY);

        // Use cached data if version matches
        if (savedVersion === CURRENT_VERSION && cachedPostData && cachedBwaData) {
            JSON_POST_DATA = JSON.parse(cachedPostData);
            BWA_DATA = JSON.parse(cachedBwaData);
            console.log('✅ Loaded data from cache');
            return;
        }

        console.log('📡 Fetching fresh data...');

        const results = await Promise.allSettled([
            fetch(JSON_URL).then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON_URL}`);
                return res.json();
            }),
            fetch(BWA_URL).then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}: ${BWA_URL}`);
                return res.json();
            })
        ]);

        let bothSucceeded = true;

        // Handle JSON_POST_DATA
        if (results[0].status === 'fulfilled') {
            JSON_POST_DATA = results[0].value;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(JSON_POST_DATA));
        } else {
            console.warn('❌ Failed to fetch posts JSON:', results[0].reason);
            bothSucceeded = false;

            // Fallback: try to use old cached data if available
            if (cachedPostData) {
                JSON_POST_DATA = JSON.parse(cachedPostData);
                console.log('⚠️ Using old cached posts data');
            }
        }

        // Handle BWA_DATA
        if (results[1].status === 'fulfilled') {
            BWA_DATA = results[1].value;
            localStorage.setItem(BWA_STORAGE_KEY, JSON.stringify(BWA_DATA));
        } else {
            console.warn('❌ Failed to fetch BWA data:', results[1].reason);
            bothSucceeded = false;

            // Fallback: try to use old cached data
            if (cachedBwaData) {
                BWA_DATA = JSON.parse(cachedBwaData);
                console.log('⚠️ Using old cached BWA data');
            }
        }

        // Only update version if **both** fetches succeeded
        if (bothSucceeded) {
            localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
            console.log('✅ Data updated and version saved');
        }

    } catch (e) {
        console.error('Unexpected error in fetchJSON():', e);
        // Final fallback: use whatever is in cache
        const cachedPost = localStorage.getItem(STORAGE_KEY);
        const cachedBwa = localStorage.getItem(BWA_STORAGE_KEY);
        if (cachedPost) JSON_POST_DATA = JSON.parse(cachedPost);
        if (cachedBwa) BWA_DATA = JSON.parse(cachedBwa);
    }
}



/**
 * Render HTML from JSON
 */

async function renderHTMLfromJSON_init() {
    await fetchJSON();
    if (JSON_POST_DATA.length > 0) {
        renderHTMLfromJSON(JSON_POST_DATA);
    } else {
        const BODY_CONTENT = document.querySelector('.content');
        BODY_CONTENT.innerHTML = "Failed to load content.";
    }
}

function renderHTMLfromJSON(data) {
    const BODY_CONTENT = document.querySelector('.content');
    BODY_CONTENT.innerHTML = `
        <div class="content">
            <div id="index-content-container">
                ${data.map(item => `
                <div class="index-year">
                    <h2 class="index-year-posts">${item.year} <sub class="index-post-count">${item.posts.length} posts</sub></h2>
                    ${item.note ? `<h5 class="index-year-note index-deactive">${item.note}</h5>` : ''}
                    ${item.posts.map(post => `
                        <div class="index-post index-deactive">
                            <div class="index-post-tag">
                                <sup class="index-post-date">${post.date}/${item.year}</sup>
                                <sub class="index-post-label">${post.label}</sub>
                            </div>
                            <div class="index-post-link">
                                <a href="${post.link}">${post.title}</a>
                                ${post.note ? `<sub class="index-post-note">(${post.note})</sub>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>`).join('')}
            </div>
            <div id="index-label-loader-container"></div>
        </div>`;
}

function handleBodyClick(e) {
    // Toggle Year Visibility
    if (e.target.classList.contains('index-year-posts') || e.target.classList.contains('index-post-count')) {
        const parentYear = e.target.closest('.index-year');
        parentYear.querySelectorAll('.index-post, .index-year-note').forEach(p => p.classList.toggle('index-deactive'));
    }

    // Filter by Label
    if (e.target.classList.contains('index-post-label')) {
        const selectedLabel = e.target.textContent.trim();
        const loader = document.getElementById('index-label-loader-container');

        const filtered = JSON_POST_DATA.flatMap(yearGroup =>
            yearGroup.posts
                .filter(p => p.label === selectedLabel)
                .map(post => ({ ...post, year: yearGroup.year }))
        );

        loader.innerHTML = `
            <div class="index-year">
                <h2 class="index-label-posts">${selectedLabel} <sub class="index-post-count">${filtered.length} posts</sub></h2>
                ${filtered.map(post => `
                    <div class="index-post">
                        <div class="index-post-tag">
                            <sup class="index-post-date">${post.date}/${post.year}</sup>
                            <sub class="index-post-label">${post.label}</sub>
                        </div>
                        <div class="index-post-link">
                            <a href="${post.link}">${post.title}</a>
                            ${post.note ? `<sub class="index-post-note">${post.note}</sub>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>`;

        // Scroll into view
        loader.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}








/**
 * 
 * 
 * 
 * 
 * 
 * Init
 * 
 * 
 * 
 * 
 */
document.addEventListener("DOMContentLoaded", () => {
    renderHTMLfromJSON_init();
    document.addEventListener('click', handleBodyClick, false);
});