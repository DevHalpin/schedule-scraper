## Scraper for LHL Mentor Schedule

### How to set up:
1. Set Up Google Cloud Project and Enable Google Calendar API
    - Create a new project.
    - Enable the Google Calendar API for your project.
    - Create OAuth 2.0 credentials (Client ID and Secret).
    - Download the credentials as a JSON file and store in project root folder.
2. Create a .env file in the project root folder and add environment variables listed in the .env.example file.

### Running the program
Program can takes four optional arguments: 
1) `--all` to get the schedule for all mentors and print out some information about the schedule.
2) `--next` followed by a number to get the schedule for the next number of weeks.  Default is 1 if no argument provided
3) `--cal` if you want to add the schedule to your google calendar. (This can only be used if you didn't use `--all`)
4) `--gui` if you want to run the playwright GUI to see things in action or to debug. (Useful if you need to reauth your google account)

For example `node index.js --next 3 --cal  ` would give me my schedule for 3 weeks out and add it to my calendar.

