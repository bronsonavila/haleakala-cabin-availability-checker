# Haleakalā National Park Cabin Availability Checker

This Google Apps Script project automatically checks for cabin availability at Haleakalā National Park in Maui, Hawaii. When new availability is detected within the next 3 months, it sends email notifications to a list of recipients.

## Setup

1. Create a new Google Apps Script project.

2. Copy the provided code from `Code.gs` into the script editor.

3. Configure the email addresses:

   - In the `Code.gs` file, locate the `EMAIL_ADDRESSES` constant.
   - Replace `'admin@example.com'` with your actual email address.
   - Replace the example email addresses in the `RECIPIENTS` array with your recipients' email addresses.

4. Set up the admin email:

   - Run the `setAdminEmail()` function to save the admin email.

5. Set up email recipients:

   - Run the `setRecipients()` function to save the recipient list.

6. Set up the trigger:

   - Run the `setTrigger()` function to create a 30-minute trigger for the script.

7. Initialize the script:
   - Run the `checkCabinAvailability()` function once manually to initialize the `previousState`. This sets the initial state to check for subsequent changes when the automatic trigger runs.

## Usage

Once set up, the script will run automatically every 30 minutes, checking for new availability and sending email notifications when changes are detected. The script performs the following actions:

1. Fetches the cabin availability data from the Haleakalā National Park reservation website.
2. Parses the data to extract availability information for each cabin.
3. Compares the current availability with the previous state to detect changes.
4. If new availability is found, sends email notifications to the configured recipients.
5. Stores the current state for future comparisons.

In case of any errors during execution, an error notification will be sent to the admin email address.
