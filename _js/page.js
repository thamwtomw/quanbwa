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

const JSON_PATH = `../_data/${CURRENT_VERSION}.json`;
const JS_URL = new URL(import.meta.url);
const JSON_URL = new URL(JSON_PATH, JS_URL);
//const JSON_URL = 'https://cdn.jsdelivr.net/gh/thamwtomw/quanbwa/_data/2026.v1.0.json';
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
 * Observer .post-body
 */


const observerPostBodyBlock = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            processPostBodyBlock(entry.target);
            observerPostBodyBlock.unobserve(entry.target); // Process once, then stop watching to save RAM
        }
    });
}, { threshold: 0.1 });

function processPostBodyBlock(postBody) {
    parseCustomTags(postBody);
}


/**
 * Observer .comment-block
 */

const observerCommentBlock = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            processCommentBlock(entry.target);
            observerCommentBlock.unobserve(entry.target); // Process once, then stop watching to save RAM
        }
    });
}, { threshold: 0.1 });

function processCommentBlock(commentBlock) {

    parseBwaStyle(commentBlock);

    const commentBody = commentBlock.querySelector('.comment-body');
    if (commentBody) {
        addCommentRef(commentBody);
        parseCustomTags(commentBody);
    }

    const commentFooter = commentBlock.querySelector('.comment-footer');
    if (commentFooter) {
        // 1. Create and add the p.footer-post-tittle
        const postTitle = document.createElement('p');
        postTitle.classList.add('footer-post-tittle');
        postTitle.textContent = document.querySelector('.post-summary')?.textContent ||
            document.querySelector('.post-title')?.textContent || '';
        commentFooter.appendChild(postTitle);
    }
}

function addCommentRef(commentBlock) {
    commentBlock.querySelectorAll('.comment-body a').forEach(link => {
        if (/#c\d+$/.test(link.href) || /#cmt\.\d+$/.test(link.href)) { // "c847" or "cmt.456"
            link.classList.add('comment-ref');
            // Clean up text node (💭 icon logic)
            const prev = link.previousSibling;
            if (prev && prev.nodeType === 3) {
                const text = prev.textContent.trim();
                prev.remove();
                link.innerHTML = `💭 ${text} <i>${link.textContent}</i>`;
            }
        }
    });
}


/**
 * Click on Ref: (0000) to show popupComment
 */

function handleBodyClick(e) {
    // 1. Handle Comment Reference (Popup)
    const eCommentRef = e.target.closest('.comment-ref');
    if (eCommentRef) {
        e.preventDefault();
        e.stopPropagation();
        showPopupComment(e, eCommentRef);
        return;
    }

    // 2. Handle Footer Toggle
    const eCommentFooter = e.target.closest('.comment-footer');
    if (eCommentFooter) {
        e.preventDefault();
        e.stopPropagation();

        // Select the paragraph inside the footer
        const postTitle = eCommentFooter.querySelector('.footer-post-tittle');
        if (postTitle) {
            postTitle.classList.toggle('active');
        }
        return;
    }
}


