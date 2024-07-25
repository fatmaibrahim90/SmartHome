var mqtt = require('mqtt')
var express = require('express')
var app = express()
const cors=require('cors');
var http = require('http').Server(app)
var io = require('socket.io')(http,{
        cors: {
          origin: '*',
          method:["GET"]
        }
      });
app.use(cors());

// Port that the web server should listen on
var port = process.env.PORT || 8001;

// Enter details of the MQTT broker that you want to interface to
// By default we'll use the public HiveMQ one, so any Arduino clients using
// the PubSubClient library can easily talk to it
var MQTT_BROKER = process.env.MQTT_BROKER || "mqtt://localhost:1883"

// We need to cope with wildcards in topics, so can't just do a simple comparison
// This function returns true if they match and false otherwise
// topic1 can include wildcards, topic2 can't
var topicMatch = function(topic1, topic2) {
        // Switch our wildcards from MQTT style to Regexp style
        var matchStr = topic1.replace(/#/g, ".*")
        return (topic2.match("^"+matchStr+"$") != null)
}

var client = mqtt.connect(MQTT_BROKER)
client.on('connect', function() {
        console.log("Connected to "+MQTT_BROKER);
})

client.on('message', function(topic, payload) {
        console.log("topic: "+topic)
        console.log("payload: "+payload)
        io.emit('mqtt', { 'topic': topic, 'payload': payload.toString() })
        // Send it to any interested sockets
        Object.keys(io.sockets.adapter.rooms).map(function(room_name) {
                // See if this room matches the topic
                if (topicMatch(room_name, topic)) {
                        // It does.  Send the message
                       
                        for (var clientId in io.sockets.adapter.rooms[room_name].sockets) {
                               
                        }
                }
        })
})

io.sockets.on('connection', function(sock) {
        // New connection, listen for...
        console.log("New connection from "+sock.id)

        sock.on('subscribe', function(msg) {
               
                if (msg.topic !== undefined) {
                        console.log("Asked to subscribe to "+msg.topic)
                                sock.join(msg.topic)
                                //console.log(io.sockets.adapter.rooms);
                                //console.log(io.sockets.adapter.rooms.get(msg.topic));
                                if (io.sockets.adapter.rooms.get(msg.topic).size == 1) {
                                        // We're the first one in the room, subscribe to the MQTT topic
                                        client.subscribe(msg.topic)
                                        console.log("sss");
                                }
                                // else someone is already here, so we'll have an MQTT subscription already
                        }
                        // FIXME else It'd be nice to report the error back to the user
        })
       

        // ...publish messages
        sock.on('publish', function(msg) {
                console.log("socket published ["+msg.topic+"] >>"+msg.payload+"<<")
                client.publish(msg.topic, msg.payload)
        })

        // ...and disconnections
        sock.on('disconnect', function(reason) {
                console.log("disconnect from "+sock.id)
                // The socket will have left all its rooms now, so see if there
                // are any empty ones
                for (var sub in client._resubscribeTopics) {
                        if (io.sockets.adapter.rooms[sub] == undefined) {
                                // There's no "room" for this subscription, so no clients
                                // are watching it, so we should unsubscribe
                                console.log("Unsubscribing from "+sub)
                                client.unsubscribe(sub)
                        }
                        // else someone is watching, so leave this MQTT subscription in place
                }
        })

})

// Serve static files from the 'static_files' folder
app.use(express.static('static_files'))

// Set up web server to serve 
app.get('/', function(req, res) {
        res.sendFile(__dirname+"/static_files/mqtt-socket.html")
})

http.listen(port, function() {
        console.log("listening on "+port)
})


const axios = require('axios');
const { log } = require('console');

// Make a GET request
// axios.get('http://localhost:3000/test')
//   .then(response => {
//     console.log('Response:', response.data);
//   })
//   .catch(error => {
//     console.error('Error:', error);
//   });