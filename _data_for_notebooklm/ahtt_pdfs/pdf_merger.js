const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

async function processPDFs() {
  const dir = './';
  // Get and sort PDF files A-Z
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.pdf'))
    .sort();

  // Group files by year (YYYY-...)
  const groups = {};
  files.forEach(f => {
    const year = f.split('-')[0];
    if (!groups[year]) groups[year] = [];
    groups[year].push(f);
  });

  for (const year in groups) {
    const mergedDoc = await PDFDocument.create();
    
    // Merge all files for this year
    for (const file of groups[year]) {
      const bytes = fs.readFileSync(path.join(dir, file));
      const doc = await PDFDocument.load(bytes);
      const copiedPages = await mergedDoc.copyPages(doc, doc.getPageIndices());
      copiedPages.forEach(page => mergedDoc.addPage(page));
    }

    const totalPages = mergedDoc.getPageCount();

    if (['2010', '2011', '2012', '2013', '2014'].includes(year) && totalPages > 1) {
      const mid = Math.floor(totalPages / 2);
      
      // Part 1
      const p1 = await PDFDocument.create();
      const p1Pages = await p1.copyPages(mergedDoc, Array.from({length: mid}, (_, i) => i));
      p1Pages.forEach(p => p1.addPage(p));
      fs.writeFileSync(`${year}_ahtt_01.pdf`, await p1.save());

      // Part 2
      const p2 = await PDFDocument.create();
      const p2Pages = await p2.copyPages(mergedDoc, Array.from({length: totalPages - mid}, (_, i) => i + mid));
      p2Pages.forEach(p => p2.addPage(p));
      fs.writeFileSync(`${year}_ahtt_02.pdf`, await p2.save());
      
      console.log(`Created ${year} Part 1 & 2`);
    } else {
      // Standard Merge
      fs.writeFileSync(`${year}_ahtt.pdf`, await mergedDoc.save());
      console.log(`Created ${year}_ahtt.pdf`);
    }
  }
}

processPDFs().catch(console.error);