function showPopupComment(e, ref) {
    const hash = new URL(ref.href).hash;
    const id = hash.replace(/^#/, '');
    let sourceNode = null, commentNode = null;

    if (/^c\d+$/.test(id)) {
        sourceNode = document.getElementById(id);
        commentNode = sourceNode ? sourceNode.parentNode : null;
    }
    else if (/^cmt\.(\d+)$/.test(id)) {
        const num = parseInt(RegExp.$1, 10);
        const comments = document.querySelectorAll('.comment-block');
        if (num >= 1 && num <= comments.length) {
            sourceNode = comments[num - 1];
        }
        commentNode = sourceNode ? sourceNode : null;
    }

    let popup;

    if (commentNode) {
        popup = commentNode.cloneNode(true);
        // Inside showPopupComment, after processCommentBlock (if any)
        processCommentBlock(popup);
    } else {
        popup = createFallback(ref.href);
    }



    popup.classList.add('popup-comment');
    const closeBtn = document.createElement('button');
    closeBtn.className = 'popup-close-btn';
    closeBtn.type = 'button';

    closeBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        popup.remove();
    });

    popup.prepend(closeBtn);

    document.body.appendChild(popup);
    popup.style.display = 'block';
    popup.offsetHeight; // force reflow – very important on Safari

    // Use classic window values for initial clamp – more predictable on iOS
    requestAnimationFrame(() => {
        const rect = popup.getBoundingClientRect();

        let left = e.pageX + 9;
        let top = e.pageY + 9;

        const maxRight = window.innerWidth + window.scrollX - 7;
        const maxBottom = window.innerHeight + window.scrollY - 7;

        if (left + rect.width > maxRight) {
            left = e.pageX - rect.width - 5;
            if (left < window.scrollX + 7) left = window.scrollX + 7;
        }

        if (top + rect.height > maxBottom) {
            top = e.pageY - rect.height - 5;
            if (top < window.scrollY + 7) {
                top = window.scrollY + 7;
            }
        }

        left = Math.max(window.scrollX + 7, left);
        top = Math.max(window.scrollY + 7, top);

        popup.style.left = `${left}px`;
        popup.style.top = `${top}px`;
    });

    makeDraggable(popup);
}

function createFallback(href) {
    const div = document.createElement('div');
    div.className = 'comment-block';
    div.innerHTML = `
    <p style="font-style:italic;">
        <strong>TRẢLỜI ở Post-trước hoặc chưa-xácdịnh</strong><br><br>
        <a href="${href}" target="_blank">(Mở Tab-khác để xem)</a><br><br>
        ${href}
    </p>`;
    return div;
}



/**
 * Action Menu
 */
