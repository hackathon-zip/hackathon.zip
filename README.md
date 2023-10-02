# [`hackathon.zip`](https://hackathon.zip)

We're building hackathon infrastructure that just works.

## Routing System

```
hackathon.zip/route -> /landing/route
hackathon.zip/api/route -> /api/route
```

```
organizer.hackathon.zip/route -> /organizer/route
organizer.hackathon.zip/api/route -> /api/organizer/route
```

```
[event].hackathon.zip/route -> /attendee/[event]/route
[event].hackathon.zip/api/route -> /api/attendee/[event]/route

// Or if using custom domains
[customdomain]/route -> /attendee/[event]/route
[customdomain]/api/route -> /api/attendee/[event]/route
```

```
api.hackathon.zip/route -> /api/integration/route
```
