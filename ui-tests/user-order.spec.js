// Admin Users Flow
import { test, expect } from "@playwright/test";
import { USER } from "../config/seed/seedDb";

test.describe("User make order", () => {
	test.beforeEach("Navigate to the login page", async ({ page }) => {
		await page.goto(".");
		await page.getByRole("link", { name: "Login" }).click();
		await page.getByRole("textbox", { name: "Enter Your Email" }).click();
		await page
			.getByRole("textbox", { name: "Enter Your Email" })
			.fill(USER.email);
		await page.getByRole("textbox", { name: "Enter Your Password" }).click();
		await page
			.getByRole("textbox", { name: "Enter Your Password" })
			.fill(USER.password);

		await page.getByRole("button", { name: "LOGIN" }).click();

		// await page.getByRole("button", { name: USER.name }).click();
		// await page.getByRole("link", { name: "Dashboard" }).click();
		// await page.getByRole("link", { name: "Profile" }).click();

		// // wait for the login success message to disappear
		// await page.waitForSelector("text=Logged in successfully", {
		//   state: "hidden",
		// });
	});

	test("should show order details after cart is checked out", async ({
		page,
	}) => {
		await page.getByRole("button", { name: "Add to Cart" }).nth(0).click();
		await page.getByRole("button", { name: "Add to Cart" }).nth(1).click();

		await page.getByRole("link", { name: "Cart" }).click();

		await page.waitForURL("/cart", {
			timeout: 5000,
		});

		await page.waitForLoadState("networkidle");
		await page
			.locator("div")
			.filter({
				hasText: /^TshirtA T-shirt, or tee shirt, is a Price : 20Remove$/,
			})
			.getByRole("button")
			.click();

		await page.getByRole("button", { name: "Paying with Card" }).click();

		await page
			.locator('iframe[name="braintree-hosted-field-number"]')
			.contentFrame()
			.getByRole("textbox", { name: "Credit Card Number" })
			.click();
		await page
			.locator('iframe[name="braintree-hosted-field-number"]')
			.contentFrame()
			.getByRole("textbox", { name: "Credit Card Number" })
			.fill("4111111111111111");

		await page
			.locator('iframe[name="braintree-hosted-field-expirationDate"]')
			.contentFrame()
			.getByRole("textbox", { name: "Expiration Date" })
			.click();
		await page
			.locator('iframe[name="braintree-hosted-field-expirationDate"]')
			.contentFrame()
			.getByRole("textbox", { name: "Expiration Date" })
			.fill("1225");

		// await page
		// 	.locator('iframe[name="braintree-hosted-field-cvv"]')
		// 	.contentFrame()
		// 	.getByRole("textbox", { name: "CVV" })
		// 	.click();
		// await page
		// 	.locator('iframe[name="braintree-hosted-field-cvv"]')
		// 	.contentFrame()
		// 	.getByRole("textbox", { name: "CVV" })
		// 	.fill("123");

		await page.getByRole("button", { name: "Make Payment" }).click();

		await page.waitForURL("/dashboard/user/orders", {
			timeout: 5000,
		});
		await page.waitForLoadState("networkidle");
        await expect(page.getByRole('main')).toMatchAriaSnapshot(`
            - heading "All Orders" [level=1]
            - table:
              - rowgroup:
                - row "# Status Buyer Date Payment Quantity":
                  - columnheader "#"
                  - columnheader "Status"
                  - columnheader "Buyer"
                  - columnheader "Date"
                  - columnheader "Payment"
                  - columnheader "Quantity"
              - rowgroup:
                - row "1 Not Processed User a few seconds ago Success 4":
                  - cell "1"
                  - cell "Not Processed"
                  - cell "User"
                  - cell "a few seconds ago"
                  - cell "Success"
                  - cell "4"
            - img "Novel"
            - paragraph: Novel
            - paragraph: A novel is a relatively long w...
            - paragraph: "/Price : \\\\d+/"
            - img "Laptop"
            - paragraph: Laptop
            - paragraph: A laptop is a small, portable ...
            - paragraph: "/Price : \\\\d+/"
            - img "Phone"
            - paragraph: Phone
            - paragraph: A telephone, or phone, is a te...
            - paragraph: "/Price : \\\\d+/"
            - img "Tshirt"
            - paragraph: Tshirt
            - paragraph: A T-shirt, or tee shirt, is a ...
            - paragraph: "/Price : \\\\d+/"
            - table:
              - rowgroup:
                - row "# Status Buyer Date Payment Quantity":
                  - columnheader "#"
                  - columnheader "Status"
                  - columnheader "Buyer"
                  - columnheader "Date"
                  - columnheader "Payment"
                  - columnheader "Quantity"
              - rowgroup:
                - row "2 Not Processed User a few seconds ago Success 1":
                  - cell "2"
                  - cell "Not Processed"
                  - cell "User"
                  - cell "a few seconds ago"
                  - cell "Success"
                  - cell "1"
            - img "Phone"
            - paragraph: Phone
            - paragraph: A telephone, or phone, is a te...
            - paragraph: "/Price : \\\\d+/"
            `);
	});
});