// Constants

const APP_PROPERTIES = {
  ADMIN_EMAIL: 'adminEmail',
  EMAIL_RECIPIENTS: 'emailRecipients',
  PREVIOUS_STATE: 'previousState'
}

const CAMPGROUND = {
  ID: '234783',
  NAME: 'Haleakalā National Park',
  RESERVATION_URL: 'https://www.recreation.gov/camping/campgrounds/234783'
}

const EMAIL_ADDRESSES = {
  ADMIN: 'admin@example.com', // TODO: Add your email here.
  RECIPIENTS: ['email1@example.com', 'email2@example.com'] // TODO: Add your email recipients here.
}

const MONTHS_TO_CHECK = 3

// Source: `/r1s-frontend/ui-camping/src/shared/constants/availability.js`
const POTENTIALLY_RESERVABLE_STATUSES = [
  'Available',
  'Early Access - Available',
  'Reserved Available',
  'Open',
  'Checkout'
]

// Functions

function checkCabinAvailability() {
  try {
    const today = new Date()
    const cabins = []

    for (let i = 0; i < MONTHS_TO_CHECK; i++) {
      const currentDate = new Date(today.getFullYear(), today.getMonth() + i, 1)
      const formattedDate = Utilities.formatDate(currentDate, 'UTC', 'yyyy-MM-dd')

      const url = `https://www.recreation.gov/api/camps/availability/campground/${CAMPGROUND.ID}/month?start_date=${formattedDate}T00%3A00%3A00.000Z`

      const response = UrlFetchApp.fetch(url)
      const content = JSON.parse(response.getContentText())

      processCabinData(content.campsites, cabins)
    }

    const changes = checkForChanges(cabins)

    if (changes.length > 0) sendEmailToRecipients(changes)

    // Store the current state for future comparisons.
    PropertiesService.getScriptProperties().setProperty(APP_PROPERTIES.PREVIOUS_STATE, JSON.stringify(cabins))
  } catch (error) {
    console.error('Error in checkCabinAvailability:', error)

    sendErrorNotification(error)
  }
}

function processCabinData(campsites, cabins) {
  Object.values(campsites).forEach(site => {
    const cabin = cabins.find(({ id }) => id === site.site) || { availability: {}, id: site.site }

    Object.entries(site.availabilities).forEach(([date, status]) => {
      if (POTENTIALLY_RESERVABLE_STATUSES.includes(status)) {
        cabin.availability[date] = status
      }
    })

    if (!cabins.find(({ id }) => id === site.site)) {
      cabins.push(cabin)
    }
  })
}

function checkForChanges(currentState) {
  const previousStateString = PropertiesService.getScriptProperties().getProperty(APP_PROPERTIES.PREVIOUS_STATE)

  if (!previousStateString) return [] // First run – no changes to report.

  const previousState = JSON.parse(previousStateString)
  const changes = []

  currentState.forEach((cabin, index) => {
    const previousCabinState = previousState[index]

    Object.entries(cabin.availability).forEach(([date, status]) => {
      if (
        POTENTIALLY_RESERVABLE_STATUSES.includes(status) &&
        (!previousCabinState ||
          !previousCabinState.availability[date] ||
          !POTENTIALLY_RESERVABLE_STATUSES.includes(previousCabinState.availability[date]))
      ) {
        changes.push({ cabinId: cabin.id, date: date, status: status })
      }
    })
  })

  return changes
}

function sendEmailToRecipients(changes) {
  const recipientsJson = PropertiesService.getScriptProperties().getProperty(APP_PROPERTIES.EMAIL_RECIPIENTS)
  const recipients = JSON.parse(recipientsJson)
  const subject = `${CAMPGROUND.NAME} Cabin Availability Alert - ${new Date().toLocaleString('en-US', {
    timeZone: 'HST'
  })}`

  let body = `New availability detected for ${CAMPGROUND.NAME} cabins:\n\n`

  changes.forEach(change => (body += `${change.cabinId} is now "${change.status}" on ${change.date}.\n`))

  body += `\nTo make a reservation, visit: ${CAMPGROUND.RESERVATION_URL}`

  recipients.forEach(recipient => MailApp.sendEmail(recipient, subject, body))
}

function sendErrorNotification(error) {
  const adminEmail = PropertiesService.getScriptProperties().getProperty(APP_PROPERTIES.ADMIN_EMAIL)
  const subject = `Cabin Checker Error - ${new Date().toLocaleString('en-US', { timeZone: 'HST' })}`

  MailApp.sendEmail(adminEmail, subject, `An error occurred: ${error.message}`)
}

function setAdminEmail() {
  PropertiesService.getScriptProperties().setProperty(APP_PROPERTIES.ADMIN_EMAIL, EMAIL_ADDRESSES.ADMIN)
}

function setRecipients() {
  PropertiesService.getScriptProperties().setProperty(
    APP_PROPERTIES.EMAIL_RECIPIENTS,
    JSON.stringify(EMAIL_ADDRESSES.RECIPIENTS)
  )
}

function setTrigger() {
  const triggers = ScriptApp.getProjectTriggers()

  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger))

  ScriptApp.newTrigger('checkCabinAvailability').timeBased().everyHours(1).create()
}
