const { addEventsToCalendar } = require("./calendar");
const { convertAndMergeIntervals, formatDate } = require("./dateUtils");


const handleAllSchedules = async (page) => {
    try {
      await page.click("text=My Schedule");
      await page.waitForTimeout(2000);
      await page.click("text=Web Schedule");
      await page.waitForTimeout(2000);
  
      const scheduleDate = await page.$eval(".rbc-toolbar-label", el => el.textContent);
      const dayTimes = await page.$$('.rbc-day-slot');
  
      const days = {};
      const totalHoursPerMentor = [];
  
      await Promise.all(dayTimes.map(async (dayTime, i) => {
        const day = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][i];
        days[day] = [];
        const events = await dayTime.$$('.rbc-event');
        for (const event of events) {
          const eventInfo = await event.getAttribute('title');
          const [time, mentor] = eventInfo.split(': ');
          const [start, end] = time.split(' – ');
  
          const mentorEntry = totalHoursPerMentor.find(m => m.mentor === mentor);
          if (mentorEntry) {
            mentorEntry.hours += 1;
          } else {
            totalHoursPerMentor.push({ mentor, hours: 1 });
          }
  
          days[day].push({ start, end, mentor });
        }
      }));
  
      console.log(`\n\nSchedule for ${scheduleDate}`);
      console.log(`\nTotal Hours Found: ${totalHoursPerMentor.reduce((acc, obj) => acc + obj.hours, 0)}\n`);
  
      totalHoursPerMentor.sort((a, b) => b.hours - a.hours).forEach(({ mentor, hours }) => {
        console.log(`${mentor}: ${hours}`);
      });
  
      Object.entries(days).forEach(([day, intervals]) => {
        console.log(`\n${day}\n-------------------`);
        intervals.forEach(({ start, end, mentor }) => {
          console.log(`${start} - ${end}: ${mentor}`);
        });
        console.log("-------------------");
      });
    } catch (error) {
      console.error("Failed to fetch or process schedule data:", error);
      throw error;
    }
  }
  
  const handleSchedule = async (page, args) => {
    try {
      const scheduleDate = await page.$eval(".rbc-toolbar-label", el => el.textContent);
      const dayTimes = await page.$$('.rbc-day-slot');
  
      const days = {};
      const totalHoursPerMentor = [];
      const [startDateStr, endDateStr] = scheduleDate.split(' – ');
      const year = 2024
      const startDate = new Date(`${startDateStr} ${year} 00:00:00`);
      const endDate = new Date(`${endDateStr} ${year} 23:59:59`);
  
      const calendarEvents = [];
  
      await Promise.all(dayTimes.map(async (dayTime, i) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        days[date.toDateString()] = [];
        const events = await dayTime.$$('.rbc-event');
        for (const event of events) {
          const eventInfo = await event.getAttribute('title');
          const [time, mentor] = eventInfo.split(': ');
          const [start, end] = time.split(' – ');
  
          const mentorEntry = totalHoursPerMentor.find(m => m.mentor === mentor);
          if (mentorEntry) {
            mentorEntry.hours += 1;
          } else {
            totalHoursPerMentor.push({ mentor, hours: 1 });
          }
  
          days[date.toDateString()].push({ start, end });
        }
      }));
  
      console.log(`\n\nSchedule for ${scheduleDate}`);
      console.log(`\nTotal Hours Found: ${totalHoursPerMentor.reduce((acc, obj) => acc + obj.hours, 0)}\n`);
  
      Object.entries(days).forEach(([day, intervals]) => {
        if (intervals.length > 0) {
          console.log(`\n${day}\n-------------------`);
          const mergedIntervals = convertAndMergeIntervals(intervals, day)
          mergedIntervals.forEach(({ start, end }) => {
            console.log(`${formatDate(start)} - ${formatDate(end)}`);
            calendarEvents.push({
              start: start, 
              end: end, 
            });
          })
          console.log("-------------------");
        };
      });
  
      calendarEvents.flat();
      if (args.includes("--cal")) {
        addEventsToCalendar(calendarEvents);
      }
    } catch (error) {
      console.error("Failed to fetch or process schedule data:", error);
      throw error;
    }
  }

  module.exports = { handleAllSchedules, handleSchedule };