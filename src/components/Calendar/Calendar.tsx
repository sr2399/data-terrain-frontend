import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Card, Badge, Typography, Dialog, List, ListItem, ListItemText, IconButton, DialogTitle, DialogContent, Divider } from "@mui/material";
import dayjs from "dayjs";
import CloseIcon from '@mui/icons-material/Close';

const groupMeetingsByDate = (meetings: any) => {
    return meetings.reduce((acc: any, meeting: any) => {
        const date = dayjs(meeting.start).format("YYYY-MM-DD");
        if (!acc[date]) acc[date] = [];
        acc[date].push(meeting);
        return acc;
    }, {});
};



const CalendarScreen = (props: any) => {
    const { events } = props
    const [currentWeek, setCurrentWeek] = useState('');
    const [open, setOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null as any);


    const getCurrentDay = () => {
        return new Date().getDate();
    };


    const ssDateRange = (text: string): string => {
        const superscriptMap: { [key: string]: string } = {
            'st': 'ˢᵗ', 'nd': 'ⁿᵈ', 'rd': 'ʳᵈ', 'th': 'ᵗʰ'
        };
        const matchSuffix = text.match(/(st|nd|rd|th)$/);
        if (matchSuffix) {
            return text.replace(matchSuffix[0], superscriptMap[matchSuffix[0]]);
        }
    
        return text;
    };

    const getDaySuffix = (day: number): string => {
        if (day > 3 && day < 21) return 'th';
        const lastDigit = day % 10;
        if (lastDigit === 1) return 'st';
        if (lastDigit === 2) return 'nd';
        if (lastDigit === 3) return 'rd';
        return 'th';
    };

    const formatDate = (date: Date, type:string): string => {
        const day = date.getDate();
        const suffix = getDaySuffix(day); 
        const dayWithSuffix = `${day}${suffix}`; 
        console.log("dayWithSuffix BEFORE---------", dayWithSuffix)
        const formattedDay = ssDateRange(dayWithSuffix); 
        console.log("dayWithSuffix AFTER---------", formattedDay)

        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        if(type === 'start'){
        return `${formattedDay} ${month}`;

        }
        return `${formattedDay} ${month}, ${year}`;
    };

    const handleDate = (arg: any) => {
        const start = formatDate(arg.start, 'start');
        const end = formatDate(arg.end, 'end');
        setCurrentWeek(`${start} to ${end}`);
    };


    const sameDayMeetings = (meetings: any) => {
        console.log("meetings", meetings)
        if (meetings.length > 0) {
            const targetDate = new Date(meetings[0].start).toISOString().split('T')[0];

            const totalMeetings = meetings.filter((meeting: any) => {
                const meetingDate = new Date(meeting.start).toISOString().split('T')[0];
                return meetingDate === targetDate;
            });

            return totalMeetings
        }

    };

    const formattedDateRange =() =>{
        return <div dangerouslySetInnerHTML={{ __html: currentWeek }} />
    }

  
    

    const renderCalendar = (eventData: any) => {
        return (
            <>
                <FullCalendar
                
                    plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                        left: 'prev,next customTodayButton',
                        center: 'customDateRange',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay,dayGridYear',
                    }}

                    datesSet={handleDate}
                    customButtons={{
                        customTodayButton: {
                            text: String(getCurrentDay())
                        },
                        customDateRange: {
                            text: currentWeek,
                        },
                    }}
                    views={{
                        dayGridMonth: { buttonText: 'Month' },
                        timeGridWeek: { buttonText: 'Week' },
                        timeGridDay: { buttonText: 'Day' },
                        dayGridYear: { buttonText: 'Year', duration: { years: 1 } },
                    }}
                    events={sameDayMeetings(eventData) && [sameDayMeetings(eventData)[0]].map((event: any) => ({
                        id: event.id,
                        title: event.job_id.jobRequest_Title,
                        start: event.start,
                        end: event.end,
                        extendedProps: { description: event.desc, interviewer: event.user_det.handled_by ? event.user_det.handled_by.firstName : '' },
                    }))}
                    eventClick={(info) => {
                        const date = dayjs(info.event.start).format("YYYY-MM-DD");
                        setSelectedDate(String(date));
                    }}
                    dateClick={(info) => {
                        const date = info.dateStr;
                        setSelectedDate(date);
                    }}
                    eventContent={(eventInfo) => (

                        <Card
                            style={{ position: "relative", padding: 16, marginBottom: 8 }}

                        >
                            <Typography variant="h6">{eventInfo.event.title}</Typography>
                            <Typography variant="h6">{`Interviewer: ${eventInfo.event.extendedProps.interviewer}`}</Typography>

                            <Typography variant="body2">
                                {dayjs(eventInfo.event.start).format("hh:mm")} - {dayjs(eventInfo.event.end).format("hh:mm A")}
                            </Typography>


                            <Badge
                                badgeContent={sameDayMeetings(eventData).length}
                                color="primary"
                                style={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                    zIndex: 10,
                                    cursor: "pointer",
                                }}
                                onClick={() => setOpen(true)}
                            />
                        </Card>

                        //     <div>{eventInfo.event.title}</div>
                    )}
                />
                {renderDialog()}
            </>
        )
    }

    const renderDialog = () => {


        if (events) {
            const groupedMeetings = groupMeetingsByDate(events);

            let meetings = groupedMeetings[selectedDate]

            console.log("meetings", meetings)
            if (meetings && meetings.length > 0) {

                return (
                    <Dialog open={open} onClose={() => setOpen(false)}>
                        <DialogTitle>
                            <Typography variant="h6" style={{ padding: 16 }}>
                                Meetings
                            </Typography>
                            <IconButton
                                edge="end"
                                color="inherit"
                                onClick={() => setOpen(false)}
                                aria-label="close"
                                style={{ position: 'absolute', right: 8, top: 8 }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>

                        <DialogContent>
                            <Divider />
                            <List>
                                {meetings.map((meeting: any, index: any) => {
                                    const showDivider = index > 0 && String(dayjs(meetings[index].start).format('hh:mm A')) !== String(dayjs(meetings[index - 1].start).format('hh:mm A'))
                                    console.log("showDivider", showDivider)
                                    return (
                                        <>
                                            {showDivider && <Divider />}

                                            <ListItem key={index}>
                                                <ListItemText
                                                    primary={meeting.job_id ? meeting.job_id.jobRequest_Role && meeting.job_id.jobRequest_Role : ''}
                                                    secondary={
                                                        <>
                                                            <div>{`${meeting.desc ? meeting.desc : ''}` + ` | ` + `Interviewer: ${meeting.user_det.handled_by ? meeting.user_det.handled_by.firstName : ''}`}</div>
                                                            <div>{`Date: ${dayjs(meeting.start).format("DD MMM YYYY")}` + ` | ` + `Time:${dayjs(meeting.start).format("hh:mm A")} - ${dayjs(meeting.end).format("hh:mm A")}`}</div>
                                                        </>
                                                    }
                                                />
                                            </ListItem>

                                        </>
                                    )
                                }
                                )}
                            </List>
                        </DialogContent>
                    </Dialog>
                )
            }

        }

    }


    return (

        <div>
            {events && renderCalendar(events)}

        </div>
    );
};

export default CalendarScreen;
