declare module "odoo-await" {
  interface OdooConfig {
    url: string; // Changed from baseUrl to url
    port?: number;
    db: string;
    username: string;
    password: string;
    [key: string]: any;
  }

  class Odoo {
    constructor(config: OdooConfig);
    connect(): Promise<Odoo>;
    execute_kw(
      model: string,
      method: string,
      args: any[],
      kwargs?: any
    ): Promise<any>;
    searchRead(model: string, domain: any[], fields: string[]): Promise<any[]>;
    search(model: string, domain: any[]): Promise<number[]>;
    read(model: string, ids: number[], fields?: string[]): Promise<any[]>;
    create(model: string, values: Record<string, any>): Promise<number>;
    write(
      model: string,
      ids: number[],
      values: Record<string, any>
    ): Promise<boolean>;
    unlink(model: string, ids: number[]): Promise<boolean>;
  }

  export default Odoo;
}
