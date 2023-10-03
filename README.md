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

## Local Development

Clone the repository and run `npm install` (or `yarn` if you prefer).

```
git clone https://github.com/hackathon-zip/hackathon.zip.git
```

### Environment variables

Make a copy of the `.env.example` file and name it `.env.development.local`. Fill in the values for the environment variables.

### Running the server

Run `npm run dev` (or `yarn dev`) to start the server. It will automatically restart when you make changes to the code.

### Accessing the server

The server will be running at `http://localhost:3000`. You can access the landing page at `http://localhost:3000/`, the organizer page at `http://organizer.localhost:3000/`, and the attendee page at `http://[event].localhost:3000/`.

#### Custom domain testing

If you want to test custom domains, you can add the following lines to your `/etc/hosts` file:

```
127.0.0.1 [full domain here]
```

Make sure the domain is set in the organizer dashboard (or the database, if you so dare)

## Todo

- [ ] Ship (showcase) functionality
- [ ] Broadcasts (communication) functionality
- [ ] Schedule functionality
- [ ] Better check-in system
- [ ] Dark mode
- [ ] Build out settings page
  - [ ] Add a way to add custom domains
  - [ ] Transfer ownership of event
  - [ ] Delete event
  - [ ] Change event date
  - [ ] Change event name
  - [ ] Change event location
- [ ] Add event branding
  - [ ] Printful Merch Integration (@jackmerrill)

_More will be added soon_