function initActionMenu() {
    const actionGroup = document.createElement('div');
    actionGroup.className = 'btn-action-group';

    // Helper to create button with label
    const createBtn = (icon, title, onClick, isSub = true, isHiddenOnClick = true) => {
        const container = document.createElement('div');
        container.className = `btn-item ${isSub ? 'btn-sub' : ''}`;

        const label = document.createElement('span');
        label.className = 'btn-label';
        label.innerText = title;

        const btn = document.createElement('button');
        btn.innerHTML = icon;
        btn.onclick = (e) => {
            onClick(e);
            if (isHiddenOnClick && isSub) {
                actionGroup.classList.remove('active');
            }
        };

        container.append(label, btn);
        return container;
    };

    const mainBtn = createBtn('⊹', '', () => actionGroup.classList.toggle('active'), false);

    const favBtn = createBtn('💎', 'Favorites', () => {
        document.querySelectorAll('.comment-block').forEach(block => {
            const authorLink = block.querySelector('.comment-header>a');
            if (typeof isFavoriteBlogger === 'function' && !isFavoriteBlogger(authorLink)) {
                block.classList.toggle('deactive');
            }
        });
    });

    const hashBtn = createBtn('#', 'Comment', () => {
        const hash = window.location.hash || '#ref-1';
        const el = document.querySelector(hash);
        if (el) {
            let parent = el.closest('details');
            if (parent && !parent.open) parent.open = true;
            setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 50);
        }
    });

    const updateFontSize = (delta) => {
        const root = document.documentElement;
        const currentSize = parseInt(getComputedStyle(root).getPropertyValue('--comment-font-size')) || 18;
        root.style.setProperty('--comment-font-size', `${currentSize + delta}px`);
    };

    const fontUpBtn = createBtn('+', 'Font Up', () => updateFontSize(1), true, false);
    const fontDownBtn = createBtn('-', 'Font Down', () => updateFontSize(-1), true, false);
    const topBtn = createBtn('↑', 'Top', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    const botBtn = createBtn('↓', 'Bottom', () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
    const prevBtn = createBtn('←', 'Prev', () => document.getElementById('goto-pre-post')?.click());
    const nextBtn = createBtn('→', 'Next', () => document.getElementById('goto-next-post')?.click());

    actionGroup.append(mainBtn, favBtn, topBtn, botBtn, hashBtn, prevBtn, nextBtn, fontUpBtn, fontDownBtn);
    document.body.appendChild(actionGroup);
}






/**
 * Create the .post-nav-btn(-s)
 */
async function addNavigationButtons() {
    await fetchJSON();
    if (JSON_POST_DATA.length > 0) {
        const BODY_CONTENT = document.querySelector('.content');

        const data = JSON_POST_DATA.flatMap(item => item.posts);

        const currentIndex = data.findIndex(post =>
            window.location.pathname.includes(post.link)
        );

        if (currentIndex === -1) return;

        const prevPost = data[currentIndex - 1];
        const nextPost = data[currentIndex + 1];

        const navContainer = document.createElement('div');
        navContainer.className = 'post-nav-container';

        navContainer.innerHTML = `
            ${prevPost ? `<a id="goto-pre-post" href="../../${prevPost.link}" class="post-nav-btn prev" title="${prevPost.title}">${prevPost.title}</a>` : '<span></span>'}
            <a href="../../" class="post-nav-btn home">𖠿</a>
            ${nextPost ? `<a id="goto-next-post" href="../../${nextPost.link}" class="post-nav-btn next" title="${nextPost.title}">${nextPost.title}</a>` : '<span></span>'}
        `;

        const pagePathName = window.location.pathname;

        // Helper to generate post rows
        const createPostRows = (posts) => posts.map(post => {
            const [year, month] = post.link.split('/');
            const dateStr = `${year}/${month}`;
            return `
                <div class="post-item-row ${pagePathName.includes(post.link) ? 'active' : ''}">
                    <span class="post-item-date">${dateStr}</span>
                    <div class="post-item-body">
                        <a href="../../${post.link}" class="post-item-link" title="${post.title}">${post.title}</a>
                        ${post.note ? `<span class="post-item-note">${post.note}</span>` : ''}
                    </div>
                </div>`;
        }).join('');

        // Labels Group
        const selectedLabel = document.querySelector('.post-label').textContent.trim().slice(1);
        const filteredByLabel = data.filter(p => p.label === selectedLabel);

        const postLabelContainer = document.createElement('div');
        postLabelContainer.innerHTML = `
        <details class="label-group">
            <summary class="label-title">⁀➴${selectedLabel}</summary>
            <div class="label-posts-list">${createPostRows(filteredByLabel)}</div>
        </details>`;

        // Year Group
        const currentYear = data[currentIndex].link.split('/')[0];
        const filteredByYear = data.filter(p => p.link.startsWith(currentYear));

        const postYearContainer = document.createElement('div');
        postYearContainer.innerHTML = `
        <details class="label-group">
            <summary class="label-title">⁀➴${currentYear}</summary>
            <div class="label-posts-list">${createPostRows(filteredByYear)}</div>
        </details>`;

        BODY_CONTENT.append(postLabelContainer, postYearContainer, navContainer);
    }
}






/**
 * Helpers
 */

function makeDraggable(el) {
    if (isPhone()) return;
    let isDragging = false;
    let startX, startY;           // rename for clarity
    let initialLeft, initialTop;

    el.addEventListener('pointerdown', (e) => {
        if (e.target.closest('.popup-close-btn') ||
            e.target.closest('a, button, input, textarea, select')) {
            return;
        }

        e.preventDefault(); // ← helps prevent iOS touch weirdness

        startX = e.clientX;
        startY = e.clientY;

        // Read current position right at pointerdown — this is critical
        const style = getComputedStyle(el);
        initialLeft = parseFloat(style.left) || 0;
        initialTop = parseFloat(style.top) || 0;

        isDragging = true;
        el.style.userSelect = 'none';
        el.style.cursor = 'grabbing';
        // Optional: el.classList.add('dragging'); for visual feedback

        document.addEventListener('pointermove', onMove, { passive: false });
        document.addEventListener('pointerup', onUp, { passive: false });
        document.addEventListener('pointercancel', onUp, { passive: false });
    });

    function onMove(e) {
        if (!isDragging) return;
        e.preventDefault();

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        const newLeft = initialLeft + deltaX;
        const newTop = initialTop + deltaY;

        // Optional: simple viewport clamp during drag (uncomment if needed)
        const rect = el.getBoundingClientRect();
        const minL = window.scrollX + 7;
        const minT = window.scrollY + 7;
        const maxL = window.innerWidth + window.scrollX - rect.width - 7;
        const maxT = window.innerHeight + window.scrollY - rect.height - 7;
        el.style.left = `${Math.max(minL, Math.min(maxL, newLeft))}px`;
        el.style.top = `${Math.max(minT, Math.min(maxT, newTop))}px`;

        //el.style.left = `${newLeft}px`;
        //el.style.top = `${newTop}px`;
    }

    function onUp() {
        isDragging = false;
        el.style.userSelect = '';
        el.style.cursor = '';
        // el.classList.remove('dragging');

        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        document.removeEventListener('pointercancel', onUp);
    }
}

function isPhone() {
    return /Mobi|Android|iPhone|iPad|iPod|Windows Phone|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        ('ontouchstart' in window && window.innerWidth <= 1024);
};
function isZZ(authorLink) {
    const ids = ['06324965406194061835', '06344674862451687914', '08901517722071939298', 'an_hoang_trung_tuong'];
    return authorLink && ids.some(id => authorLink.href.endsWith(id));
}

function isFavoriteBlogger(authorLink) {
    const ids = ['06324965406194061835', '06344674862451687914', '08901517722071939298', 'an_hoang_trung_tuong'];
    return authorLink && ids.some(id => authorLink.href.endsWith(id));
}

function lightenForDarkMode(hexColor, amount = 25) {
    // Convert hex to HSL, increase lightness, convert back
    let r = parseInt(hexColor.slice(1, 3), 16);
    let g = parseInt(hexColor.slice(3, 5), 16);
    let b = parseInt(hexColor.slice(5, 7), 16);

    // Simple RGB → HSL (approximate)
    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    // Increase lightness in dark mode
    l = Math.min(0.95, l + amount / 100);

    // Convert HSL back to RGB (simplified version - or use a library)
    // For simplicity, here's a direct brightening fallback:
    return lightenRGB(hexColor, 45); // fallback to RGB boost
}

// Quick RGB version (good enough for most cases)
function lightenRGB(hex, amount) {
    let r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount);
    let g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount);
    let b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}


