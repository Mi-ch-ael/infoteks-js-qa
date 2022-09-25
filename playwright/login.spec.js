const {test, expect} = require("@playwright/test");

const USERNAME = "michael-at-infoteks";
const PASSWORD = "Michael@tek5";

test.describe("Positive login scenarios", () => {
    test.beforeEach(async ({page}) => {
        await page.goto("/login");
        await page.locator("#userName").fill(USERNAME);
        await page.locator("#password").fill(PASSWORD);
    });

    test.afterEach(async ({page}) => {
        await expect(page).toHaveURL("https://demoqa.com/profile");
        await expect(await page.locator("label#userName-value").textContent()).toBe(USERNAME);
    });

    test("login via button click", async ({page}) => {
        await page.locator("button#login").click();
    });

    test("login by clicking 'Enter' while username in focus", async ({page}) => {
        await page.locator("#userName").click();
        await page.keyboard.press("Enter");
    });

    test("login by clicking 'Enter' while password input in focus", async ({page}) => {
        await page.locator("#password").click();
        await page.keyboard.press("Enter");
    });

    test("try to log in twice", async ({page}) => {
        await page.locator("button#login").click();
        await expect(page).toHaveURL("https://demoqa.com/profile");
        await page.goto("/login");
        await expect(page).toHaveURL("https://demoqa.com/login");
        const alreadyLoggedMessage = page.locator("text=You are already logged in.")
        await expect(await alreadyLoggedMessage.count()).toEqual(1);
        await page.locator("a >> text='profile'").click();
    });
});

test.describe("Negative login scenarios", () => {
    test.beforeEach(async ({page}) => {
        await page.goto("/login");
    });

    test.afterEach(async ({page}) => {
        await expect(page).toHaveURL("https://demoqa.com/login");
    });

    test("failed login: click 'Enter' without focus on input", async ({page}) => {
        await page.locator("#userName").fill(USERNAME);
        await page.locator("#password").fill(PASSWORD);
        await page.locator("label#userName-label").click();
        await page.keyboard.press("Enter");
    });

    const loginAttempts = [
        {username: "", password: ""},
        {username: "wrong", password: ""},
        {username: "", password: "wrong"},
        {username: "wrong", password: "wrong"},
        {username: USERNAME, password: ""},
        {username: "", password: PASSWORD},
        {username: "wrong", password: PASSWORD},
        {username: USERNAME, password: "wrong"}
    ];

    for(const attempt of loginAttempts) {
        test(`failed login @ "${attempt.username}":"${attempt.password}"`,
            async ({page}) => {
                const usernameInput = await page.locator("#userName");
                usernameInput.fill(attempt.username);
                const passwordInput = await page.locator("#password");
                passwordInput.fill(attempt.password);
                await page.locator("button#login").click();
            });
    }
});


