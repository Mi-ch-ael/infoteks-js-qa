const config = {
    use: {
        headless: true,
        browserName: "firefox",
        baseURL: "https://demoqa.com",
        timeout: 8000,
        actionTimeout: 8000,
        testDir: "./playwright"
    }
};

module.exports = config;