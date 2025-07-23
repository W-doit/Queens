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

  // Add these methods to your OdooAuthService class

  /**
   * Triggers Odoo's native password reset flow
   * @param email User's email address
   * @returns Success status and message
   */
  // Fix the triggerOdooPasswordReset method

  async triggerOdooPasswordReset(
    email: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Authenticate as admin
      const adminUid = await this.authenticateAdmin();

      // 2. Find the user with that email
      const userResponse = await axios.post(`${odooConfig.url}/jsonrpc`, {
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
            "search_read",
            [[["login", "=", email]]],
            { fields: ["id", "login", "partner_id"] },
          ],
        },
      });

      const users = userResponse.data.result;
      if (!users || users.length === 0) {
        // Don't reveal if email exists
        return {
          success: true,
          message:
            "Si su correo electrónico está registrado, recibirá instrucciones para restablecer su contraseña",
        };
      }

      const userId = users[0].id;
      const partnerId = users[0].partner_id[0]; // Partner ID is returned as [id, name]

      // 3. Use Odoo's built-in reset_password method instead
      // This handles all the token generation and email sending
      await axios.post(`${odooConfig.url}/jsonrpc`, {
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
            "reset_password",
            [email],
          ],
        },
      });

      return {
        success: true,
        message:
          "Si su correo electrónico está registrado, recibirá instrucciones para restablecer su contraseña",
      };
    } catch (error: any) {
      console.error(
        "Error triggering Odoo password reset:",
        error.response?.data || error.message
      );

      // For debugging, log the full error
      if (error.response?.data) {
        console.error(
          "Odoo error details:",
          JSON.stringify(error.response.data, null, 2)
        );
      }

      return {
        success: false,
        message:
          "Error al procesar la solicitud de restablecimiento de contraseña",
      };
    }
  }
}
