const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const TurndownService = require('turndown');
const turndownService = new TurndownService();

/**
 * 
 * Try newLine (create a function insteads of using text())
 * 
 * 
 * Add Safety Measure
 * 
 * 
 * 
 * 
 */



let jsonData = [

    {
        "year": "2008",
        "note": "",
        "posts": [
            {
                "title": "Tự Bạch",
                "link": "2008/05/tu-bach.html",
                "date": "21/05",
                "label": "Thôngbáo",
                "note": null

            }, {
                "title": "Mất tân",
                "link": "2008/05/mat-tan.html",
                "date": "21/05",
                "label": "Truyệnngắn",
                "note": null

            }, {
                "title": "Gianghồ cỏ [1]",
                "link": "2008/05/giangho-co-1.html",
                "date": "21/05",
                "label": "Phóngsự",
                "note": null
            }]
    },
    {
        "year": "2012",
        "note": "",
        "posts": [
            {
                "title": "Valentine's song",
                "link": "2012/02/valentines-song.html",
                "date": "12/02",
                "label": "Bựanhạc",
                "note": "penultimate of yahoo"

            }, {
                "title": "Ryo The Hooligan (Riô Cônđồ)",
                "link": "2012/03/ryo-hooligan-rio-cono.html",
                "date": "13/03",
                "label": "Tùybút",
                "note": null

            }, {
                "title": "NOW MOVE: GIÃ-BIỆT ZAHU",
                "link": "2012/03/now-move-gia-biet-zahu-p1.html",
                "date": "20/03",
                "label": "Thôngbáo",
                "note": null

            }, {
                "title": "The story of St Jong",
                "link": "2012/03/the-story-of-st-jong-yahoo.html",
                "date": "21/03",
                "label": "Bựathơ",
                "note": "end of yahoo"

            }, {
                "title": "The story of St Jong (Thánh Jóng) #1",
                "link": "2012/03/story-of-st-jong-thanh-jong.html",
                "date": "13/03",
                "label": "Bựathơ",
                "note": null

            }, {
                "title": "The story of St Jong (Thánh Jóng) #2",
                "link": "2012/03/story-of-st-jong-thanh-jong-2.html",
                "date": "26/03",
                "label": "Bựathơ",
                "note": null

            }, {
                "title": "Shit-corp Rearrangement (Quán Bựa Cảitạo)",
                "link": "2012/03/shit-corp-rearrangement-quan-bua-caitao.html",
                "date": "28/03",
                "label": "Thôngbáo",
                "note": null

            }
        ]
    },
    {
        "year": "2021",
        "note": "",
        "posts": [
            {
                "title": "BIRD STORIES: CHUYỆN CHIM [2]",
                "link": "2021/01/bird-stories-chuyen-chim-2.html",
                "date": "27/01",
                "label": "Tùybút",
                "note": null

            }, {
                "title": "QUÁN BỰA 13 MÙA BÁOCÁO",
                "link": "2021/05/quan-bua-13-mua-baocao.html",
                "date": "21/05",
                "label": "Thôngbáo",
                "note": null

            }, {
                "title": "QUÁN BỰA 8 MÙA XÈNGMẠNG",
                "link": "2021/09/quan-bua-8-mua-xengmang.html",
                "date": "08/09",
                "label": "Côngnghệ",
                "note": null

            }
        ]
    }


]













jsonData = require('../AHTT/_data/full_post.json');
const outputDir = 'ahtt_only_md_basic_blgLink';
const logFile = 'txtMaker.log';












const ARCHIVE_LINK = 'https://not-an-hoang-trung-tuong.blogspot.com/';
function isZZ(authorLink) {
    const ids = ['06324965406194061835', '06344674862451687914', '08901517722071939298', 'an_hoang_trung_tuong'];
    return authorLink && ids.some(id => authorLink.endsWith(id));
}

/**
 * Helper: Replaces all whitespace with underscores
 */
const formatHeader = (text) => {
    return text.trim().replace(/\s+/g, '_');
};


/**
 * Helper: Ensures the text ends with a valid punctuation mark

const formatBody = (text) => {
    // 1. Replace all sequences of whitespace (including \n) with a single space
    let cleaned = text.replace(/\s+/g, ' ').trim();
    return cleaned;
    //if (!cleaned) return "";

    // 2. Check for existing punctuation
    //const lastChar = cleaned.slice(-1);
    //const validEnds = ".?!,:;\"'])}";

    // 3. Add dot if missing
    //return validEnds.includes(lastChar) ? cleaned : `${cleaned}. `;
};
 */


/**
 * @param {cheerio.Cheerio} element - A Cheerio object
 * @returns {string} - Flattened Markdown with appropriate punctuation
 */
