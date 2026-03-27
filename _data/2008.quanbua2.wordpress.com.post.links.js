const axios = require('axios');
const fs = require('fs');

const SITE = 'quanbua2.wordpress.com';
const API_URL = `https://public-api.wordpress.com/wp/v2/sites/${SITE}/posts`;

async function generateFiles() {
    let allPosts = [];
    let page = 1;
    let totalPages = 1;

    console.log(`Fetching from ${SITE}...`);

    try {
        while (page <= totalPages) {
            const response = await axios.get(API_URL, {
                params: {
                    page: page,
                    per_page: 100, // Max allowed by WP API
                    _fields: 'title,link,date,categories' // Only fetch what we need
                }
            });

            // Update total pages from header on first request
            if (page === 1) {
                totalPages = parseInt(response.headers['x-wp-totalpages']) || 1;
            }

            const posts = response.data.map(post => {
                const dateObj = new Date(post.date);
                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');

                return {
                    title: post.title.rendered,
                    link: post.link,
                    cat: "Post", // WP categories are IDs; using "Post" for simplicity
                    year: year,
                    month_year: `${year}/${month}`
                };
            });

            allPosts.push(...posts);
            console.log(`Page ${page}/${totalPages} fetched. Total: ${allPosts.length}`);
            page++;
        }

        // Grouping
        const groupedPosts = allPosts.reduce((acc, post) => {
            if (!acc[post.year]) acc[post.year] = [];
            acc[post.year].push(post);
            return acc;
        }, {});

        // HTML Generation (Simplified version of your template)
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Archive: ${SITE}</title>
    <style>
        body { margin: 0 auto; max-width: 700px; font-family: sans-serif; padding: 20px; line-height: 1.6; }
        .year-sec { margin-bottom: 20px; }
        h2 { cursor: pointer; background: #f4f4f4; padding: 10px; border-radius: 5px; }
        .post { display: flex; gap: 15px; margin-bottom: 5px; border-bottom: 1px solid #eee; align-items: center; }
        .post-tag { font-size: 10px; background: #0066cc; color: #fff; padding: 2px 5px; border-radius: 3px; min-width: 50px; text-align: center; }
        .date { font-family: monospace; color: #666; }
        a { text-decoration: none; color: #0066cc; }
        .hidden { display: none; }
    </style>
</head>
<body>
    <h1>${SITE} Archive</h1>
    ${Object.keys(groupedPosts).sort((a, b) => b - a).map(year => `
        <div class="year-sec">
            <h2 onclick="this.nextElementSibling.classList.toggle('hidden')">${year} (${groupedPosts[year].length} posts)</h2>
            <div class="post-list">
                ${groupedPosts[year].map(p => `
                    <div class="post">
                        <span class="date">${p.month_year}</span>
                        <span class="post-tag">${p.cat}</span>
                        <a href="${p.link}" target="_blank">${p.title}</a>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('')}
</body>
</html>`;

        fs.writeFileSync('2008.json', JSON.stringify(allPosts, null, 2));
        fs.writeFileSync('2008.html', htmlContent);
        console.log('\nSuccess! Created archive.json and archive.html');

    } catch (error) {
        console.error("Error:", error.response ? error.response.data.message : error.message);
    }
}

generateFiles();