const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

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

            }, {
                "title": "QUÁN BỰA NOEL CHÚCTỤNG",
                "link": "2021/12/quan-bua-noel-chuctung.html",
                "date": "23/12",
                "label": "Thôngbáo",
                "note": null
            }
        ]
    }


]


jsonData = require('../_data/2008-2025.json'); // ← load your real items here



async function scrapePosts() {
    const logFile = path.join(__dirname, 'txtMaker.log');

    for (const yearData of jsonData) {
        const fileName = path.join(__dirname, `${yearData.year}.txt`);
        const writeStream = fs.createWriteStream(fileName, { flags: 'a' });

        for (const post of yearData.posts) {
            try {
                // Construct path to parent folder
                const URL_PATH = path.join(__dirname, '..', post.link);

                if (!fs.existsSync(URL_PATH)) {
                    throw new Error(`File not found`);
                }

                const html = fs.readFileSync(URL_PATH, 'utf8');
                let $ = cheerio.load(html);

                const title = $('.post-title').text().trim();
                const orgUrl = $('.post-org-url a').attr('href') || post.link;
                const postTime = $('.post-time').text().trim();

                writeStream.write(`\n___\n\nStart of post: ${title}\nLink: ${orgUrl}\nTime: ${postTime}\n\n`);

                $('.post-title, .post-time').remove();
                writeStream.write(`${$('.post-body').text().trim()}\n`);

                const commentBlocks = $('.comment-block');
                commentBlocks.each((_, el) => {
                    const block = $(el);
                    writeStream.write(`\n${block.find('.comment-header > a').text().trim()} ${block.find('.comment-header > i > a').text().trim()} said:\tat ${block.find('.comment-footer').first().text().trim()}\n\n${block.find('.comment-body').text().trim()}\n`);
                });

                writeStream.write(`\nEnd of post: ${title}\n`);

                // Log logic
                const expectedCount = parseInt(($('.post-comment-count').text() || "0").replace(/\D/g, '')) || 0;
                const realCount = commentBlocks.length;
                const logEntry = `${expectedCount - realCount} (${expectedCount} - ${realCount} comments): OK → ${post.link}\n`;

                fs.appendFileSync(logFile, logEntry);
                console.log(logEntry.trim());

                $ = null;
            } catch (err) {
                const errLog = `ERR: ${post.link} -> ${err.message}\n`;
                fs.appendFileSync(logFile, errLog);
                console.error(errLog.trim());
            }
        }
        writeStream.end();
    }
}


scrapePosts();