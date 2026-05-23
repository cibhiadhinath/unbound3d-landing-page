import glob
import re

files = glob.glob("*.html")

for file in files:
    if file in ["lynx350.html", "lynx-320.html", "index.html"]:
        continue # Already manually updated
        
    with open(file, "r") as f:
        content = f.read()
        
    # Update Nav
    # We want to replace `<a href="/lynx-320.html"...>...</a>` with both links.
    # Note: different files might have different formatting (e.g. "Lynx 320" vs "Lynx-320" vs class="active")
    # Let's use regex.
    content = re.sub(
        r'(<a href="/lynx-320\.html"[^>]*>.*?</a>)',
        r'<a href="/lynx350.html">Lynx 350</a>\n            \1',
        content
    )
    
    # Update Footer
    # Replace `<a href="/lynx-320.html">Hardware Node</a>` or similar with both
    # Actually, in footer it's usually under <div class="footer-links"> under <h4>Platform</h4>
    # Let's look for `<a href="/lynx-320.html">Hardware Node</a>` and replace
    content = re.sub(
        r'(<a href="/lynx-320\.html">Hardware Node</a>)',
        r'<a href="/lynx350.html">LYNX-350</a>\n                    <a href="/lynx-320.html">Lynx-320</a>',
        content
    )
    
    with open(file, "w") as f:
        f.write(content)

print("Updated links in all HTML files.")
