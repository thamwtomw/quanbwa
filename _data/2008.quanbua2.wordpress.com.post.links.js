const axios = require('axios');
const fs = require('fs');

const SITE = 'quanbua2.wordpress.com';
const API_URL = `https://public-api.wordpress.com/wp/v2/sites/${SITE}/posts`;

async function getAllPostData() {
    let page = 1;
    let allPosts = [];
    let fetchMore = true;

    console.log(`Fetching from ${SITE}...`);

    while (fetchMore) {
        try {
            const response = await axios.get(API_URL, {
                params: {
                    per_page: 100,
                    page: page,
                    _fields: 'title,link' // Fetching both title and link
                }
            });

            if (response.data.length === 0) break;

            const posts = response.data.map(post => ({
                title: post.title.rendered, // WordPress titles are nested in 'rendered'
                link: post.link
            }));

            allPosts.push(...posts);
            console.log(`Page ${page} fetched. Total: ${allPosts.length}`);
            page++;
        } catch (error) {
            fetchMore = false;
        }
    }

    // 1. Save JSON File
    fs.writeFileSync(`2008.json`, JSON.stringify(allPosts, null, 2));

    // 2. Save HTML File
    let lastYear = "", postYear = 0;
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Yahoo 2008 Archive</title>
    <style>
        body { font-family: sans-serif; padding: 20px; line-height: 1.6; margin: 0 auto; max-width: 700px; }
        h3 { border-bottom: 2px solid #999; padding-bottom: 10px; }
        ul { list-style: none; padding: 0; display: flex; flex-direction: column-reverse; }
        li { padding: 8px 0; border-bottom: 1px solid #999; }
        a { text-decoration: none; color: #0066cc; font-size: 1.1em; }
        a:hover { text-decoration: none; color: #004499; }
        sup { font-weight: bold; color: #999; }
    </style>
</head>
<body>
    <h3>${SITE} Archive (${allPosts.length} posts)</h3>
    <ul>
        ${allPosts.map(p => {
        const s = p.link.split('/');
        const year = s[3];
        let yearHeader = "";

        if (year !== lastYear) {
            yearHeader = `<li style="background-color: #999; color: #999">${year} - ${postYear} posts</li>`;
            lastYear = year;
            postYear = 0;
        }
        postYear++;
        return `${yearHeader}<li><sup>[${year}/${s[4]}/${s[5]}]</sup> <a href="${p.link}" target="_blank">${p.title}</a></li>`;
    }).join('')}
    </ul >
</body>
</html>`;

    fs.writeFileSync(`2008.html`, htmlContent);
    console.log(`\nSuccess! Created 2008.json and 2008.html`);
}

getAllPostData();