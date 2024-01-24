const opcua = require("node-opcua");
const { OPCUAServer, DataType } = require("node-opcua");

let main = async (server) => {
    return new OPCUAServer({
        port: server.port,
        resourcePath: server.resourcePath,
        buildInfo: {
            productName: server.productName,
            buildNumber: "7658",
            buildDate: new Date(2014, 5, 2),
        },
    });
}

let getNestedObject = (data, value) => {
    const nestedObject = {};
    let currentNested = nestedObject;

    for (let i = 0; i < data.length; i++) {
        const key = data[i];
        if (key === "") continue;
        if (i === data.length - 1 && value) {
            currentNested[key] = value;
        } else {
            currentNested = currentNested[key] = {};
        }
    }

    return nestedObject;
}
// let i = 0
let createNodesRecursive = async(parentNode, structure, value, namespace, addressSpace) => {
    for (const key in structure) {
        if (structure.hasOwnProperty(key)) {
            let childNode = null;

            // Check if the child node already exists
            // const modifiedString = key.charAt(0).toLowerCase() + key.slice(1);
            
            if (parentNode[key]) {
                // console.log("Use existing object:", key);
                childNode = parentNode[key];
            } else {
                // console.log("Create new object:", key);
                childNode = namespace.addObject({
                    organizedBy: parentNode,
                    browseName: key,
                });
            }

            if (typeof structure[key] === "object") {
                await createNodesRecursive(childNode, structure[key], value, namespace, addressSpace);
            } else {
                // Here, you can directly add a new variable to the existing denver object
                let variableNode = null;

                const variables = childNode[key];

                if (variables && variables.browseName.name.toString() === key) {
                    // console.log("Existing Variable: ", variables.browseName.toString());
                    variableNode = variables;
                }

                if (!variableNode) {
                    // console.log("Create new variable:", key);
                    variableNode = namespace.addVariable({
                        componentOf: childNode,
                        browseName: key,
                        dataType: "Double",
                        minimumSamplingInterval: 1234,
                        value: {
                            dataType: DataType.Double,
                            value: value
                        }
                    });
                    addressSpace.installHistoricalDataNode(variableNode);
                    // console.log(`Variable ${variableNode.browseName.toString()} created successfully with value ${value}.`);
                } else {
                    try {
                        variableNode.setValueFromSource({
                            dataType: "Double",
                            value: value,
                        });
                        // console.log(`Variable ${variableNode.browseName.toString()} updated successfully as value ${value}.`);
                    } catch (error) {
                        console.error(`Error updating variable ${key}:`, error.message);
                    }
                }
            }
        }
    }
}

let servers = [
    {
        productName: 'MySampleServer1',
        resourcePath: '/UA/MyLittleServer1',
        port: 4335
    },
    {
        productName: 'MySampleServer2',
        resourcePath: '/UA/MyLittleServer2',
        port: 4336
    },
    {
        productName: 'MySampleServer3',
        resourcePath: '/UA/MyLittleServer3',
        port: 4337
    },
    {
        productName: 'MySampleServer4',
        resourcePath: '/UA/MyLittleServer4',
        port: 4338
    },
    {
        productName: 'MySampleServer5',
        resourcePath: '/UA/MyLittleServer5',
        port: 4339
    }
]

module.exports = {
    main,
    getNestedObject,
    createNodesRecursive,
    servers
}