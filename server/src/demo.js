// DEMO MODE: predefined + rule-based test cases. This is NOT AI output.
// It is used only when no API key is set (or when the user chooses demo mode).

const tc = (type, priority, scenario, description, preconditions, steps, testData, expectedResult) => ({
  type, priority, scenario, description, preconditions, steps, testData, expectedResult,
});

const LOGIN = [
  tc('Positive', 'High', 'Login with valid credentials', 'A registered user logs in successfully.', 'User account exists and is active.',
    ['Open the login page', 'Enter the registered email', 'Enter the correct password', 'Click Login'],
    'Email: user@example.com, Password: Pass@1234', 'User is redirected to the dashboard and sees a welcome message.'),
  tc('Negative', 'High', 'Login with wrong password', 'System rejects an incorrect password.', 'User account exists.',
    ['Open the login page', 'Enter the registered email', 'Enter a wrong password', 'Click Login'],
    'Email: user@example.com, Password: WrongPass1', 'Login is rejected with a generic "Invalid email or password" message; user stays on the login page.'),
  tc('Negative', 'High', 'Login with unregistered email', 'System rejects an email that has no account.', 'Email is not registered.',
    ['Open the login page', 'Enter an unregistered email', 'Enter any password', 'Click Login'],
    'Email: nobody@example.com, Password: Pass@1234', 'Login is rejected with the same generic error (no hint that the email does not exist).'),
  tc('Input Validation', 'High', 'Submit with both fields empty', 'Empty submission is prevented.', 'Login page is open.',
    ['Leave email empty', 'Leave password empty', 'Click Login'],
    'Email: (empty), Password: (empty)', 'Form is not submitted and required-field messages appear for both fields.'),
  tc('Input Validation', 'Medium', 'Invalid email format', 'Email without a valid format is rejected before submission.', 'Login page is open.',
    ['Enter an email without "@"', 'Enter any password', 'Click Login'],
    'Email: userexample.com, Password: Pass@1234', 'A "Enter a valid email address" message is shown and no request is sent.'),
  tc('Boundary', 'Medium', 'Password at maximum allowed length', 'Password exactly at the maximum length is accepted (assuming a limit of 64).', 'User exists with a 64-character password.',
    ['Enter the registered email', 'Enter the 64-character password', 'Click Login'],
    'Password: 64 characters', 'Login succeeds; the field does not truncate the password.'),
  tc('Edge Case', 'Medium', 'Email with leading/trailing spaces', 'Whitespace around a valid email is handled consistently.', 'User account exists.',
    ['Enter the email with spaces before and after', 'Enter the correct password', 'Click Login'],
    'Email: "  user@example.com  "', 'System trims the spaces and logs the user in (or shows a clear validation message).'),
  tc('Edge Case', 'High', 'SQL injection attempt in email field', 'Malicious input does not break or bypass authentication.', 'Login page is open.',
    ['Enter a SQL injection string as email', 'Enter any password', 'Click Login'],
    "Email: ' OR '1'='1", 'Login is rejected; no database error or stack trace is shown.'),
];

const CART = [
  tc('Positive', 'High', 'Add a product to the cart', 'A product is added and the cart updates.', 'User is on a product page; product is in stock.',
    ['Click "Add to Cart" on a product', 'Open the cart'], 'Product: Wireless Mouse, Quantity: 1',
    'The cart shows the product with quantity 1 and the correct price; cart badge shows 1.'),
  tc('Positive', 'High', 'Cart total calculation', 'Total equals the sum of price x quantity for all items.', 'Cart has two different products.',
    ['Open the cart', 'Read the total'], 'Item A: 10.00 x 2, Item B: 5.50 x 1', 'Total is displayed as 25.50.'),
  tc('Negative', 'Medium', 'Add an out-of-stock product', 'Out-of-stock items cannot be added.', 'Product stock is 0.',
    ['Open the out-of-stock product', 'Try to click "Add to Cart"'], 'Product stock: 0',
    'The Add to Cart button is disabled or an "Out of stock" message is shown; cart is unchanged.'),
  tc('Input Validation', 'High', 'Enter a negative quantity', 'Negative quantities are rejected.', 'Cart contains one item.',
    ['Open the cart', 'Change quantity to -1', 'Press Enter'], 'Quantity: -1',
    'Value is rejected; quantity stays at its previous valid value.'),
  tc('Input Validation', 'Medium', 'Enter non-numeric quantity', 'Letters in the quantity field are not accepted.', 'Cart contains one item.',
    ['Open the cart', 'Type "abc" in quantity', 'Press Enter'], 'Quantity: abc', 'Input is rejected and quantity is unchanged.'),
  tc('Boundary', 'High', 'Quantity at stock limit', 'Quantity equal to available stock is accepted; one more is rejected.', 'Product has 5 units in stock.',
    ['Set quantity to 5', 'Set quantity to 6'], 'Quantities: 5, then 6', 'Quantity 5 is accepted; quantity 6 shows a "Only 5 available" message.'),
  tc('Boundary', 'Medium', 'Minimum quantity of 1', 'Reducing quantity to 0 removes the item (or is blocked).', 'Cart has an item with quantity 1.',
    ['Click the "-" button on the item'], 'Quantity: 1 -> 0', 'The item is removed from the cart or the button is disabled at 1, per the specification.'),
  tc('Edge Case', 'Medium', 'Empty cart checkout', 'Checkout is blocked when the cart is empty.', 'Cart is empty.',
    ['Open the cart', 'Click Checkout'], 'Cart: empty', 'Checkout is disabled or a "Your cart is empty" message is shown.'),
  tc('Edge Case', 'Low', 'Cart persists after page refresh', 'Cart contents are kept after reloading the page.', 'Cart has 2 items.',
    ['Refresh the browser page', 'Open the cart'], 'Cart: 2 items', 'The same 2 items and total are still shown.'),
];

