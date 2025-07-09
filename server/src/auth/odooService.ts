import axios from "axios";
import { odooConfig } from "./config";

export class OdooAuthService {
  private uid: number | null = null;

  /**
   * Autentica como administrador para operaciones que requieren permisos elevados
   */
  async authenticateAdmin(): Promise<number> {
    try {
      const response = await axios.post(`${odooConfig.url}/jsonrpc`, {
        jsonrpc: "2.0",
        method: "call",
        id: Date.now(),
        params: {
          service: "common",
          method: "login",
          args: [odooConfig.db, odooConfig.adminUser, odooConfig.adminPassword],
        },
      });

      if (!response.data.result) {
        throw new Error("Autenticación de administrador fallida");
      }

      this.uid = response.data.result;
      return this.uid;
    } catch (error: any) {
      console.error(
        "Error autenticando admin:",
        error.response?.data || error.message
      );
      throw new Error("Error de autenticación con Odoo");
    }
  }

  /**
   * Autentica un usuario regular
   */
  async authenticateUser(
    email: string,
    password: string
  ): Promise<{ uid: number; userData: any }> {
    try {
      // 1. Primero autenticar para obtener UID
      const loginResponse = await axios.post(`${odooConfig.url}/jsonrpc`, {
        jsonrpc: "2.0",
        method: "call",
        id: Date.now(),
        params: {
          service: "common",
          method: "login",
          args: [odooConfig.db, email, password],
        },
      });

      const uid = loginResponse.data.result;

      if (!uid) {
        throw new Error("Credenciales inválidas");
      }

      // 2. Obtener datos del usuario
      const userDataResponse = await axios.post(`${odooConfig.url}/jsonrpc`, {
        jsonrpc: "2.0",
        method: "call",
        id: Date.now(),
        params: {
          service: "object",
          method: "execute_kw",
          args: [
            odooConfig.db,
            uid,
            password,
            "res.users",
            "read",
            [uid],
            { fields: ["name", "email", "partner_id"] },
          ],
        },
      });

      const userData = userDataResponse.data.result[0];

      return { uid, userData };
    } catch (error: any) {
      console.error(
        "Error de autenticación:",
        error.response?.data || error.message
      );
      if (error.message === "Credenciales inválidas") {
        throw error;
      }
      throw new Error("Error al conectar con Odoo");
    }
  }

  /**
   * Verifica si un usuario ya existe
   */
  async userExists(email: string): Promise<boolean> {
    try {
      const adminUid = await this.authenticateAdmin();

      const response = await axios.post(`${odooConfig.url}/jsonrpc`, {
        jsonrpc: "2.0",
        method: "call",
        id: Date.now(),
        params: {
          service: "object",
          method: "execute_kw",
          args: [
            odooConfig.db,
            adminUid,
            odooConfig.adminPassword,
            "res.users",
            "search_count",
            [[["login", "=", email]]],
          ],
        },
      });

      return response.data.result > 0;
    } catch (error: any) {
      console.error(
        "Error verificando usuario:",
        error.response?.data || error.message
      );
      throw new Error("Error al verificar usuario en Odoo");
    }
  }

  /**
   * Crea un nuevo usuario portal
   */
  async createUser(
    name: string,
    email: string,
    password: string
  ): Promise<number> {
    try {
      // Verificar si el usuario ya existe
      const exists = await this.userExists(email);
      if (exists) {
        throw new Error("El correo electrónico ya está registrado");
      }

      const adminUid = await this.authenticateAdmin();

      const response = await axios.post(`${odooConfig.url}/jsonrpc`, {
        jsonrpc: "2.0",
        method: "call",
        id: Date.now(),
        params: {
          service: "object",
          method: "execute_kw",
          args: [
            odooConfig.db,
            adminUid,
            odooConfig.adminPassword,
            "res.users",
            "create",
            [
              {
                name,
                login: email,
                email,
                password,
                groups_id: [[6, 0, [odooConfig.portalGroupId]]],
              },
            ],
          ],
        },
      });

      if (!response.data.result) {
        throw new Error("Error al crear el usuario");
      }

      return response.data.result;
    } catch (error: any) {
      console.error(
        "Error creando usuario:",
        error.response?.data || error.message
      );
      if (error.message === "El correo electrónico ya está registrado") {
        throw error;
      }
      throw new Error("Error al crear usuario en Odoo");
    }
  }
}
