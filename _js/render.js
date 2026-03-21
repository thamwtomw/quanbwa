
document.addEventListener("DOMContentLoaded", () => {
    wrapPostsAndComments();

    if (typeof addFavoriteBloggerToogleBtn === "function") {
        addFavoriteBloggerToogleBtn();
    }

    const postBody = document.querySelector('.post-body');
    if (postBody) parseCustomTags(postBody);

    const commentBlocks = document.querySelectorAll('.comment-block');
    if (typeof observerCommentBlock !== "undefined") {
        commentBlocks.forEach(commentBlock => {
            const commentAuthor = commentBlock.querySelector('.comment-header>a');
            if (commentAuthor && typeof isZZ === "function" && isZZ(commentAuthor)) {
                commentBlock.classList.add('comment-zz');
            }
            observerCommentBlock.observe(commentBlock);
        });
    }
});



/**
 * Observer .c (comment-block)
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
    const commentBody = commentBlock.querySelector('.comment-body');
    addCommentRef(commentBody);
    parseCustomTags(commentBody);
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
document.addEventListener('click', handleCommentRefClick, false);

function handleCommentRefClick(e) {
    const ref = e.target.closest('.comment-ref');
    if (ref) {
        e.preventDefault();
        e.stopPropagation();
        showPopupComment(e, ref);
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

    const popup = commentNode
        ? commentNode.cloneNode(true)
        : createFallback(ref.href);

    popup.classList.add('popup-comment');

    const closeBtn = document.createElement('button');
    closeBtn.className = 'popup-close-btn';
    closeBtn.type = 'button';

    closeBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        popup.remove();
    });

    popup.prepend(closeBtn);
    processCommentBlock(popup);
    // Inside showPopupComment, after processCommentBlock (if any)

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
    div.innerHTML = `
    <p style="font-style:italic;">
        <strong>TRẢLỜI ở Post-trước hoặc chưa-xácdịnh</strong><br><br>
        <a href="${href}" target="_blank">(Mở Tab-khác để xem)</a><br><br>
        ${href}
    </p>`;
    return div;
}


















/**
 * Create the zizun-btn
 */
function addFavoriteBloggerToogleBtn() {
    const favoriteBloggerToogleBtn = document.createElement('button');
    favoriteBloggerToogleBtn.id = 'btn-zz';
    document.body.appendChild(favoriteBloggerToogleBtn);
    // Add the click event listener to toggle comment blocks
    favoriteBloggerToogleBtn.addEventListener('click', () => {
        const commentBlocks = document.querySelectorAll('.comment-block');
        if (commentBlocks) {
            commentBlocks.forEach(commentBlock => {
                const authorLink = commentBlock.querySelector('.comment-header>a');
                if (!isFavoriteBlogger(authorLink)) {
                    commentBlock.classList.toggle('deactive');
                }
            });
        }
    });
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

const isPhone = () => {
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
function wrapPostsAndComments() {
    document.querySelectorAll('.post-body').forEach(post => {
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        const postTitle = post.querySelector('.post-title');
        summary.classList.add('post-summary');
        summary.textContent = postTitle ? postTitle.textContent : 'Post';
        if (postTitle) postTitle.remove();

        details.appendChild(summary);
        post.before(details);       // Insert details into DOM first
        details.appendChild(post);   // Then move post inside details
    });

    document.querySelectorAll('.post-comment-page').forEach((commentPage, index) => {
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        summary.textContent = `Page: ${index + 1}`;

        details.appendChild(summary);
        commentPage.before(details);   // Insert details before commentPage
        details.appendChild(commentPage); // Then move commentPage inside details
    });
}