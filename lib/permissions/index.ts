interface User {
    id: string;
}

function Permissions<SelfType>() {
    class PermissionsHelper {
        object: SelfType;

        constructor(object: SelfType) {
            this.object = object;
        }
    }

    return PermissionsHelper;
}

import type {
    Attendee,
    AttendeeAttribute,
    AttendeeAttributeValue,
    Hackathon
} from "@prisma/client";

let foo: [
    Attendee,
    AttendeeAttribute,
    AttendeeAttributeValue,
    Hackathon & { attendees: Attendee[] }
][] = [];

export class HackathonPolicy extends Permissions<
    Hackathon & { attendees: Attendee[] }
>() {
    get hackathon() {
        return this.object;
    }

    canOrganizerAccess(user: User) {
        return (
            user.id == this.hackathon.ownerId ||
            this.hackathon.collaboratorIds.includes(user.id)
        );
    }

    canAttendeeAccess(attendee: Attendee) {
        return this.hackathon.attendees.map((x) => x.id).includes(attendee.id);
    }
}

export class AttendeePolicy extends Permissions<Attendee>() {}
