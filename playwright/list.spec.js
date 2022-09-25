const {test, expect} = require("@playwright/test");

test.beforeEach(async ({page}) => {
    await page.goto("/books");
});

const attempts = [
    {amount: 5, nextEnabled: true},
    {amount: 10, nextEnabled: false},
    {amount: 20, nextEnabled: false},
    {amount: 25, nextEnabled: false},
    {amount: 50, nextEnabled: false},
    {amount: 100, nextEnabled: false}
];

const bookCount = 8;
for(const attempt of attempts) {
    test(`display ${attempt.amount} rows`, async ({page}) => {
        const select = page.locator("css=[aria-label=\"rows per page\"]");
        await select.selectOption(attempt.amount.toString());
        const tableRowsLocator = page.locator(".rt-tr-group");
        await expect(await tableRowsLocator.count()).toEqual(attempt.amount);
        await expect(await tableRowsLocator.locator(".action-buttons").count())
            .toEqual(bookCount > attempt.amount ? attempt.amount : bookCount);
        await expect(await page.locator("button:text-is(\"Next\")").isEnabled())
            .toEqual(attempt.nextEnabled);
        await expect(await page.locator("button:text-is(\"Previous\")").isDisabled())
            .toEqual(true);
    });
}

test("test 'Previous' and 'Next' buttons", async ({page}) => {
    await page.locator("css=[aria-label=\"rows per page\"]").selectOption("5");
    const buttonNext = page.locator("button:text-is(\"Next\")");
    const buttonPrev = page.locator("button:text-is(\"Previous\")");
    const tableRowsLocator = page.locator(".rt-tr-group");
    const pageNumberInput = page.locator("css=[aria-label=\"jump to page\"]");
    await expect(await tableRowsLocator.locator(".action-buttons").count())
        .toEqual(5);
    await expect(await pageNumberInput.evaluate(e => e.value)).toEqual("1");
    await buttonNext.click();
    await expect(await tableRowsLocator.locator(".action-buttons").count())
        .toEqual(3);
    await expect(await buttonNext.isDisabled()).toEqual(true);
    await expect(await buttonPrev.isEnabled()).toEqual(true);
    await expect(await pageNumberInput.evaluate(e => e.value)).toEqual("2");
    await buttonPrev.click();
    await expect(await tableRowsLocator.locator(".action-buttons").count())
        .toEqual(5);
    await expect(await pageNumberInput.evaluate(e => e.value)).toEqual("1");
});

test("Search matching one book", async ({page}) => {
    const searchbar = page.locator("input#searchBox");
    const nonEmptyRows = page.locator(".rt-tr-group").locator(".action-buttons");
    await searchbar.fill("js");
    await expect(await nonEmptyRows.count()).toEqual(1);
    await expect(await nonEmptyRows.locator("span.mr-2").textContent())
        .toEqual("You Don't Know JS");
    await expect(await page.locator(".rt-tr-group:has-text(\"Kyle Simpson\")").count())
        .toEqual(1);
    await expect(await page.locator(".rt-tr-group:has-text(\"O'Reilly Media\")").count())
        .toEqual(1);
});

test("Search matching all books", async ({page}) => {
    await page.locator("input#searchBox").fill("t");
    const nonEmptyRows = page.locator(".rt-tr-group").locator(".action-buttons");
    await expect(await nonEmptyRows.count()).toEqual(bookCount);
    await expect((await nonEmptyRows.allTextContents()).map(s => s.trim())).toEqual([
        "Git Pocket Guide",
        "Learning JavaScript Design Patterns",
        "Designing Evolvable Web APIs with ASP.NET",
        "Speaking JavaScript",
        "You Don't Know JS",
        "Programming JavaScript Applications",
        "Eloquent JavaScript, Second Edition",
        "Understanding ECMAScript 6"
    ]);
    await expect(await page.locator(".rt-tr-group:has-text(\"O'Reilly Media\")").count())
        .toEqual(6);
});

test("Search matching several books", async ({page}) => {
    await page.locator("input#searchBox").fill("pt");
    const nonEmptyRows = page.locator(".rt-tr-group").locator(".action-buttons");
    await expect(await nonEmptyRows.count()).toEqual(5);
    await expect((await nonEmptyRows.allTextContents()).map(s => s.trim())).toEqual([
        "Learning JavaScript Design Patterns",
        "Speaking JavaScript",
        "Programming JavaScript Applications",
        "Eloquent JavaScript, Second Edition",
        "Understanding ECMAScript 6"
    ]);
    await expect(await page.locator(".rt-tr-group:has-text(\"O'Reilly Media\")").count())
        .toEqual(3);
});

test("Search matching no books", async ({page}) => {
    await page.locator("input#searchBox").fill("test");
    const nonEmptyRows = page.locator(".rt-tr-group").locator(".action-buttons");
    await expect(await nonEmptyRows.count()).toEqual(0);
    await expect(await page.locator("div.rt-noData:has-text(\"No rows found\")").count())
        .toEqual(1);
});