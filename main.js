// Importar el módulo http
const http = require('http');

// Importar el módulo querystring
const querystring = require('querystring');

// Definir el puerto a utilizar
const port = 3000;

//   Definimos la base de datos \\
// Importar el cliente de MongoDB
const MongoClient = require('mongodb').MongoClient;
// Especificar la URL de conexión por defecto al servidor local
const url = 'mongodb://localhost:27017';
// Nombre de la base de datos a la que conectarse
const dbName = 'nodejs-mongo';
// Crear una instancia del cliente de MongoDB
const client = new MongoClient(url, { useNewUrlParser: true });

// Conectar el cliente al servidor
client.connect(function(err) {
    if (err) {
        console.log("Error al conectar al servidor: ", err);
        return;
    }

    console.log("Conectado con éxito al servidor");

    const db = client.db(dbName);
});


// Creamos el servidor
const server = http.createServer((request, response) => {
    const { headers, method, url } = request;
    console.log('headers: ', headers);
    console.log('method: ', method);
    console.log('url: ', url);

    // Lee los datos y los guardamos en una lista body
    let body = [];

    request.on('error', (err) => {
        console.error(err);
    }).on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        console.log('body: ', body);

        // Recolección y formateo de los parámetros
        var path = url.split("?")[0];
        var queryParams = url.split("?")[1];
        console.log(path, queryParams);
        console.log('Datos recibidos: ', body);

        let datos_query = querystring.decode(queryParams);
        console.log(datos_query);

        if (method == 'POST' && path == '/usuario') {
            client.connect().then(async() => {

                console.log("Conectado con éxito al servidor");
                const db = client.db(dbName);
                // Obtener la referencia a la colección
                const collection = db.collection('usuarios');
                // Llamar a la colleción dentro de la db para insertar un usuario con los parametros dados
                const insertResult = await collection.insertOne(datos_query);
                console.log("Resultado de la inserción: ", insertResult.result);

                // Buscar elementos para listar
                const findResult = await collection.find().toArray();
                console.log("Documentos inicio: ", findResult);
                // Código de estado HTTP que se devuelve / resultado
                response.statusCode = 200;
                // Encabezados de la respuesta, texto plano
                response.setHeader('Content-Type', 'text/html');
                response.write('<h2>Lista con los usuarios</h2><ul>');
                for (const usuario of findResult) {
                    response.write('<li> Nombre: ' + usuario["name"] + " Teléfono: " + usuario["phone"] + '</li>');
                }
                response.write('</ul>');
                response.end();

            }).catch((error) => {
                response.statusCode = 400;
                console.log("Se produjo algún error en las operaciones con la base de datos: " + error);
                client.close();
            });
        } else if (method == 'GET') {
            // Conectar el cliente al servidor
            client.connect().then(async() => {

                console.log("Conectado con éxito al servidor");
                const db = client.db(dbName);
                // Obtener la referencia a la colección
                const collection = db.collection('usuarios');

                // Llamar a la función para recuperar
                const findResult = await collection.find().toArray();
                console.log("Documentos inicio: ", findResult);
                // Código de estado HTTP que se devuelve / resultado
                response.statusCode = 200;
                // Encabezados de la respuesta, texto plano
                response.setHeader('Content-Type', 'text/html');
                response.write('<h2>Lista con los usuarios</h2><ul>');
                for (const usuario of findResult) {
                    response.write('<li> Nombre: ' + usuario["name"] + " Teléfono: " + usuario["phone"] + '</li>');
                }
                response.write('</ul>');
                response.end();


            }).catch((error) => {
                console.log("Se produjo algún error en las operaciones con la base de datos: " + error);
                client.close();
            });

        } else {
            // Código de estado HTTP que se devuelve / resultado
            response.statusCode = 404;
            response.end();
        }
    });


})

// Ejecutar el servicio para que permanezca a la espera de peticiones
server.listen(port, () => {
    console.log('Servidor ejecutándose...');
    console.log('Abrir en un navegador http://localhost:3000');
});