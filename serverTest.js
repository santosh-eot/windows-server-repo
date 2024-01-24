const {main, getNestedObject, createNodesRecursive} = require('./helper')
const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });
let opcusServer, addressSpace, namespace;

(async () => {
    opcusServer = await main({
        productName: 'Denver Server',
        resourcePath: '/UA/DenverServer',
        port: 4335
      });
    await opcusServer.initialize();
    // console.log(server);
    opcusServer.start(function () {
        // console.log("Server is now listening ... ( press CTRL+C to stop)");
        // console.log("port ", opcusServer?.endpoints[0]?.port);
    });
    const endpointUrl = opcusServer?.endpoints[0]?.endpointDescriptions()[0]?.endpointUrl;
    console.log("The primary server endpoint url is ", endpointUrl);
    addressSpace = opcusServer.engine.addressSpace;
    namespace = addressSpace.getOwnNamespace();
    var intervalId = setInterval(test, 1000);
})()

let test = ()=>{
    const topic = '/oldGreen/denver/temperature'
    const message = Math.random()*100
    const value = message;
    const finalvalue = topic.split("/").pop().split(" ")[0];
    const data = topic
        .split("/")
        .filter((element) => element)
        .map((element) => element.split(" ")[0])
        .filter((element) => isNaN(element));
    
    // console.log(data)
    const nestedObject = getNestedObject(data, finalvalue);
    createNodesRecursive(
        opcusServer.engine.addressSpace.rootFolder.objects,
        nestedObject,
        value,
        namespace,
        addressSpace
    ).then(() => {
        // client.unsubscribe(topic);
        // console.log("Unsubscribed from topic:", topic);
    })
    .catch(error=>{
        console.log(error)
    });
}



// setTimeout(function() {
//     clearInterval(intervalId); // Stop the loop
//     console.log("Loop stopped after 10 seconds.");
// }, 10000000);