const REGISTRATION = [
  tc('Positive', 'High', 'Register with all valid data', 'A new user registers successfully.', 'Email is not already registered.',
    ['Open the registration form', 'Fill all fields with valid data', 'Click Register'],
    'Name: Riya Shah, Email: riya@example.com, Password: Strong@123, Confirm: Strong@123', 'Account is created and a success message or confirmation email notice is shown.'),
  tc('Negative', 'High', 'Register with an existing email', 'Duplicate email is rejected.', 'An account with the email already exists.',
    ['Fill the form using an already registered email', 'Click Register'], 'Email: riya@example.com', 'Registration fails with "Email already registered"; no duplicate account is created.'),
  tc('Negative', 'High', 'Password and confirm password do not match', 'Mismatched passwords are rejected.', 'Registration form is open.',
    ['Enter password "Strong@123"', 'Enter confirm password "Strong@124"', 'Click Register'], 'Password: Strong@123, Confirm: Strong@124', 'A "Passwords do not match" error is shown and the form is not submitted.'),
  tc('Input Validation', 'High', 'Submit with all fields empty', 'Required-field validation works.', 'Registration form is open.',
    ['Leave all fields empty', 'Click Register'], 'All fields: empty', 'Each required field shows an error message and no account is created.'),
  tc('Input Validation', 'Medium', 'Invalid email format', 'Badly formatted email is rejected.', 'Registration form is open.',
    ['Enter email "riya@", fill other fields validly', 'Click Register'], 'Email: riya@', 'A valid-email message is shown; form is not submitted.'),
  tc('Input Validation', 'Medium', 'Weak password rejected', 'Password must meet the strength rules (min 8 chars, letter, number, symbol).', 'Registration form is open.',
    ['Enter password "abc"', 'Click Register'], 'Password: abc', 'A message lists the password rules and registration is blocked.'),
  tc('Boundary', 'Medium', 'Password length 7 vs 8 characters', 'Minimum length boundary of 8 characters is enforced.', 'Registration form is open.',
    ['Register with a 7-character password', 'Register with an 8-character password'], 'Passwords: Abcd@12 (7), Abcd@123 (8)', '7 characters is rejected; 8 characters is accepted.'),
  tc('Edge Case', 'Low', 'Name with special characters', 'Names such as O\'Neil or José are handled.', 'Registration form is open.',
    ['Enter name "José O\'Neil"', 'Fill other fields validly', 'Click Register'], 'Name: José O\'Neil', 'Registration succeeds and the name is stored and displayed correctly.'),
  tc('Edge Case', 'Medium', 'Email case sensitivity', 'The same email in different letter case is treated as a duplicate.', 'Account exists for riya@example.com.',
    ['Register using RIYA@EXAMPLE.COM'], 'Email: RIYA@EXAMPLE.COM', 'Registration is rejected as a duplicate email.'),
];

const generic = (req) => {
  const short = req.length > 80 ? `${req.slice(0, 77)}...` : req;
  return [
    tc('Positive', 'High', 'Main flow with valid input', `Verify the core behaviour: "${short}"`, 'System is available and the user has access.',
      ['Open the feature', 'Enter valid data', 'Submit'], 'Valid, typical values', 'The system completes the action successfully and shows a clear confirmation.'),
    tc('Negative', 'High', 'Invalid input is rejected', 'The system rejects data that breaks the requirement.', 'System is available.',
      ['Open the feature', 'Enter invalid data', 'Submit'], 'Clearly invalid values', 'An error message is shown and no data is saved.'),
    tc('Input Validation', 'High', 'Empty submission', 'Required fields cannot be left empty.', 'System is available.',
      ['Open the feature', 'Leave all fields empty', 'Submit'], 'All fields: empty', 'Submission is blocked and required-field messages are displayed.'),
    tc('Boundary', 'Medium', 'Minimum and maximum allowed values', 'Values at the edge of the allowed range behave correctly.', 'System is available.',
      ['Enter the minimum allowed value', 'Submit', 'Repeat with the maximum, then one beyond it'], 'Min, Max, Max + 1', 'Min and Max are accepted; the value beyond the limit is rejected.'),
    tc('Edge Case', 'Medium', 'Special characters and spaces', 'Unusual characters do not break the feature.', 'System is available.',
      ['Enter text with spaces and symbols such as <>&"\'', 'Submit'], 'Text: "  A&B <test>  "', 'Input is handled safely (trimmed or escaped) with no crash or script execution.'),
    tc('Edge Case', 'Low', 'Repeated submission', 'Pressing submit twice quickly does not create duplicates.', 'System is available.',
      ['Fill valid data', 'Double-click Submit'], 'Valid data', 'Only one record/action is created.'),
  ];
};

export function detectCategory(requirement) {
  const r = requirement.toLowerCase();
  if (/\b(login|log in|sign in|signin)\b/.test(r)) return 'login';
  if (/\b(cart|checkout|shopping)\b/.test(r)) return 'cart';
  if (/\b(registration|register|sign ?up|create an account)\b/.test(r)) return 'registration';
  return 'generic';
}

export function demoGenerate(requirement) {
  const category = detectCategory(requirement);
  const testCases = { login: LOGIN, cart: CART, registration: REGISTRATION }[category] ?? generic(requirement);
  return { testCases };
}
