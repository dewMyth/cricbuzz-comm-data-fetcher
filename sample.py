import asyncio
from playwright.async_api import async_playwright

async def fetch_full_commentary(url):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        await page.goto(url)
        # Adjust selector to match comment line entries—this is a guess and may need tuning:
        await page.wait_for_selector('.cb-col.cb-col-100.cb-ltst-wgt-hdr')

        # Fetch all commentary entries
        comment_nodes = await page.query_selector_all('.cb-col.cb-col-100.cb-ltst-wgt-hdr .cb-com-ln')
        if not comment_nodes:
            # Fallback to broader selector if needed
            comment_nodes = await page.query_selector_all('.cb-com-ln')

        full_commentary = []
        for node in comment_nodes:
            time = await node.query_selector_eval('.cb-scr-time', 'el => el.textContent').catch(lambda _: None)
            text = await node.query_selector_eval('.cb-comment', 'el => el.textContent').catch(lambda _: None)
            if text:
                full_commentary.append((time.strip() if time else None, text.strip()))

        await browser.close()
        return full_commentary

async def main():
    url = "https://www.cricbuzz.com/cricket-full-commentary/118619/sl-vs-ban-1st-t20i-bangladesh-tour-of-sri-lanka-2025"
    commentary = await fetch_full_commentary(url)
    for t, line in commentary:
        print(f"{t or ''} {line}")

asyncio.run(main())
