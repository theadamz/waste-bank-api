declare module "bun" {
  interface Env {
    APP_NAME: string;
    PORT: number;
    DATABASE_URL: string;
    APP_URL: string;
    PAGE_SIZE: number;
  }
}
