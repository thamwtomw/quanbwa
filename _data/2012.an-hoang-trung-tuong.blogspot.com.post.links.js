const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');

const SITE_URL = 'https://an-hoang-trung-tuong.blogspot.com';

async function generateFiles() {
    let allPosts = [];
    let startIndex = 1;
    const maxResults = 150;
    let fetchMore = true;

    console.log(`Fetching from ${SITE_URL}...`);

    while (fetchMore) {
        try {
            const feedUrl = `${SITE_URL}/feeds/posts/default?alt=rss&start-index=${startIndex}&max-results=${maxResults}`;
            const response = await axios.get(feedUrl);
            const result = await (new xml2js.Parser()).parseStringPromise(response.data);

            const items = result.rss.channel[0].item;

            if (!items || items.length === 0) {
                fetchMore = false;
                break;
            }

            const posts = items.map(item => {
                // 1. Title is straightforward
                const title = item.title ? item.title[0] : 'No Title';

                // 2. Link is a direct string in RSS <item>
                const link = item.link ? item.link[0] : '#';

                // 3. Category (The Fix): 
                // In your XML, it looks like: <category ...>Chém-gió</category>
                // xml2js usually parses this as item.category[0]._ (if attributes exist) 
                // or just item.category[0]
                let cat = 'Uncategorized';
                if (item.category && item.category[0]) {
                    cat = (typeof item.category[0] === 'object' ? item.category[0]._ : item.category[0])
                        .replace(/[*-]/g, '')
                        .replace(/Đ/g, 'D')
                        .replace(/đ/g, 'd')
                        .replace(/D/g, 'Z')
                        .replace(/d/g, 'z');
                }

                return { title, link, cat };
            });

            allPosts.push(...posts);
            console.log(`Fetched ${posts.length} posts. Total: ${allPosts.length}`);

            // Increment by actual items received
            startIndex += items.length;

            // If we got less than max, we reached the end
            if (items.length < maxResults) fetchMore = false;

        } catch (error) {
            console.error("Error fetching feed:", error.message);
            fetchMore = false;
        }
    }

    // 1. Create JSON file
    fs.writeFileSync('2012.json', JSON.stringify(allPosts, null, 2));

    // 2. Create HTML file
    // 1. Reverse and Group by Year
    const groupedPosts = allPosts.slice().reverse().reduce((acc, post) => {
        const parts = post.link.split('/');
        const year = parts[3];
        const month = parts[4];

        if (!acc[year]) acc[year] = [];
        acc[year].push({
            post: post,
            month_year: `${year}/${month}`
        });
        return acc;
    }, {});

    // 2. Generate HTML
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>2012 (2008-2014)</title>
    <style>
        body {
                margin: 0 auto;
                display: block;
                max-width: 700px;
                font-family: sans-serif;
                line-height: 1.6;
                padding: 20px;
        }

        h2 {
                cursor: pointer;
                background: #f4f4f4;
                border-radius: 5px;
                padding: 5px 10px;
        }

        h2 sub {
                margin-left: 7px;
                font-weight: normal;
        }

        sub,
        sup {
                font-family: monospace;
                font-size: 10px;
                padding: 2px 5px;
                border-radius: 5px;
                user-select: none;
                -webkit-user-select: none;
        }

        a>sub {
                background-color: #0066cc;
                color: #f4f4f4;
        }

        a {
                text-decoration: none;
                color: #0066cc;
        }

        a:hover {
                text-decoration: underline;
        }



        .post.deactive {
                display: none;
        }

        .post {
                padding-left: 10px;
                border-bottom: 1px solid #f4f4f4;
                display: flex;
                flex-direction: row;
                align-items: center;
                gap: 10px;
                margin-bottom: 8px;
        }

        .post-tag {
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 2px;
                line-height: 1;
                width: 80px;
        }

        .post-datetime,
        .post-label {
                vertical-align: baseline;
                position: static;
                text-align: center;
        }

        .post-datetime {
                background-color: #f4f4f4;
        }

        .post-label {
                background-color: orange;
                color: #f4f4f4;
        }
    </style>
</head>
<body>
    ${Object.keys(groupedPosts).sort((a, b) => b - a).reverse().map(year => `
    <div class="year">
        <h2>${year}</h2>
        ${groupedPosts[year].map(item => `
        <div class="post">
            <div class="post-tag">
                <sup class="post-datetime">${item.month_year}</sup>
                <sub class="post-label">${item.post.cat}</sub>
            </div>
            <sup class="post-datetime"></sup> 
            <a href="${item.post.link}" target="_blank">${item.post.title}</a>
        </div>`).join('')}
    </div>`).join('')}
    <script>
        window.addEventListener('load', () => {
            // Select all year containers
            const years = document.querySelectorAll('.year');

            years.forEach(year => {
                const h2 = year.querySelector('h2');
                const posts = year.querySelectorAll('.post');

                // 1. Count posts and update the H2
                if (h2) {
                    const count = posts.length;
                    const sup = document.createElement('sub');
                    sup.className = 'post-count';
                    sup.textContent = count + ' posts';
                    h2.appendChild(sup);

                    // 2. Add click event to toggle .active class on posts
                    h2.addEventListener('click', () => {
                        posts.forEach(post => {
                            post.classList.toggle('deactive');
                        });
                    });
                }
            });
        });
    </script>
</body>
</html>`;

    fs.writeFileSync('2012.html', htmlContent);
    console.log('\nSuccess: created 2012.json and 2012.html');
}

generateFiles();