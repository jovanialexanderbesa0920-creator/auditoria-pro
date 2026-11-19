const { CosmosClient } = require("@azure/cosmos");

// La cadena de conexión se configura en los Settings de la Azure Static Web App
const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const container = client.database("AuditoriaDB").container("audits");

module.exports = async function (context, req) {
    try {
        const audit = req.body;
        if (!audit) {
            context.res = { status: 400, body: "Por favor envíe una auditoría en el cuerpo de la solicitud" };
            return;
        }
        
        // Asegurar timestamp
        if (!audit.createdAt) audit.createdAt = Date.now();
        
        const { resource: createdItem } = await container.items.create(audit);
        context.res = {
            status: 201,
            body: createdItem
        };
    } catch (error) {
        context.log.error('Error al guardar auditoría:', error);
        context.res = { 
            status: 500, 
            body: { message: "Error interno en Azure Function", details: error.message }
        };
    }
};
