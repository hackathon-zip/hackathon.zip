import type {
    Attendee,
    AttendeeAttribute,
    AttendeeAttributeValue,
    Hackathon,
    Project,
    ProjectAttributeValue,
    ProjectAttribute
} from "@prisma/client";

export type AttendeeWithAttributes = Attendee & {
    attributeValues: AttendeeAttributeValue[];
};

export type ProjectWithAttributes = Project & {
    attributeValues: ProjectAttributeValue[];
};

export type HackathonWithProjects = Hackathon & {
    projects: Project[];
};

export type HackathonWithAttendees = Hackathon & {
    attendees: Attendee[];
};

export type HackathonWithAttendeesAndAttributes = HackathonWithAttendees & {
    attendeeAttributes: AttendeeAttribute[];
};

export type HackathonWithProjectsAndAttributes = HackathonWithProjects & {
    projectAttributes: ProjectAttribute[];
};