/**
 * 
 * 
 * 
 * 
 * BBCODES
 * 
 * 
 * 
 * 
 * 
 */
function parseCustomTags(container) {
    let html = container.innerHTML;

    // Replace [img=URL] and [fim=URL] with placeholders
    html = html.replace(/\[img=(.+?)\]/g, '<span class="img-placeholder" data-src="$1" data-type="img"></span>');
    html = html.replace(/\[fim=(.+?)\]/g, '<span class="img-placeholder" data-src="$1" data-type="fim"></span>');
    html = html.replace(/\[youtube=(.+?)\]/g, '<iframe class="youtube-link" src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe>');

    container.innerHTML = html;

    // Process placeholders
    const placeholders = container.querySelectorAll('.img-placeholder');
    placeholders.forEach(span => {
        const src = span.getAttribute('data-src');
        const type = span.getAttribute('data-type');
        const imgElement = document.createElement('img');
        imgElement.src = src;
        imgElement.className = type === 'img' ? 'img-link' : 'fim-link';

        // Only check [img=...] for width
        if (type === 'img') {
            imgElement.onload = () => {
                if (imgElement.width > 200) {
                    imgElement.classList.add('big-img'); // Add class without removing img-link
                }
            };
        }
        span.replaceWith(imgElement);
    });
}

/**
 * 
 * 
 * 
 * 
 * TEM/PHIẾU
 * Stamps-n-cards
 * 
 * 
 * 
 * 
 */

