import { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
    Card, Badge, Typography, Dialog, List, ListItem, ListItemText,
    IconButton, DialogTitle, DialogContent, Divider, Box, Button, CardContent
} from "@mui/material";
import dayjs from "dayjs";
import CloseIcon from '@mui/icons-material/Close';
import { GmeetIcon } from "../../Icons/CommonIcons";
import '@fortawesome/fontawesome-free/css/all.min.css'
import './calendar.css';

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

    const [openSelectedMeeting, setOpenSelectedMeeting] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState(null as any);

    const [calendarRef, setCalendarRef] = useState(null);




    // useEffect(() => {
    //     const centerHeader = document.querySelector('.fc-header-toolbar .fc-center');
    //     if (centerHeader) {
    //       centerHeader.innerHTML = `<span class="custom-text">${currentWeek}</span>`;
    //     }
    //   }, [currentWeek]);



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

    const formatDate = (date: Date, type?: string, compName?: string): string => {
        const day = date.getDate();
        const suffix = getDaySuffix(day);
        const dayWithSuffix = `${day}${suffix}`;
        console.log("dayWithSuffix BEFORE---------", dayWithSuffix)
        const formattedDay = ssDateRange(dayWithSuffix);
        console.log("dayWithSuffix AFTER---------", formattedDay)

        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        if (compName === 'calendar' && type === 'start') {
            return `${formattedDay} ${month}`;
        }
        return `${formattedDay} ${month}, ${year}`;
    };

    const handleDate = (arg: any) => {
        console.log("ARG", arg)
        const start = formatDate(arg.start, 'start', 'calendar');
        const end = formatDate(arg.end, 'end', 'calendar');
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


    const selectedMeetingFiles = () => {
        return (
            <div className="file-buttons-container">
                <div className="file-button">
                    <span className="file-name">Resume.docx</span>
                    <div className="icons">
                        <i className="fas fa-eye icon"></i>
                        <i className="fas fa-download icon"></i>
                    </div>
                </div>
                <div className="file-button">
                    <span className="file-name">Aadharcard</span>
                    <div className="icons">
                        <i className="fas fa-eye icon"></i>
                        <i className="fas fa-download icon"></i>
                    </div>
                </div>
            </div>
        );
    };


    const renderEventContent = (eventInfo: any, eventData:any) => {
        return (
            <Card
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    borderRadius: '5px',
                    cursor: "pointer",
                    width:"250px",
                    backgroundColor: 'white', 
                }}
                onClick={() => setOpen(true)}

            >
                <div style={{
                    width: '15px',
                    backgroundColor: '#1976d2',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                }}></div>

                <CardContent style={{
                    marginLeft: '10px',
                    padding: '10px 15px',
                    fontSize: '12px',
                }}>
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
                </CardContent>
            </Card>
        );
    };


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

                    dayHeaderContent={(args) => {
                        const date = args.date;
                        const day = date.toLocaleDateString('en-GB', { weekday: 'long' });
                        const dayNumber = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

                        return (
                            <div>
                                <div>{dayNumber}</div>
                                <div>{day}</div>
                            </div>
                        );
                    }}
                    height="auto"
                    slotMinTime="10:00:00"
                    slotMaxTime="22:00:00"
                    allDaySlot={false}
                    slotDuration="00:60:00"  
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
                    eventContent={(eventInfo) => renderEventContent(eventInfo, eventData)}

                />
                {renderDialog()}
            </>
        )
    }



    const handleSelectedMeeting = (event: any, currentMeeting: object) => {

        if (!event) {
            return
        } else {
            console.log("currMeet", currentMeeting)
            setOpen(false)
            setOpenSelectedMeeting(true)
            setSelectedMeeting((prevState: any) => currentMeeting)

        }

    }

    const renderMeetingsDialog = (meetingsData: any) => {

        return (
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>
                    <Typography variant="h6" style={{ padding: 16 }}>
                        Meetings
                    </Typography>
                    <IconButton
                        edge="end"
                        color="primary"
                        onClick={() => setOpen(false)}
                        style={{
                            position: "absolute",
                            top: -3,
                            right: 8,
                            backgroundColor: "#1976d2",
                            color: "#fff",
                            borderRadius: "50%",
                            padding: "2px",
                            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.15)",
                            zIndex: 1,
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent>
                    <Divider />
                    <List>
                        {meetingsData.map((meeting: any, index: any) => {
                            const showDivider = index > 0 && String(dayjs(meetingsData[index].start).format('hh:mm A')) !== String(dayjs(meetingsData[index - 1].start).format('hh:mm A'))
                            console.log("showDivider", showDivider)
                            return (
                                <>
                                    {showDivider && <Divider />}

                                    <ListItem key={index} style={{ cursor: "pointer" }} onClick={(e) => handleSelectedMeeting(e, meeting)} >
                                        <ListItemText
                                            primary={meeting.job_id ? meeting.job_id.jobRequest_Role && meeting.job_id.jobRequest_Role : ''}
                                            secondary={
                                                <>
                                                    <div>{`${meeting.desc ? meeting.desc : ''}` + ` | ` + `Interviewer: ${meeting.user_det.handled_by ? meeting.user_det.handled_by.firstName : ''}`}</div>
                                                    <div>{`Date: ${formatDate(new Date(meeting.start))}` + ` | ` + `Time:${dayjs(meeting.start).format("hh:mm")} - ${dayjs(meeting.end).format("hh:mm A")}`}</div>
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

    const handleCloseSelectedMeeting  =() =>{
        setOpenSelectedMeeting(false)
        setSelectedMeeting(null)
    }

    const renderSelectedMeting = () => {
        if (!selectedMeeting) {
            return
        } else {
            let candidateName = selectedMeeting.user_det && selectedMeeting.user_det.candidate && `${selectedMeeting.user_det.candidate.candidate_firstName + selectedMeeting.user_det.candidate.candidate_lastName}`
            let positionName = selectedMeeting.job_id && selectedMeeting.job_id.jobRequest_Title ? selectedMeeting.job_id.jobRequest_Title : ''
            // According to data given its null  for createdBy that y its empty
            let createdBy = selectedMeeting.job_id && selectedMeeting.job_id.jobRequest_createdBy ? selectedMeeting.job_id.jobRequest_createdBy : ''
            let interviewDate = selectedMeeting.start && formatDate(new Date(selectedMeeting.start));
            let interviewTime = selectedMeeting.start && selectedMeeting.end ? `${dayjs(selectedMeeting.start).format("hh:mm")} - ${dayjs(selectedMeeting.end).format("hh:mm A")}` : ''


            return (
                <Dialog
                    open={openSelectedMeeting}
                    onClose={handleCloseSelectedMeeting}
                    maxWidth="md"
                    PaperProps={{
                        style: { padding: "16px", border: "2px solid #ccc", borderRadius: "8px" },
                    }}
                >
                    <DialogTitle style={{ margin: "-14px" }}>
                        <IconButton
                            edge="end"
                            color="primary"
                            onClick={handleCloseSelectedMeeting}
                            style={{
                                position: "absolute",
                                top: -3,
                                right: 8,
                                backgroundColor: "#1976d2",
                                color: "#fff",
                                borderRadius: "50%",
                                padding: "2px",
                                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.15)",
                                zIndex: 1,
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <Box
                        display="flex"
                        gap="16px"

                        style={{ border: "1px solid #ccc", padding: "16px", borderRadius: "8px", }}
                    >
                        <Box flex="1" style={{ padding: "8px" }}>
                            <>
                                <div className="selected-meeting-content">{`Interviewer With : ${candidateName}`}</div>
                                <div className="selected-meeting-content">{`Position : ${positionName}`}</div>
                                <div className="selected-meeting-content">{`Created By : ${createdBy}`}</div>
                                <div className="selected-meeting-content">{`Interview Date : ${interviewDate}`}</div>
                                <div className="selected-meeting-content">{`Interview Time : ${interviewTime}`}</div>
                                <div className="selected-meeting-content">{`Interview Via : Google Meet`}</div>
                                {selectedMeetingFiles()}
                            </>
                        </Box>
                        <Box
                            style={{
                                width: "1px",
                                backgroundColor: "#ccc",
                                margin: "0 16px",
                            }}
                        />
                        <Box
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "45px",
                                width: "50%"
                            }}
                        >
                            <GmeetIcon />
                            <Button variant="contained" color="primary" style={{ marginTop: "16px" }} >
                                Join
                            </Button>
                        </Box>
                    </Box>
                    <DialogContent>

                    </DialogContent>

                </Dialog>
            )

        }
    }

    const renderDialog = () => {


        if (events) {
            const groupedMeetings = groupMeetingsByDate(events);

            let meetings = groupedMeetings[selectedDate]

            console.log("meetings", meetings)
            if (meetings && meetings.length > 0) {

                return (
                    <>
                        {renderMeetingsDialog(meetings)}
                        {renderSelectedMeting()}
                    </>
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
