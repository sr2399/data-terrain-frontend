import{ useState, useEffect, useRef } from "react";
import CalendarScreen from "./components/Calendar/Calendar";
import calendarData from "./data/calendarfromtoenddate.json";
import calendarData2 from "./data/calendar_meeting.json"
const App = () => {
  const [calendarEvents, setCalendarEvents] = useState([]as any);

  useEffect(() => {

    console.log("CalendarData", calendarData)
    setCalendarEvents([...calendarData, ...calendarData2])
  }, []);

  return (
    <CalendarScreen events={calendarEvents}  />
  );
};

export default App;