const formatBody = (element) => {
    if (!element || element.length === 0) return "";

    // 1. DOM Pre-processing: Convert custom tags to HTML
    let htmlContent = element.html();

    // Replace [img=link] with temporary HTML link
    htmlContent = htmlContent.replace(/\[img=(.*?)\]/g, '<a href="$1">[IMAGE]</a>');

    // Replace [youtube=id] with temporary HTML link
    htmlContent = htmlContent.replace(/\[youtube=(.*?)\]/g, '<a href="https://www.youtube.com/watch?v=$1">[YOUTUBE]</a>');

    // 2. Conversion to Markdown
    let markdown = turndownService.turndown(htmlContent);

    // 3. Remove all horizontal whitespace and ALL newlines
    // This collapses the entire document into a single line
    let flattezed = markdown.replace(/\s+/g, ' ').trim();

    if (!flattezed) return "";

    // 4. Punctuation Logic
    // Validates the final character against your specific requirement set
    const validEnds = ".?!,:;\"'])}*_";
    const lastChar = flattezed.slice(-1);

    const finalizez = validEnds.includes(lastChar)
        ? flattezed
        : `${flattezed}. `;

    return finalizez.trim();
};












async function scrapePosts() {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    const splitYears = [2010, 2011, 2012];

    for (const yearData of jsonData) {
        const year = parseInt(yearData.year);
        const allPosts = yearData.posts;

        const iterations = splitYears.includes(year) ?
            [{ suffix: "_01", posts: allPosts.slice(0, Math.ceil(allPosts.length / 2)) },
            { suffix: "_02", posts: allPosts.slice(Math.ceil(allPosts.length / 2)) }] :
            [{ suffix: "", posts: allPosts }];

        for (const part of iterations) {
            const fileName = `${year}${part.suffix}.md`;
            const filePath = path.join(outputDir, fileName);
            const writeStream = fs.createWriteStream(filePath, { flags: 'w' });

            const totalPostsInPart = part.posts.length;

            // --- 1. SYSTEM DIRECTIVE ---
            //writeArchiveHeader(writeStream, year, part, totalPostsInPart);
            let postIndex = 1;

            for (const post of part.posts) {
                try {
                    const URL_PATH = path.join('../AHTT/', post.link);
                    if (!fs.existsSync(URL_PATH)) {
                        throw new Error(`File not found: ${URL_PATH}`);
                    }

                    const html = fs.readFileSync(URL_PATH, 'utf8');
                    let $ = cheerio.load(html);

                    // --- DATA EXTRACTION ---
                    const title = post.title.trim() || "Untitled";
                    const orgUrl = `${ARCHIVE_LINK}${post.link}`;
                    const postTime = formatHeader($('.post-time').text());
                    const expectedCount = parseInt(($('.post-comment-count').text() || "0").replace(/\D/g, '')) || 0;

                    const commentBlocks = $('.comment-block');
                    const realCount = commentBlocks.length;

                    // 1. Header Metadata
                    writeStream.write(`StartOf [${title}](${orgUrl})\t${postTime}\n\n`);

                    const POST_LABEL = $('.post-label').text().slice(1) || "Uncategory"; // Label/Category

                    // 2. Body
                    $('.post-title, .post-time, .post-org-url, .post-label, .post-comment-count, .first-comment-time, .last-comment-time, .post-edited, .post-note').remove();
                    writeStream.write(`\`${POST_LABEL}\`\n\n${formatBody($('.post-body'))}\n\n`);

                    // 3. Comments
                    commentBlocks.each((_, el) => {
                        const block = $(el);
                        const authorLink = block.find('.comment-header > a').attr('href');
                        if (isZZ(authorLink)) {
                            //const cAuthor = formatHeader(block.find('.comment-header > a').text());
                            const cAuthor = 'Zì';
                            const cNo = block.find('.comment-header > i > a').text().trim();
                            const cTime = formatHeader(block.find('.comment-footer').first().text());
                            const cBody = formatBody(block.find('.comment-body'));

                            writeStream.write(`\_\_\_\n\n[${cNo} ${cTime} ${cAuthor}](${ARCHIVE_LINK}${post.link}#ref-${cNo.slice(1, -1)})\t${cBody}\n`);
                        }
                    });

                    // 4. Footer
                    writeStream.write(`\nEndOf ${title}\n\n\*\*\*\n\n`);

                    // Logging
                    const diff = expectedCount - realCount;
                    const logEntry = `${diff} (${expectedCount} - ${realCount} comments): ${URL_PATH} → ${fileName} (post ${postIndex})\n`;

                    fs.appendFileSync(logFile, logEntry);
                    console.log(logEntry.trim());

                    postIndex++;
                    $ = null; // help GC

                } catch (err) {
                    const errLog = `ERR: ${post.link} → ${err.message} (year ${year})\n`;
                    fs.appendFileSync(logFile, errLog);
                    console.error(errLog.trim());
                }
            }

            await new Promise((resolve) => {
                writeStream.on('finish', resolve);
                writeStream.end();
            });
        }
    }
    console.log("Process complete. Markdown files are ready for NotebookLM.");
}
scrapePosts();