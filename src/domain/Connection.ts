/**
 * Database connection configuration.
 */
interface Connection {
  id?: string;
  host: string;
  port: string;
  user: string;
  database: string;
  password: string;
  client: string;
  requestTimeout?: number;
  charset?: string;
  options?: any;
}

export default Connection;
