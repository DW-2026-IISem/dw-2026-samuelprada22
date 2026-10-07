import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

interface DatabaseConfig {
  dialect: string;
  host: string;
  username: string;
  password: string;
  database: string;
  port: number;
}

const dbConfigurations: Record<string, DatabaseConfig> = {
  mysql: {
    dialect: "mysql",
    host: process.env.DB_MYSQL_HOST || "localhost",
    username: process.env.DB_MYSQL_USERNAME || "root",
    password: process.env.DB_MYSQL_PASSWORD || "",
    database: process.env.DB_MYSQL_NAME || "test",
    port: parseInt(process.env.DB_MYSQL_PORT || "3306", 10),
  },

  postgres: {
    dialect: "postgres",
    host: process.env.DB_POSTGRES_HOST || "localhost",
    username: process.env.DB_POSTGRES_USERNAME || "postgres",
    password: process.env.DB_POSTGRES_PASSWORD || "",
    database: process.env.DB_POSTGRES_NAME || "test",
    port: parseInt(process.env.DB_POSTGRES_PORT || "5432", 10),
  },

  mssql: {
    dialect: "mssql",
    host: process.env.DB_MSSQL_HOST || "localhost",
    username: process.env.DB_MSSQL_USERNAME || "sa",
    password: process.env.DB_MSSQL_PASSWORD || "",
    database: process.env.DB_MSSQL_NAME || "test",
    port: parseInt(process.env.DB_MSSQL_PORT || "1433", 10),
  },

  oracle: {
    dialect: "oracle",
    host: process.env.DB_ORACLE_HOST || "localhost",
    username: process.env.DB_ORACLE_USERNAME || "",
    password: process.env.DB_ORACLE_PASSWORD || "",
    database: process.env.DB_ORACLE_NAME || "XEPDB1",
    port: parseInt(process.env.DB_ORACLE_PORT || "1521", 10),
  },
};

const selectedEngine = (
  process.env.DB_ENGINE || "mysql"
).toLowerCase();

const selectedConfig = dbConfigurations[selectedEngine];

if (!selectedConfig) {
  throw new Error(
    `Motor de base de datos no soportado: ${selectedEngine}`
  );
}

console.log(
  `🔌 Conectando a base de datos: ${selectedEngine.toUpperCase()}`
);

console.log(
  `🌐 Host: ${selectedConfig.host}:${selectedConfig.port}`
);

console.log(
  `👤 Usuario: ${selectedConfig.username}`
);

console.log(
  `🗄️ Base de datos: ${selectedConfig.database}`
);

export const sequelize = new Sequelize(
  selectedConfig.database,
  selectedConfig.username,
  selectedConfig.password,
  {
    host: selectedConfig.host,
    port: selectedConfig.port,
    dialect: selectedConfig.dialect as any,

    logging:
      process.env.NODE_ENV === "development"
        ? console.log
        : false,

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export const getDatabaseInfo = () => {
  return {
    engine: selectedEngine,
    config: selectedConfig,
    connectionString:
      `${selectedConfig.dialect}://` +
      `${selectedConfig.username}@` +
      `${selectedConfig.host}:` +
      `${selectedConfig.port}/` +
      `${selectedConfig.database}`,
  };
};

export const testConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();

    console.log(
      `✅ Conexión exitosa a ${selectedEngine.toUpperCase()}`
    );

    return true;
  } catch (error) {
    console.error(
      `❌ Error de conexión a ${selectedEngine.toUpperCase()}:`,
      error
    );

    return false;
  }
};
