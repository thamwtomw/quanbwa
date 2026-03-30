const DEFAULT_TITLE = ' AN HOÀNG TRUNG TƯỚNG QUÁN BỰA archive',
    DEFAULT_HEADER = '<h2>AN HOÀNG TRUNG TƯỚNG<br>QUÁN BỰA <sub>(archive)</sub></h2>';

var DEFAULT_SLOGAN = '<p>(2008 - 2009) Quán Bựa của công dân ngoan hiền An Hoàng Trung Tướng chầu mừng các Ông Lừa Bà Lừa</p>';
DEFAULT_SLOGAN += '<p>(2009 - 2012) Ở đây có những thông tin mà đồng chí nào chưa đủ chín chắn và khách quan để đọc và ngẫm nghĩ về chúng một cách thấu đáo và nghiêm túc hoàn toàn không nên liếc qua</p>';
DEFAULT_SLOGAN += '<p>(2012 - 2022) SỐNG DAI SỐNG KHỎE SỐNG TINHHOA CHO LÀMVIỆC VÀ HỌCHÀNH VÀ HƯỞNGTHỤ</p>';
DEFAULT_SLOGAN += '<p>(2022-2026) GO FUCK YOURSELF VOVA</p>';
DEFAULT_SLOGAN += '<p>(2026-) HERE STANDING BESIDE OUR IRANIAN BUDDIES</p>';

const TANKS = '<p>Thank @LìuTìu, @Anh-Búa(-s), and @ANHOÀNGTRUNGTƯỚNG very mucho</p><p>THĂMTƠM</p>';


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
async function headerAlt() {
    // Remove head
    //document.head.innerHTML = '';
    document.querySelectorAll('script').forEach(script => script.remove());
    const metaData = {
        "viewport": "width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no, viewport-fit=contain",
        "mobile-web-app-capable": "yes",
        "apple-mobile-web-app-capable": "yes",
        "apple-mobile-web-app-status-bar-style": "default",
        "apple-mobile-web-app-title": "AHTT",
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

    const script = Object.assign(document.createElement('script'), {
        src: 'https://cdn.jsdelivr.net/gh/antonroch/blogger/blogger.pubvar.gd3.js',
        async: true
    });
    document.head.append(script);

    // Set Title
    document.title = `${document.querySelector('.post-summary') ? document.querySelector('.post-summary').textContent + ' - ' + DEFAULT_TITLE : DEFAULT_TITLE}`;

    const
        BODY_HEADER = document.querySelector('.header'),
        BODY_FOOTER = document.querySelector('.footer');
    // Set Body Header
    if (BODY_HEADER) {
        BODY_HEADER.innerHTML = `<a>${DEFAULT_HEADER}</a>`;
    }

    // Footer
    if (BODY_FOOTER) {
        BODY_FOOTER.innerHTML = `<h6>${DEFAULT_SLOGAN}</h6><h6 style="direction: rtl;">${TANKS}</h6>`;
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


const isBlogspot = window.location.hostname.includes('blogspot');

const resources = [
    {
        key: 'JSON_POST_DATA',
        url: isBlogspot
            ? 'https://cdn.jsdelivr.net/gh/thamwtomw/quanbwa/_data/full_post.json'
            : new URL('../_data/full_post.json', import.meta.url)
    },
    {
        key: 'JSON_BWA_DATA',
        url: 'https://cdn.jsdelivr.net/gh/asinerum/project/team/buas.json'
    }
];

// Global data store
let APP_DATA = {
    JSON_POST_DATA: [],
    JSON_BWA_DATA: null
};

async function fetchResources() {
    const results = await Promise.allSettled(resources.map(async (res) => {
        const etagKey = `${res.key}_ETAG`;

        try {
            // 1. Fetch HEAD to check ETag
            const headRes = await fetch(res.url, { method: 'HEAD' });
            const currentETag = headRes.headers.get('ETag');
            const savedETag = localStorage.getItem(etagKey);
            const cachedData = localStorage.getItem(res.key);

            // 2. Use cache if ETag matches and data exists
            if (currentETag && currentETag === savedETag && cachedData) {
                return JSON.parse(cachedData);
            }

            // 3. Fetch fresh data if ETag is new or missing
            const dataRes = await fetch(res.url);
            if (!dataRes.ok) throw new Error(`HTTP error! status: ${dataRes.status}`);

            const freshData = await dataRes.json();

            // 4. Update localStorage
            localStorage.setItem(res.key, JSON.stringify(freshData));
            if (currentETag) localStorage.setItem(etagKey, currentETag);

            return freshData;

        } catch (error) {
            console.warn(`Failed to fetch ${res.key}, trying local cache...`, error);

            // 5. Individual Fallback: return cache if network/link fails
            const backup = localStorage.getItem(res.key);
            if (backup) return JSON.parse(backup);

            throw new Error(`No network and no cache for ${res.key}`);
        }
    }));

    // 6. Assign results to the global object
    results.forEach((result, index) => {
        const key = resources[index].key;
        if (result.status === 'fulfilled') {
            APP_DATA[key] = result.value;
        } else {
            console.error(`Resource [${key}] is unavailable:`, result.reason);
        }
    });
}



/**
 * Render HTML from JSON
 */

function renderHTMLfromJSON(data) {
    const BODY_CONTENT = document.querySelector('.content');
    BODY_CONTENT.innerHTML = `
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
        <div id="index-label-loader-container"></div>`;
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

        const filtered = APP_DATA.JSON_POST_DATA.flatMap(yearGroup =>
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
    headerAlt();
    fetchResources().then(() => {
        if (APP_DATA.JSON_POST_DATA.length > 0) {
            renderHTMLfromJSON(APP_DATA.JSON_POST_DATA);
        } else {
            const BODY_CONTENT = document.querySelector('.content');
            BODY_CONTENT.innerHTML = "Failed to load content.";
        }
    });
    document.addEventListener('click', handleBodyClick, false);
});