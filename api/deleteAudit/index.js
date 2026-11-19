const { CosmosClient } = require("@azure/cosmos");

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const container = client.database("AuditoriaDB").container("audits");

module.exports = async function (context, req) {
    const id = context.bindingData.id;
    try {
        // En Cosmos DB, eliminar requiere el ID y la Partition Key (que definimos como /category)
        // Pero para simplificar, si no tenemos la PK a mano, podemos buscarlo primero o pasarla en el body.
        // Aquí intentaremos eliminar asumiendo que el ID es suficiente si la PK es el mismo ID o buscarlo.
        
        // Mejor práctica: buscar el item para obtener su partition key si no se conoce.
        const { resource: item } = await container.item(id).read();
        
        if (item) {
            await container.item(id, item.category).delete();
            context.res = { status: 204 };
        } else {
            context.res = { status: 404, body: "Auditoría no encontrada" };
        }
    } catch (error) {
        context.log.error('Error al eliminar auditoría:', error);
        context.res = { 
            status: 500, 
            body: { message: "Error interno al eliminar", details: error.message }
        };
    }
};