function parseBwaStyle(commentBlock) {
    const commentHeader = commentBlock.querySelector('.comment-header');
    let commentStamp = commentHeader.querySelector('.comment-stamp');
    if (!commentStamp) {
        commentStamp = document.createElement('a');
        commentStamp.className = 'comment-stamp';


        const authorLink = commentBlock.querySelector('.comment-header > a');
        const commentBody = commentBlock.querySelector('.comment-body');

        if (!authorLink || !commentBody || !BWA_DATA.members) return;

        const href = authorLink.getAttribute('href') || '';
        const authorId = href.split('/').pop();
        if (!authorId) return;

        const { UserVIPs, UserBLs, numIndexVip1, numIndexVip2 } = BWA_DATA.members;

        // 1. Handle Blacklist (Matches first, exits if found)
        if (UserBLs) {
            for (const bl of UserBLs) {
                const ids = bl[0].replace(/[()]/g, '').split('|');
                if (ids.includes(authorId)) {
                    commentBody.textContent = bl[4];
                    commentBody.style.fontStyle = 'italic';
                    commentBody.style.color = '#888';
                    return;
                }
            }
        }

        // 2. Handle VIPs & Icons
        if (UserVIPs) {
            for (let i = 0; i < UserVIPs.length; i++) {
                const vips = UserVIPs[i];
                const ids = vips[0].replace(/[()]/g, '').split('|');

                if (ids.includes(authorId)) {
                    // Determine VIP Rank Image - skip if i === 0 (the first member)
                    if (i > 0) {
                        const rankIndex = i + 1; // 1-based index for logic
                        let vipImgSrc = globalThis.urlVip3Avatar;

                        if (rankIndex <= numIndexVip1) {
                            vipImgSrc = globalThis.urlVip1Avatar;
                        } else if (rankIndex <= (numIndexVip1 + numIndexVip2)) {
                            vipImgSrc = globalThis.urlVip2Avatar;
                        }

                        const vipImg = document.createElement('img');
                        vipImg.src = vipImgSrc;
                        vipImg.className = 'bwa-vip-rank';
                        commentStamp.appendChild(vipImg);
                    }

                    // Handle Stamps/Cards (Index 8: e.g., "vc,cd")
                    // This still runs for the first member
                    const stampKeys = vips[8] ? vips[8].split(',') : [];
                    stampKeys.forEach(key => {
                        const cleanKey = key.trim();
                        if (globalThis.urlIdAvatars[cleanKey]) {
                            const [src, title] = globalThis.urlIdAvatars[cleanKey];
                            const stampImg = document.createElement('img');
                            stampImg.src = src;
                            stampImg.title = title;
                            stampImg.className = 'bwa-stamp';
                            commentStamp.appendChild(stampImg);
                        }
                    });

                    // Apply Body Styles
                    if (vips[3] && i > 0) {
                        let finalColor = vips[3];
                        // Check if user prefers dark mode
                        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                            finalColor = lightenRGB(vips[3], 120);   // Increase this number (30-70) for more/less brightening
                        }

                        commentBody.style.color = finalColor;
                    };
                    if (vips[4]) {
                        commentBody.style.fontFamily = vips[4];
                    }
                    break;
                }
            }
        }
        commentHeader.appendChild(commentStamp);
    }
}



