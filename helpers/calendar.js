const { google } = require('googleapis');
require("dotenv").config();
const authenticate = require('./auth');
const timeZone = process.env.TIME_ZONE || 'America/Vancouver';

function createEvent(eventData) {
  return {
    summary: `Mentoring Session`,
    location: 'Lighthouse Labs',
    description: 'Scheduled mentoring session.',
    start: {
      dateTime: eventData.start,
      timeZone: timeZone,
    },
    end: {
      dateTime: eventData.end,
      timeZone: timeZone,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 10 },
      ],
    },
  };
}

const addEventsToCalendar = async (events) => {
  const oAuth2Client = await authenticate();
  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
  events.forEach((eventData) => {
    const event = createEvent(eventData);
    calendar.events.insert(
      {
        auth: oAuth2Client,
        calendarId: 'primary',
        resource: event,
      },
      (err, event) => {
        if (err) {
          console.log('There was an error contacting the Calendar service: ' + err);
          return;
        }
        console.log('Event created: %s', event.data.htmlLink);
      }
    );
  });
}

module.exports = {
  addEventsToCalendar,
};
