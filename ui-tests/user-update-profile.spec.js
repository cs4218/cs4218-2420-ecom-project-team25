// Admin Users Flow
import { test, expect } from "@playwright/test";
import { USER } from "../config/seed/seedDb";


const UPDATED_USER = {
  name: "John Doe",
  phone: "123456789102",
  address: "123 Main Street",
  password: "12345678",
}

async function fillInUserDetails(
  page, {
    name, phone, address, password
  }
) {
  console.log("Filling in user details", name, phone, address, password);
  
    await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Name' }).fill(name);
  
  
    await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(password);


    await page.getByRole('textbox', { name: 'Enter Your Phone' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill(phone);
  
    await page.getByRole('textbox', { name: 'Enter Your Address' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Address' }).fill(address);
  

}

// 1. Login as user and navigate to the profile page
// 2. Wait for the login success message to disappear
test.beforeEach(
  "Login as user and navigate to the profile page",
  async ({ page }) => {
    await page.goto(".");
    await page.getByRole("link", { name: "Login" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).fill(
      USER.email
    );
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .click();
    await page.getByRole("textbox", { name: "Enter Your Password" }).fill(
      USER.password
    );
    await page.getByRole("button", { name: "LOGIN" }).click();

    await page.getByRole("button", { name: USER.name }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await page.getByRole("link", { name: "Profile" }).click();

    // wait for the login success message to disappear
    await page.waitForSelector('text=Logged in successfully', { state: 'hidden' });
  }
);

test("should display user profile details", async ({ page }) => {
  await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toHaveValue(USER.name);
  await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toHaveValue(USER.email);
  await expect(page.getByRole('textbox', { name: 'Enter Your Phone' })).toHaveValue(USER.phone);
  await expect(page.getByRole('textbox', { name: 'Enter Your Address' })).toHaveValue(USER.address);

})

test("should update profile successfully", async ({page} ) => {
  await fillInUserDetails(page, UPDATED_USER);
  await page.getByRole('button', { name: 'UPDATE' }).click();

  await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toHaveValue(UPDATED_USER.name);
  // orignal email address
  await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toHaveValue(USER.email);
  await expect(page.getByRole('textbox', { name: 'Enter Your Password' })).toHaveValue(UPDATED_USER.password);
  await expect(page.getByRole('textbox', { name: 'Enter Your Phone' })).toHaveValue(UPDATED_USER.phone);
  await expect(page.getByRole('textbox', { name: 'Enter Your Address' })).toHaveValue(UPDATED_USER.address);

  // check if navbar user is updated
  await expect(page.getByRole("button", { name: UPDATED_USER.name })).toBeVisible();

  // logout user
  await page.getByRole("button", { name: UPDATED_USER.name }).click();
  await page.getByRole("link", { name: "Logout" }).click();

  // login with new details
  await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).fill(
      USER.email
    );
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .click();
    
    // checks if new password is updated
    await page.getByRole("textbox", { name: "Enter Your Password" }).fill(
      UPDATED_USER.password
    );
    await page.getByRole("button", { name: "LOGIN" }).click();
  
  await page.getByRole("button", { name: UPDATED_USER.name }).click();
  await page.getByRole("link", { name: "Dashboard" }).click();
  await page.getByRole("link", { name: "Profile" }).click();

  // check if the details are updated
  await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toHaveValue(UPDATED_USER.name);
  await expect(page.getByRole('textbox', { name: 'Enter Your Phone' })).toHaveValue(UPDATED_USER.phone);
  // orignal email address
  await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toHaveValue(USER.email);
  await expect(page.getByRole('textbox', { name: 'Enter Your Address' })).toHaveValue(UPDATED_USER.address);
  }
);

test("should display error message when name field is emptys", async ({page}) => {
  await fillInUserDetails(page, {
    ...UPDATED_USER,
    name: "" // empty name
  });
  await page.getByRole('button', { name: 'UPDATE' }).click();
  await expect(page.getByText('Name is required')).toBeVisible();
})

test("should not allow user to update email", async ({page}) => {
  await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toBeDisabled();
});

test("should display error message when password field is empty", async ({page}) => {
  await fillInUserDetails(page, {
    ...UPDATED_USER,
    password: "" // empty password
  });
  await page.getByRole('button', { name: 'UPDATE' }).click();
  await expect(page.getByText('Password is required')).toBeVisible();
})

test("should display error message when phone field is empty", async ({page}) => {
  await fillInUserDetails(page, {
    ...UPDATED_USER,
    phone: "" // empty phone
  });
  await page.getByRole('button', { name: 'UPDATE' }).click();
  await expect(page.getByText('Phone is required')).toBeVisible();
})

test("should display error message when address field is empty", async ({page}) => {
  await fillInUserDetails(page, {
    ...UPDATED_USER,
    address: "" // empty address
  });
  await page.getByRole('button', { name: 'UPDATE' }).click();
  await expect(page.getByText('Address is required')).toBeVisible();
})

test("should redirect to login page if not logged in", async ({ page }) => {
  // logout 
  await page.getByRole('button', { name: 'User' }).click();
  await page.getByRole('link', { name: 'Logout' }).click();
  // navigate to users page
  await page.goto("/dashboard/admin/users");
  // check if redirected to login page
  await page.waitForURL("/login", {
      timeout: 5000,
  });
});
