# moodi-uptime-checker
Periodically check URLs and display their status code and response duration

### How to install
- `git clone git@github.com:mazlo/moodi-uptime-checker.git`
- `cd moodi-uptime-checker`
- `npm install`

### How to start

This application needs a running mongodb instance to save configurations and checks. Please name the collection ` uptime-checks`. This is the connection string `mongodb://localhost:27017/uptime-checks`

During development you can start the application with `nodemon` to automatically restart the node when a file get's changed, which `DEBUG=myapp:* ./node_modules/.bin/nodemon app.js`

In production just do `npm start`
