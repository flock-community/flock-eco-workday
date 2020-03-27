const assert = require("assert")
const {chromium, firefox, webkit} = require("playwright")

let browser
let page

describe("workday app", () => {
  before(async () => {
    browser = await chromium.launch() // Or 'firefox' or 'webkit'.
    page = await browser.newPage()
    await page.goto("http://localhost:8080")
  })

  // after(async () => {
  //   await browser.close()
  // })

  describe("login", () => {
    it("goes to the login page", async () => {
      // await page.waitFor(() => page.url().contains("login"))
      await page.waitForNavigation()
      assert.equal(page.url(), "http://localhost:8080/login")
      return page.screenshot({path: `example.png`})
    }).timeout(5000)
  })
})
