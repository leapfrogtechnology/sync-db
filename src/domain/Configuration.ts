/**
 * Configuration.
 */
interface Configuration {
  sql: string[];
  hooks: {
    pre_sync: string[];
    post_sync: string[];
  };
}

export default Configuration;
