# Haleakalā National Park Cabin Availability Checker

This Google Apps Script automatically checks for cabin availability at Haleakalā National Park in Maui, Hawaii. It sends email notifications to a list of recipients when new availability is detected within the next 3 months.

## Setup

1. **Create a new Google Apps Script project:**

   - Visit [script.google.com](https://script.google.com/) and create a new script.

2. **Add the script code:**

   - Copy the code from `Code.gs` and paste it into the script editor, replacing any existing content.

3. **Configure email addresses:**

   - In the `Code.gs` file, locate the `EMAIL_ADDRESSES` constant.
   - Replace `'admin@example.com'` with your own email address.
   - Replace the example emails in the `RECIPIENTS` array with the email addresses of your recipients.

4. **Initialize script properties:**

   - Run the `setAdminEmail()` function to save the admin email.
   - Run the `setRecipients()` function to save the recipient list.

5. **Set up the trigger:**

   - Run the `setTrigger()` function to schedule the script to run every 30 minutes.

6. **Run the script manually:**
   - Execute the `checkCabinAvailability()` function once to initialize the `previousState`. This allows the script to detect changes in future runs.

## Usage

After setup, the script will automatically check for cabin availability every 30 minutes and send email notifications when new availability is found.

### Error Handling

If an error occurs during execution, an error notification will be sent to the admin email address.
