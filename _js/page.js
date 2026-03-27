// <![CDATA[
document.documentElement.innerHTML = '';
document.addEventListener('DOMContentLoaded', () => {
    const site = 'https://cdn.jsdelivr.net/gh/thamwtomw/quanbwa/';
    
    // UPPERCASE ETAG KEYS
    const ETAG_CSS_KEY = 'ETAG_COMMON_CSS';
    const ETAG_INDEX_KEY = 'ETAG_INDEX_JS';
    const ETAG_PAGE_KEY = 'ETAG_PAGE_JS';

    let pagePart = location.pathname.substring(1);
    const isIndex = !pagePart || pagePart === 'index.html';
    const finalUrl = site + (isIndex ? 'index.html' : pagePart);

    if (pagePart.includes('xcafevn.htm')) {
        fetch(finalUrl).then(r => r.text()).then(html => {
            document.open(); document.write(html); document.close();
        }).catch(e => console.error(e));
        return;
    }

    fetch(finalUrl).then(r => r.text()).then(async (html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        doc.head.querySelectorAll('script, link[rel="stylesheet"]').forEach(el => el.remove());

        // ========================
        // 1. COMMON.CSS (UPPERCASE KEYS)
        // ========================
        async function loadCSS() {
            const url = `${site}_css/common.css`;
            const CONTENT_KEY = 'QUANBWA_COMMON_CSS'; // UPPERCASE
            try {
                const head = await fetch(url, { method: 'HEAD' });
                const currentEtag = head.headers.get('ETag');
                const savedEtag = localStorage.getItem(ETAG_CSS_KEY);
                let content = localStorage.getItem(CONTENT_KEY);

                if (content && currentEtag === savedEtag) {
                    injectCSS(content);
                } else {
                    const res = await fetch(url);
                    content = await res.text();
                    localStorage.setItem(CONTENT_KEY, content);
                    localStorage.setItem(ETAG_CSS_KEY, currentEtag);
                    injectCSS(content);
                }
            } catch (e) {
                const fallback = localStorage.getItem(CONTENT_KEY);
                if (fallback) injectCSS(fallback);
            }
        }

        // ========================
        // 2. JS FILES (UPPERCASE KEYS)
        // ========================
        async function loadScript() {
            const fileName = isIndex ? 'index_e.js' : 'page_e.js';
            const url = `${site}_js/${fileName}`;
            const CONTENT_KEY = isIndex ? 'QUANBWA_INDEX_JS' : 'QUANBWA_PAGE_JS'; // UPPERCASE
            const ETAG_KEY = isIndex ? ETAG_INDEX_KEY : ETAG_PAGE_KEY;

            try {
                const head = await fetch(url, { method: 'HEAD' });
                const currentEtag = head.headers.get('ETag');
                const savedEtag = localStorage.getItem(ETAG_KEY);
                let content = localStorage.getItem(CONTENT_KEY);

                if (content && currentEtag === savedEtag) {
                    injectScript(content);
                } else {
                    const res = await fetch(url);
                    content = await res.text();
                    localStorage.setItem(CONTENT_KEY, content);
                    localStorage.setItem(ETAG_KEY, currentEtag);
                    injectScript(content);
                }
            } catch (e) {
                const fallback = localStorage.getItem(CONTENT_KEY);
                if (fallback) injectScript(fallback);
            }
        }

        function injectCSS(cssText) {
            const style = doc.createElement('style');
            style.textContent = cssText;
            doc.head.appendChild(style);
            const fontLink = doc.createElement('link');
            fontLink.rel = 'stylesheet';
            fontLink.href = 'https://cdn.jsdelivr.net/gh/antonroch/blogger/fonts.css';
            doc.head.appendChild(fontLink);
        }

        function injectScript(jsText) {
            const script = doc.createElement('script');
            script.textContent = jsText;
            doc.head.appendChild(script);
        }

        await Promise.all([loadCSS(), loadScript()]);

        document.open();
        document.write(doc.documentElement.outerHTML);
        document.close();
    });
});
// ]]>