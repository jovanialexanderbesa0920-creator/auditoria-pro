/**
 * Data Service para AuditoriaPro
 * Este servicio abstrae las llamadas a la base de datos para facilitar
 * la migración de Firebase a Azure (API local /api/).
 */

const IS_AZURE = true; // Cambiar a false si se quiere volver a Firebase

export const dataService = {
  /**
   * Obtiene todas las auditorías
   */
  async getAudits() {
    if (IS_AZURE) {
      try {
        const response = await fetch('/api/getAudits');
        if (!response.ok) throw new Error('Error en Azure Functions');
        return await response.json();
      } catch (error) {
        console.error("Error fetching audits from Azure:", error);
        throw error;
      }
    } else {
      // Aquí iría la lógica de Firebase si se necesitara el fallback
      console.warn("Firebase fallback no implementado en este servicio.");
      return [];
    }
  },

  /**
   * Guarda una nueva auditoría
   */
  async saveAudit(payload) {
    if (IS_AZURE) {
      try {
        const response = await fetch('/api/saveAudit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Error al guardar en Azure');
        return await response.json();
      } catch (error) {
        console.error("Error saving audit to Azure:", error);
        throw error;
      }
    } else {
      // Fallback
    }
  },

  /**
   * Elimina una auditoría (Opcional implementar en Azure si se requiere)
   */
  async deleteAudit(id) {
    if (IS_AZURE) {
      try {
        const response = await fetch(`/api/deleteAudit/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar en Azure');
        return true;
      } catch (error) {
        console.error("Error deleting audit from Azure:", error);
        throw error;
      }
    }
  }
};
