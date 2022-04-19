require('dotenv').config()
const { Server } = require("socket.io");
const { v4: uuidv4 } = require('uuid');
const Twitter = require('twitter');

if (!process.env.CONSUMER_KEY || !process.env.CONSUMER_SECRET || !process.env.ACCESS_TOKEN_KEY || !process.env.ACCESS_TOKEN_SECRET) {
  throw new Error('You must provide consumer and access token key/secret for the twitter client first')
}

const client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});
const io = new Server(9000, { cors: { origin: ["http://localhost:3000"] } });

function TwitterTracker() {
  return {
    listeners: {},
    terms: {},
    streams: {},
    trackTerm(term) {
      const stream = client.stream("statuses/filter", {track: term})
      stream.on("data", tweet => {
        this.terms[term].forEach(client_id => {
          this.listeners[client_id]?.socket.emit(term, tweet)
        })
      })
      stream.on("error", console.error)
      this.streams[term] = stream
    },
    addListener(client_id, socket) {
      this.listeners[client_id] = {
        socket,
        trackedTerms: []
      }
    },
    addTermListener(term, client_id) {
      if (!this.terms[term]) {
        this.terms[term] = []
        this.trackTerm(term);
      }
      this.terms[term].push(client_id)
      this.listeners[client_id].trackedTerms.push(term);
    },
    removeTermListener(term, client_id) {
      this.terms[term].splice(this.terms[term].indexOf(client_id), 1)
      if (this.terms[term].length === 0) {
        this.streams[term].destroy()
        delete this.streams[term]
        delete this.terms[term]
      }
    },
    removeTrackedTermFromListener(term, client_id) {
      this.listeners[client_id].trackedTerms.splice(this.listeners[client_id].trackedTerms.indexOf(term), 1)
    },
    removeAndCleanTermListener(term, client_id) {
      this.removeTermListener(term, client_id)
      this.removeTrackedTermFromListener(term, client_id)
    },
    cleanUpListener(client_id) {
      this.listeners[client_id].trackedTerms.forEach((term) => {
        this.removeTermListener(term, client_id)
      })
      delete this.listeners[client_id]
    }
  }
}

const tracker = new TwitterTracker()

io.on('connection', (socket) => {
  const clientId = uuidv4()
  tracker.addListener(clientId, socket);
  socket.on('disconnect', () => {
    tracker.cleanUpListener(clientId);
  })
  socket.on('track', (term) => {
    tracker.addTermListener(term, clientId)
  })
  socket.on('untrack', (term) => {
    tracker.removeAndCleanTermListener(term, clientId)
  })
})