import os
from pypdf import PdfWriter, PdfReader

# Get and sort files
files = sorted([f for f in os.listdir('.') if f.endswith('.pdf')])

# Group files by year (assumes format: YYYY-...)
years = {}
for f in files:
    year = f.split('-')[0]
    years.setdefault(year, []).append(f)

for year, fs in years.items():
    merger = PdfWriter()
    for f in fs:
        merger.append(f)
    
    # Logic for 2010, 2011, 2012
    if year in ['2010', '2011', '2012', '2013', '2014']:
        total_pages = len(merger.pages)
        mid = total_pages // 2
        
        # Part 1
        p1 = PdfWriter()
        for i in range(mid): p1.add_page(merger.pages[i])
        with open(f"{year}_01.pdf", "wb") as f1: p1.write(f1)
        
        # Part 2
        p2 = PdfWriter()
        for i in range(mid, total_pages): p2.add_page(merger.pages[i])
        with open(f"{year}_02.pdf", "wb") as f2: p2.write(f2)
    else:
        with open(f"{year}.pdf", "wb") as f_out:
            merger.write(f_out)
    
    merger.close()