globalThis.urlIdAvatars = {};
globalThis.resourcesLocation = 'https://cdn.jsdelivr.net/gh/antonroch/blogger';
globalThis.iconImageLocation = `${resourcesLocation}/img`;
//
//////////////////////////////////////////////////
//
globalThis.urlVip1Avatar = `${iconImageLocation}/is_vip02.jpg`;
globalThis.urlVip2Avatar = `${iconImageLocation}/is_vip03.jpg`;
globalThis.urlVip3Avatar = `${iconImageLocation}/is_vip04.gif`;
// Stamps-n-cards:
urlIdAvatars['00'] = [`${iconImageLocation}/i_quanbua2.gif`, 'L&#227;nht&#7909; t&#224;nb&#7841;o manh&#273;&#7897;ng'];
urlIdAvatars['th'] = [`${iconImageLocation}/i_tinhhoa.gif`, 'Tinhhoa phongnh&#227; baola'];
urlIdAvatars['vs'] = [`${iconImageLocation}/i_vangson.gif`, 'V&#224;ngson m&#7855;t s&#7855;c m&#244;ng to &#273;&#249;i tr&#242;n'];
urlIdAvatars['bn'] = [`${iconImageLocation}/i_bannong.gif`, 'B&#7847;nn&#244;ng m&#7891;m &#273;&#7887; c&#7855;n nhanh'];
urlIdAvatars['jh'] = [`${iconImageLocation}/i_jahoi.gif`, 'C&#225;cm&#225;c gi&#224;h&#243;i, c&#7845;m th&#7857;ng m&#224;y tr&#234;u'];
urlIdAvatars['tt'] = [`${iconImageLocation}/i_tintin.gif`, 'Tintin ch&#432;a m&#7845;t trinh &#273;&#226;u'];
urlIdAvatars['db'] = [`${iconImageLocation}/i_daibang.gif`, '&#272;&#7841;ib&#224;ng b&#7909;ng c&#243;c d&#225;i m&#232;o tai d&#417;i'];
urlIdAvatars['mt'] = [`${iconImageLocation}/i_momthoi.gif`, 'M&#245;m th&#7889;i, bam su&#7889;t b&#7843;y ng&#224;y'];
urlIdAvatars['oq'] = [`${iconImageLocation}/i_ocquat.gif`, '&#211;c qu&#7845;t, kh&#244;n nh&#7845;t Qu&#225;n n&#224;y con &#417;i'];
urlIdAvatars['ld'] = [`${iconImageLocation}/i_liudan.gif`, 'L&#7921;u&#273;&#7841;n gi&#7853;t ch&#7889;t qu&#259;ng ngay'];
urlIdAvatars['td'] = [`${iconImageLocation}/i_thandit.gif`, 'Th&#7847;n &#273;&#7883;t, ch&#417;i kh&#233;o, v&#259;n hay, c&#7863;c d&#224;i'];
urlIdAvatars['vc'] = [`${iconImageLocation}/i_daubo.gif`, '&#272;&#7847;u b&#242;, b&#7843;oth&#7911; thi&#234;nt&#224;i'];
urlIdAvatars['sl'] = [`${iconImageLocation}/i_salong.gif`, 'Sal&#244;ng th&#225;nh g&#250;c mi&#7879;tm&#224;i l&#224; &#273;&#226;y'];
urlIdAvatars['lx'] = [`${iconImageLocation}/i_loxo.gif`, 'L&#242;xo b&#7853;t m&#227;i kh&#244;ng ngu&#244;i'];
urlIdAvatars['eo'] = [`${iconImageLocation}/i_echop.gif`, '&#7870;ch ng&#7891;i &#273;&#225;y gi&#7871;ng, bi&#7871;t &#273;&#7901;i n&#224;o ngon'];
urlIdAvatars['cs'] = [`${iconImageLocation}/i_casau.gif`, 'C&#225;s&#7845;u m&#7863;t x&#7845;u v&#227;i l&#7891;n'];
urlIdAvatars['xl'] = [`${iconImageLocation}/i_xilip.gif`, 'Xil&#237;p h&#7891;ng t&#237;m cho ch&#224;ng hai-phai'];
urlIdAvatars['oc'] = [`${iconImageLocation}/i_ongcu.gif`, 'Anh C&#7909; r&#259;ng b&#7921;a r&#226;u th&#432;a'];
urlIdAvatars['ol'] = [`${iconImageLocation}/i_ongle.gif`, 'Anh Le ph&#225;tx&#237;t r&#226;u nh&#432; qu&#7843; m&#236;n'];
urlIdAvatars['om'] = [`${iconImageLocation}/i_ongmao.gif`, 'Anh Mao r&#226;u c&#7841;o s&#7841;ch tr&#417;n'];
urlIdAvatars['on'] = [`${iconImageLocation}/i_ongnin.gif`, 'Anh Nin r&#226;u m&#7885;c tr&#249;m quanh quai h&#224;m'];
urlIdAvatars['bc'] = [`${iconImageLocation}/i_boncau.gif`, 'X&#237; b&#7879;t, n&#244;n kh&#7841;c khai m&#249;'];
urlIdAvatars['cd'] = [`${iconImageLocation}/i_chuidit.gif`, 'Gi&#7845;y l&#244;, nh&#245;n &#273;&#225;m ph&#242; qu&#234; m&#7899;i d&#249;ng'];
urlIdAvatars['tb'] = [`${iconImageLocation}/i_taobon.gif`, 'T&#225;ob&#243;n t&#7915; s&#225;ng t&#7899;i &#273;&#234;m'];
urlIdAvatars['tv'] = [`${iconImageLocation}/i_tinvit.gif`, 'Chuy&#234;n tung tin v&#7883;t, &#7843;o h&#417;n loa ph&#432;&#7901;ng'];
urlIdAvatars['tz'] = [`${iconImageLocation}/i_tongzat.gif`, 'Em to&#7885;c: M&#7865;o, M&#225;n, T&#224;y, M&#432;&#7901;ng'];
urlIdAvatars['dance'] = [`${iconImageLocation}/dance.gif`, 'Guerrilla: Zuk&#237;ch Chim B&#432;&#417;ng'];
urlIdAvatars['fun'] = [`${iconImageLocation}/fun.gif`, 'Actress: V&#361; C&#244;ng V&#250; B&#7921;'];
urlIdAvatars['hit'] = [`${iconImageLocation}/hit.gif`, 'Policeman: Daoph&#7911; C&#7843;nhbinh'];
urlIdAvatars['hug'] = [`${iconImageLocation}/hug.gif`, 'Teacher: Gi&#225;o Gi&#7843;ng Tr&#432;&#7901;ng L&#224;ng'];
urlIdAvatars['kiss'] = [`${iconImageLocation}/kiss.gif`, 'Capitalist: T&#432;b&#7843;n S&#224;ilang'];
urlIdAvatars['laugh'] = [`${iconImageLocation}/laugh.gif`, 'Communist: D&#7843;ngvi&#234;n Ho&#224;nt&#7909;c'];
urlIdAvatars['think'] = [`${iconImageLocation}/think.gif`, 'Wanking Netizen: Trai T&#226;n S&#243;c L&#7885;'];
urlIdAvatars['ship'] = [`${iconImageLocation}/ship.gif`, 'Shipping Biker: Ch&#7841;y Ch&#7907; Xe &#212;m'];
urlIdAvatars['show'] = [`${iconImageLocation}/show.gif`, 'Fucking Bastard: S&#7871;p Nh&#7899;n H&#7871;t X&#232;ng'];
urlIdAvatars['ride'] = [`${iconImageLocation}/ride.gif`, 'Homeless Wanderer: Langthang Kh&#244;ng Nh&#224; Kh&#244;ng C&#7917;a'];











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
    // Button to toogle post of ZZ and some kol
    initActionMenu();

    // Observer postBody
    const postBody = document.querySelector('.post-body');
    if (postBody) {
        if (typeof observerPostBodyBlock !== 'undefined') {
            observerPostBodyBlock.observe(postBody);
        } else {
            parseCustomTags(postBody);
        }
    }
    // Observer commentBlocks
    const commentBlocks = document.querySelectorAll('.comment-block');
    if (typeof observerCommentBlock !== 'undefined') {
        commentBlocks.forEach(commentBlock => {
            const commentAuthor = commentBlock.querySelector('.comment-header>a');
            if (commentAuthor && typeof isZZ === 'function' && isZZ(commentAuthor)) {
                commentBlock.classList.add('comment-zz');
            }
            const commentRefID = commentBlock.querySelector('.comment-header>i>a');
            commentBlock.id = 'ref-' + commentRefID.textContent.slice(1, -1);
            observerCommentBlock.observe(commentBlock);
        });
    }
    // Prev/Next Post
    addNavigationButtons();

    // Events
    document.addEventListener('click', handleBodyClick, false);
});