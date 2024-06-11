// Chemin vers le fichier .proto contenant la définition des services gRPC
const PROTO_PATH = __dirname + '/chat.proto';

// Importation des modules gRPC et proto-loader
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

var readline = require("readline");

//Read terminal Lines
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Chargement synchronisé de la définition de protocole à partir du fichier .proto
let packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    // Options de chargement pour garantir la compatibilité avec les noms de casse, les types longs et énumérations en tant que chaînes,
    // valeurs par défaut et descripteurs de type "oneof"
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

// Chargement de la définition de package gRPC à partir du package généré
let chat_proto = grpc.loadPackageDefinition(packageDefinition);

const REMOTE_SERVER = "0.0.0.0:5001";

let username;

//Create gRPC client
let client = new chat_proto.ynov_chat.Chat(REMOTE_SERVER,
    grpc.credentials.createInsecure());


//Start the stream between server and client
function startChat() {
    let channel = client.join({ user: username });

    channel.on("data", onData);

    rl.on("line", function(text) {
        client.send({ user: username, text: text }, res => {});
    });
}

//When server send a message
function onData(message) {
    if (message.user == username) {
        return;
    }
    console.log(`${message.user}: ${message.text}`);
}

//Ask user name than start the chat
rl.question("What's ur name? ", answer => {
    username = answer;

    startChat();
});