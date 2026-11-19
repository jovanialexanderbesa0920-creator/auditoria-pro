const { CosmosClient } = require("@azure/cosmos");

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const container = client.database("AuditoriaDB").container("audits");

module.exports = async function (context, req) {
    try {
        const querySpec = {
            query: "SELECT * FROM c ORDER BY c.createdAt DESC"
        };
        const { resources: items } = await container.items.query(querySpec).fetchAll();
        context.res = {
            status: 200,
            body: items
        };
    } catch (error) {
        context.log.error('Error al obtener auditorías:', error);
        context.res = { 
            status: 500, 
            body: { message: "Error interno en Azure Function", details: error.message }
        };
    }
};
