import type {
    Attendee,
    AttendeeAttribute,
    AttendeeAttributeValue,
    Hackathon
} from "@prisma/client";

export type AttendeeWithAttributes = Attendee & {
    attributeValues: AttendeeAttributeValue[];
};

export type HackathonWithAttendees = Hackathon & {
    attendees: Attendee[];
};

export type HackathonWithAttendeesAndAttributes = HackathonWithAttendees & {
    attendeeAttributes: AttendeeAttribute[];
};
