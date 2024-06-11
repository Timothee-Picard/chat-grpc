// Chemin vers le fichier .proto contenant la définition des services gRPC
const PROTO_PATH = __dirname + '/chat.proto';

// Importation des modules gRPC et proto-loader
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

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

let users = [];
const SERVER_ADDRESS = "0.0.0.0:5001"

// Recevoir un message du client rejoignant le chat
function join(call, callback) {
    users.push(call);
    console.log("New user joined the chat");
    notifyChat({ user: "Server", text: "new user joined ..." });
}

// Recevoir un message du client
function send(call, callback) {
    console.log(`Received message from ${call.request.user}: ${call.request.text}`);
    notifyChat(call.request);
}

// Envoyer un message à tous les clients connectés
function notifyChat(message) {
    console.log(`Sending message to all users: ${message.user}: ${message.text}`);
    users.forEach(user => {
        user.write(message);
    });
}

// Fonction principale pour le serveur gRPC
function main() {
    // Création d'une nouvelle instance de serveur gRPC
    let server = new grpc.Server();

    // Ajout des services join et send au serveur, en utilisant la définition de service du package gRPC
    server.addService(chat_proto.ynov_chat.Chat.service, {
        join: join, send: send
    });

    // Liaison asynchrone du serveur à l'adresse et au port spécifiés, avec des informations d'authentification non sécurisées
    server.bindAsync(SERVER_ADDRESS, grpc.ServerCredentials.createInsecure(), (error, port) => {
        // Gestion des erreurs potentielles lors de la liaison du serveur
        if (error) {
            console.error(error);
            return;
        }
        // Affichage d'un message de confirmation une fois que le serveur est démarré avec succès
        console.log(`Server started on port ${port}`);
    });
}

// Appel de la fonction principale pour démarrer le serveur
main();