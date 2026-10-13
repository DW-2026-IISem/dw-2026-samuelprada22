---
editor_options:
  markdown:
    wrap: 72
---

# PROYECTO 29

## 29. FondoSolidario - Cooperativa de ahorro y crédito

**Socios / cuentas / créditos / movimientos**

------------------------------------------------------------------------

# NARRATIVA DEL PROYECTO

FondoSolidario administra aportes, cuentas de ahorro y créditos de sus
asociados. El sistema permite registrar movimientos con referencia,
tipo, fecha, cantidad y observaciones, gestionar solicitudes de crédito,
créditos aprobados, tasas de interés, cuotas y pagos de cuotas.

El sistema mantiene los saldos y registros financieros de forma
reproducible. Las decisiones relacionadas con créditos, movimientos
sensibles, ajustes y otras operaciones que requieren control deben
contar con autorización mediante roles y permisos, además de generar
registros de auditoría.

La aplicación implementa autenticación mediante JWT y autorización
basada en roles y recursos (RBAC), aplicando el principio de denegación
por defecto.

------------------------------------------------------------------------

# ENTIDADES DE NEGOCIO

| Entidad de dominio | Nombre en el sistema | Atributos / claves principales |
|------------------------|------------------------|------------------------|
| Socio | `Member` | `id`, `name`, `description`, `isActive`, `createdAt`, `updatedAt` |
| Cuenta | `Account` | `id`, `member_id`, `name`, `description`, `status`, `createdAt`, `updatedAt` |
| Movimiento | `Movement` | `id`, `account_id`, `reference`, `type`, `date`, `amount`, `description`, `status`, `createdAt`, `updatedAt` |
| Solicitud de Crédito | `CreditApplication` | `id`, `member_id`, `reference`, `date`, `amount`, `status`, `description`, `createdAt`, `updatedAt` |
| Crédito | `Credit` | `id`, `credit_application_id`, `rate_id`, `member_id`, `date`, `amount`, `status`, `description`, `createdAt`, `updatedAt` |
| Tasa | `Rate` | `id`, `name`, `description`, `rate`, `isActive`, `createdAt`, `updatedAt` |
| Cuota | `Installment` | `id`, `credit_id`, `number`, `dueDate`, `amount`, `status`, `createdAt`, `updatedAt` |
| Pago de Cuota | `InstallmentPayment` | `id`, `installment_id`, `date`, `amount`, `status`, `reference`, `createdAt`, `updatedAt` |
| Decisión de Comité | `CommitteeDecision` | `id`, `credit_application_id`, `decision`, `observations`, `createdAt`, `updatedAt` |
| Auditoría | `Audit` | `id`, `actor_user_id`, `action`, `entity`, `entity_id`, `data`, `createdAt` |

------------------------------------------------------------------------

# RELACIONES DE NEGOCIO

-   `Member` **1:N** `Account`
-   `Account` **1:N** `Movement`
-   `Member` **1:N** `CreditApplication`
-   `CreditApplication` **0..1:1** `Credit`
-   `Rate` **1:N** `Credit`
-   `Credit` **1:N** `Installment`
-   `Installment` **1:N** `InstallmentPayment`
-   `CreditApplication` **1:N** `CommitteeDecision`
-   Las operaciones sensibles generan registros en `Audit`.

------------------------------------------------------------------------

# ARQUITECTURA DE AUTORIZACIÓN

FondoSolidario implementa autenticación y autorización mediante **JWT +
RBAC**.

## Roles

Los roles principales del sistema son:

-   `ADMIN`
-   `SELLER`
-   `ANALYST`
-   `COMMITTEE`
-   `AUDITOR`

------------------------------------------------------------------------

# 1. ISS-00 — Requisitos previos

**Objetivo:** entorno listo para el laboratorio.\
**Bloqueado por:** ninguno.

### Criterios de aceptación (ISS-00)

-   [x] `node -v` muestra v20+ (lab: v24.x)
-   [x] `npm -v` responde
-   [x] Motor de BD accesible (MySQL recomendado para el primer `sync`)

### Pasos

``` bash
node -v
npm -v
```

### Verificación del ISS

``` bash
node -v && npm -v
```

![](images/clipboard-2184761415.png)

------------------------------------------------------------------------

# 2. ISS-01 — Esqueleto del proyecto

**Objetivo:** proyecto npm + TypeScript + Express con estructura
`features/` y servidor HTTP base.\
**Bloqueado por:** ISS-00.

### Criterios de aceptación (ISS-01) — consolidados

-   [x] **2.1** Existe `package.json` con `"type": "commonjs"` y scripts
    `build` / `dev`
-   [x] **2.2** Árbol `src/` con `config`, `database/seeders`, `routes`,
    `features/business/client` (auth **fuera de alcance** de este lab)
-   [x] **2.3** Dependencias Express/TS instaladas (`npm ls --depth=0`)
-   [x] **2.4** Existe `tsconfig.json` (`rootDir: ./src`,
    `outDir: ./dist`, `strict: true`)
-   [x] **2.5** Existen `src/server.ts` y `src/config/index.ts`
    (esqueleto App)
-   [x] `npx tsc --noEmit` sin errores al cerrar el ISS

------------------------------------------------------------------------

## 2.1 Inicializar npm y scripts

**Criterios de este sub-ítem**

-   [x] `package.json` creado
-   [x] Scripts `build` y `dev` definidos

``` bash
mkdir app-storelab-express
cd app-storelab-express
npm init -y
mkdir -p docs
```

![](images/clipboard-1392437888.png)

**PARCHE** — `package.json` **ya existe** (lo creó `npm init -y`).

-   **Dentro de** `"scripts"`: deja solo (o añade) `build` y `dev` como
    abajo.
-   **Debajo de** `"license"` (o al mismo nivel que `"scripts"`):
    asegúrate de `"type": "commonjs"`.

Estado esperado de esas claves:

``` json
{
  "scripts": {
    "build": "tsc",
    "dev": "nodemon --watch src --ext ts --exec ts-node -- src/server.ts"
  },
  "type": "commonjs"
}
```

``` bash
node -e "const p=require('./package.json'); console.log(p.scripts)"
```

![](images/clipboard-4279735611.png)

![](images/clipboard-189655588.png)

------------------------------------------------------------------------

## 2.2 Estructura de carpetas (features)

**Criterios de este sub-ítem**

-   [x] Carpetas de infra y features creadas según el árbol

``` bash
mkdir -p \
  src/config \
  src/database/seeders \
  src/routes \
  src/features/business/member
```

``` text
src/
├── config/
├── database/
│   └── seeders/
├── routes/
├── features/
│   └── business/
│       └── member/
└── server.ts
```

``` bash
find src -type d | sort
```

![](images/clipboard-671434993.png)

------------------------------------------------------------------------

## 2.3 Dependencias base (Express + TypeScript)

**Criterios de este sub-ítem**

-   [x] `express`, `cors`, `dotenv`, `morgan` instalados
-   [x] `typescript`, `ts-node`, `nodemon`, `@types/*` instalados

``` bash
npm install express@^5.2.1 cors@^2.8.6 dotenv@^17.4.2 morgan@^1.12.1

npm install -D typescript@~5.9.2 ts-node@^10.9.2 nodemon@^3.1.14 \
  @types/node@^22.20.3 @types/express@^5.0.6 \
  @types/cors@^2.8.19 @types/morgan@^1.9.10
```

> TypeScript en **5.9.x** por compatibilidad con `ts-node`.

``` bash
npm ls --depth=0
```

![](images/clipboard-4262287887.png)

------------------------------------------------------------------------

## 2.4 TypeScript (`tsconfig.json`)

**Criterios de este sub-ítem**

-   [x] `tsconfig.json` con `rootDir: ./src`, `outDir: ./dist`,
    `strict: true`

``` bash
: > tsconfig.json
cat >> tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "module": "commonjs",
    "target": "ES2020",
    "lib": ["ES2020"],
    "types": ["node"],
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "sourceMap": true,
    "strict": true,
    "skipLibCheck": true,
    "moduleDetection": "force",
    "isolatedModules": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF
```

``` bash
test -f tsconfig.json && npx tsc --showConfig | head -20
```

![](images/clipboard-205411948.png)

------------------------------------------------------------------------

## 2.5 Servidor y App (esqueleto HTTP)

**Criterios de este sub-ítem**

-   [x] Existen `src/server.ts` y `src/config/index.ts`
-   [x] `App` define `settings`, `middlewares`, `routes`,
    `dbConnection`, `listen` (placeholders OK)

### 2.5.1 `src/server.ts`

``` bash
: > src/server.ts
cat >> src/server.ts << 'EOF'
import { App } from './config/index';

async function main() {
    const app = new App();
    await app.listen();
}

main();
EOF
```

![](images/clipboard-4013792907.png)

### 2.5.2 `src/config/index.ts` (esqueleto)

> En ISS-01 el App es **esqueleto**. Los imports de modelos,
> associations, Routes, Swagger y el `sync` completo se añaden con
> **PARCHE** en ISS-02…08. El archivo **final** consolidado aparece al
> cierre de ISS-08.

``` bash
: > src/config/index.ts
cat >> src/config/index.ts << 'EOF'
import dotenv from "dotenv";
import express, { Application } from "express";
import morgan from "morgan";
var cors = require("cors");

dotenv.config();

export class App {
  public app: Application;

  constructor(private port?: number | string) {
    this.app = express();
    this.settings();
    this.middlewares();
    this.routes();
    this.dbConnection();
  }

  private settings(): void {
    this.app.set('port', this.port || process.env.PORT || 4000);
  }

  private middlewares(): void {
    this.app.use(morgan('dev'));
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  private routes(): void {
    // ISS-03 §4.3
  }

  private async dbConnection(): Promise<void> {
    // ISS-02 / ISS-03
  }

  async listen() {
    await this.app.listen(this.app.get('port'));
    console.log(`🚀 Servidor ejecutándose en puerto ${this.app.get('port')}`);
  }
}
EOF
```

![](images/clipboard-2725133888.png)

### Verificación del ISS-01

``` bash
npx tsc --noEmit
find src -type f | sort
```

![](images/clipboard-1284377115.png)

### Cierre del ISS

``` bash
npm run dev
```

> El servidor debe arrancar sin error. Detenerlo con Ctrl+C antes de
> continuar.
>
> ![](images/clipboard-618220498.png)

------------------------------------------------------------------------

# 3. ISS-02 — Infraestructura de base de datos

**Objetivo:** drivers + `.env` + módulo Sequelize + carpeta `seeders/`.\
**Bloqueado por:** ISS-01.

### Criterios de aceptación (ISS-02) — consolidados

-   [x] **3.1** Paquetes Sequelize/drivers instalados; existe `.env` con
    `DB_ENGINE` y bloques de motores
-   [x] **3.2** Existe `src/database/db.ts` exportando `sequelize`,
    `getDatabaseInfo`, `testConnection`
-   [x] **3.3** Existe carpeta `src/database/seeders/` **sin** lógica
    implementada aún
-   [x] `npx tsc --noEmit` OK

------------------------------------------------------------------------

## 3.1 Drivers Sequelize y `.env`

**Criterios de este sub-ítem**

-   [x] `sequelize`, `mysql2`, `pg`, `pg-hstore`, `tedious`, `oracledb`
    instalados
-   [x] `.env` con `PORT`, `DB_ENGINE`, MySQL/Postgres/MSSQL/Oracle

``` bash
npm install sequelize@^6.37.8 mysql2@^3.24.4 pg@^8.23.0 pg-hstore@^2.3.4 \
  tedious@^20.0.0 oracledb@^7.0.1
npm install -D @types/sequelize@^6.12.0
```

``` bash
: > .env
cat >> .env << 'EOF'
PORT=4000

# Variable para seleccionar el motor de base de datos
DB_ENGINE=mysql

# Configuración para MySQL
MYSQL_HOST=localhost
MYSQL_USER=admin
MYSQL_PASSWORD=MiNiCo57**
MYSQL_NAME=tecnogua
MYSQL_PORT=3306

# Configuración para PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_NAME=almacen_2025_iisem_node
POSTGRES_PORT=5432

# Configuración para SQL Server
MSSQL_HOST=localhost
MSSQL_USER=sa
MSSQL_PASSWORD=password
MSSQL_NAME=almacen_2025_iisem_node
MSSQL_PORT=1433

# Configuración para Oracle
ORACLE_HOST=localhost
ORACLE_USER=ALMACENDB_ADMIN
ORACLE_PASSWORD=password
ORACLE_NAME=xe
ORACLE_PORT=1521

EOF
```

``` bash
test -f .env && grep DB_ENGINE .env
npm ls sequelize mysql2 --depth=0
```

![](images/clipboard-971067612.png)

![](images/clipboard-2992693998.png)

------------------------------------------------------------------------

## 3.2 Configuración Sequelize (`database/db.ts`)

**Criterios de este sub-ítem**

-   [x] Archivo `src/database/db.ts` creado
-   [x] Exporta `sequelize`, `getDatabaseInfo`, `testConnection`

``` bash
: > src/database/db.ts
cat >> src/database/db.ts << 'EOF'
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
    host: process.env.MYSQL_HOST || "localhost",
    username: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_NAME || "test",
    port: parseInt(process.env.MYSQL_PORT || "3306")
  },
  postgres: {
    dialect: "postgres",
    host: process.env.POSTGRES_HOST || "localhost",
    username: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "",
    database: process.env.POSTGRES_NAME || "test",
    port: parseInt(process.env.POSTGRES_PORT || "5432")
  }
};

const selectedEngine = process.env.DB_ENGINE || "mysql";
const selectedConfig = dbConfigurations[selectedEngine];

if (!selectedConfig) {
  throw new Error(`Motor de base de datos no soportado: ${selectedEngine}`);
}

console.log(`🔌 Conectando a base de datos: ${selectedEngine.toUpperCase()}`);

export const sequelize = new Sequelize(
  selectedConfig.database,
  selectedConfig.username,
  selectedConfig.password,
  {
    host: selectedConfig.host,
    port: selectedConfig.port,
    dialect: selectedConfig.dialect as any,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export const getDatabaseInfo = () => {
  return {
    engine: selectedEngine,
    config: selectedConfig,
    connectionString: `${selectedConfig.dialect}://${selectedConfig.username}@${selectedConfig.host}:${selectedConfig.port}/${selectedConfig.database}`
  };
};

export const testConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Conexión exitosa a ${selectedEngine.toUpperCase()}`);
    return true;
  } catch (error) {
    console.error(`❌ Error de conexión a ${selectedEngine.toUpperCase()}:`, error);
    return false;
  }
};
EOF
```

``` bash
test -f src/database/db.ts && npx tsc --noEmit
```

![](images/clipboard-2148359184.png)

![](images/clipboard-2946544883.png)

------------------------------------------------------------------------

## 3.3 Carpeta seeders (reservada)

**Criterios de este sub-ítem**

-   [x] `src/database/seeders/` existe (la lógica llega en ISS-04)
-   [x] `src/database/seeders/` existe **sin** `*.seeder.ts` ni runner

``` bash
mkdir -p src/database/seeders
# opcional: touch src/database/seeders/.gitkeep
```

``` bash
test -d src/database/seeders && echo OK
```

![](images/clipboard-2388703424.png)

### Verificación del ISS-02

``` bash
npx tsc --noEmit
test -f src/database/db.ts && test -f .env && test -d src/database/seeders
```

![](images/clipboard-3214311697.png)

### Cierre del ISS

``` bash
npm run dev
```

> ![](images/clipboard-2398240683.png)
>
> El servidor debe arrancar sin error. Detenerlo con Ctrl+C antes de
> continuar.

------------------------------------------------------------------------

# 4. ISS-03-A — Feature Members — fundación (modelo, esqueleto, HTTP, cableado)

**Nombre recomendado:** *Feature Members — fundación*\
**Objetivo:** dejar el feature listo para CRUD: modelo con columnas
obligatorias, esqueleto controller/routes, carpeta `http/`, agregador y
sync.\
**Bloqueado por:** ISS-02.

### Criterios de aceptación (ISS-03-A)

-   [ ] **4.1** Modelo `members.model.ts` con `status` +
    `timestamps: true` + bcrypt
-   [ ] **4.2** Controller/routes esqueleto (sin CRUD aún en este
    sub-ítem pedagógico; el repo ya puede tener CRUD de ISS-03-B…E)
-   [ ] **4.3** Carpeta `features/business/members/http/` creada
-   [ ] **4.4** `routes/index.ts` + `config` importan modelo, conectan
    BD y hacen `sync`
-   [ ] Con BD: `npm run dev` → conexión OK + sync OK + tabla `members`

------------------------------------------------------------------------

## 4.1 Modelo Members

**Criterios**

-   [x] `src/features/business/members/members.model.ts`
-   [x] Enum `active`/`inactive`, default `inactive`; `timestamps: true`

``` bash
npm install bcryptjs@^3.0.3
npm install -D @types/bcryptjs@^3.0.0
```

![](images/clipboard-413507259.png)

![](images/clipboard-3286066806.png)

``` bash
mkdir -p src/features/business/members

: > src/features/business/members/members.model.ts

cat >> src/features/business/members/members.model.ts << 'EOF'
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

export interface MemberI {
  id?: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Member extends Model {
  public id!: number;
  public name!: string;
  public description!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Member.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Member name cannot be empty",
        },
      },
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Member",
    tableName: "members",
    timestamps: true,
  }
);
EOF
```

![](images/clipboard-2325527158.png)

------------------------------------------------------------------------

## 4.2 Esqueleto controller / routes + carpeta HTTP

**Criterios**

-   [x] Archivos `members.controller.ts` y `members.routes.ts` existen
    (esqueleto)
-   [x] Carpeta `src/features/business/members/http/` existe

``` bash
mkdir -p src/features/business/members/http
```

> El CRUD se completa en ISS-03-B…E. Aquí se reserva la carpeta `http/`
> para archivos `.http` (REST Client) con leyenda **SIN AUTH**.

``` bash
: > src/features/business/members/members.controller.ts

cat >> src/features/business/members/members.controller.ts << 'EOF'
import { Request, Response } from "express";
import { Member, MemberI } from "./members.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

export class MembersController {
  // ================== READ ==================
  // (rellenar en ISS-03-B) getAll, luego getOne

  // ================== CREATE ==================
  // (rellenar en ISS-03-C)

  // ================== UPDATE ==================
  // (rellenar en ISS-03-D)

  // ================== DELETE ==================
  // (rellenar en ISS-03-E)
}
EOF
```

![](images/clipboard-3315943661.png)

``` bash
: > src/features/business/members/members.routes.ts

cat >> src/features/business/members/members.routes.ts << 'EOF'
import { Application } from "express";
import { MembersController } from "./members.controller";

export class MembersRoutes {
  public membersController: MembersController = new MembersController();

  public routes(app: Application): void {
    // ================== ROUTES WITHOUT AUTHENTICATION / WITHOUT JWT MIDDLEWARE ==================
    // (to be completed in ISS-03-B…E)
  }
}
EOF
```

![](images/clipboard-1439223948.png)

------------------------------------------------------------------------

## 4.3 Agregador Routes + cableado en Config

**Criterios**

-   [x] `src/routes/index.ts` con `membersRoutes`
-   [x] `config` importa modelo + `dbConnection` + `routes`

``` bash
: > src/routes/index.ts

cat >> src/routes/index.ts << 'EOF'
import { MembersRoutes } from "../features/business/members/members.routes";

export class Routes {
  public membersRoutes: MembersRoutes = new MembersRoutes();
}
EOF
```

![](images/clipboard-74497133.png)

**PARCHE** — `src/config/index.ts` **ya existe** (ISS-01).

1.  **Debajo de** `var cors = require("cors");` **añadir**:

``` ts
import { sequelize, getDatabaseInfo, testConnection } from "../database/db";
import "../features/business/members/members.model";
import { Routes } from "../routes/index";
```

2.  **Dentro de** `export class App`, **debajo de**
    `public app: Application;` **añadir**:

``` ts
  public routePrv: Routes = new Routes();
```

3.  **Dentro de** `routes()`, **reemplazar** el comentario
    `// ISS-03 §4.3` por:

``` ts
    this.routePrv.membersRoutes.routes(this.app);
```

4.  **Dentro de** `dbConnection()`, **reemplazar** el comentario
    `// ISS-02 / ISS-03` por:

``` ts
    try {
      // Mostrar información de la base de datos seleccionada
      const dbInfo = getDatabaseInfo();
      console.log(`🔗 Intentando conectar a: ${dbInfo.engine.toUpperCase()}`);

      // Probar la conexión
      const isConnected = await testConnection();

      if (!isConnected) {
        throw new Error(`No se pudo conectar a la base de datos ${dbInfo.engine.toUpperCase()}`);
      }

      // alter: true actualiza columnas faltantes (ej. createdAt/updatedAt tras timestamps: true).
      // force: false no recrea tablas; no borra datos. En producción preferir migraciones.
      await sequelize.sync({ force: false, alter: true });
      console.log(`📦 Base de datos sincronizada exitosamente`);
    } catch (error) {
      console.error("❌ Error al conectar con la base de datos:", error);
      process.exit(1); // Terminar la aplicación si no se puede conectar
    }
```

> **Importante (lab):** si la tabla `memberss` se creó antes con
> `timestamps: false`, `sync({ force: false })` **no** añade
> `createdAt`/`updatedAt`. Por eso se usa `alter: true`.

### Verificación ISS-03-A

``` bash
test -d src/features/business/members/http && echo HTTP_FOLDER_OK
```

![](images/clipboard-591070581.png)

### Cierre del ISS

``` bash
npm run dev
```

> ![](images/clipboard-3043316437.png)
>
> Sync OK y tabla `members` (con `createdAt` / `updatedAt`). Detenerlo
> con Ctrl+C antes de continuar.

------------------------------------------------------------------------

# 5. ISS-03-B — Feature Members — GetAll y GetOne

**Objetivo:** listar activos y obtener uno por id. Es el primer paso del
feature: getAll, getOne, luego create, update y delete.\
**Bloqueado por:** ISS-03-A.

### Criterios de aceptación (ISS-03-B)

-   [x] Controller: `getAll` (solo `status: 'active'`) y, debajo,
    `getOne`
-   [x] Rutas `GET /api/members` y `GET /api/members/:id` — **sin auth**
-   [x] `http/members.get.http` con leyenda **SIN AUTH**
-   [x] Respuestas sin campo `password`

### Controller — **PARCHE** `members.controller.ts` (ya existe)

**Debajo de** el comentario
`// ================== READ ==================` (y **encima de**
`// ================== CREATE ==================`), **añadir** primero
`getAll` y después `getOne`:

``` ts
import { Request, Response } from "express";
import { Member } from "./members.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

export class MembersController {
  // ================== READ ==================

  public async getAll(req: Request, res: Response) {
    try {
      const members = await Member.findAll({
        where: { isActive: true },
      });

      res.status(200).json({ members });
    } catch (error) {
      res.status(500).json({
        error: "Error fetching members",
        detail: String(error),
      });
    }
  }

  public async getOne(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const member = await Member.findByPk(id);

      if (!member) {
        res.status(404).json({
          error: "Member not found",
        });
        return;
      }

      res.status(200).json({ member });
    } catch (error) {
      res.status(500).json({
        error: "Error fetching member",
        detail: String(error),
      });
    }
  }

  // ================== CREATE ==================
  // (rellenar en ISS-03-C)

  // ================== UPDATE ==================
  // (rellenar en ISS-03-D)

  // ================== DELETE ==================
  // (rellenar en ISS-03-E)
}
```

### Rutas — **PARCHE** `members.routes.ts` (ya existe)

**Debajo de** el comentario
`// ================== RUTAS SIN AUTENTICACIÓN / SIN MIDDLEWARE JWT ==================`,
**añadir** primero `getAll` y después `getOne`:

``` ts
import { Application } from "express";
import { MembersController } from "./members.controller";

export class MembersRoutes {
  public membersController: MembersController = new MembersController();

  public routes(app: Application): void {
    // ================== ROUTES WITHOUT AUTHENTICATION / WITHOUT JWT MIDDLEWARE ==================

    // getAll
    app
      .route("/api/members")
      .get(
        this.membersController.getAll.bind(
          this.membersController
        )
      );

    // getOne
    app
      .route("/api/members/:id")
      .get(
        this.membersController.getOne.bind(
          this.membersController
        )
      );
  }
}
```

### HTTP — archivo nuevo

``` bash
cat > src/features/business/members/http/members.get.http << 'EOF'
### Feature Members — GET ALL / GET ONE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)

@baseUrl = http://localhost:4000
@id = 1

# @name getAllMembers
GET {{baseUrl}}/api/members

###

# @name getOneMember
GET {{baseUrl}}/api/members/{{id}}
EOF
```

### Verificación

``` bash
curl -s http://localhost:4000/api/members
curl -s http://localhost:4000/api/members/1
```

![](images/clipboard-1123077106.png)

### Cierre del ISS

``` bash
npm run dev
```

> El servidor debe arrancar sin error. Detenerlo con Ctrl+C antes de
> continuar.
>
> ![](images/clipboard-775426098.png)

------------------------------------------------------------------------

# 6. ISS-03-C — Feature Members — Crear miembros

**Objetivo:** alta de miembros vía API, después de getAll y getOne.\
**Bloqueado por:** ISS-03-B.

### Criterios de aceptación (ISS-03-C)

-   [x] Controller: método `create` **debajo de** `getOne` y **encima
    de** update
-   [x] Ruta `POST /api/memebers` **debajo de** `getOne` — **sin auth**
-   [x] Archivo `http/members.create.http` con leyenda **SIN AUTH**
-   [x] `POST` responde `201` con miembros

### Controller — **PARCHE** `members.controller.ts` (ya existe)

**Debajo de** el comentario
`// ================== CREATE ==================` (y **encima de**
`// ================== UPDATE ==================`), **añadir** el método
`create`:

``` ts
  public async create(req: Request, res: Response) {
    try {
      const body = req.body as ClientI;
      const client = await Client.create({
        name: body.name,
        address: body.address,
        phone: body.phone,
        email: body.email,
        password: body.password,
        status: body.status ?? "active",
      });
      const { password, ...safe } = client.toJSON() as ClientI & { password?: string };
      res.status(201).json({ client: safe });
    } catch (error) {
      res.status(500).json({ error: "Error creating client", detail: String(error) });
    }
  }
```

### Rutas — **PARCHE** `members.routes.ts` (ya existe)

**Debajo de** el bloque `// getOne`, **añadir**:

``` ts
    // create
    app
      .route("/api/clientes")
      .post(this.clientController.create.bind(this.clientController));
```

### HTTP — archivo nuevo

``` bash
: > src/features/business/client/http/clients.create.http
cat >> src/features/business/client/http/clients.create.http << 'EOF'
### Feature Client — CREATE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000

# @name createClient
POST {{baseUrl}}/api/clientes
Content-Type: application/json

{
  "name": "Ana Pérez",
  "address": "Calle 10 #20-30",
  "phone": "3001234567",
  "email": "ana.perez@example.com",
  "password": "Password123!",
  "status": "active"
}
EOF
```

![](images/clipboard-882932687.png)

### Verificación

``` bash
curl -i -X POST http://localhost:4000/api/members \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ana","description":"Miembro de prueba","isActive":true}'
```

![](images/clipboard-4073914960.png)

### Cierre del ISS

``` bash
npm run dev
```

> ![](images/clipboard-2280647928.png)
>
> El servidor debe arrancar sin error. Detenerlo con Ctrl+C antes de
> continuar.

------------------------------------------------------------------------

# 7. ISS-03-D — Feature Members — Update (PUT) y Update (PATCH)

**Objetivo:** actualización completa y parcial.\
**Bloqueado por:** ISS-03-C.

### Criterios de aceptación (ISS-03-D)

-   [x] Controller: `updatePut` y `updatePatch`
-   [x] Rutas `PUT` y `PATCH` `/api/miembross/:id` — **sin auth**
-   [x] `http/members.update.http` con leyenda **SIN AUTH**

### Controller — **PARCHE** `members.controller.ts` (ya existe)

**Debajo de** el comentario
`// ================== UPDATE ==================` (y **encima de**
`// ================== DELETE ==================`), **añadir**:

``` ts
  public async updatePut(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as ClientI;
      const client = await Client.findByPk(id);
      if (!client) {
        res.status(404).json({ error: "Client not found" });
        return;
      }

      await client.update({
        name: body.name,
        address: body.address,
        phone: body.phone,
        email: body.email,
        password: body.password ?? client.password,
        status: body.status ?? client.status,
      });

      const { password, ...safe } = client.toJSON() as ClientI & { password?: string };
      res.status(200).json({ client: safe });
    } catch (error) {
      res.status(500).json({ error: "Error updating client (PUT)", detail: String(error) });
    }
  }

  public async updatePatch(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as Partial<ClientI>;
      const client = await Client.findByPk(id);
      if (!client) {
        res.status(404).json({ error: "Client not found" });
        return;
      }

      await client.update(body);
      const { password, ...safe } = client.toJSON() as ClientI & { password?: string };
      res.status(200).json({ client: safe });
    } catch (error) {
      res.status(500).json({ error: "Error updating client (PATCH)", detail: String(error) });
    }
  }
```

![](images/clipboard-685238800.png)

### Rutas — **PARCHE** `members.routes.ts` (ya existe)

**Debajo de** el bloque `// create`, **añadir** PUT y PATCH:

``` ts
    // update (PUT / PATCH)
    app
      .route("/api/clientes/:id")
      .put(this.clientController.updatePut.bind(this.clientController))
      .patch(this.clientController.updatePatch.bind(this.clientController));
```

![](images/clipboard-481542962.png)

### HTTP — archivo nuevo

``` bash
: > src/features/business/client/http/clients.update.http
cat >> src/features/business/client/http/clients.update.http << 'EOF'
### Feature Client — UPDATE (PUT) / UPDATE (PATCH)
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name updateClientPut
PUT {{baseUrl}}/api/clientes/{{id}}
Content-Type: application/json

{
  "name": "Ana Pérez Actualizada",
  "address": "Carrera 15 #40-10",
  "phone": "3009876543",
  "email": "ana.perez@example.com",
  "password": "Password123!",
  "status": "active"
}

###

# @name updateClientPatch
PATCH {{baseUrl}}/api/clientes/{{id}}
Content-Type: application/json

{
  "phone": "3011112233",
  "address": "Nueva dirección parcial"
}
EOF
```

![](images/clipboard-3512692538.png)

### Verificación

``` bash
curl -i -X PUT http://localhost:4000/api/members/1 \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ana Actualizada","description":"Miembro actualizado","isActive":true}'
```

![](images/clipboard-178382956.png)

### Cierre del ISS

``` bash
npm run dev
```

> ![](images/clipboard-2105903644.png)
>
> El servidor debe arrancar sin error. Detenerlo con Ctrl+C antes de
> continuar.

------------------------------------------------------------------------

# 8. ISS-03-E — Feature Members — Eliminar (físico y lógico)

**Objetivo:** borrado físico (`DELETE`) y lógico
(`status = 'inactive'`).\
**Bloqueado por:** ISS-03-D.

### Criterios de aceptación (ISS-03-E)

-   [x] Controller: `deletePhysical` y `deleteLogical`
-   [x] `DELETE /api/miembros/:id` — físico — **sin auth**
-   [x] `PATCH /api/miembros/:id/deactivate` — lógico → `inactive` —
    **sin auth**
-   [x] `http/members.delete.http` con leyenda **SIN AUTH**

### Controller — **PARCHE** `members.controller.ts` (ya existe)

**Debajo de** el comentario
`// ================== DELETE ==================`, **añadir** primero el
borrado físico y después el lógico:

``` ts
    // ================== DELETE ==================

  /** Eliminación física */
  public async deletePhysical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const member = await Member.findByPk(id);

      if (!member) {
        res.status(404).json({
          error: "Member not found",
        });
        return;
      }

      await member.destroy();

      res.status(200).json({
        message: "Member permanently deleted",
        id,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error deleting member",
        detail: String(error),
      });
    }
  }

  /** Eliminación lógica → isActive = false */
  public async deleteLogical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const member = await Member.findByPk(id);

      if (!member) {
        res.status(404).json({
          error: "Member not found",
        });
        return;
      }

      await member.update({
        isActive: false,
      });

      res.status(200).json({
        message: "Member deactivated (logical delete)",
        member,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error deactivating member",
        detail: String(error),
      });
    }
  }
```

![](images/clipboard-2592200049.png)

### Rutas — **PARCHE** `members.routes.ts` (ya existe)

1.  **Debajo de** el bloque `// update (PUT / PATCH)`, **añadir** el
    borrado físico:

``` ts
// delete físico
    app
      .route("/api/members/:id")
      .delete(
        this.membersController.deletePhysical.bind(
          this.membersController
        )
      );
```

2.  **Debajo de** ese bloque, **añadir** la baja lógica:

``` ts
  // delete lógico
    app
      .route("/api/members/:id/deactivate")
      .patch(
        this.membersController.deleteLogical.bind(
          this.membersController
        )
      );
```

![](images/clipboard-2001673070.png)

### HTTP — archivo nuevo

``` bash
src/features/business/members/http/members.delete.http
### Feature Members — DELETE físico / DELETE lógico
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)

@baseUrl = http://localhost:4000
@id = 1

# @name deleteMemberPhysical
DELETE {{baseUrl}}/api/members/{{id}}

###

# @name deleteMemberLogical
PATCH {{baseUrl}}/api/members/{{id}}/deactivate
```

![](images/clipboard-809891187.png)

### Verificación

``` bash
curl -i -X PATCH http://localhost:4000/api/members/1/deactivate
curl -i -X DELETE http://localhost:4000/api/members/2
```

> ![](images/clipboard-1342981907.png)
>
> Tras baja lógica, `GET /api/miembros` ya no debe listar ese registro
> (filtra `active`).

### Estado final Members (CRUD completo) — archivos consolidados

Tras ISS-03-B…E, estos archivos deben quedar así (equivalente a aplicar
todos los PARCHE):

``` bash
cat src/features/business/members/members.controller.ts
import { Request, Response } from "express";
import { Member, MemberI } from "./members.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

export class MembersController {
  // ================== READ ==================

  public async getAll(req: Request, res: Response) {
    try {
      const members = await Member.findAll({
        where: { isActive: true },
      });

      res.status(200).json({ members });
    } catch (error) {
      res.status(500).json({
        error: "Error fetching members",
        detail: String(error),
      });
    }
  }

  public async getOne(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const member = await Member.findByPk(id);

      if (!member) {
        res.status(404).json({
          error: "Member not found",
        });
        return;
      }

      res.status(200).json({ member });
    } catch (error) {
      res.status(500).json({
        error: "Error fetching member",
        detail: String(error),
      });
    }
  }

  // ================== CREATE ==================

  public async create(req: Request, res: Response) {
    try {
      const body = req.body as MemberI;

      const member = await Member.create({
        name: body.name,
        description: body.description,
        isActive: body.isActive ?? true,
      });

      res.status(201).json({ member });
    } catch (error) {
      res.status(500).json({
        error: "Error creating member",
        detail: String(error),
      });
    }
  }

  // ================== UPDATE ==================

  public async updatePut(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as MemberI;

      const member = await Member.findByPk(id);

      if (!member) {
        res.status(404).json({
          error: "Member not found",
        });
        return;
      }

      await member.update({
        name: body.name,
        description: body.description,
        isActive: body.isActive ?? member.isActive,
      });

      res.status(200).json({ member });
    } catch (error) {
      res.status(500).json({
        error: "Error updating member (PUT)",
        detail: String(error),
      });
    }
  }

  public async updatePatch(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as Partial<MemberI>;

      const member = await Member.findByPk(id);

      if (!member) {
        res.status(404).json({
          error: "Member not found",
        });
        return;
      }

      await member.update(body);

      res.status(200).json({ member });
    } catch (error) {
      res.status(500).json({
        error: "Error updating member (PATCH)",
        detail: String(error),
      });
    }
  }

  // ================== DELETE ==================

  /** Eliminación física */
  public async deletePhysical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const member = await Member.findByPk(id);

      if (!member) {
        res.status(404).json({
          error: "Member not found",
        });
        return;
      }

      await member.destroy();

      res.status(200).json({
        message: "Member permanently deleted",
        id,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error deleting member",
        detail: String(error),
      });
    }
  }

  /** Eliminación lógica → isActive = false */
  public async deleteLogical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const member = await Member.findByPk(id);

      if (!member) {
        res.status(404).json({
          error: "Member not found",
        });
        return;
      }

      await member.update({
        isActive: false,
      });

      res.status(200).json({
        message: "Member deactivated (logical delete)",
        member,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error deactivating member",
        detail: String(error),
      });
    }
  }

}
```

``` bash
cat src/features/business/members/members.routes.ts
import { Application } from "express";
import { MembersController } from "./members.controller";

export class MembersRoutes {
  public membersController: MembersController = new MembersController();

  public routes(app: Application): void {
    // ================== RUTAS SIN AUTENTICACIÓN / SIN MIDDLEWARE JWT ==================

    // getAll
    app
      .route("/api/members")
      .get(
        this.membersController.getAll.bind(
          this.membersController
        )
      );

    // getOne
    app
      .route("/api/members/:id")
      .get(
        this.membersController.getOne.bind(
          this.membersController
        )
      );

    // create
    app
      .route("/api/members")
      .post(
        this.membersController.create.bind(
          this.membersController
        )
      );

    // update (PUT / PATCH)
    app
      .route("/api/members/:id")
      .put(
        this.membersController.updatePut.bind(
          this.membersController
        )
      )
      .patch(
        this.membersController.updatePatch.bind(
          this.membersController
        )
      );

    // delete físico
    app
      .route("/api/members/:id")
      .delete(
        this.membersController.deletePhysical.bind(
          this.membersController
        )
      );

    // delete lógico
    app
      .route("/api/members/:id/deactivate")
      .patch(
        this.membersController.deleteLogical.bind(
          this.membersController
        )
      );
  }
}
```

### Cierre del ISS

``` bash
npm run dev
```

> ![](images/clipboard-2416757009.png)
>
> El servidor debe arrancar sin error. Detenerlo con Ctrl+C antes de
> continuar.

------------------------------------------------------------------------

# 9. ISS-04 — Seeders con Faker (feature + runner externo)

**Objetivo:** datos falsos por feature (Faker) y un orquestador externo
que ejecuta todos los seeders enviando la **cantidad por entidad**.\
**Bloqueado por:** ISS-03-A (modelo); recomendado tras ISS-03-E.

### Criterios de aceptación (ISS-04) — consolidados

-   [x] **9.1** Existe `features/business/members/members.seeder.ts` con
    `@faker-js/faker`, recibe `count`, es idempotente
-   [x] **9.2** Existe `database/seeders/index.ts` (SeedersRunner) que
    llama seeders de features
-   [x] **9.2** Existe `database/seeders/counts.ts` con cantidad por
    entidad (default / env / CLI)
-   [x] Script `npm run db:seed` funciona
-   [x] Se puede variar cantidad: `npm run db:seed -- --members=20` o
    `SEED_MEMBERS=5`

**Diseño**

| Pieza | Ubicación | Rol |
|------------------------|------------------------|------------------------|
| Seeder del feature | `src/feat ures/business/member s/members.seeder.ts` | Genera filas falsas de Members |
| Conteos | `src/databas e/seeders/counts.ts` | `memberss: N` (y futuras entidades) |
| Runner | `src/databa se/seeders/index.ts` | Importa seeders de features y los ejecuta en orden |

------------------------------------------------------------------------

## 9.1 Seeder dentro del feature Members

**Criterios**

-   [x] `seedMembers(count: number)` exportado desde el feature
-   [x] Usa `@faker-js/faker`
-   [x] Si ya hay filas, no duplica

``` bash
npm install -D @faker-js/faker@^10.6.0
```

``` bash
cat > src/features/business/members/members.seeder.ts << 'EOF'
import { faker } from "@faker-js/faker";
import { Member } from "./members.model";

/**
 * Seeder del feature Members.
 *
 * Genera datos falsos utilizando @faker-js/faker.
 *
 * Es idempotente:
 * si ya existen registros en la tabla members,
 * no vuelve a insertar datos.
 */
export async function seedMembers(count: number): Promise<number> {
  if (count <= 0) {
    console.log("⏭️  members: count=0, se omite");
    return 0;
  }

  const existing = await Member.count();

  if (existing > 0) {
    console.log(
      `⏭️  members: ya hay ${existing} registro(s), se omite seeder`
    );
    return 0;
  }

  const rows = Array.from({ length: count }, () => ({
    name: faker.person.fullName(),
    description: faker.lorem.sentence(),
    isActive: true,
  }));

  await Member.bulkCreate(rows);

  console.log(
    `✅ members: insertados ${count} registro(s) falsos`
  );

  return count;
}
EOF
```

![](images/clipboard-2163979074.png)

------------------------------------------------------------------------

## 9.2 SeedersRunner + conteos por entidad (`database/seeders`)

**Criterios**

-   [x] Runner fuera del feature en `src/database/seeders/`
-   [x] Cantidad configurable por feature (`members`, …)

### 9.2.1 Conteos

``` bash
mkdir -p src/database/seeders

cat > src/database/seeders/counts.ts << 'EOF'
/**
 * Cantidad de registros por feature/entidad.
 *
 * Prioridad:
 * CLI (--members=N) > env (SEED_MEMBERS) > default de este archivo.
 *
 * Cuando se agreguen nuevas entidades, se pueden añadir
 * nuevas claves a SeedCounts y DEFAULT_SEED_COUNTS.
 */
export type SeedCounts = {
  members: number;
  // users?: number;
  // roles?: number;
  // products?: number;
};

export const DEFAULT_SEED_COUNTS: SeedCounts = {
  members: 10,
};

export function resolveSeedCounts(
  argv: string[] = process.argv.slice(2)
): SeedCounts {
  const counts: SeedCounts = {
    ...DEFAULT_SEED_COUNTS,
  };

  const envMembers = process.env.SEED_MEMBERS;

  if (envMembers !== undefined && envMembers !== "") {
    counts.members = Number(envMembers);
  }

  for (const arg of argv) {
    const m = arg.match(/^--([a-zA-Z_]+)=(\d+)$/);

    if (!m) continue;

    const key = m[1] as keyof SeedCounts;
    const value = Number(m[2]);

    if (key in counts) {
      counts[key] = value;
    }
  }

  return counts;
}
EOF
```

![](images/clipboard-3138741216.png)

### 9.2.2 Runner

``` bash
cat > src/database/seeders/index.ts << 'EOF'
import dotenv from "dotenv";
import { sequelize, testConnection } from "../db";
import "../../features/business/members/members.model";
import { seedMembers } from "../../features/business/members/members.seeder";
import { resolveSeedCounts } from "./counts";

dotenv.config();

/**
 * SeedersRunner — ejecuta todos los seeders de features.
 *
 * La orquestación se mantiene fuera de los features.
 *
 * Uso:
 *   npm run db:seed
 *   npm run db:seed -- --members=20
 *   SEED_MEMBERS=5 npm run db:seed
 */
export async function runAllSeeders(): Promise<void> {
  const counts = resolveSeedCounts();

  console.log("🌱 Iniciando SeedersRunner...");
  console.log("📊 Conteos:", counts);

  const ok = await testConnection();

  if (!ok) {
    throw new Error("No hay conexión a la base de datos");
  }

  await sequelize.sync({
    force: false,
    alter: true,
  });

  // Orden: business (padres → hijos)
  await seedMembers(counts.members);

  console.log("🌱 SeedersRunner finalizado");
}

runAllSeeders()
  .then(async () => {
    await sequelize.close();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("❌ Error en seeders:", err);
    await sequelize.close();
    process.exit(1);
  });
EOF
```

![](images/clipboard-3175949578.png)

**PARCHE** — `package.json` **ya existe**.

**Dentro de** `"scripts"`, **debajo de** `"dev": "..."`, **añadir** la
coma al final de `dev` (si falta) y la clave:

``` json
    "db:seed": "ts-node -- src/database/seeders/index.ts"
```

Fragmento esperado:

``` json
  "scripts": {
    "build": "tsc",
    "dev": "nodemon --watch src --ext ts --exec ts-node -- src/server.ts",
    "db:seed": "ts-node -- src/database/seeders/index.ts"
  }
```

![](images/clipboard-1365322133.png)

### Verificación ISS-04

``` bash
npm run db:seed
npm run db:seed -- --members=20
SEED_MEMBERS=5 npm run db:seed
```

![](images/clipboard-3336743513.png)

![](images/clipboard-1683102578.png)

**Al agregar otra entidad (patrón):**

1.  Archivo **nuevo** `features/.../<entidad>.seeder.ts` con `: >` +
    `cat >>`.
2.  **PARCHE** `counts.ts`: **dentro de** `SeedCounts` / defaults,
    **añadir** clave (ej. `products: 10`).
3.  **PARCHE** `database/seeders/index.ts`: **debajo de**
    `await seedClients(...)`, **añadir** la llamada al nuevo seeder.

### Cierre del ISS

``` bash
npm run dev
```

> ![](images/clipboard-2096232487.png)
>
> El servidor debe arrancar sin error. Detenerlo con Ctrl+C antes de
> continuar.

------------------------------------------------------------------------

# 10. ISS-05 — Swagger / OpenAPI (feature + registry externo)

**Objetivo:** documentar el API del feature Members en OpenAPI 3 y
montar Swagger UI desde un **registry externo** (mismo patrón que
seeders).\
**Bloqueado por:** ISS-03-E (rutas CRUD definidas).

### Criterios de aceptación (ISS-05) — consolidados

-   [x] **10.1** Existe `features/business/members/members.swagger.ts`
    con tags, paths y schemas de Client (leyenda **SIN AUTH**)
-   [x] **10.2** Existe `src/swagger/index.ts` que agrega módulos de
    features y monta UI
-   [x] `App` llama `setupSwagger` (método `docs()`)
-   [x] `GET /api/docs` muestra Swagger UI
-   [x] `GET /api/docs.json` devuelve el documento OpenAPI

**Diseño**

| Pieza | Ubicación | Rol |
|------------------------|------------------------|------------------------|
| Docs del feature | `src/featu res/business/members /members.swagger.ts` | Paths + schemas Client |
| Registry | `s rc/swagger/index.ts` | Fusiona features + `setupSwagger(app)` |
| UI | `/api/docs` | Swagger UI |
| Spec | `/api/docs.json` | OpenAPI JSON |

------------------------------------------------------------------------

## 10.1 OpenAPI dentro del feature Client

**Criterios**

-   [x] Exporta `membersSwagger` con `tags`, `paths`,
    `components.schemas`
-   [x] Endpoints documentados como **SIN AUTH**

``` bash
# Paquetes (una vez)
npm install swagger-ui-express@^5.0.1
npm install -D @types/swagger-ui-express@^4.1.8
```

![](images/clipboard-4089339649.png)

Archivo **nuevo**:

``` bash
mkdir -p src/features/business/members
cat > src/features/business/members/members.swagger.ts << 'EOF'
/**
 * Documentación OpenAPI del feature Members.
 *
 * Se agrega desde src/swagger (registry externo),
 * no se monta directamente desde este feature.
 *
 * Leyenda: endpoints documentados como SIN AUTH
 * (sin middleware JWT).
 */

export const membersSwagger = {
  tags: [
    {
      name: "Members",
      description: "CRUD de Members — **SIN AUTH** (sin middleware JWT)",
    },
  ],

  paths: {
    "/api/members": {
      get: {
        tags: ["Members"],
        summary: "Listar Members activos",
        description:
          "SIN AUTH — retorna únicamente Members con isActive=true.",
        security: [],
        responses: {
          "200": {
            description: "Lista de Members",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    members: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Member",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      post: {
        tags: ["Members"],
        summary: "Crear Member",
        description: "SIN AUTH",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/MemberCreate",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Member creado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    member: {
                      $ref: "#/components/schemas/Member",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/members/{id}": {
      get: {
        tags: ["Members"],
        summary: "Obtener Member por ID",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "Member encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    member: {
                      $ref: "#/components/schemas/Member",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Member no encontrado",
          },
        },
      },

      put: {
        tags: ["Members"],
        summary: "Actualizar Member (PUT)",
        description: "SIN AUTH — actualización completa",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/MemberUpdate",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Member actualizado",
          },
          "404": {
            description: "Member no encontrado",
          },
        },
      },

      patch: {
        tags: ["Members"],
        summary: "Actualizar Member (PATCH)",
        description: "SIN AUTH — actualización parcial",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/MemberPatch",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Member actualizado",
          },
          "404": {
            description: "Member no encontrado",
          },
        },
      },

      delete: {
        tags: ["Members"],
        summary: "Eliminar Member físicamente",
        description: "SIN AUTH — elimina físicamente la fila de la base de datos.",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "Member eliminado físicamente",
          },
          "404": {
            description: "Member no encontrado",
          },
        },
      },
    },

    "/api/members/{id}/deactivate": {
      patch: {
        tags: ["Members"],
        summary: "Desactivar Member",
        description:
          "SIN AUTH — eliminación lógica estableciendo isActive=false.",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "Member desactivado",
          },
          "404": {
            description: "Member no encontrado",
          },
        },
      },
    },
  },

  components: {
    schemas: {
      Member: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          name: {
            type: "string",
            example: "Ana Pérez",
          },
          description: {
            type: "string",
            example: "Member registrado para pruebas",
          },
          isActive: {
            type: "boolean",
            example: true,
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },

      MemberCreate: {
        type: "object",
        required: ["name"],
        properties: {
          name: {
            type: "string",
            example: "Ana Pérez",
          },
          description: {
            type: "string",
            example: "Descripción del Member",
          },
          isActive: {
            type: "boolean",
            default: true,
            example: true,
          },
        },
      },

      MemberUpdate: {
        type: "object",
        required: ["name", "isActive"],
        properties: {
          name: {
            type: "string",
            example: "Ana Pérez Actualizada",
          },
          description: {
            type: "string",
            example: "Descripción actualizada",
          },
          isActive: {
            type: "boolean",
            example: true,
          },
        },
      },

      MemberPatch: {
        type: "object",
        properties: {
          name: {
            type: "string",
            example: "Ana Pérez Actualizada",
          },
          description: {
            type: "string",
            example: "Cambio parcial",
          },
          isActive: {
            type: "boolean",
            example: true,
          },
        },
      },
    },
  },
};
EOF
```

![](images/clipboard-2916299438.png)

------------------------------------------------------------------------

## 10.2 Registry externo + montaje en Config

**Criterios**

-   [x] `buildOpenApiDocument()` fusiona módulos de features
-   [x] `setupSwagger(app)` monta `/api/docs` y `/api/docs.json`
-   [x] `config` invoca `setupSwagger` (método `docs()`)

``` bash
mkdir -p src/swagger
```

Archivo **nuevo**:

``` bash
cat > src/swagger/index.ts << 'EOF'
import { Application } from "express";
import swaggerUi from "swagger-ui-express";
import { membersSwagger } from "../features/business/members/members.swagger";

export type FeatureSwaggerModule = {
  tags: unknown[];
  paths: Record<string, unknown>;
  components?: {
    schemas?: Record<string, unknown>;
  };
};

/**
 * Registry externo: importa la documentación OpenAPI
 * de cada feature.
 *
 * Mismo patrón utilizado por los Seeders.
 */
const featureSwaggerModules: FeatureSwaggerModule[] = [
  membersSwagger,
  // productTypeSwagger,
  // userSwagger,
];

/**
 * Construye el documento OpenAPI fusionando
 * la documentación de todos los features.
 */
export function buildOpenApiDocument() {
  const tags: unknown[] = [];
  const paths: Record<string, unknown> = {};
  const schemas: Record<string, unknown> = {};

  for (const mod of featureSwaggerModules) {
    tags.push(...mod.tags);

    Object.assign(paths, mod.paths);

    if (mod.components?.schemas) {
      Object.assign(schemas, mod.components.schemas);
    }
  }

  return {
    openapi: "3.0.3",

    info: {
      title: "Solia Express API",
      version: "1.0.0",
      description:
        "API Solia Express (Express + Sequelize). Los endpoints del feature Members están documentados como SIN AUTH.",
    },

    servers: [
      {
        url: `http://localhost:${process.env.PORT || 4000}`,
        description: "Servidor local",
      },
    ],

    tags,

    paths,

    components: {
      schemas,
    },
  };
}

/**
 * Monta Swagger UI y el documento OpenAPI JSON.
 */
export function setupSwagger(app: Application): void {
  const document = buildOpenApiDocument();

  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(document)
  );

  app.get("/api/docs.json", (_req, res) => {
    res.json(document);
  });

  console.log(
    "📘 Swagger UI: /api/docs | OpenAPI JSON: /api/docs.json"
  );
}
EOF
```

![](images/clipboard-3546734763.png)

**PARCHE** — `src/config/index.ts` **ya existe**.

1.  **Debajo de** `import { Routes } from "../routes/index";` (o
    **debajo de** los imports de BD/modelo), **añadir**:

``` ts
import { setupSwagger } from "../swagger/index";
```

2.  **Dentro del** `constructor`, **debajo de** `this.routes();` y
    **encima de** `this.dbConnection();`, **añadir**:

``` ts
    this.docs();
```

3.  **Dentro de** la clase `App`, **debajo de** el método `routes()` y
    **encima de** `dbConnection()`, **añadir**:

``` ts
  private docs(): void {
    setupSwagger(this.app);
  }
```

### Verificación ISS-05

``` bash
http://localhost:4000/api/docs
```

> ![](images/clipboard-4002618805.png)
>
> Con el servidor del cierre: abrir `http://localhost:4000/api/docs`.

**Al agregar otra entidad (patrón):**

1.  Archivo **nuevo** `features/.../<entidad>.swagger.ts` con `: >` +
    `cat >>`.
2.  **PARCHE** `src/swagger/index.ts`: **debajo de**
    `import { membersSwagger } ...`, **añadir** el import; **dentro de**
    `featureSwaggerModules`, **debajo de** `membersSwagger,`, **añadir**
    el módulo nuevo.

### Cierre del ISS

``` bash
npm run dev
```

> ![](images/clipboard-1716148080.png)
>
> El servidor debe arrancar sin error. Abrir
> `http://localhost:4000/api/docs`. Detenerlo con Ctrl+C antes de
> continuar.

------------------------------------------------------------------------

# 11. ISS-06 — Feature Accounts (Cuentas)

**Objetivo:** CRUD + seeder + swagger de Accoubts (sin FK).\
**Bloqueado por:** ISS-05.\
**API:** `/api/ cuentas` — **SIN AUTH**.\
**Patrón:** mismo que Members (ISS-03-A…E + 04 + 05).

### Criterios de aceptación (ISS-06)

-   [x] **11.1** Modelo `accounts.model.ts` (`status` +
    `timestamps: true`)
-   [x] **11.2** Controller + routes en este orden: getAll, getOne,
    create, update PUT/PATCH, delete físico y lógico
-   [x] **11.3** Carpeta `http/` en el mismo orden: get, create, update,
    delete
-   [x] **11.4** Cableado en `routes/index.ts` + `config` (import
    model + route)
-   [x] **11.5** Seeder + registro en SeedersRunner / counts
-   [x] **11.6** Swagger + registro en `src/swagger`

``` bash
mkdir -p src/features/business/account/http
```

------------------------------------------------------------------------

## 11.1 Modelo ProductType

``` bash
cat > src/features/business/account/account.model.ts << 'EOF'
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

export interface AccountI {
  id?: number;
  name: string;
  description?: string | null;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

export class Account extends Model {
  public id!: number;
  public name!: string;
  public description!: string | null;
  public status!: "active" | "inactive";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Account.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Account",
    tableName: "accounts",
    timestamps: true,
  }
);
EOF
```

![](images/clipboard-3570341592.png)

------------------------------------------------------------------------

## 11.2 Controller + routes (CRUD completo)

``` bash
: > src/features/business/account/account.controller.ts
cat > src/features/business/account/account.controller.ts << 'EOF'
import { Request, Response } from "express";
import { Account, AccountI } from "./account.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

export class AccountController {
  // ================== READ ==================

  public async getAll(req: Request, res: Response) {
    try {
      const accounts = await Account.findAll({
        where: { status: "active" },
      });

      res.status(200).json({ accounts });
    } catch (error) {
      res.status(500).json({
        error: "Error fetching accounts",
        detail: String(error),
      });
    }
  }

  public async getOne(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const account = await Account.findByPk(id);

      if (!account) {
        res.status(404).json({
          error: "Account not found",
        });
        return;
      }

      res.status(200).json({ account });
    } catch (error) {
      res.status(500).json({
        error: "Error fetching account",
        detail: String(error),
      });
    }
  }

  // ================== CREATE ==================

  public async create(req: Request, res: Response) {
    try {
      const body = req.body as AccountI;

      const account = await Account.create({
        name: body.name,
        description: body.description ?? null,
        status: body.status ?? "active",
      });

      res.status(201).json({ account });
    } catch (error) {
      res.status(500).json({
        error: "Error creating account",
        detail: String(error),
      });
    }
  }

  // ================== UPDATE ==================

  public async updatePut(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as AccountI;

      const account = await Account.findByPk(id);

      if (!account) {
        res.status(404).json({
          error: "Account not found",
        });
        return;
      }

      await account.update({
        name: body.name,
        description: body.description ?? null,
        status: body.status ?? account.status,
      });

      res.status(200).json({ account });
    } catch (error) {
      res.status(500).json({
        error: "Error updating account (PUT)",
        detail: String(error),
      });
    }
  }

  public async updatePatch(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as Partial<AccountI>;

      const account = await Account.findByPk(id);

      if (!account) {
        res.status(404).json({
          error: "Account not found",
        });
        return;
      }

      await account.update(body);

      res.status(200).json({ account });
    } catch (error) {
      res.status(500).json({
        error: "Error updating account (PATCH)",
        detail: String(error),
      });
    }
  }

  // ================== DELETE ==================

  /** Eliminación física */
  public async deletePhysical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const account = await Account.findByPk(id);

      if (!account) {
        res.status(404).json({
          error: "Account not found",
        });
        return;
      }

      await account.destroy();

      res.status(200).json({
        message: "Account permanently deleted",
        id,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error deleting account",
        detail: String(error),
      });
    }
  }

  /** Eliminación lógica → status = inactive */
  public async deleteLogical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const account = await Account.findByPk(id);

      if (!account) {
        res.status(404).json({
          error: "Account not found",
        });
        return;
      }

      await account.update({
        status: "inactive",
      });

      res.status(200).json({
        message: "Account deactivated (logical delete)",
        account,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error deactivating account",
        detail: String(error),
      });
    }
  }
}
EOF
```

![](images/clipboard-214452726.png)

``` bash
cat > src/features/business/account/account.routes.ts << 'EOF'
import { Application } from "express";
import { AccountController } from "./account.controller";

export class AccountRoutes {
  public accountController: AccountController = new AccountController();

  public routes(app: Application): void {
    // ================== RUTAS SIN AUTENTICACIÓN / SIN MIDDLEWARE JWT ==================

    // getAll
    app
      .route("/api/accounts")
      .get(
        this.accountController.getAll.bind(
          this.accountController
        )
      );

    // getOne
    app
      .route("/api/accounts/:id")
      .get(
        this.accountController.getOne.bind(
          this.accountController
        )
      );

    // create
    app
      .route("/api/accounts")
      .post(
        this.accountController.create.bind(
          this.accountController
        )
      );

    // update (PUT / PATCH)
    app
      .route("/api/accounts/:id")
      .put(
        this.accountController.updatePut.bind(
          this.accountController
        )
      )
      .patch(
        this.accountController.updatePatch.bind(
          this.accountController
        )
      );

    // delete físico
    app
      .route("/api/accounts/:id")
      .delete(
        this.accountController.deletePhysical.bind(
          this.accountController
        )
      );

    // delete lógico
    app
      .route("/api/accounts/:id/deactivate")
      .patch(
        this.accountController.deleteLogical.bind(
          this.accountController
        )
      );
  }
}
EOF
```

![](images/clipboard-3754424488.png)

------------------------------------------------------------------------

## 11.3 HTTP (REST Members)

``` bash
: > src/features/business/account/http/accounts.get.http
cat >> src/features/business/account/http/accounts.get.http << 'EOF'
### Feature Account — GET ALL / GET ONE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)

@baseUrl = http://localhost:4000
@id = 1

# @name getAllAccounts
GET {{baseUrl}}/api/accounts

###

# @name getOneAccount
GET {{baseUrl}}/api/accounts/{{id}}
EOF
```

![](images/clipboard-318823202.png)

``` bash
: > src/features/business/account/http/accounts.create.http
cat >> src/features/business/account/http/accounts.create.http << 'EOF'
### Feature Account — CREATE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)

@baseUrl = http://localhost:4000

# @name createAccount
POST {{baseUrl}}/api/accounts
Content-Type: application/json

{
  "name": "Cuenta de Ahorros",
  "description": "Cuenta de ahorro para asociados",
  "status": "active"
}
EOF
```

![](images/clipboard-3143881305.png)

``` bash
: > src/features/business/account/http/accounts.update.http
cat >> src/features/business/account/http/accounts.update.http << 'EOF'
### Feature Account — UPDATE (PUT) / UPDATE (PATCH)
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)

@baseUrl = http://localhost:4000
@id = 1

# @name updateAccountPut
PUT {{baseUrl}}/api/accounts/{{id}}
Content-Type: application/json

{
  "name": "Cuenta de Ahorros Actualizada",
  "description": "Cuenta de ahorro actualizada",
  "status": "active"
}

###

# @name updateAccountPatch
PATCH {{baseUrl}}/api/accounts/{{id}}
Content-Type: application/json

{
  "description": "Descripción parcial actualizada"
}
EOF
```

![](images/clipboard-1849666992.png)

``` bash
: > src/features/business/account/http/accounts.delete.http
cat >> src/features/business/account/http/accounts.delete.http << 'EOF'
### Feature Account — DELETE físico / DELETE lógico (status = inactive)
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)

@baseUrl = http://localhost:4000
@id = 1

# @name deleteAccountPhysical
DELETE {{baseUrl}}/api/accounts/{{id}}

###

# @name deleteAccountLogical
PATCH {{baseUrl}}/api/accounts/{{id}}/deactivate
EOF
```

![](images/clipboard-2441685480.png)

------------------------------------------------------------------------

## 11.4 Cableado Routes + Config

**PARCHE** — `src/routes/index.ts` **ya existe**.

1.  **Debajo de** `import { ClientRoutes } ...`, **añadir**:

``` ts
import { ProductTypeRoutes } from "../features/business/product-type/product-type.routes";
```

2.  **Dentro de** `export class Routes`, **debajo de** `clientRoutes`,
    **añadir**:

``` ts
  public productTypeRoutes: ProductTypeRoutes = new ProductTypeRoutes();
```

**PARCHE** — `src/config/index.ts` **ya existe**.

1.  **Debajo de** `import "../features/business/client/client.model";`,
    **añadir**:

``` ts
import "../features/business/product-type/product-type.model";
```

2.  **Dentro de** `routes()`, **debajo de**
    `this.routePrv.clientRoutes.routes(this.app);`, **añadir**:

``` ts
    this.routePrv.productTypeRoutes.routes(this.app);
```

### Veriricación

``` bash
curl -s -X POST http://localhost:4000/api/accounts \
  -H 'Content-Type: application/json' \
  -d '{"name":"Cuenta de Ahorros","description":"Cuenta para asociados","status":"active"}
```

![](images/clipboard-4059468993.png)

------------------------------------------------------------------------

## 11.5 Seeder ProductType

``` bash
: > src/features/business/account/account.seeder.ts
cat >> src/features/business/account/account.seeder.ts << 'EOF'
import { faker } from "@faker-js/faker";
import { Account } from "./account.model";

/**
 * Seeder del feature Account.
 *
 * Genera datos falsos utilizando @faker-js/faker.
 *
 * Se invoca desde src/database/seeders (SeedersRunner),
 * no desde la App.
 *
 * Es idempotente:
 * si ya existen registros en la tabla accounts,
 * no vuelve a insertar datos.
 */
export async function seedAccounts(count: number): Promise<number> {
  if (count <= 0) {
    console.log("⏭️  accounts: count=0, se omite");
    return 0;
  }

  const existing = await Account.count();

  if (existing > 0) {
    console.log(
      `⏭️  accounts: ya hay ${existing} registro(s), se omite seeder`
    );
    return 0;
  }

  const rows = Array.from({ length: count }, () => ({
    name: faker.finance.accountName(),
    description: faker.lorem.sentence(),
    status: "active" as const,
  }));

  await Account.bulkCreate(rows);

  console.log(
    `✅ accounts: insertados ${count} registro(s) falsos`
  );

  return count;
}
EOF
```

![](images/clipboard-4171172693.png)

**PARCHE** — `src/database/seeders/counts.ts` **ya existe**.

-   **Dentro de** `SeedCounts`, **añadir** `product_types: number;`
-   **Dentro de** `DEFAULT_SEED_COUNTS`, **añadir** `product_types: 25,`
-   **Dentro de** la resolución por env, **añadir** lectura de
    `SEED_PRODUCT_TYPES` (ver archivo final abajo en ISS-08 si
    consolidás).

**PARCHE** — `src/database/seeders/index.ts` **ya existe**.

1.  **Debajo de** imports de client, **añadir** import de
    `seedProductTypes`.
2.  **Debajo de** `await seedClients(...)`, **añadir**
    `await seedProductTypes(counts.product_types);`

------------------------------------------------------------------------

## 11.6 Swagger ProductType

``` bash
: > src/features/business/account/account.swagger.ts
cat >> src/features/business/account/account.swagger.ts << 'EOF'
/**
 * Documentación OpenAPI del feature Account.
 *
 * Se agrega desde src/swagger (registry externo),
 * no se monta directamente desde este feature.
 *
 * Leyenda: endpoints documentados como SIN AUTH
 * (sin middleware JWT).
 */

export const accountSwagger = {
  tags: [
    {
      name: "Accounts",
      description:
        "CRUD de cuentas — **SIN AUTH** (sin middleware JWT)",
    },
  ],

  paths: {
    "/api/accounts": {
      get: {
        tags: ["Accounts"],
        summary: "Listar cuentas activas",
        description:
          "SIN AUTH — retorna únicamente cuentas con status=active.",
        security: [],
        responses: {
          "200": {
            description: "Lista de cuentas",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    accounts: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Account",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      post: {
        tags: ["Accounts"],
        summary: "Crear cuenta",
        description: "SIN AUTH",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AccountCreate",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Cuenta creada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    account: {
                      $ref: "#/components/schemas/Account",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/accounts/{id}": {
      get: {
        tags: ["Accounts"],
        summary: "Obtener cuenta por ID",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "Cuenta encontrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    account: {
                      $ref: "#/components/schemas/Account",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Cuenta no encontrada",
          },
        },
      },

      put: {
        tags: ["Accounts"],
        summary: "Actualizar cuenta (PUT — reemplazo)",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AccountUpdate",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Cuenta actualizada",
          },
          "404": {
            description: "Cuenta no encontrada",
          },
        },
      },

      patch: {
        tags: ["Accounts"],
        summary: "Actualizar cuenta (PATCH — parcial)",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AccountPatch",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Cuenta actualizada",
          },
          "404": {
            description: "Cuenta no encontrada",
          },
        },
      },

      delete: {
        tags: ["Accounts"],
        summary: "Eliminar cuenta físicamente",
        description: "SIN AUTH — elimina físicamente la fila.",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "Cuenta eliminada",
          },
          "404": {
            description: "Cuenta no encontrada",
          },
        },
      },
    },

    "/api/accounts/{id}/deactivate": {
      patch: {
        tags: ["Accounts"],
        summary: "Desactivar cuenta",
        description:
          "SIN AUTH — eliminación lógica estableciendo status=inactive.",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "Cuenta desactivada",
          },
          "404": {
            description: "Cuenta no encontrada",
          },
        },
      },
    },
  },

  components: {
    schemas: {
      Account: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          name: {
            type: "string",
            example: "Cuenta de Ahorros",
          },
          description: {
            type: "string",
            example: "Cuenta de ahorro para asociados",
            nullable: true,
          },
          status: {
            type: "string",
            enum: ["active", "inactive"],
            example: "active",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },

      AccountCreate: {
        type: "object",
        required: ["name"],
        properties: {
          name: {
            type: "string",
            example: "Cuenta de Ahorros",
          },
          description: {
            type: "string",
            example: "Cuenta de ahorro para asociados",
          },
          status: {
            type: "string",
            enum: ["active", "inactive"],
            default: "active",
          },
        },
      },

      AccountUpdate: {
        type: "object",
        required: ["name"],
        properties: {
          name: {
            type: "string",
            example: "Cuenta de Ahorros Actualizada",
          },
          description: {
            type: "string",
            example: "Descripción actualizada",
          },
          status: {
            type: "string",
            enum: ["active", "inactive"],
          },
        },
      },

      AccountPatch: {
        type: "object",
        properties: {
          name: {
            type: "string",
            example: "Cuenta Actualizada",
          },
          description: {
            type: "string",
            example: "Descripción parcial",
          },
          status: {
            type: "string",
            enum: ["active", "inactive"],
          },
        },
      },
    },
  },
};
EOF
```

![](images/clipboard-3333603036.png)

**PARCHE** — `src/swagger/index.ts` **ya existe**.

1.  **Debajo de** `import { clientSwagger } ...`, **añadir** import de
    `productTypeSwagger`.
2.  **Dentro de** `featureSwaggerModules`, **debajo de**
    `clientSwagger,`, **añadir** `productTypeSwagger,`.

### Cierre del ISS

``` bash
npm run dev
```

> ![](images/clipboard-2602740766.png)
>
> ![](images/clipboard-1449643655.png)
>
> El servidor debe arrancar sin error. Detenerlo con Ctrl+C antes de
> continuar.

------------------------------------------------------------------------

# 12. ISS-07 — Feature Movements (movimientos

**Objetivo:** CRUD de Movement con FK Account.\
**Bloqueado por:** ISS-06.\
**API:** `/api/movements` — **SIN AUTH**.

### Criterios de aceptación (ISS-07)

-   [x] **12.1** Modelo Movement con account`_id`
-   [x] **12.2** Controller valida tipo **activo** en create/updatePut
-   [x] **12.3** Routes + http/ en orden getAll, getOne, create, update
    PUT/PATCH, delete físico y lógico
-   [x] **12.4** Cableado routes/config
-   [x] **12.5** **Relaciones** Movements ↔ Account_id (archivo
    associations + import)
-   [x] **12.6** Seeder + swagger

``` bash
mkdir -p src/features/business/movements/http
```

------------------------------------------------------------------------

## 12.1 Modelo Movements

``` bash
: > src/features/business/movements/movement.model.ts
cat >> src/features/business/movements/movement.model.ts << 'EOF'
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

export interface MovementI {
  id?: number;
  account_id: number;
  reference_id?: number | null;
  type: string;
  date: Date;
  amount: number;
  observations?: string | null;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

export class Movement extends Model {
  public id!: number;
  public account_id!: number;
  public reference_id!: number | null;
  public type!: string;
  public date!: Date;
  public amount!: number;
  public observations!: string | null;
  public status!: "active" | "inactive";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Movement.init(
  {
    account_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reference_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Movement",
    tableName: "movements",
    timestamps: true,
  }
);
EOF
```

![](images/clipboard-2871970107.png)

------------------------------------------------------------------------

## 12.2 Controller + routes

``` bash
: > src/features/business/movements/movement.controller.ts
cat >> src/features/business/movements/movement.controller.ts <<'EOF'
import { Request, Response } from "express";
import { Movement, MovementI } from "./movement.model";
import { Account } from "../account/account.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

async function assertAccountExists(
  account_id: number
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const account = await Account.findByPk(account_id);

  if (!account) {
    return {
      ok: false,
      status: 404,
      error: "Account not found",
    };
  }

  if (account.status !== "active") {
    return {
      ok: false,
      status: 400,
      error: "Account must be active",
    };
  }

  return { ok: true };
}

export class MovementController {
  // ================== READ ==================

  public async getAll(req: Request, res: Response) {
    try {
      const movements = await Movement.findAll({
        where: { status: "active" },
      });

      res.status(200).json({ movements });
    } catch (error) {
      res.status(500).json({
        error: "Error fetching movements",
        detail: String(error),
      });
    }
  }

  public async getOne(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const movement = await Movement.findByPk(id);

      if (!movement) {
        res.status(404).json({
          error: "Movement not found",
        });
        return;
      }

      res.status(200).json({ movement });
    } catch (error) {
      res.status(500).json({
        error: "Error fetching movement",
        detail: String(error),
      });
    }
  }

  // ================== CREATE ==================

  public async create(req: Request, res: Response) {
    try {
      const body = req.body as MovementI;

      const check = await assertAccountExists(
        Number(body.account_id)
      );

      if (!check.ok) {
        res.status(check.status).json({
          error: check.error,
        });
        return;
      }

      const movement = await Movement.create({
        account_id: body.account_id,
        reference_id: body.reference_id ?? null,
        type: body.type,
        date: body.date,
        amount: body.amount,
        observations: body.observations ?? null,
        status: body.status ?? "active",
      });

      res.status(201).json({ movement });
    } catch (error) {
      res.status(500).json({
        error: "Error creating movement",
        detail: String(error),
      });
    }
  }

  // ================== UPDATE ==================

  public async updatePut(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as MovementI;

      const movement = await Movement.findByPk(id);

      if (!movement) {
        res.status(404).json({
          error: "Movement not found",
        });
        return;
      }

      const check = await assertAccountExists(
        Number(body.account_id)
      );

      if (!check.ok) {
        res.status(check.status).json({
          error: check.error,
        });
        return;
      }

      await movement.update({
        account_id: body.account_id,
        reference_id: body.reference_id ?? null,
        type: body.type,
        date: body.date,
        amount: body.amount,
        observations: body.observations ?? null,
        status: body.status ?? movement.status,
      });

      res.status(200).json({ movement });
    } catch (error) {
      res.status(500).json({
        error: "Error updating movement (PUT)",
        detail: String(error),
      });
    }
  }

  public async updatePatch(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as Partial<MovementI>;

      const movement = await Movement.findByPk(id);

      if (!movement) {
        res.status(404).json({
          error: "Movement not found",
        });
        return;
      }

      if (body.account_id !== undefined) {
        const check = await assertAccountExists(
          Number(body.account_id)
        );

        if (!check.ok) {
          res.status(check.status).json({
            error: check.error,
          });
          return;
        }
      }

      await movement.update(body);

      res.status(200).json({ movement });
    } catch (error) {
      res.status(500).json({
        error: "Error updating movement (PATCH)",
        detail: String(error),
      });
    }
  }

  // ================== DELETE ==================

  /** Eliminación física */
  public async deletePhysical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const movement = await Movement.findByPk(id);

      if (!movement) {
        res.status(404).json({
          error: "Movement not found",
        });
        return;
      }

      await movement.destroy();

      res.status(200).json({
        message: "Movement permanently deleted",
        id,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error deleting movement",
        detail: String(error),
      });
    }
  }

  /** Eliminación lógica → status = inactive */
  public async deleteLogical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const movement = await Movement.findByPk(id);

      if (!movement) {
        res.status(404).json({
          error: "Movement not found",
        });
        return;
      }

      await movement.update({
        status: "inactive",
      });

      res.status(200).json({
        message: "Movement deactivated (logical delete)",
        movement,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error deactivating movement",
        detail: String(error),
      });
    }
  }
}
EOF
```

![](images/clipboard-1705064960.png)

``` bash
: > src/features/business/movements/movement.routes.ts
cat >> src/features/business/movements/movement.routes.ts <<'EOF'
import { Application } from "express";
import { MovementController } from "./movement.controller";

export class MovementRoutes {
  public movementController: MovementController = new MovementController();

  public routes(app: Application): void {
    // ================== RUTAS SIN AUTENTICACIÓN / SIN MIDDLEWARE JWT ==================

    // getAll
    app
      .route("/api/movements")
      .get(this.movementController.getAll.bind(this.movementController));

    // getOne
    app
      .route("/api/movements/:id")
      .get(this.movementController.getOne.bind(this.movementController));

    // create
    app
      .route("/api/movements")
      .post(this.movementController.create.bind(this.movementController));

    // update (PUT / PATCH)
    app
      .route("/api/movements/:id")
      .put(this.movementController.updatePut.bind(this.movementController))
      .patch(this.movementController.updatePatch.bind(this.movementController));

    // delete físico
    app
      .route("/api/movements/:id")
      .delete(
        this.movementController.deletePhysical.bind(this.movementController)
      );

    // delete lógico
    app
      .route("/api/movements/:id/deactivate")
      .patch(
        this.movementController.deleteLogical.bind(this.movementController)
      );
  }
}
EOF
```

![](images/clipboard-2186800827.png)

------------------------------------------------------------------------

## 12.3 HTTP

``` bash
: > src/features/business/movements/http/movements.get.http
cat >> src/features/business/movements/http/movements.get.http <<'EOF'
### Feature Movement — GET ALL / GET ONE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name getAllMovements
GET {{baseUrl}}/api/movements

###

# @name getOneMovement
GET {{baseUrl}}/api/movements/{{id}}
EOF
```

![](images/clipboard-1462264836.png)

``` bash
: > src/features/business/movements/http/movements.create.http
cat >> src/features/business/movements/http/movements.create.http <<'EOF'
### Feature Movement — CREATE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000

# @name createMovement
POST {{baseUrl}}/api/movements
Content-Type: application/json

{
  "account_id": 1,
  "reference_id": null,
  "type": "deposit",
  "date": "2026-10-01",
  "amount": 500000.00,
  "observations": "Aporte inicial",
  "status": "active"
}
EOF
```

![](images/clipboard-368414347.png)

``` bash
: > src/features/business/movements/http/movements.update.http
cat >> src/features/business/movements/http/movements.update.http <<'EOF'
### Feature Movement — UPDATE (PUT) / UPDATE (PATCH)
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name updateMovementPut
PUT {{baseUrl}}/api/movements/{{id}}
Content-Type: application/json

{
  "account_id": 1,
  "reference_id": null,
  "type": "deposit",
  "date": "2026-10-01",
  "amount": 750000.00,
  "observations": "Aporte actualizado",
  "status": "active"
}

###

# @name updateMovementPatch
PATCH {{baseUrl}}/api/movements/{{id}}
Content-Type: application/json

{
  "amount": 800000.00,
  "observations": "Monto actualizado"
}
EOF
```

![](images/clipboard-727818848.png)

``` bash
: > src/features/business/movements/http/movements.delete.http
cat >> src/features/business/movements/http/movements.delete.http <<'EOF'
### Feature Movement — DELETE físico / DELETE lógico (status = inactive)
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name deleteMovementPhysical
DELETE {{baseUrl}}/api/movements/{{id}}

###

# @name deleteMovementLogical
PATCH {{baseUrl}}/api/movements/{{id}}/deactivate
EOF
```

![](images/clipboard-1493272405.png)

------------------------------------------------------------------------

## 12.4 Cableado

**PARCHE** — `src/routes/index.ts`:

-   **Debajo de** import MovementspeRoutes, **añadir** MovementsRoutes.
-   **Dentro de** `Routes`, **añadir** `MovementsRoutes`.

**PARCHE** — `src/config/index.ts`:

-   **Debajo de** import product-type.model, **añadir**
    `import "../features/business/Movements/movements.model";`
-   **Dentro de** `routes()`, **añadir**
    `this.routePrv.movementsRoutes.routes(this.app);`

------------------------------------------------------------------------

## 12.5 Relación Movements↔ Movements (**obligatorio al cerrar la tabla Movements**)

> Norma FK: `account_id` (tabla account → singular account + `_id`).

> Cuando una tabla nueva **se relaciona** con una ya existente, al final
> se agrega este paso: archivo de asociaciones + **PARCHE** en `config`
> para cargarlo (side-effect).

``` bash
: > src/features/business/accounts/account.associations.ts
cat >> src/features/business/accounts/account.associations.ts << 'EOF'
import { Product } from "./product.model";
import { ProductType } from "../product-type/product-type.model";

Product.belongsTo(ProductType, { foreignKey: "product_type_id", as: "product_type" });
ProductType.hasMany(Product, { foreignKey: "product_type_id", as: "products" });
EOF
```

**PARCHE** — `src/config/index.ts` **ya existe**.

**Debajo de** los imports de modelos Product / ProductType (y **encima
de** `import { Routes }`), **añadir**:

``` ts
import "../features/business/product/product.associations";
```

Archivo **nuevo** (lab — alinea FK camelCase → snake_case antes del
`sync`):

**PARCHE** — `src/config/index.ts`: **debajo de**
`import { sequelize, getDatabaseInfo, testConnection } from "../database/db";`,
**añadir**:

``` ts
```

**Dentro de** `dbConnection()`, **reemplazar** el bloque de
`sequelize.sync(...)` por el de `src/config/index.ts` del repo
(`SET FOREIGN_KEY_CHECKS` en MySQL, y opcional `DB_SYNC_FORCE=true`).
Con BD limpia no hace falta rename legacy.

Esto registra en Sequelize:

-   `Product.belongsTo(ProductType, { foreignKey: "product_type_id", as: "product_type" })`
-   `ProductType.hasMany(Product, { foreignKey: "product_type_id", as: "products" })`

### Verificación relación

``` bash
curl -s -X POST http://localhost:4000/api/movements \
  -H 'Content-Type: application/json' \
  -d '{
    "account_id": 1,
    "reference_id": null,
    "type": "credit",
    "date": "2026-10-04T10:30:00.000Z",
    "amount": 250000,
    "observations": "Aporte mensual",
    "status": "active"
  }'

curl -s http://localhost:4000/api/movements
```

![](images/clipboard-1286487409.png)

------------------------------------------------------------------------

## 12.6 Seeder + Swagger Movements

``` bash
cat > src/features/business/movements/movement.seeder.ts << 'EOF'
import { faker } from "@faker-js/faker";
import { Movement } from "./movement.model";
import { Account } from "../account/account.model";

/**
 * Seeder del feature Movement.
 * Genera movimientos asociados a cuentas activas.
 *
 * Se invoca desde `src/database/seeders` (SeedersRunner),
 * no desde la App.
 *
 * Idempotente: si ya existen movimientos, no inserta nuevos.
 */
export async function seedMovements(count: number): Promise<number> {
  if (count <= 0) {
    console.log("⏭️  movements: count=0, se omite");
    return 0;
  }

  const existing = await Movement.count();

  if (existing > 0) {
    console.log(
      `⏭️  movements: ya hay ${existing} registro(s), se omite seeder`
    );
    return 0;
  }

  const accounts = await Account.findAll({
    where: {
      status: "active",
    },
  });

  if (accounts.length === 0) {
    console.log(
      "⏭️  movements: no hay cuentas activas, se omite seeder"
    );
    return 0;
  }

  const rows = Array.from({ length: count }, () => {
    const account =
      accounts[Math.floor(Math.random() * accounts.length)];

    const type = faker.helpers.arrayElement([
      "credit",
      "debit",
    ]);

    return {
      account_id: account.id,
      reference_id: null,
      type,
      date: faker.date.recent({ days: 30 }),
      amount: Number(
        faker.finance.amount({
          min: 10000,
          max: 1000000,
          dec: 2,
        })
      ),
      observations: faker.helpers.arrayElement([
        "Aporte mensual",
        "Depósito en cuenta",
        "Retiro de fondos",
        "Movimiento de ahorro",
        "Pago registrado",
        "Transferencia interna",
      ]),
      status: "active" as const,
    };
  });

  await Movement.bulkCreate(rows);

  console.log(
    `✅ movements: insertados ${count} registro(s) falsos`
  );

  return count;
}
EOF
```

![](images/clipboard-2963368553.png)

``` bash
cat > src/features/business/movements/movement.swagger.ts << 'EOF'
/**
 * Documentación OpenAPI del feature Movement.
 * Se agrega desde `src/swagger` (registry externo), no se monta aquí.
 *
 * Leyenda: endpoints documentados como SIN AUTH
 * (sin middleware JWT).
 */

export const movementSwagger = {
  tags: [
    {
      name: "Movimientos",
      description:
        "CRUD de movimientos de cuentas — **SIN AUTH** (sin middleware JWT)",
    },
  ],

  paths: {
    "/api/movimientos": {
      get: {
        tags: ["Movimientos"],
        summary: "Listar movimientos activos",
        description:
          "SIN AUTH — retorna movimientos con status=active",
        security: [],
        responses: {
          "200": {
            description: "Lista de movimientos",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    movements: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Movement",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      post: {
        tags: ["Movimientos"],
        summary: "Crear movimiento",
        description:
          "SIN AUTH — account_id debe corresponder a una cuenta existente",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/MovementCreate",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Movimiento creado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    movement: {
                      $ref: "#/components/schemas/Movement",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Datos inválidos",
          },
          "404": {
            description: "Cuenta no encontrada",
          },
        },
      },
    },

    "/api/movimientos/{id}": {
      get: {
        tags: ["Movimientos"],
        summary: "Obtener movimiento por id",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "Movimiento encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    movement: {
                      $ref: "#/components/schemas/Movement",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Movimiento no encontrado",
          },
        },
      },

      put: {
        tags: ["Movimientos"],
        summary: "Actualizar movimiento (PUT — reemplazo)",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/MovementUpdate",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Movimiento actualizado",
          },
          "400": {
            description: "Datos inválidos",
          },
          "404": {
            description: "Movimiento o cuenta no encontrada",
          },
        },
      },

      patch: {
        tags: ["Movimientos"],
        summary: "Actualizar movimiento (PATCH — parcial)",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/MovementPatch",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Movimiento actualizado",
          },
          "404": {
            description: "Movimiento no encontrado",
          },
        },
      },

      delete: {
        tags: ["Movimientos"],
        summary: "Eliminar movimiento (físico)",
        description:
          "SIN AUTH — elimina físicamente el registro",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "Movimiento eliminado",
          },
          "404": {
            description: "Movimiento no encontrado",
          },
        },
      },
    },

    "/api/movimientos/{id}/deactivate": {
      patch: {
        tags: ["Movimientos"],
        summary: "Eliminar movimiento (lógico)",
        description:
          "SIN AUTH — cambia status = inactive",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "Movimiento desactivado",
          },
          "404": {
            description: "Movimiento no encontrado",
          },
        },
      },
    },
  },

  components: {
    schemas: {
      Movement: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          account_id: {
            type: "integer",
            example: 1,
          },
          reference_id: {
            type: "integer",
            nullable: true,
            example: null,
          },
          type: {
            type: "string",
            example: "credit",
          },
          date: {
            type: "string",
            format: "date-time",
            example: "2026-10-04T10:30:00.000Z",
          },
          amount: {
            type: "number",
            format: "decimal",
            example: 250000.00,
          },
          observations: {
            type: "string",
            nullable: true,
            example: "Aporte mensual",
          },
          status: {
            type: "string",
            enum: ["active", "inactive"],
            example: "active",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },

      MovementCreate: {
        type: "object",
        required: [
          "account_id",
          "type",
          "date",
          "amount",
        ],
        properties: {
          account_id: {
            type: "integer",
            example: 1,
          },
          reference_id: {
            type: "integer",
            nullable: true,
            example: null,
          },
          type: {
            type: "string",
            example: "credit",
          },
          date: {
            type: "string",
            format: "date-time",
          },
          amount: {
            type: "number",
            format: "decimal",
            example: 250000.00,
          },
          observations: {
            type: "string",
            nullable: true,
            example: "Aporte mensual",
          },
          status: {
            type: "string",
            enum: ["active", "inactive"],
            default: "active",
          },
        },
      },

      MovementUpdate: {
        type: "object",
        required: [
          "account_id",
          "type",
          "date",
          "amount",
        ],
        properties: {
          account_id: {
            type: "integer",
            example: 1,
          },
          reference_id: {
            type: "integer",
            nullable: true,
            example: null,
          },
          type: {
            type: "string",
            example: "credit",
          },
          date: {
            type: "string",
            format: "date-time",
          },
          amount: {
            type: "number",
            format: "decimal",
            example: 250000.00,
          },
          observations: {
            type: "string",
            nullable: true,
            example: "Aporte mensual actualizado",
          },
          status: {
            type: "string",
            enum: ["active", "inactive"],
          },
        },
      },

      MovementPatch: {
        type: "object",
        properties: {
          account_id: {
            type: "integer",
            example: 1,
          },
          reference_id: {
            type: "integer",
            nullable: true,
            example: null,
          },
          type: {
            type: "string",
            example: "debit",
          },
          date: {
            type: "string",
            format: "date-time",
          },
          amount: {
            type: "number",
            format: "decimal",
            example: 150000.00,
          },
          observations: {
            type: "string",
            nullable: true,
            example: "Retiro de fondos",
          },
          status: {
            type: "string",
            enum: ["active", "inactive"],
          },
        },
      },
    },
  },
};
EOF
```

![](images/clipboard-3846769713.png)

**PARCHE** counts / SeedersRunner / swagger registry: añadir `products`
(default 15), `seedProducts`, `productSwagger` (mismo patrón que
ISS-06).

### Cierre del ISS

``` bash
npm run dev
```

> ![](images/clipboard-702142662.png)
>
> ![](images/clipboard-4269250181.png)
>
> El servidor debe arrancar sin error. Detenerlo con Ctrl+C antes de
> continuar.

------------------------------------------------------------------------

# 13. ISS-08 — Feature CreditApplication (solicitudes de crédito)

**Objetivo:** gestionar las solicitudes de crédito de los asociados,
registrando la fecha, valor solicitado, estado y observaciones,
manteniendo la relación con `Member` y preparando la posterior relación
con `Credit`.

**Bloqueado por:** ISS-07 — Movements.

**API:** `/api/credit-applications` — **SIN AUTH**.

### Criterios de aceptación (ISS-08)

-   Feature propio `src/features/business/credit-applications/` (model,
    controller, routes, seeder, swagger, http, associations).
-   Rutas `/api/credit-applications` montadas en los aggregators.
-   **13.1** Modelo `CreditApplication` (tabla `credit_applications`).
-   **13.2** Controller CreditApplication en orden getAll, getOne,
    create, update PUT/PATCH, delete físico y lógico.
-   **13.3** Routes `/api/credit-applications` + `http/`.
-   **13.4** Seeder `credit-applications` y clave `creditApplications`
    en SeedCounts.
-   **13.5** Relación `Member ↔ CreditApplication`.
-   **13.6** Swagger CreditApplication.
-   **13.7** Estado final consolidado (config / routes / seeders /
    swagger).

``` bash
mkdir -p src/features/business/credit-applications/http
```

------------------------------------------------------------------------

## 13.1 Modelos Sale y feature CreditApplication (solicitudes de crédito)

``` bash
: > src/features/business/credit-applications/credit-application.model.ts
cat >> src/features/business/credit-applications/credit-application.model.ts << 'EOF'
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

export interface CreditApplicationI {
  id?: number;
  member_id: number;
  reference_id?: number | null;
  date: Date | string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "cancelled";
  observations?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CreditApplication extends Model {
  public id!: number;
  public member_id!: number;
  public reference_id!: number | null;
  public date!: Date;
  public amount!: number;
  public status!: "pending" | "approved" | "rejected" | "cancelled";
  public observations!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CreditApplication.init(
  {
    member_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reference_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "approved",
        "rejected",
        "cancelled"
      ),
      defaultValue: "pending",
      allowNull: false,
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "CreditApplication",
    tableName: "credit_applications",
    timestamps: true,
  }
);
EOF
```

![](images/clipboard-1658905984.png)

``` bash
mkdir -p src/features/business/credit-applications/http

: > src/features/business/credit-applications/credit-application.model.ts
cat >> src/features/business/credit-applications/credit-application.model.ts << 'EOF'
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

export interface CreditApplicationI {
  id?: number;
  member_id: number;
  reference_id?: number | null;
  date: Date | string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "cancelled";
  observations?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CreditApplication extends Model {
  public id!: number;
  public member_id!: number;
  public reference_id!: number | null;
  public date!: Date;
  public amount!: number;
  public status!: "pending" | "approved" | "rejected" | "cancelled";
  public observations!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CreditApplication.init(
  {
    member_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reference_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "approved",
        "rejected",
        "cancelled"
      ),
      defaultValue: "pending",
      allowNull: false,
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "CreditApplication",
    tableName: "credit_applications",
    timestamps: true,
  }
);
EOF
```

![](images/clipboard-1318913110.png)

## 13.1b Associations CreditApplication

``` bash
: > src/features/business/credit-applications/credit-application.associations.ts
cat >> src/features/business/credit-applications/credit-application.associations.ts << 'EOF'
import { CreditApplication } from "./credit-application.model";
import { Member } from "../members/members.model";

Member.hasMany(CreditApplication, {
  foreignKey: "member_id",
  as: "creditApplications",
});

CreditApplication.belongsTo(Member, {
  foreignKey: "member_id",
  as: "member",
});
EOF
```

![](images/clipboard-678721631.png)

## 13.2b Controller CreditApplication

``` bash
: > src/features/business/credit-applications/credit-application.controller.ts
cat >> src/features/business/credit-applications/credit-application.controller.ts << 'EOF'
import { Request, Response } from "express";
import {
  CreditApplication,
  CreditApplicationI,
} from "./credit-application.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

export class CreditApplicationController {
  // ================== READ ==================

  public async getAll(req: Request, res: Response) {
    try {
      const credit_applications = await CreditApplication.findAll({
        where: {
          status: [
            "pending",
            "approved",
            "rejected",
            "cancelled",
          ],
        },
      });

      res.status(200).json({ credit_applications });
    } catch (error) {
      res.status(500).json({
        error: "Error al obtener las solicitudes de crédito",
        detail: String(error),
      });
    }
  }

  public async getOne(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const credit_application =
        await CreditApplication.findByPk(id);

      if (!credit_application) {
        res.status(404).json({
          error: "Solicitud de crédito no encontrada",
        });
        return;
      }

      res.status(200).json({ credit_application });
    } catch (error) {
      res.status(500).json({
        error: "Error al obtener la solicitud de crédito",
        detail: String(error),
      });
    }
  }

  // ================== CREATE ==================

  public async create(req: Request, res: Response) {
    try {
      const body = req.body as CreditApplicationI;

      if (!body.member_id) {
        res.status(400).json({
          error: "member_id es obligatorio",
        });
        return;
      }

      if (!body.amount || Number(body.amount) <= 0) {
        res.status(400).json({
          error: "amount debe ser mayor que 0",
        });
        return;
      }

      const credit_application =
        await CreditApplication.create({
          member_id: body.member_id,
          reference_id: body.reference_id ?? null,
          date: body.date ?? new Date(),
          amount: body.amount,
          status: body.status ?? "pending",
          observations: body.observations ?? null,
        });

      res.status(201).json({ credit_application });
    } catch (error) {
      res.status(500).json({
        error: "Error al crear la solicitud de crédito",
        detail: String(error),
      });
    }
  }

  // ================== UPDATE ==================

  public async updatePut(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const credit_application =
        await CreditApplication.findByPk(id);

      if (!credit_application) {
        res.status(404).json({
          error: "Solicitud de crédito no encontrada",
        });
        return;
      }

      const body = req.body as CreditApplicationI;

      if (!body.member_id) {
        res.status(400).json({
          error: "member_id es obligatorio",
        });
        return;
      }

      if (!body.amount || Number(body.amount) <= 0) {
        res.status(400).json({
          error: "amount debe ser mayor que 0",
        });
        return;
      }

      await credit_application.update({
        member_id: body.member_id,
        reference_id: body.reference_id ?? null,
        date: body.date,
        amount: body.amount,
        status: body.status,
        observations: body.observations ?? null,
      });

      res.status(200).json({ credit_application });
    } catch (error) {
      res.status(500).json({
        error: "Error al actualizar la solicitud de crédito (PUT)",
        detail: String(error),
      });
    }
  }

  public async updatePatch(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const credit_application =
        await CreditApplication.findByPk(id);

      if (!credit_application) {
        res.status(404).json({
          error: "Solicitud de crédito no encontrada",
        });
        return;
      }

      const body = req.body as Partial<CreditApplicationI>;

      if (
        body.amount !== undefined &&
        Number(body.amount) <= 0
      ) {
        res.status(400).json({
          error: "amount debe ser mayor que 0",
        });
        return;
      }

      await credit_application.update({
        ...(body.member_id !== undefined && {
          member_id: body.member_id,
        }),
        ...(body.reference_id !== undefined && {
          reference_id: body.reference_id,
        }),
        ...(body.date !== undefined && {
          date: body.date,
        }),
        ...(body.amount !== undefined && {
          amount: body.amount,
        }),
        ...(body.status !== undefined && {
          status: body.status,
        }),
        ...(body.observations !== undefined && {
          observations: body.observations,
        }),
      });

      res.status(200).json({ credit_application });
    } catch (error) {
      res.status(500).json({
        error: "Error al actualizar la solicitud de crédito (PATCH)",
        detail: String(error),
      });
    }
  }

  // ================== DELETE ==================

  public async deletePhysical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const credit_application =
        await CreditApplication.findByPk(id);

      if (!credit_application) {
        res.status(404).json({
          error: "Solicitud de crédito no encontrada",
        });
        return;
      }

      await credit_application.destroy();

      res.status(200).json({
        message: "Solicitud de crédito eliminada correctamente",
        id,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error al eliminar la solicitud de crédito",
        detail: String(error),
      });
    }
  }

  public async deleteLogical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const credit_application =
        await CreditApplication.findByPk(id);

      if (!credit_application) {
        res.status(404).json({
          error: "Solicitud de crédito no encontrada",
        });
        return;
      }

      await credit_application.update({
        status: "cancelled",
      });

      res.status(200).json({
        message:
          "Solicitud de crédito cancelada correctamente",
        credit_application,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error al cancelar la solicitud de crédito",
        detail: String(error),
      });
    }
  }
}
EOF
```

![](images/clipboard-2042103138.png)

## 13.3b Routes CreditApplication (`/api/credit-applications`)

``` bash
: > src/features/business/credit-applications/credit-application.routes.ts
cat >> src/features/business/credit-applications/credit-application.routes.ts << 'EOF'
import { Application } from "express";
import { CreditApplicationController } from "./credit-application.controller";

export class CreditApplicationRoutes {
  public creditApplicationController: CreditApplicationController =
    new CreditApplicationController();

  public routes(app: Application): void {
    // ================== ROUTES WITHOUT AUTHENTICATION / JWT MIDDLEWARE ==================

    // getAll
    app
      .route("/api/credit-applications")
      .get(
        this.creditApplicationController.getAll.bind(
          this.creditApplicationController
        )
      );

    // getOne
    app
      .route("/api/credit-applications/:id")
      .get(
        this.creditApplicationController.getOne.bind(
          this.creditApplicationController
        )
      );

    // create
    app
      .route("/api/credit-applications")
      .post(
        this.creditApplicationController.create.bind(
          this.creditApplicationController
        )
      );

    // update (PUT / PATCH)
    app
      .route("/api/credit-applications/:id")
      .put(
        this.creditApplicationController.updatePut.bind(
          this.creditApplicationController
        )
      )
      .patch(
        this.creditApplicationController.updatePatch.bind(
          this.creditApplicationController
        )
      );

    // physical delete
    app
      .route("/api/credit-applications/:id")
      .delete(
        this.creditApplicationController.deletePhysical.bind(
          this.creditApplicationController
        )
      );

    // logical delete
    app
      .route("/api/credit-applications/:id/deactivate")
      .patch(
        this.creditApplicationController.deleteLogical.bind(
          this.creditApplicationController
        )
      );
  }
}
EOF
```

![](images/clipboard-3365973968.png)

## 13.4b Seeder CreditApplication

``` bash
: > src/features/business/credit-applications/credit-application.seeder.ts
cat >> src/features/business/credit-applications/credit-application.seeder.ts << 'EOF'
import { faker } from "@faker-js/faker";
import { CreditApplication } from "./credit-application.model";
import { Member } from "../members/members.model";

/**
 * CreditApplication feature seeder.
 *
 * Generates credit applications associated with active members.
 *
 * It is executed from `src/database/seeders` (SeedersRunner),
 * not from the App.
 *
 * Idempotent: if credit applications already exist,
 * no new records are inserted.
 */
export async function seedCreditApplications(
  count: number
): Promise<number> {
  if (count <= 0) {
    console.log("⏭️  credit_applications: count=0, skipped");
    return 0;
  }

  const existing = await CreditApplication.count();

  if (existing > 0) {
    console.log(
      `⏭️  credit_applications: ${existing} record(s) already exist, seeder skipped`
    );
    return 0;
  }

  const members = await Member.findAll({
    where: {
      isActive: true,
    },
  });

  if (members.length === 0) {
    console.log(
      "⏭️  credit_applications: no active members found, seeder skipped"
    );
    return 0;
  }

  const rows = Array.from({ length: count }, () => {
    const member =
      members[Math.floor(Math.random() * members.length)];

    return {
      member_id: member.id,
      reference_id: null,
      date: faker.date.recent({ days: 30 }),
      amount: Number(
        faker.finance.amount({
          min: 500000,
          max: 10000000,
          dec: 2,
        })
      ),
      status: faker.helpers.arrayElement([
        "pending",
        "approved",
        "rejected",
      ]) as "pending" | "approved" | "rejected",
      observations: faker.helpers.arrayElement([
        "Solicitud de crédito personal",
        "Solicitud de crédito para libre inversión",
        "Solicitud de crédito para educación",
        "Solicitud de crédito para vivienda",
        "Solicitud de crédito para emprendimiento",
      ]),
    };
  });

  await CreditApplication.bulkCreate(rows);

  console.log(
    `✅ credit_applications: ${count} fake record(s) inserted`
  );

  return count;
}
EOF
```

![](images/clipboard-2112202739.png)

## 13.5b Swagger CreditApplication

``` bash
: > src/features/business/credit-applications/credit-application.swagger.ts
cat >> src/features/business/credit-applications/credit-application.swagger.ts << 'EOF'
/**
 * Documentación OpenAPI del feature CreditApplication
 * (tabla credit_applications).
 * Se agrega desde `src/swagger` (registry externo), no se monta aquí.
 *
 * Leyenda: endpoints documentados como SIN AUTH
 * (sin middleware JWT).
 */

export const creditApplicationSwagger = {
  tags: [
    {
      name: "CreditApplications",
      description:
        "CRUD de solicitudes de crédito — **SIN AUTH** (sin middleware JWT)",
    },
  ],

  paths: {
    "/api/credit-applications": {
      get: {
        tags: ["CreditApplications"],
        summary: "Listar solicitudes de crédito",
        description:
          "SIN AUTH — retorna las solicitudes de crédito registradas",
        security: [],
        responses: {
          "200": {
            description: "Lista de solicitudes de crédito",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    credit_applications: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/CreditApplication",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      post: {
        tags: ["CreditApplications"],
        summary: "Crear solicitud de crédito",
        description:
          "SIN AUTH — registra una nueva solicitud de crédito asociada a un socio",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreditApplicationCreate",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Solicitud de crédito creada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    credit_application: {
                      $ref: "#/components/schemas/CreditApplication",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description:
              "Validación de member_id o amount",
          },
        },
      },
    },

    "/api/credit-applications/{id}": {
      get: {
        tags: ["CreditApplications"],
        summary: "Obtener solicitud de crédito por id",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "Solicitud de crédito encontrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    credit_application: {
                      $ref: "#/components/schemas/CreditApplication",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Solicitud de crédito no encontrada",
          },
        },
      },

      put: {
        tags: ["CreditApplications"],
        summary: "Actualizar solicitud de crédito (PUT)",
        description:
          "SIN AUTH — actualiza completamente la información de la solicitud",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreditApplicationUpdate",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Solicitud de crédito actualizada",
          },
          "400": {
            description: "Datos de solicitud inválidos",
          },
          "404": {
            description: "Solicitud de crédito no encontrada",
          },
        },
      },

      patch: {
        tags: ["CreditApplications"],
        summary: "Actualizar solicitud de crédito (PATCH)",
        description:
          "SIN AUTH — permite actualizar parcialmente la solicitud",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreditApplicationPatch",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Solicitud de crédito actualizada",
          },
          "400": {
            description: "Datos inválidos",
          },
          "404": {
            description: "Solicitud de crédito no encontrada",
          },
        },
      },

      delete: {
        tags: ["CreditApplications"],
        summary: "Eliminar solicitud de crédito (físico)",
        description:
          "SIN AUTH — elimina físicamente la solicitud de crédito",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "Solicitud de crédito eliminada",
          },
          "404": {
            description: "Solicitud de crédito no encontrada",
          },
        },
      },
    },

    "/api/credit-applications/{id}/deactivate": {
      patch: {
        tags: ["CreditApplications"],
        summary: "Cancelar solicitud de crédito (lógico)",
        description:
          "SIN AUTH — cambia el estado de la solicitud a cancelled",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "Solicitud de crédito cancelada",
          },
          "404": {
            description: "Solicitud de crédito no encontrada",
          },
        },
      },
    },
  },

  components: {
    schemas: {
      CreditApplication: {
        type: "object",
        description:
          "Solicitud de crédito asociada a un socio del FondoSolidario",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          member_id: {
            type: "integer",
            example: 1,
            description:
              "Identificador del socio que realiza la solicitud",
          },
          reference_id: {
            type: "integer",
            nullable: true,
            example: 1001,
            description:
              "Referencia opcional asociada a la solicitud",
          },
          date: {
            type: "string",
            format: "date-time",
            example: "2026-10-01T10:30:00.000Z",
          },
          amount: {
            type: "number",
            format: "decimal",
            example: 5000000.0,
            description:
              "Monto solicitado para el crédito",
          },
          status: {
            type: "string",
            enum: [
              "pending",
              "approved",
              "rejected",
              "cancelled",
            ],
            example: "pending",
          },
          observations: {
            type: "string",
            nullable: true,
            example:
              "Solicitud de crédito para libre inversión",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },

      CreditApplicationCreate: {
        type: "object",
        required: [
          "member_id",
          "amount",
        ],
        properties: {
          member_id: {
            type: "integer",
            example: 1,
            description:
              "Identificador del socio solicitante",
          },
          reference_id: {
            type: "integer",
            nullable: true,
            example: 1001,
          },
          date: {
            type: "string",
            format: "date-time",
            example: "2026-10-01T10:30:00.000Z",
          },
          amount: {
            type: "number",
            format: "decimal",
            minimum: 0.01,
            example: 5000000.0,
          },
          status: {
            type: "string",
            enum: [
              "pending",
              "approved",
              "rejected",
              "cancelled",
            ],
            default: "pending",
          },
          observations: {
            type: "string",
            nullable: true,
            example:
              "Solicitud de crédito para educación",
          },
        },
      },

      CreditApplicationUpdate: {
        type: "object",
        required: [
          "member_id",
          "amount",
        ],
        properties: {
          member_id: {
            type: "integer",
            example: 1,
          },
          reference_id: {
            type: "integer",
            nullable: true,
            example: 1001,
          },
          date: {
            type: "string",
            format: "date-time",
          },
          amount: {
            type: "number",
            format: "decimal",
            minimum: 0.01,
            example: 7500000.0,
          },
          status: {
            type: "string",
            enum: [
              "pending",
              "approved",
              "rejected",
              "cancelled",
            ],
          },
          observations: {
            type: "string",
            nullable: true,
          },
        },
      },

      CreditApplicationPatch: {
        type: "object",
        properties: {
          member_id: {
            type: "integer",
            example: 1,
          },
          reference_id: {
            type: "integer",
            nullable: true,
            example: 1001,
          },
          date: {
            type: "string",
            format: "date-time",
          },
          amount: {
            type: "number",
            format: "decimal",
            minimum: 0.01,
            example: 6000000.0,
          },
          status: {
            type: "string",
            enum: [
              "pending",
              "approved",
              "rejected",
              "cancelled",
            ],
          },
          observations: {
            type: "string",
            nullable: true,
          },
        },
      },
    },
  },
};
EOF
```

![](images/clipboard-2714702612.png)

### HTTP Credit-applications get

``` bash
: > src/features/business/credit-applications/http/credit-applications.get.http
cat >> src/features/business/credit-applications/http/credit-applications.get.http << 'EOF'
### Feature CreditApplication — GET
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000

# @name getCreditApplications
GET {{baseUrl}}/api/credit-applications

###

# @name getCreditApplication
GET {{baseUrl}}/api/credit-applications/1
EOF
```

![](images/clipboard-3438928132.png)

### HTTP Credit-applications create

``` bash
: > src/features/business/credit-applications/http/credit-applications.create.http
cat >> src/features/business/credit-applications/http/credit-applications.create.http << 'EOF'
### Feature CreditApplication — CREATE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000

# @name createCreditApplication
POST {{baseUrl}}/api/credit-applications
Content-Type: application/json

{
  "member_id": 1,
  "reference_id": 1001,
  "date": "2026-10-01T10:30:00.000Z",
  "amount": 5000000,
  "status": "pending",
  "observations": "Solicitud de crédito para libre inversión"
}
EOF
```

![](images/clipboard-2748063171.png)

### HTTP Credit-applications update

``` bash
: > src/features/business/credit-applications/http/credit-applications.update.http
cat >> src/features/business/credit-applications/http/credit-applications.update.http << 'EOF'
### Feature CreditApplication — UPDATE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000

# @name updateCreditApplicationPut
PUT {{baseUrl}}/api/credit-applications/1
Content-Type: application/json

{
  "member_id": 1,
  "reference_id": 1001,
  "date": "2026-10-01T10:30:00.000Z",
  "amount": 7500000,
  "status": "pending",
  "observations": "Solicitud actualizada para libre inversión"
}

###

# @name updateCreditApplicationPatch
PATCH {{baseUrl}}/api/credit-applications/1
Content-Type: application/json

{
  "amount": 6000000,
  "observations": "Monto de solicitud actualizado"
}
EOF
```

![](images/clipboard-3338065763.png)

### HTTP Credit-applications delete

``` bash
: > src/features/business/credit-applications/http/credit-applications.delete.http
cat >> src/features/business/credit-applications/http/credit-applications.delete.http << 'EOF'
### Feature CreditApplication — DELETE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000

# @name deleteCreditApplicationPhysical
DELETE {{baseUrl}}/api/credit-applications/1

###

# @name deleteCreditApplicationLogical
PATCH {{baseUrl}}/api/credit-applications/1/deactivate
EOF
```

![](images/clipboard-473506427.png)

------------------------------------------------------------------------

## 13.2 Controller + routes

``` bash
: > src/features/business/credit-applications/credit-application.controller.ts
cat >> src/features/business/credit-applications/credit-application.controller.ts << 'EOF'
import { Request, Response } from "express";
import {
  CreditApplication,
  CreditApplicationI,
} from "./credit-application.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

export class CreditApplicationController {
  // ================== READ ==================

  public async getAll(req: Request, res: Response) {
    try {
      const credit_applications =
        await CreditApplication.findAll();

      res.status(200).json({ credit_applications });
    } catch (error) {
      res.status(500).json({
        error:
          "Error al obtener las solicitudes de crédito",
        detail: String(error),
      });
    }
  }

  public async getOne(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const credit_application =
        await CreditApplication.findByPk(id);

      if (!credit_application) {
        res.status(404).json({
          error: "Solicitud de crédito no encontrada",
        });
        return;
      }

      res.status(200).json({
        credit_application,
      });
    } catch (error) {
      res.status(500).json({
        error:
          "Error al obtener la solicitud de crédito",
        detail: String(error),
      });
    }
  }

  // ================== CREATE ==================

  public async create(req: Request, res: Response) {
    try {
      const body = req.body as CreditApplicationI;

      if (!body.member_id) {
        res.status(400).json({
          error: "member_id es obligatorio",
        });
        return;
      }

      if (!body.amount || Number(body.amount) <= 0) {
        res.status(400).json({
          error: "amount debe ser mayor que 0",
        });
        return;
      }

      const credit_application =
        await CreditApplication.create({
          member_id: body.member_id,
          reference_id: body.reference_id ?? null,
          date: body.date ?? new Date(),
          amount: body.amount,
          status: body.status ?? "pending",
          observations:
            body.observations ?? null,
        });

      res.status(201).json({
        credit_application,
      });
    } catch (error) {
      res.status(500).json({
        error:
          "Error al crear la solicitud de crédito",
        detail: String(error),
      });
    }
  }

  // ================== UPDATE ==================

  public async updatePut(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const credit_application =
        await CreditApplication.findByPk(id);

      if (!credit_application) {
        res.status(404).json({
          error: "Solicitud de crédito no encontrada",
        });
        return;
      }

      const body = req.body as CreditApplicationI;

      if (!body.member_id) {
        res.status(400).json({
          error: "member_id es obligatorio",
        });
        return;
      }

      if (!body.amount || Number(body.amount) <= 0) {
        res.status(400).json({
          error: "amount debe ser mayor que 0",
        });
        return;
      }

      await credit_application.update({
        member_id: body.member_id,
        reference_id:
          body.reference_id ?? null,
        date: body.date,
        amount: body.amount,
        status: body.status,
        observations:
          body.observations ?? null,
      });

      res.status(200).json({
        credit_application,
      });
    } catch (error) {
      res.status(500).json({
        error:
          "Error al actualizar la solicitud de crédito (PUT)",
        detail: String(error),
      });
    }
  }

  public async updatePatch(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const credit_application =
        await CreditApplication.findByPk(id);

      if (!credit_application) {
        res.status(404).json({
          error: "Solicitud de crédito no encontrada",
        });
        return;
      }

      const body =
        req.body as Partial<CreditApplicationI>;

      if (
        body.amount !== undefined &&
        Number(body.amount) <= 0
      ) {
        res.status(400).json({
          error: "amount debe ser mayor que 0",
        });
        return;
      }

      await credit_application.update({
        ...(body.member_id !== undefined && {
          member_id: body.member_id,
        }),

        ...(body.reference_id !== undefined && {
          reference_id: body.reference_id,
        }),

        ...(body.date !== undefined && {
          date: body.date,
        }),

        ...(body.amount !== undefined && {
          amount: body.amount,
        }),

        ...(body.status !== undefined && {
          status: body.status,
        }),

        ...(body.observations !== undefined && {
          observations: body.observations,
        }),
      });

      res.status(200).json({
        credit_application,
      });
    } catch (error) {
      res.status(500).json({
        error:
          "Error al actualizar la solicitud de crédito (PATCH)",
        detail: String(error),
      });
    }
  }

  // ================== DELETE ==================

  /**
   * Eliminación física de la solicitud de crédito.
   */
  public async deletePhysical(
    req: Request,
    res: Response
  ) {
    try {
      const id = paramId(req);

      const credit_application =
        await CreditApplication.findByPk(id);

      if (!credit_application) {
        res.status(404).json({
          error: "Solicitud de crédito no encontrada",
        });
        return;
      }

      await credit_application.destroy();

      res.status(200).json({
        message:
          "Solicitud de crédito eliminada correctamente",
        id,
      });
    } catch (error) {
      res.status(500).json({
        error:
          "Error al eliminar la solicitud de crédito",
        detail: String(error),
      });
    }
  }

  /**
   * Eliminación lógica → status = cancelled.
   */
  public async deleteLogical(
    req: Request,
    res: Response
  ) {
    try {
      const id = paramId(req);

      const credit_application =
        await CreditApplication.findByPk(id);

      if (!credit_application) {
        res.status(404).json({
          error: "Solicitud de crédito no encontrada",
        });
        return;
      }

      await credit_application.update({
        status: "cancelled",
      });

      res.status(200).json({
        message:
          "Solicitud de crédito cancelada correctamente",
        credit_application,
      });
    } catch (error) {
      res.status(500).json({
        error:
          "Error al cancelar la solicitud de crédito",
        detail: String(error),
      });
    }
  }
}
EOF
```

![](images/clipboard-2113124710.png)

``` bash
: > src/features/business/credit-applications/credit-application.routes.ts
cat >> src/features/business/credit-applications/credit-application.routes.ts << 'EOF'
import { Application } from "express";
import { CreditApplicationController } from "./credit-application.controller";

export class CreditApplicationRoutes {
  public creditApplicationController: CreditApplicationController =
    new CreditApplicationController();

  public routes(app: Application): void {
    // ================== RUTAS SIN AUTENTICACIÓN / SIN MIDDLEWARE JWT ==================

    // getAll
    app
      .route("/api/credit-applications")
      .get(
        this.creditApplicationController.getAll.bind(
          this.creditApplicationController
        )
      );

    // getOne
    app
      .route("/api/credit-applications/:id")
      .get(
        this.creditApplicationController.getOne.bind(
          this.creditApplicationController
        )
      );

    // create
    app
      .route("/api/credit-applications")
      .post(
        this.creditApplicationController.create.bind(
          this.creditApplicationController
        )
      );

    // update (PUT / PATCH)
    app
      .route("/api/credit-applications/:id")
      .put(
        this.creditApplicationController.updatePut.bind(
          this.creditApplicationController
        )
      )
      .patch(
        this.creditApplicationController.updatePatch.bind(
          this.creditApplicationController
        )
      );

    // delete físico
    app
      .route("/api/credit-applications/:id")
      .delete(
        this.creditApplicationController.deletePhysical.bind(
          this.creditApplicationController
        )
      );

    // delete lógico
    app
      .route("/api/credit-applications/:id/deactivate")
      .patch(
        this.creditApplicationController.deleteLogical.bind(
          this.creditApplicationController
        )
      );
  }
}
EOF
```

![](images/clipboard-687736044.png)

------------------------------------------------------------------------

## 13.3 HTTP

``` bash
: > src/features/business/credit-applications/http/credit-applications.get.http
cat >> src/features/business/credit-applications/http/credit-applications.get.http << 'EOF'
### Feature CreditApplication — GET ALL / GET ONE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name getAllCreditApplications
GET {{baseUrl}}/api/credit-applications

###

# @name getOneCreditApplication
GET {{baseUrl}}/api/credit-applications/{{id}}
EOF
```

![](images/clipboard-399708549.png)

``` bash
: > src/features/business/credit-applications/http/credit-applications.create.http
cat >> src/features/business/credit-applications/http/credit-applications.create.http << 'EOF'
### Feature CreditApplication — CREATE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000

# @name createCreditApplication
POST {{baseUrl}}/api/credit-applications
Content-Type: application/json

{
  "member_id": 1,
  "reference_id": 1001,
  "date": "2026-10-01T10:30:00.000Z",
  "amount": 5000000,
  "status": "pending",
  "observations": "Solicitud de crédito para libre inversión"
}
EOF
```

![](images/clipboard-3196163711.png)

``` bash
: > src/features/business/credit-applications/http/credit-applications.update.http
cat >> src/features/business/credit-applications/http/credit-applications.update.http << 'EOF'
### Feature CreditApplication — UPDATE (PUT) / UPDATE (PATCH)
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name updateCreditApplicationPut
PUT {{baseUrl}}/api/credit-applications/{{id}}
Content-Type: application/json

{
  "member_id": 1,
  "reference_id": 1001,
  "date": "2026-10-01T12:00:00.000Z",
  "amount": 7500000,
  "status": "pending",
  "observations": "Solicitud actualizada"
}

###

# @name updateCreditApplicationPatch
PATCH {{baseUrl}}/api/credit-applications/{{id}}
Content-Type: application/json

{
  "amount": 6000000,
  "observations": "Monto actualizado de la solicitud"
}
EOF
```

![](images/clipboard-1832005318.png)

``` bash
: > src/features/business/credit-applications/http/credit-applications.delete.http
cat >> src/features/business/credit-applications/http/credit-applications.delete.http << 'EOF'
### Feature CreditApplication — DELETE físico / DELETE lógico (status = cancelled)
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name deleteCreditApplicationPhysical
DELETE {{baseUrl}}/api/credit-applications/{{id}}

###

# @name deleteCreditApplicationLogical
PATCH {{baseUrl}}/api/credit-applications/{{id}}/deactivate
EOF
```

![](images/clipboard-73231337.png)

------------------------------------------------------------------------

## 13.4 Cableado

**PARCHE** — `src/routes/index.ts`: import + undefined.

**PARCHE** — `src/config/index.ts`:

-   **Debajo de** import product.model, **añadir**:

``` ts
import { CreditApplicationRoutes } from "../features/business/credit-applications/credit-application.routes";
```

-   **Dentro de** `routes()`, **añadir**
    `this.routePrv.saleRoutes.routes(this.app);`

    ![](images/clipboard-1419431468.png)

------------------------------------------------------------------------

## 13.5 Relación Member / CreditApplication (**obligatorio**)

> Norma FK: `member_id` (singular de la tabla referenciada + `_id`).

``` bash
: > src/features/business/credit-applications/credit-application.associations.ts
cat >> src/features/business/credit-applications/credit-application.associations.ts << 'EOF'
import { CreditApplication } from "./credit-application.model";
import { Member } from "../members/members.model";

Member.hasMany(CreditApplication, {
  foreignKey: "member_id",
  as: "creditApplications",
});

CreditApplication.belongsTo(Member, {
  foreignKey: "member_id",
  as: "member",
});
EOF
```

![](images/clipboard-2115594720.png)

### PARCHE — `src/config/index.ts`

```
import "../features/business/movements/movement.associations";Relaciones registradas:
```

-   `Sale.belongsTo(Client)` / `Client.hasMany(Sale)` — en
    `sale.associations.ts`
-   `ProductSale.belongsTo(Sale|Product)` / `Sale.hasMany(items)` /
    `Product.hasMany(sale_items)` — en `product-sale.associations.ts`

**PARCHE** — también importar side-effect:

``` ts
import "../features/business/movements/movement.associations";
```

![](images/clipboard-2875322318.png)

### Verificación venta

``` bash
curl -s http://localhost:4000/api/credit-applications
curl -s -X POST http://localhost:4000/api/credit-applications \
  -H 'Content-Type: application/json' \
  -d '{
    "member_id": 1,
    "reference_id": 1001,
    "amount": 5000000,
    "status": "pending",
    "observations": "Solicitud de crédito para libre inversión"
  }'
  curl -s http://localhost:4000/api/credit-applications
```

![](images/clipboard-287909805.png)

------------------------------------------------------------------------

## 13.6 Seeder + Swagger Sale

``` bash
: > src/features/business/credit-applications/credit-application.seeder.ts
cat >> src/features/business/credit-applications/credit-application.seeder.ts << 'EOF'
import { faker } from "@faker-js/faker";
import { CreditApplication } from "./credit-application.model";
import { Member } from "../members/members.model";

/**
 * Seeder del feature CreditApplication.
 * Idempotente: si ya hay solicitudes de crédito, no inserta.
 */
export async function seedCreditApplications(
  count: number
): Promise<number> {
  if (count <= 0) {
    console.log("⏭️  credit_applications: count=0, se omite");
    return 0;
  }

  const existing = await CreditApplication.count();

  if (existing > 0) {
    console.log(
      `⏭️  credit_applications: ya hay ${existing} registro(s), se omite seeder`
    );
    return 0;
  }

  const members = await Member.findAll({
    where: {
      isActive: true,
    },
  });

  if (members.length === 0) {
    console.log(
      "⏭️  credit_applications: no hay socios activos, se omite seeder"
    );
    return 0;
  }

  const rows = Array.from({ length: count }, () => {
    const member =
      members[Math.floor(Math.random() * members.length)];

    return {
      member_id: member.id,
      reference_id: null,
      date: faker.date.recent({ days: 30 }),
      amount: Number(
        faker.finance.amount({
          min: 500000,
          max: 10000000,
          dec: 2,
        })
      ),
      status: faker.helpers.arrayElement([
        "pending",
        "approved",
        "rejected",
      ]) as "pending" | "approved" | "rejected",
      observations: faker.helpers.arrayElement([
        "Solicitud de crédito personal",
        "Solicitud de crédito para libre inversión",
        "Solicitud de crédito para educación",
        "Solicitud de crédito para vivienda",
        "Solicitud de crédito para emprendimiento",
      ]),
    };
  });

  await CreditApplication.bulkCreate(rows);

  console.log(
    `✅ credit_applications: insertados ${count} registro(s) falsos`
  );

  return count;
}
EOF
```

![](images/clipboard-1868396773.png)

``` bash
 : > src/features/business/credit-applications/credit-application.swagger.ts
cat >> src/features/business/credit-applications/credit-application.swagger.ts << 'EOF'
/**
 * Documentación OpenAPI del feature CreditApplication.
 * Se agrega desde `src/swagger` (registry externo), no se monta aquí.
 *
 * Leyenda: endpoints documentados como SIN AUTH
 * (sin middleware JWT).
 */

export const creditApplicationSwagger = {
  tags: [
    {
      name: "CreditApplications",
      description:
        "CRUD de solicitudes de crédito — **SIN AUTH** (sin middleware JWT)",
    },
  ],

  paths: {
    "/api/credit-applications": {
      get: {
        tags: ["CreditApplications"],
        summary: "Listar solicitudes de crédito",
        description:
          "SIN AUTH — retorna las solicitudes de crédito registradas",
        security: [],
        responses: {
          "200": {
            description: "Lista de solicitudes de crédito",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    credit_applications: {
                      type: "array",
                      items: {
                        $ref:
                          "#/components/schemas/CreditApplication",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      post: {
        tags: ["CreditApplications"],
        summary: "Crear solicitud de crédito",
        description:
          "SIN AUTH — registra una nueva solicitud de crédito asociada a un socio",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref:
                  "#/components/schemas/CreditApplicationCreate",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Solicitud de crédito creada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    credit_application: {
                      $ref:
                        "#/components/schemas/CreditApplication",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description:
              "Datos inválidos o campos obligatorios faltantes",
          },
        },
      },
    },

    "/api/credit-applications/{id}": {
      get: {
        tags: ["CreditApplications"],
        summary: "Obtener solicitud de crédito por id",
        description:
          "SIN AUTH — retorna una solicitud de crédito específica",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "Solicitud de crédito encontrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    credit_application: {
                      $ref:
                        "#/components/schemas/CreditApplication",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description:
              "Solicitud de crédito no encontrada",
          },
        },
      },

      put: {
        tags: ["CreditApplications"],
        summary: "Actualizar solicitud de crédito (PUT)",
        description:
          "SIN AUTH — actualización completa de la solicitud de crédito",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref:
                  "#/components/schemas/CreditApplicationUpdate",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Solicitud de crédito actualizada",
          },
          "404": {
            description:
              "Solicitud de crédito no encontrada",
          },
        },
      },

      patch: {
        tags: ["CreditApplications"],
        summary: "Actualizar solicitud de crédito (PATCH)",
        description:
          "SIN AUTH — actualización parcial de la solicitud de crédito",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref:
                  "#/components/schemas/CreditApplicationPatch",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Solicitud de crédito actualizada",
          },
          "404": {
            description:
              "Solicitud de crédito no encontrada",
          },
        },
      },

      delete: {
        tags: ["CreditApplications"],
        summary: "Eliminar solicitud de crédito (físico)",
        description:
          "SIN AUTH — elimina físicamente la solicitud de crédito",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description:
              "Solicitud de crédito eliminada",
          },
          "404": {
            description:
              "Solicitud de crédito no encontrada",
          },
        },
      },
    },

    "/api/credit-applications/{id}/deactivate": {
      patch: {
        tags: ["CreditApplications"],
        summary: "Cancelar solicitud de crédito",
        description:
          "SIN AUTH — cambia el estado de la solicitud a cancelled",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description:
              "Solicitud de crédito cancelada",
          },
          "404": {
            description:
              "Solicitud de crédito no encontrada",
          },
        },
      },
    },
  },

  components: {
    schemas: {
      CreditApplication: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          member_id: {
            type: "integer",
            example: 1,
          },
          reference_id: {
            type: "integer",
            nullable: true,
            example: 1001,
          },
          date: {
            type: "string",
            format: "date-time",
          },
          amount: {
            type: "number",
            example: 5000000,
          },
          status: {
            type: "string",
            enum: [
              "pending",
              "approved",
              "rejected",
              "cancelled",
            ],
            example: "pending",
          },
          observations: {
            type: "string",
            nullable: true,
            example:
              "Solicitud de crédito para libre inversión",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },

      CreditApplicationCreate: {
        type: "object",
        required: [
          "member_id",
          "amount",
        ],
        properties: {
          member_id: {
            type: "integer",
            example: 1,
          },
          reference_id: {
            type: "integer",
            nullable: true,
            example: 1001,
          },
          date: {
            type: "string",
            format: "date-time",
          },
          amount: {
            type: "number",
            minimum: 0.01,
            example: 5000000,
          },
          status: {
            type: "string",
            enum: [
              "pending",
              "approved",
              "rejected",
              "cancelled",
            ],
            default: "pending",
          },
          observations: {
            type: "string",
            nullable: true,
          },
        },
      },

      CreditApplicationUpdate: {
        type: "object",
        required: [
          "member_id",
          "amount",
        ],
        properties: {
          member_id: {
            type: "integer",
            example: 1,
          },
          reference_id: {
            type: "integer",
            nullable: true,
          },
          date: {
            type: "string",
            format: "date-time",
          },
          amount: {
            type: "number",
            minimum: 0.01,
          },
          status: {
            type: "string",
            enum: [
              "pending",
              "approved",
              "rejected",
              "cancelled",
            ],
          },
          observations: {
            type: "string",
            nullable: true,
          },
        },
      },

      CreditApplicationPatch: {
        type: "object",
        properties: {
          member_id: {
            type: "integer",
          },
          reference_id: {
            type: "integer",
            nullable: true,
          },
          date: {
            type: "string",
            format: "date-time",
          },
          amount: {
            type: "number",
            minimum: 0.01,
          },
          status: {
            type: "string",
            enum: [
              "pending",
              "approved",
              "rejected",
              "cancelled",
            ],
          },
          observations: {
            type: "string",
            nullable: true,
          },
        },
      },
    },
  },
};
EOF
```

![](images/clipboard-1862725212.png)

------------------------------------------------------------------------

## 13.7 Estado final de agregadores (reemplazar / alinear)

Tras ISS-06…08, estos archivos quedan así (podés **reemplazar** el
contenido completo con `cat >>` si preferís evitar parches acumulados):

### `src/routes/index.ts`

``` bash
: > src/routes/index.ts
cat >> src/routes/index.ts << 'EOF'
import { Application } from "express";

import { MembersRoutes } from "../features/business/members/members.routes";
import { AccountRoutes } from "../features/business/account/account.routes";
import { MovementRoutes } from "../features/business/movements/movement.routes";
import { CreditApplicationRoutes } from "../features/business/credit-applications/credit-application.routes";

export class Routes {
  public membersRoutes: MembersRoutes =
    new MembersRoutes();

  public accountRoutes: AccountRoutes =
    new AccountRoutes();

  public movementRoutes: MovementRoutes =
    new MovementRoutes();

  public creditApplicationRoutes: CreditApplicationRoutes =
    new CreditApplicationRoutes();

  public routes(app: Application): void {
    // ================== RUTAS SIN AUTENTICACIÓN ==================

    this.membersRoutes.routes(app);
    this.accountRoutes.routes(app);
    this.movementRoutes.routes(app);
    this.creditApplicationRoutes.routes(app);
  }
}
EOF
```

![](images/clipboard-3871828425.png)

### `src/database/seeders/counts.ts`

``` bash
: > src/database/seeders/counts.ts
cat >> src/database/seeders/counts.ts << 'EOF'
/**
 * Cantidad de registros por tabla (snake_case = nombre de tabla BD).
 *
 * Prioridad:
 * CLI (--members=N) > env (SEED_MEMBERS) >
 * default de este archivo.
 *
 * Cuando se agreguen nuevas features, se debe sumar
 * aquí la clave correspondiente y leerla en el runner.
 */
export type SeedCounts = {
  members: number;
  accounts: number;
  movements: number;
  credit_applications: number;
  // credits?: number;
  // installments?: number;
  // installment_payments?: number;
  // rates?: number;
};

export const DEFAULT_SEED_COUNTS: SeedCounts = {
  members: 10,
  accounts: 10,
  movements: 15,
  credit_applications: 10,
};

export function resolveSeedCounts(
  argv: string[] = process.argv.slice(2)
): SeedCounts {
  const counts: SeedCounts = {
    ...DEFAULT_SEED_COUNTS,
  };

  const envMap: Array<
    [keyof SeedCounts, string | undefined]
  > = [
    ["members", process.env.SEED_MEMBERS],
    ["accounts", process.env.SEED_ACCOUNTS],
    ["movements", process.env.SEED_MOVEMENTS],
    [
      "credit_applications",
      process.env.SEED_CREDIT_APPLICATIONS,
    ],
  ];

  for (const [key, value] of envMap) {
    if (value !== undefined && value !== "") {
      counts[key] = Number(value);
    }
  }

  for (const arg of argv) {
    const m = arg.match(/^--([a-zA-Z_]+)=(\d+)$/);

    if (!m) continue;

    const key = m[1] as keyof SeedCounts;
    const value = Number(m[2]);

    if (key in counts) {
      counts[key] = value;
    }
  }

  return counts;
}
EOF
```

![](images/clipboard-1539883999.png)

### `src/database/seeders/index.ts`

``` bash
: > src/database/seeders/index.ts
cat >> src/database/seeders/index.ts << 'EOF'
import dotenv from "dotenv";
import { sequelize, testConnection } from "../db";

import "../../features/business/members/members.model";
import "../../features/business/account/account.model";
import "../../features/business/movements/movement.model";
import "../../features/business/credit-applications/credit-application.model";

import "../../features/business/account/account.associations";
import "../../features/business/movements/movement.associations";
import "../../features/business/credit-applications/credit-application.associations";

import { seedMembers } from "../../features/business/members/members.seeder";
import { seedAccounts } from "../../features/business/account/account.seeder";
import { seedMovements } from "../../features/business/movements/movement.seeder";
import { seedCreditApplications } from "../../features/business/credit-applications/credit-application.seeder";

import { resolveSeedCounts } from "./counts";

dotenv.config();

/**
 * SeedersRunner — ejecuta los seeders de las tablas del sistema.
 *
 * Tablas actuales (orden padres → hijos):
 *   members → accounts → movements → credit_applications
 *
 * Ejecutar seeders:
 *   npm run db:seed
 *
 * Variar cantidades:
 *   npm run db:seed -- --members=20 --accounts=10 --movements=15 --credit_applications=10
 *
 * También se pueden utilizar variables de entorno:
 *   SEED_MEMBERS=10
 *   SEED_ACCOUNTS=10
 *   SEED_MOVEMENTS=15
 *   SEED_CREDIT_APPLICATIONS=10
 *
 * Cada seeder es idempotente:
 * si ya existen registros, omite la inserción.
 */
export async function runAllSeeders(): Promise<void> {
  const counts = resolveSeedCounts();

  console.log("🌱 Iniciando SeedersRunner...");
  console.log("📊 Conteos:", counts);

  const ok = await testConnection();

  if (!ok) {
    throw new Error(
      "No hay conexión a la base de datos"
    );
  }

  const isMysql =
    sequelize.getDialect() === "mysql" ||
    sequelize.getDialect() === "mariadb";

  if (isMysql) {
    await sequelize.query(
      "SET FOREIGN_KEY_CHECKS = 0"
    );
  }

  try {
    await sequelize.sync({
      force: false,
      alter: true,
    });
  } finally {
    if (isMysql) {
      await sequelize.query(
        "SET FOREIGN_KEY_CHECKS = 1"
      );
    }
  }

  // Orden: business (padres → hijos)
  await seedMembers(counts.members);
  await seedAccounts(counts.accounts);
  await seedMovements(counts.movements);
  await seedCreditApplications(
    counts.credit_applications
  );

  console.log(
    "🌱 SeedersRunner finalizado"
  );
}

if (require.main === module) {
  runAllSeeders()
    .then(async () => {
      await sequelize.close();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error(
        "❌ Error en seeders:",
        err
      );

      await sequelize.close();
      process.exit(1);
    });
}
EOF
```

![](images/clipboard-3518304054.png)

### `src/swagger/index.ts`

``` bash
: > src/swagger/index.ts
cat >> src/swagger/index.ts << 'EOF'
import { Application } from "express";
import swaggerUi from "swagger-ui-express";

import { membersSwagger } from "../features/business/members/members.swagger";
import { accountSwagger } from "../features/business/account/account.swagger";
import { movementSwagger } from "../features/business/movements/movement.swagger";
import { creditApplicationSwagger } from "../features/business/credit-applications/credit-application.swagger";

export type FeatureSwaggerModule = {
  tags: unknown[];
  paths: Record<string, unknown>;
  components?: {
    schemas?: Record<string, unknown>;
  };
};

/**
 * Registry externo: importa la documentación OpenAPI
 * de cada feature.
 */
const featureSwaggerModules: FeatureSwaggerModule[] = [
  membersSwagger,
  accountSwagger,
  movementSwagger,
  creditApplicationSwagger,
];

export function buildOpenApiDocument() {
  const tags: unknown[] = [];
  const paths: Record<string, unknown> = {};
  const schemas: Record<string, unknown> = {};

  for (const mod of featureSwaggerModules) {
    tags.push(...mod.tags);

    Object.assign(paths, mod.paths);

    if (mod.components?.schemas) {
      Object.assign(
        schemas,
        mod.components.schemas
      );
    }
  }

  return {
    openapi: "3.0.3",

    info: {
      title: "Solia Express API",
      version: "1.0.0",
      description:
        "API FondoSolidario (Express + Sequelize). Los endpoints de business están documentados como **SIN AUTH**.",
    },

    servers: [
      {
        url: `http://localhost:${process.env.PORT || 4000}`,
        description: "Local",
      },
    ],

    tags,

    paths,

    components: {
      schemas,
    },
  };
}

/**
 * Monta Swagger UI y el JSON OpenAPI.
 */
export function setupSwagger(
  app: Application
): void {
  const document =
    buildOpenApiDocument();

  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(document)
  );

  app.get(
    "/api/docs.json",
    (_req, res) => {
      res.json(document);
    }
  );

  console.log(
    "📘 Swagger UI: /api/docs | OpenAPI JSON: /api/docs.json"
  );
}
EOF
```

![](images/clipboard-3268823609.png)

### Estado final `src/config/index.ts` (consolida ISS-01…08)

``` bash
: > src/config/index.ts
cat >> src/config/index.ts << 'EOF'
import dotenv from "dotenv";
import express, { Application } from "express";
import morgan from "morgan";
var cors = require("cors");

import {
  sequelize,
  getDatabaseInfo,
  testConnection,
} from "../database/db";

import "../features/business/members/members.model";
import "../features/business/account/account.model";
import "../features/business/movements/movement.model";
import "../features/business/credit-applications/credit-application.model";

import "../features/business/account/account.associations";
import "../features/business/movements/movement.associations";
import "../features/business/credit-applications/credit-application.associations";

import { Routes } from "../routes/index";
import { setupSwagger } from "../swagger/index";

dotenv.config();

export class App {
  public app: Application;
  public routePrv: Routes = new Routes();

  constructor(
    private port?: number | string
  ) {
    this.app = express();

    this.settings();
    this.middlewares();
    this.routes();
    this.docs();
    this.dbConnection();
  }

  private settings(): void {
    this.app.set(
      "port",
      this.port ||
        process.env.PORT ||
        4000
    );
  }

  private middlewares(): void {
    this.app.use(morgan("dev"));
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(
      express.urlencoded({
        extended: false,
      })
    );
  }

  private routes(): void {
    this.routePrv.routes(this.app);
  }

  private docs(): void {
    setupSwagger(this.app);
  }

  private async dbConnection(): Promise<void> {
    try {
      const dbInfo =
        getDatabaseInfo();

      console.log(
        `🔗 Intentando conectar a: ${dbInfo.engine.toUpperCase()}`
      );

      const isConnected =
        await testConnection();

      if (!isConnected) {
        throw new Error(
          `No se pudo conectar a la base de datos ${dbInfo.engine.toUpperCase()}`
        );
      }

      const force =
        process.env.DB_SYNC_FORCE ===
        "true";

      const isMysql =
        sequelize.getDialect() === "mysql" ||
        sequelize.getDialect() === "mariadb";

      if (isMysql) {
        await sequelize.query(
          "SET FOREIGN_KEY_CHECKS = 0"
        );
      }

      try {
        await sequelize.sync({
          force,
          alter: !force,
        });
      } finally {
        if (isMysql) {
          await sequelize.query(
            "SET FOREIGN_KEY_CHECKS = 1"
          );
        }
      }

      console.log(
        force
          ? "📦 Base de datos recreada (DB_SYNC_FORCE=true)"
          : "📦 Base de datos sincronizada exitosamente"
      );
    } catch (error) {
      console.error(
        "❌ Error al conectar con la base de datos:",
        error
      );

      process.exit(1);
    }
  }

  async listen() {
    await this.app.listen(
      this.app.get("port")
    );

    console.log(
      `🚀 Servidor ejecutándose en puerto ${this.app.get("port")}`
    );
  }
}
EOF
```

![](images/clipboard-2280814641.png)

**PARCHE** — `src/config/index.ts`: al cerrar ISS-08 el bloque de
imports de modelos/asociaciones y `routes()` debe quedar como en el repo
(models client→product-type→product→sale→product-sale; associations
product + sale + product-sale; `routes()` registra las **5** features
business).

### Verificación ISS-08 / business completo

``` bash
npx tsc --noEmit
npm run db:seed
curl -s http://localhost:4000/api/members | head
curl -s http://localhost:4000/api/accounts | head
curl -s http://localhost:4000/api/movements | head
curl -s http://localhost:4000/api/credit-applications | head
```

![](images/clipboard-3915635276.png)

### Cierre del ISS

``` bash
npm run dev
```

> ![](images/clipboard-312810124.png)
>
> ![](images/clipboard-999372833.png)
>
> Swagger: `http://localhost:4000/api/docs`. El servidor debe arrancar
> sin error.
> ------------------------------------------------------------------------

# 14. ISS-09 — Feature Credit (créditos)

**Objetivo:** CRUD + seeder + Swagger de Credit.\
**Bloqueado por:** ISS-09.\
**API:** `/api/credits` — **SIN AUTH**.\
**Patrón:** mismo que las features anteriores de FondoSolidario.

### Criterios de aceptación (ISS-09)

-   [x] **11.1** Modelo `credit.model.ts` (`status` +
    `timestamps: true`)
-   [x] **11.2** Controller + routes en este orden: getAll, getOne,
    create, update PUT/PATCH, delete físico y lógico
-   [x] **11.3** Carpeta `http/` en el mismo orden: get, create, update,
    delete
-   [x] **11.4** Cableado en `routes/index.ts` + `config` (import
    model + route)
-   [x] **11.5** Seeder + registro en SeedersRunner / counts
-   [x] **11.6** Swagger + registro en `src/swagger`

``` bash
mkdir -p src/features/business/credits/http
```

------------------------------------------------------------------------

## 14.1 Modelo Credit

``` bash
: > src/features/business/credits/credit.model.ts
cat >> src/features/business/credits/credit.model.ts << 'EOF'
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

export interface CreditI {
  id?: number;
  credit_application_id: number;
  rate_id: number;
  date: Date | string;
  approved_amount: number;
  term: number;
  interest_rate: number;
  status: "active" | "paid" | "cancelled";
  observations?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Credit extends Model {
  public id!: number;
  public credit_application_id!: number;
  public rate_id!: number;
  public date!: Date;
  public approved_amount!: number;
  public term!: number;
  public interest_rate!: number;
  public status!: "active" | "paid" | "cancelled";
  public observations!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Credit.init(
  {
    credit_application_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rate_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    approved_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    term: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    interest_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "active",
        "paid",
        "cancelled"
      ),
      defaultValue: "active",
      allowNull: false,
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Credit",
    tableName: "credits",
    timestamps: true,
  }
);
EOF
```

![](images/clipboard-3961411225.png)

------------------------------------------------------------------------

## 14.2 Controller + routes (CRUD completo)

``` bash
: > src/features/business/credits/credit.controller.ts
cat >> src/features/business/credits/credit.controller.ts << 'EOF'
import { Request, Response } from "express";
import { Credit, CreditI } from "./credit.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

export class CreditController {
  // ================== READ ==================

  public async getAll(req: Request, res: Response) {
    try {
      const credits = await Credit.findAll();

      res.status(200).json({ credits });
    } catch (error) {
      res.status(500).json({
        error: "Error al obtener los créditos",
        detail: String(error),
      });
    }
  }

  public async getOne(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const credit = await Credit.findByPk(id);

      if (!credit) {
        res.status(404).json({
          error: "Crédito no encontrado",
        });
        return;
      }

      res.status(200).json({
        credit,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error al obtener el crédito",
        detail: String(error),
      });
    }
  }

  // ================== CREATE ==================

  public async create(req: Request, res: Response) {
    try {
      const body = req.body as CreditI;

      if (!body.credit_application_id) {
        res.status(400).json({
          error: "credit_application_id es obligatorio",
        });
        return;
      }

      if (!body.rate_id) {
        res.status(400).json({
          error: "rate_id es obligatorio",
        });
        return;
      }

      if (
        body.approved_amount === undefined ||
        Number(body.approved_amount) <= 0
      ) {
        res.status(400).json({
          error: "approved_amount debe ser mayor que 0",
        });
        return;
      }

      if (!body.term || Number(body.term) <= 0) {
        res.status(400).json({
          error: "term debe ser mayor que 0",
        });
        return;
      }

      if (
        body.interest_rate === undefined ||
        Number(body.interest_rate) < 0
      ) {
        res.status(400).json({
          error: "interest_rate no puede ser negativo",
        });
        return;
      }

      const credit = await Credit.create({
        credit_application_id: body.credit_application_id,
        rate_id: body.rate_id,
        date: body.date ?? new Date(),
        approved_amount: body.approved_amount,
        term: body.term,
        interest_rate: body.interest_rate,
        status: body.status ?? "active",
        observations: body.observations ?? null,
      });

      res.status(201).json({
        credit,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error al crear el crédito",
        detail: String(error),
      });
    }
  }

  // ================== UPDATE ==================

  public async updatePut(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const credit = await Credit.findByPk(id);

      if (!credit) {
        res.status(404).json({
          error: "Crédito no encontrado",
        });
        return;
      }

      const body = req.body as CreditI;

      if (!body.credit_application_id) {
        res.status(400).json({
          error: "credit_application_id es obligatorio",
        });
        return;
      }

      if (!body.rate_id) {
        res.status(400).json({
          error: "rate_id es obligatorio",
        });
        return;
      }

      if (
        body.approved_amount === undefined ||
        Number(body.approved_amount) <= 0
      ) {
        res.status(400).json({
          error: "approved_amount debe ser mayor que 0",
        });
        return;
      }

      if (!body.term || Number(body.term) <= 0) {
        res.status(400).json({
          error: "term debe ser mayor que 0",
        });
        return;
      }

      if (
        body.interest_rate === undefined ||
        Number(body.interest_rate) < 0
      ) {
        res.status(400).json({
          error: "interest_rate no puede ser negativo",
        });
        return;
      }

      await credit.update({
        credit_application_id: body.credit_application_id,
        rate_id: body.rate_id,
        date: body.date,
        approved_amount: body.approved_amount,
        term: body.term,
        interest_rate: body.interest_rate,
        status: body.status,
        observations: body.observations ?? null,
      });

      res.status(200).json({
        credit,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error al actualizar el crédito (PUT)",
        detail: String(error),
      });
    }
  }

  public async updatePatch(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const credit = await Credit.findByPk(id);

      if (!credit) {
        res.status(404).json({
          error: "Crédito no encontrado",
        });
        return;
      }

      const body = req.body as Partial<CreditI>;

      if (
        body.approved_amount !== undefined &&
        Number(body.approved_amount) <= 0
      ) {
        res.status(400).json({
          error: "approved_amount debe ser mayor que 0",
        });
        return;
      }

      if (
        body.term !== undefined &&
        Number(body.term) <= 0
      ) {
        res.status(400).json({
          error: "term debe ser mayor que 0",
        });
        return;
      }

      if (
        body.interest_rate !== undefined &&
        Number(body.interest_rate) < 0
      ) {
        res.status(400).json({
          error: "interest_rate no puede ser negativo",
        });
        return;
      }

      await credit.update({
        ...(body.credit_application_id !== undefined && {
          credit_application_id:
            body.credit_application_id,
        }),
        ...(body.rate_id !== undefined && {
          rate_id: body.rate_id,
        }),
        ...(body.date !== undefined && {
          date: body.date,
        }),
        ...(body.approved_amount !== undefined && {
          approved_amount: body.approved_amount,
        }),
        ...(body.term !== undefined && {
          term: body.term,
        }),
        ...(body.interest_rate !== undefined && {
          interest_rate: body.interest_rate,
        }),
        ...(body.status !== undefined && {
          status: body.status,
        }),
        ...(body.observations !== undefined && {
          observations: body.observations,
        }),
      });

      res.status(200).json({
        credit,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error al actualizar el crédito (PATCH)",
        detail: String(error),
      });
    }
  }

  // ================== DELETE ==================

  /** Eliminación física */
  public async deletePhysical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const credit = await Credit.findByPk(id);

      if (!credit) {
        res.status(404).json({
          error: "Crédito no encontrado",
        });
        return;
      }

      await credit.destroy();

      res.status(200).json({
        message: "Crédito eliminado correctamente",
        id,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error al eliminar el crédito",
        detail: String(error),
      });
    }
  }

  /** Eliminación lógica → status = cancelled */
  public async deleteLogical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const credit = await Credit.findByPk(id);

      if (!credit) {
        res.status(404).json({
          error: "Crédito no encontrado",
        });
        return;
      }

      await credit.update({
        status: "cancelled",
      });

      res.status(200).json({
        message: "Crédito cancelado correctamente",
        credit,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error al cancelar el crédito",
        detail: String(error),
      });
    }
  }
}
EOF
```

![](images/clipboard-1387623764.png)

``` bash
: > src/features/business/credits/credit.routes.ts
cat >> src/features/business/credits/credit.routes.ts << 'EOF'
import { Application } from "express";
import { CreditController } from "./credit.controller";

export class CreditRoutes {
  public creditController: CreditController =
    new CreditController();

  public routes(app: Application): void {
    // ================== RUTAS SIN AUTENTICACIÓN / SIN MIDDLEWARE JWT ==================

    // getAll
    app
      .route("/api/credits")
      .get(
        this.creditController.getAll.bind(
          this.creditController
        )
      );

    // getOne
    app
      .route("/api/credits/:id")
      .get(
        this.creditController.getOne.bind(
          this.creditController
        )
      );

    // create
    app
      .route("/api/credits")
      .post(
        this.creditController.create.bind(
          this.creditController
        )
      );

    // update (PUT / PATCH)
    app
      .route("/api/credits/:id")
      .put(
        this.creditController.updatePut.bind(
          this.creditController
        )
      )
      .patch(
        this.creditController.updatePatch.bind(
          this.creditController
        )
      );

    // delete físico
    app
      .route("/api/credits/:id")
      .delete(
        this.creditController.deletePhysical.bind(
          this.creditController
        )
      );

    // delete lógico
    app
      .route("/api/credits/:id/deactivate")
      .patch(
        this.creditController.deleteLogical.bind(
          this.creditController
        )
      );
  }
}
EOF
```

![](images/clipboard-3882762000.png)

------------------------------------------------------------------------

## 14.3 HTTP (REST Credit)

``` bash
: > src/features/business/credits/http/credits.get.http
cat >> src/features/business/credits/http/credits.get.http << 'EOF'
### Feature Credit — GET ALL / GET ONE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name getAllCredits
GET {{baseUrl}}/api/credits

###

# @name getOneCredit
GET {{baseUrl}}/api/credits/{{id}}
EOF
```

![](images/clipboard-2785330478.png)

``` bash
: > src/features/business/credits/http/credits.create.http
cat >> src/features/business/credits/http/credits.create.http << 'EOF'
### Feature Credit — CREATE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000

# @name createCredit
POST {{baseUrl}}/api/credits
Content-Type: application/json

{
  "credit_application_id": 1,
  "rate_id": 1,
  "date": "2026-10-01T10:30:00.000Z",
  "approved_amount": 5000000,
  "term": 24,
  "interest_rate": 1.5,
  "status": "active",
  "observations": "Crédito aprobado para el asociado"
}
EOF
```

![](images/clipboard-2277098043.png)

``` bash
: > src/features/business/credits/http/credits.update.http
cat >> src/features/business/credits/http/credits.update.http << 'EOF'
### Feature Credit — UPDATE (PUT) / UPDATE (PATCH)
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name updateCreditPut
PUT {{baseUrl}}/api/credits/{{id}}
Content-Type: application/json

{
  "credit_application_id": 1,
  "rate_id": 1,
  "date": "2026-10-01T12:00:00.000Z",
  "approved_amount": 7500000,
  "term": 36,
  "interest_rate": 1.5,
  "status": "active",
  "observations": "Crédito actualizado"
}

###

# @name updateCreditPatch
PATCH {{baseUrl}}/api/credits/{{id}}
Content-Type: application/json

{
  "approved_amount": 6000000,
  "term": 24,
  "observations": "Monto y plazo actualizados"
}
EOF
```

![](images/clipboard-3584244905.png)

``` bash
: > src/features/business/credits/http/credits.delete.http
cat >> src/features/business/credits/http/credits.delete.http << 'EOF'
### Feature Credit — DELETE físico / DELETE lógico (status = cancelled)
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name deleteCreditPhysical
DELETE {{baseUrl}}/api/credits/{{id}}

###

# @name deleteCreditLogical
PATCH {{baseUrl}}/api/credits/{{id}}/deactivate
EOF
```

![](images/clipboard-1003826844.png)

------------------------------------------------------------------------

## 14.5 Seeder Credit

``` bash
mkdir -p src/features/business/credits

cat > src/features/business/credits/credit.seeder.ts << 'EOF'
import { faker } from "@faker-js/faker";
import { Credit } from "./credit.model";

/**
 * Seeder del feature Credit (datos falsos con @faker-js/faker).
 * Se invoca desde `src/database/seeders` (SeedersRunner), no desde la App.
 *
 * Idempotente: si ya hay filas, no vuelve a insertar.
 */
export async function seedCredits(count: number): Promise<number> {
  if (count <= 0) {
    console.log("⏭️  credits: count=0, se omite");
    return 0;
  }

  const existing = await Credit.count();

  if (existing > 0) {
    console.log(
      `⏭️  credits: ya hay ${existing} registro(s), se omite seeder`
    );
    return 0;
  }

  const rows = Array.from({ length: count }, (_, index) => ({
    credit_application_id: index + 1,
    rate_id: 1,
    date: faker.date.recent({ days: 30 }),
    approved_amount: faker.number.int({
      min: 1000000,
      max: 15000000,
    }),
    term: faker.number.int({
      min: 6,
      max: 60,
    }),
    interest_rate: faker.number.float({
      min: 0.5,
      max: 3.5,
      fractionDigits: 2,
    }),
    status: "active" as const,
    observations: faker.lorem.sentence(),
  }));

  await Credit.bulkCreate(rows);

  console.log(
    `✅ credits: insertados ${count} registro(s) falsos`
  );

  return count;
}
EOF
```

![](images/clipboard-2031888722.png)

**PARCHE** — `src/database/seeders/counts.ts` **ya existe**.

-   **Dentro de** `SeedCounts`, **añadir** `credits: number;`
-   **Dentro de** `DEFAULT_SEED_COUNTS`, **añadir** `credits: 10,`
-   **Dentro de** la resolución por env, **añadir** lectura de
    `SEED_CREDITS` (ver archivo final abajo en ISS-08 si consolidás).

**PARCHE** — `src/database/seeders/index.ts` **ya existe**.

1.  **Debajo de** imports de `credit_applications`, **añadir** import de
    `seedCredits`.
2.  **Debajo de** `await seedCreditApplications(...)`, **añadir**
    `await seedCredits(counts.credits);`

------------------------------------------------------------------------

## 14.6 Swagger Credit

``` bash
: > src/features/business/credits/credit.swagger.ts
cat >> src/features/business/credits/credit.swagger.ts << 'EOF'
/**
 * Documentación OpenAPI del feature Credit.
 * Se agrega desde `src/swagger` (registry externo), no se monta aquí.
 *
 * Leyenda: endpoints documentados como SIN AUTH (sin middleware JWT).
 */

export const creditSwagger = {
  tags: [
    {
      name: "Credits",
      description:
        "CRUD de créditos — **SIN AUTH** (sin middleware JWT)",
    },
  ],

  paths: {
    "/api/credits": {
      get: {
        tags: ["Credits"],
        summary: "Listar créditos",
        description: "SIN AUTH — retorna todos los créditos",
        security: [],
        responses: {
          "200": {
            description: "Lista de créditos",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    credits: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Credit",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      post: {
        tags: ["Credits"],
        summary: "Crear crédito",
        description:
          "SIN AUTH — registra un nuevo crédito",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreditCreate",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Crédito creado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    credit: {
                      $ref: "#/components/schemas/Credit",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Datos inválidos",
          },
        },
      },
    },

    "/api/credits/{id}": {
      get: {
        tags: ["Credits"],
        summary: "Obtener crédito por id",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "Crédito encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    credit: {
                      $ref: "#/components/schemas/Credit",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Crédito no encontrado",
          },
        },
      },

      put: {
        tags: ["Credits"],
        summary: "Actualizar crédito (PUT — reemplazo)",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreditUpdate",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Crédito actualizado",
          },
          "404": {
            description: "Crédito no encontrado",
          },
        },
      },

      patch: {
        tags: ["Credits"],
        summary: "Actualizar crédito (PATCH — parcial)",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreditPatch",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Crédito actualizado",
          },
          "404": {
            description: "Crédito no encontrado",
          },
        },
      },

      delete: {
        tags: ["Credits"],
        summary: "Eliminar crédito (físico)",
        description: "SIN AUTH — elimina la fila",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "Crédito eliminado",
          },
          "404": {
            description: "Crédito no encontrado",
          },
        },
      },
    },

    "/api/credits/{id}/deactivate": {
      patch: {
        tags: ["Credits"],
        summary: "Cancelar crédito (lógico)",
        description:
          "SIN AUTH — status = cancelled",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "Crédito cancelado",
          },
          "404": {
            description: "Crédito no encontrado",
          },
        },
      },
    },
  },

  components: {
    schemas: {
      Credit: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          credit_application_id: {
            type: "integer",
            example: 1,
          },
          rate_id: {
            type: "integer",
            example: 1,
          },
          date: {
            type: "string",
            format: "date-time",
          },
          approved_amount: {
            type: "number",
            format: "double",
            example: 5000000,
          },
          term: {
            type: "integer",
            example: 24,
          },
          interest_rate: {
            type: "number",
            format: "double",
            example: 1.5,
          },
          status: {
            type: "string",
            enum: ["active", "paid", "cancelled"],
            example: "active",
          },
          observations: {
            type: "string",
            nullable: true,
            example:
              "Crédito aprobado para el asociado",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },

      CreditCreate: {
        type: "object",
        required: [
          "credit_application_id",
          "rate_id",
          "approved_amount",
          "term",
          "interest_rate",
        ],
        properties: {
          credit_application_id: {
            type: "integer",
            example: 1,
          },
          rate_id: {
            type: "integer",
            example: 1,
          },
          date: {
            type: "string",
            format: "date-time",
          },
          approved_amount: {
            type: "number",
            format: "double",
            example: 5000000,
          },
          term: {
            type: "integer",
            example: 24,
          },
          interest_rate: {
            type: "number",
            format: "double",
            example: 1.5,
          },
          status: {
            type: "string",
            enum: ["active", "paid", "cancelled"],
            default: "active",
          },
          observations: {
            type: "string",
            nullable: true,
          },
        },
      },

      CreditUpdate: {
        type: "object",
        required: [
          "credit_application_id",
          "rate_id",
          "approved_amount",
          "term",
          "interest_rate",
        ],
        properties: {
          credit_application_id: {
            type: "integer",
          },
          rate_id: {
            type: "integer",
          },
          date: {
            type: "string",
            format: "date-time",
          },
          approved_amount: {
            type: "number",
            format: "double",
          },
          term: {
            type: "integer",
          },
          interest_rate: {
            type: "number",
            format: "double",
          },
          status: {
            type: "string",
            enum: ["active", "paid", "cancelled"],
          },
          observations: {
            type: "string",
            nullable: true,
          },
        },
      },

      CreditPatch: {
        type: "object",
        properties: {
          credit_application_id: {
            type: "integer",
          },
          rate_id: {
            type: "integer",
          },
          date: {
            type: "string",
            format: "date-time",
          },
          approved_amount: {
            type: "number",
            format: "double",
          },
          term: {
            type: "integer",
          },
          interest_rate: {
            type: "number",
            format: "double",
          },
          status: {
            type: "string",
            enum: ["active", "paid", "cancelled"],
          },
          observations: {
            type: "string",
            nullable: true,
          },
        },
      },
    },
  },
};
EOF
```

![](images/clipboard-1667283941.png)

**PARCHE** — `src/swagger/index.ts` **ya existe**.

1.  **Debajo de** los imports de `creditApplicationSwagger`, **añadir**
    el import de `creditSwagger`.

2.  **Dentro de** `featureSwaggerModules`, **debajo de**
    `creditApplicationSwagger,`, **añadir** `creditSwagger,`.

### Cierre del ISS

``` bash
npm run dev
```

> El servidor debe arrancar sin error. Detenerlo con Ctrl+C antes de
> continuar.
>
> ![](images/clipboard-2766623804.png)
>
> ![](images/clipboard-1525352322.png)

------------------------------------------------------------------------

# 15. ISS-10 — Feature Rate (tasas)

**Objetivo:** CRUD + seeder + Swagger de Rate (sin FK).

**Bloqueado por:** ISS-10.

**API:** `/api/rates` — **SIN AUTH**.

**Patrón:** mismo que las features anteriores de FondoSolidario.

### Criterios de aceptación

-   [x] **15.1** Modelo `rate.model.ts` (`status` + `timestamps: true`)
-   [x] **15.2** Controller + routes en este orden: getAll, getOne,
    create, update PUT/PATCH, delete físico y lógico
-   [x] **15.3** Carpeta `http/` en el mismo orden: get, create, update,
    delete
-   [x] **15.4** Cableado en `routes/index.ts` + `config` (import
    model + route)
-   [x] **15.5** Seeder + registro en SeedersRunner / counts
-   [x] **15.6** Swagger + registro en `src/swagger`

``` bash
mkdir -p src/features/business/rates/http
```

------------------------------------------------------------------------

## 15.1 Modelo Rates

``` bash
: > src/features/business/rates/rate.model.ts
cat >> src/features/business/rates/rate.model.ts << 'EOF'
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

export interface RateI {
  id?: number;
  name: string;
  percentage: number;
  type: "monthly" | "annual";
  description?: string | null;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

export class Rate extends Model {
  public id!: number;
  public name!: string;
  public percentage!: number;
  public type!: "monthly" | "annual";
  public description!: string | null;
  public status!: "active" | "inactive";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Rate.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("monthly", "annual"),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Rate",
    tableName: "rates",
    timestamps: true,
  }
);
EOF
```

![](images/clipboard-504923882.png)

------------------------------------------------------------------------

## 15.2 Controller + routes (CRUD completo)

``` bash
: > src/features/business/rates/rate.controller.ts
cat >> src/features/business/rates/rate.controller.ts << 'EOF'
import { Request, Response } from "express";
import { Rate, RateI } from "./rate.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

export class RateController {
  // ================== READ ==================

  public async getAll(req: Request, res: Response) {
    try {
      const rates = await Rate.findAll({
        where: { status: "active" },
      });

      res.status(200).json({ rates });
    } catch (error) {
      res.status(500).json({
        error: "Error al obtener las tasas",
        detail: String(error),
      });
    }
  }

  public async getOne(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const rate = await Rate.findByPk(id);

      if (!rate) {
        res.status(404).json({
          error: "Tasa no encontrada",
        });
        return;
      }

      res.status(200).json({ rate });
    } catch (error) {
      res.status(500).json({
        error: "Error al obtener la tasa",
        detail: String(error),
      });
    }
  }

  // ================== CREATE ==================

  public async create(req: Request, res: Response) {
    try {
      const body = req.body as RateI;

      if (!body.name) {
        res.status(400).json({
          error: "name es obligatorio",
        });
        return;
      }

      if (
        body.percentage === undefined ||
        Number(body.percentage) < 0
      ) {
        res.status(400).json({
          error: "percentage debe ser mayor o igual a 0",
        });
        return;
      }

      if (!body.type) {
        res.status(400).json({
          error: "type es obligatorio",
        });
        return;
      }

      const rate = await Rate.create({
        name: body.name,
        percentage: body.percentage,
        type: body.type,
        description: body.description ?? null,
        status: body.status ?? "active",
      });

      res.status(201).json({ rate });
    } catch (error) {
      res.status(500).json({
        error: "Error al crear la tasa",
        detail: String(error),
      });
    }
  }

  // ================== UPDATE ==================

  public async updatePut(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as RateI;

      const rate = await Rate.findByPk(id);

      if (!rate) {
        res.status(404).json({
          error: "Tasa no encontrada",
        });
        return;
      }

      if (!body.name) {
        res.status(400).json({
          error: "name es obligatorio",
        });
        return;
      }

      if (
        body.percentage === undefined ||
        Number(body.percentage) < 0
      ) {
        res.status(400).json({
          error: "percentage debe ser mayor o igual a 0",
        });
        return;
      }

      if (!body.type) {
        res.status(400).json({
          error: "type es obligatorio",
        });
        return;
      }

      await rate.update({
        name: body.name,
        percentage: body.percentage,
        type: body.type,
        description: body.description ?? null,
        status: body.status ?? rate.status,
      });

      res.status(200).json({ rate });
    } catch (error) {
      res.status(500).json({
        error: "Error al actualizar la tasa (PUT)",
        detail: String(error),
      });
    }
  }

  public async updatePatch(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as Partial<RateI>;

      const rate = await Rate.findByPk(id);

      if (!rate) {
        res.status(404).json({
          error: "Tasa no encontrada",
        });
        return;
      }

      if (
        body.percentage !== undefined &&
        Number(body.percentage) < 0
      ) {
        res.status(400).json({
          error: "percentage debe ser mayor o igual a 0",
        });
        return;
      }

      await rate.update({
        ...(body.name !== undefined && {
          name: body.name,
        }),
        ...(body.percentage !== undefined && {
          percentage: body.percentage,
        }),
        ...(body.type !== undefined && {
          type: body.type,
        }),
        ...(body.description !== undefined && {
          description: body.description,
        }),
        ...(body.status !== undefined && {
          status: body.status,
        }),
      });

      res.status(200).json({ rate });
    } catch (error) {
      res.status(500).json({
        error: "Error al actualizar la tasa (PATCH)",
        detail: String(error),
      });
    }
  }

  // ================== DELETE ==================

  /** Eliminación física */
  public async deletePhysical(
    req: Request,
    res: Response
  ) {
    try {
      const id = paramId(req);
      const rate = await Rate.findByPk(id);

      if (!rate) {
        res.status(404).json({
          error: "Tasa no encontrada",
        });
        return;
      }

      await rate.destroy();

      res.status(200).json({
        message: "Tasa eliminada correctamente",
        id,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error al eliminar la tasa",
        detail: String(error),
      });
    }
  }

  /** Eliminación lógica → status = inactive */
  public async deleteLogical(
    req: Request,
    res: Response
  ) {
    try {
      const id = paramId(req);
      const rate = await Rate.findByPk(id);

      if (!rate) {
        res.status(404).json({
          error: "Tasa no encontrada",
        });
        return;
      }

      await rate.update({
        status: "inactive",
      });

      res.status(200).json({
        message: "Tasa desactivada correctamente",
        rate,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error al desactivar la tasa",
        detail: String(error),
      });
    }
  }
}
EOF
```

![](images/clipboard-3778052389.png)

``` bash
: > src/features/business/rates/rate.routes.ts
cat >> src/features/business/rates/rate.routes.ts << 'EOF'
import { Application } from "express";
import { RateController } from "./rate.controller";

export class RateRoutes {
  public rateController: RateController =
    new RateController();

  public routes(app: Application): void {
    // ================== RUTAS SIN AUTENTICACIÓN / SIN MIDDLEWARE JWT ==================

    // getAll
    app
      .route("/api/rates")
      .get(
        this.rateController.getAll.bind(
          this.rateController
        )
      );

    // getOne
    app
      .route("/api/rates/:id")
      .get(
        this.rateController.getOne.bind(
          this.rateController
        )
      );

    // create
    app
      .route("/api/rates")
      .post(
        this.rateController.create.bind(
          this.rateController
        )
      );

    // update (PUT / PATCH)
    app
      .route("/api/rates/:id")
      .put(
        this.rateController.updatePut.bind(
          this.rateController
        )
      )
      .patch(
        this.rateController.updatePatch.bind(
          this.rateController
        )
      );

    // delete físico
    app
      .route("/api/rates/:id")
      .delete(
        this.rateController.deletePhysical.bind(
          this.rateController
        )
      );

    // delete lógico
    app
      .route("/api/rates/:id/deactivate")
      .patch(
        this.rateController.deleteLogical.bind(
          this.rateController
        )
      );
  }
}
EOF
```

![](images/clipboard-4096222886.png)

------------------------------------------------------------------------

## 15.3 HTTP (REST Rates)

``` bash
: > src/features/business/rates/http/rates.get.http
cat >> src/features/business/rates/http/rates.get.http << 'EOF'
### Feature Rate — GET ALL / GET ONE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name getAllRates
GET {{baseUrl}}/api/rates

###

# @name getOneRate
GET {{baseUrl}}/api/rates/{{id}}
EOF
```

![](images/clipboard-2489500699.png)

``` bash
: > src/features/business/rates/http/rates.create.http
cat >> src/features/business/rates/http/rates.create.http << 'EOF'
### Feature Rate — CREATE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000

# @name createRate
POST {{baseUrl}}/api/rates
Content-Type: application/json

{
  "name": "Tasa crédito ordinario",
  "percentage": 1.5,
  "type": "monthly",
  "description": "Tasa mensual para créditos ordinarios",
  "status": "active"
}
EOF
```

![](images/clipboard-4160848311.png)

``` bash
: > src/features/business/rates/http/rates.update.http
cat >> src/features/business/rates/http/rates.update.http << 'EOF'
### Feature Rate — UPDATE (PUT) / UPDATE (PATCH)
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name updateRatePut
PUT {{baseUrl}}/api/rates/{{id}}
Content-Type: application/json

{
  "name": "Tasa crédito ordinario actualizada",
  "percentage": 1.75,
  "type": "monthly",
  "description": "Tasa mensual actualizada para créditos ordinarios",
  "status": "active"
}

###

# @name updateRatePatch
PATCH {{baseUrl}}/api/rates/{{id}}
Content-Type: application/json

{
  "percentage": 1.6,
  "description": "Porcentaje actualizado"
}
EOF
```

![](images/clipboard-3712950657.png)

``` bash
: > src/features/business/rates/http/rates.delete.http
cat >> src/features/business/rates/http/rates.delete.http << 'EOF'
### Feature Rate — DELETE físico / DELETE lógico (status = inactive)
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name deleteRatePhysical
DELETE {{baseUrl}}/api/rates/{{id}}

###

# @name deleteRateLogical
PATCH {{baseUrl}}/api/rates/{{id}}/deactivate
EOF
```

![](images/clipboard-2946327488.png)

------------------------------------------------------------------------

## 15.4 Cableado Routes + Config

**PARCHE** — `src/routes/index.ts` **ya existe**.

1.  **Debajo de** `import { CreditApplicationRoutes } ...`, **añadir**:

``` ts
import { RateRoutes } from "../features/business/rates/rate.routes";
```

2.  **Dentro de** `export class Routes`, **debajo de**
    `creditApplicationRoutes`, **añadir**:

``` ts
  public rateRoutes: RateRoutes = new RateRoutes();
```

3.  **Dentro de** `routes(app)`, **debajo de**
    `this.creditApplicationRoutes.routes(app);`, **añadir**:

``` ts
    this.rateRoutes.routes(app);
```

------------------------------------------------------------------------

**PARCHE** — `src/config/index.ts` **ya existe**.

1.  **Debajo de** `import "../features/business/credits/credit.model";`,
    **añadir**:

``` ts
import "../features/business/rates/rate.model";
```

------------------------------------------------------------------------

### Verificación

Ejecutar la compilación de TypeScript:

``` bash
npx tsc --noEmit
```

Si no aparecen errores, iniciar el servidor:

``` bash
npm run dev
```

Probar la creación de una tasa:

``` bash
curl -s -X POST http://localhost:4000/api/rates -H 'Content-Type: application/json' \
  -d '{"name":"Tasa crédito ordinario","percentage":1.5,"type":"monthly","description":"Tasa mensual para créditos ordinarios","status":"active"}'
```

Consultar las tasas registradas:

``` bash
curl -s http://localhost:4000/api/rates
```

Consultar una tasa específica:

``` bash
curl -s http://localhost:4000/api/rates/1
```

![](images/clipboard-2118865009.png)

------------------------------------------------------------------------

## 15.5 Seeder Rate

``` bash
: > src/features/business/rates/rate.seeder.ts
cat >> src/features/business/rates/rate.seeder.ts << 'EOF'
import { faker } from "@faker-js/faker";
import { Rate } from "./rate.model";

/**
 * Seeder del feature Rate (datos falsos con @faker-js/faker).
 * Se invoca desde `src/database/seeders` (SeedersRunner), no desde la App.
 *
 * Idempotente: si ya hay filas, no vuelve a insertar.
 */
export async function seedRates(count: number): Promise<number> {
  if (count <= 0) {
    console.log("⏭️  rates: count=0, se omite");
    return 0;
  }

  const existing = await Rate.count();
  if (existing > 0) {
    console.log(`⏭️  rates: ya hay ${existing} registro(s), se omite seeder`);
    return 0;
  }

  const rows = Array.from({ length: count }, () => ({
    name: `Tasa ${faker.finance.accountName()}`,
    percentage: Number(
      faker.number.float({
        min: 0.5,
        max: 5,
        fractionDigits: 2,
      }).toFixed(2)
    ),
    type: faker.helpers.arrayElement([
      "monthly",
      "annual",
    ]) as "monthly" | "annual",
    description: faker.commerce.productDescription(),
    status: "active" as const,
  }));

  await Rate.bulkCreate(rows);
  console.log(`✅ rates: insertados ${count} registro(s) falsos`);
  return count;
}
EOF
```

![](images/clipboard-3939056419.png)

**PARCHE** — `src/database/seeders/counts.ts` **ya existe**.

-   **Dentro de** `SeedCounts`, **añadir** `rates: number;`
-   **Dentro de** `DEFAULT_SEED_COUNTS`, **añadir** `rates: 10,`
-   **Dentro de** la resolución por env, **añadir** lectura de
    `SEED_RATES`.

**PARCHE** — `src/database/seeders/index.ts` **ya existe**.

1.  **Debajo de** los imports de `seedCreditApplications`, **añadir** el
    import de `seedRates`.

2.  **Debajo de** `await seedCreditApplications(...)`, **añadir**
    `await seedRates(counts.rates);`

------------------------------------------------------------------------

## 15.6 Swagger Rate

``` bash
: > src/features/business/rates/rate.swagger.ts
cat >> src/features/business/rates/rate.swagger.ts << 'EOF'
/**
 * Documentación OpenAPI del feature Rate.
 * Se agrega desde `src/swagger` (registry externo), no se monta aquí.
 *
 * Leyenda: endpoints documentados como SIN AUTH (sin middleware JWT).
 */

export const rateSwagger = {
  tags: [
    {
      name: "Rates",
      description: "CRUD de tasas — **SIN AUTH** (sin middleware JWT)",
    },
  ],
  paths: {
    "/api/rates": {
      get: {
        tags: ["Rates"],
        summary: "Listar tasas activas",
        description: "SIN AUTH — retorna tasas con status=active",
        security: [],
        responses: {
          "200": {
            description: "Lista de tasas",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    rates: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Rate",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Rates"],
        summary: "Crear tasa",
        description: "SIN AUTH",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RateCreate",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Tasa creada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    rate: {
                      $ref: "#/components/schemas/Rate",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/rates/{id}": {
      get: {
        tags: ["Rates"],
        summary: "Obtener tasa por id",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Tasa encontrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    rate: {
                      $ref: "#/components/schemas/Rate",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "No encontrada",
          },
        },
      },

      put: {
        tags: ["Rates"],
        summary: "Actualizar tasa (PUT — reemplazo)",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RateUpdate",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Tasa actualizada",
          },
          "404": {
            description: "No encontrada",
          },
        },
      },

      patch: {
        tags: ["Rates"],
        summary: "Actualizar tasa (PATCH — parcial)",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RatePatch",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Tasa actualizada",
          },
          "404": {
            description: "No encontrada",
          },
        },
      },

      delete: {
        tags: ["Rates"],
        summary: "Eliminar tasa (físico)",
        description: "SIN AUTH — borra la fila",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Tasa eliminada",
          },
          "404": {
            description: "No encontrada",
          },
        },
      },
    },

    "/api/rates/{id}/deactivate": {
      patch: {
        tags: ["Rates"],
        summary: "Eliminar tasa (lógico)",
        description: "SIN AUTH — status = inactive",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Tasa desactivada",
          },
          "404": {
            description: "No encontrada",
          },
        },
      },
    },
  },

  components: {
    schemas: {
      Rate: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          name: {
            type: "string",
            example: "Tasa crédito ordinario",
          },
          percentage: {
            type: "number",
            format: "decimal",
            example: 1.5,
          },
          type: {
            type: "string",
            enum: ["monthly", "annual"],
            example: "monthly",
          },
          description: {
            type: "string",
            example: "Tasa mensual para créditos ordinarios",
            nullable: true,
          },
          status: {
            type: "string",
            enum: ["active", "inactive"],
            example: "active",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },

      RateCreate: {
        type: "object",
        required: ["name", "percentage", "type"],
        properties: {
          name: {
            type: "string",
            example: "Tasa crédito ordinario",
          },
          percentage: {
            type: "number",
            format: "decimal",
            example: 1.5,
          },
          type: {
            type: "string",
            enum: ["monthly", "annual"],
            example: "monthly",
          },
          description: {
            type: "string",
            example: "Tasa mensual para créditos ordinarios",
          },
          status: {
            type: "string",
            enum: ["active", "inactive"],
            default: "active",
          },
        },
      },

      RateUpdate: {
        type: "object",
        required: ["name", "percentage", "type"],
        properties: {
          name: {
            type: "string",
          },
          percentage: {
            type: "number",
            format: "decimal",
          },
          type: {
            type: "string",
            enum: ["monthly", "annual"],
          },
          description: {
            type: "string",
          },
          status: {
            type: "string",
            enum: ["active", "inactive"],
          },
        },
      },

      RatePatch: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
          percentage: {
            type: "number",
            format: "decimal",
          },
          type: {
            type: "string",
            enum: ["monthly", "annual"],
          },
          description: {
            type: "string",
          },
          status: {
            type: "string",
            enum: ["active", "inactive"],
          },
        },
      },
    },
  },
};
EOF
```

![](images/clipboard-3266848495.png)

**PARCHE** — `src/swagger/index.ts` **ya existe**.

1.  **Debajo de** `import { clientSwagger } ...`, **añadir** import de
    `productTypeSwagger`.
2.  **Dentro de** `featureSwaggerModules`, **debajo de**
    `clientSwagger,`, **añadir** `productTypeSwagger,`.

### Cierre del ISS

``` bash
npm run dev
```

> ![](images/clipboard-1568111745.png)
>
> ![](images/clipboard-1459614108.png)
>
> El servidor debe arrancar sin error. Detenerlo con Ctrl+C antes de
> continuar.

------------------------------------------------------------------------

# 16. ISS-11 — Feature Installment (cuotas)

**Objetivo:** CRUD + seeder + Swagger de Installment.

**Bloqueado por:** ISS-11.

**API:** `/api/installments` — **SIN AUTH**.

**Relación:** Credit 1:N Installment.

**FK:** `installments.credit_id` → `credits.id`.

**Patrón:** mismo que las features anteriores de FondoSolidario.

### Criterios de aceptación

-   [x] **16.1** Modelo `installment.model.ts` (`credit_id` + `status` +
    `timestamps: true`)
-   [x] **16.2** Asociación `Credit 1:N Installment`
-   [x] **16.3** Controller + routes en este orden: getAll, getOne,
    create, update PUT/PATCH, delete físico y lógico
-   [x] **16.4** Carpeta `http/` en el mismo orden: get, create, update,
    delete
-   [x] **16.5** Cableado en `routes/index.ts` + `config` (import
    model + asociación + route)
-   [x] **16.6** Seeder + registro en SeedersRunner / counts
-   [x] **16.7** Swagger + registro en `src/swagger`

``` bash
mkdir -p src/features/business/installments/http
```

------------------------------------------------------------------------

## 16.1 Modelo Installment

``` bash
: > src/features/business/installments/installment.model.ts
cat >> src/features/business/installments/installment.model.ts << 'EOF'
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

export interface InstallmentI {
  id?: number;
  credit_id: number;
  number: number;
  due_date: Date | string;
  principal_amount: number;
  interest_amount: number;
  total_amount: number;
  paid_amount: number;
  status: "pending" | "paid" | "overdue" | "cancelled";
  createdAt?: Date;
  updatedAt?: Date;
}

export class Installment extends Model {
  public id!: number;
  public credit_id!: number;
  public number!: number;
  public due_date!: Date;
  public principal_amount!: number;
  public interest_amount!: number;
  public total_amount!: number;
  public paid_amount!: number;
  public status!: "pending" | "paid" | "overdue" | "cancelled";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Installment.init(
  {
    credit_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    principal_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    interest_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    total_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    paid_amount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "paid",
        "overdue",
        "cancelled"
      ),
      defaultValue: "pending",
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Installment",
    tableName: "installments",
    timestamps: true,
  }
);
EOF
```

![](images/clipboard-2791256972.png)

------------------------------------------------------------------------

## 16.2 Controller + routes (CRUD completo)

``` bash
: > src/features/business/installments/installment.controller.ts
cat >> src/features/business/installments/installment.controller.ts << 'EOF'
import { Request, Response } from "express";
import { Installment, InstallmentI } from "./installment.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

export class InstallmentController {
  // ================== READ ==================
  public async getAll(req: Request, res: Response) {
    try {
      const installments = await Installment.findAll({
        where: { status: "pending" },
      });

      res.status(200).json({ installments });
    } catch (error) {
      res.status(500).json({
        error: "Error al consultar las cuotas",
        detail: String(error),
      });
    }
  }

  public async getOne(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const installment = await Installment.findByPk(id);

      if (!installment) {
        res.status(404).json({
          error: "Cuota no encontrada",
        });
        return;
      }

      res.status(200).json({ installment });
    } catch (error) {
      res.status(500).json({
        error: "Error al consultar la cuota",
        detail: String(error),
      });
    }
  }

  // ================== CREATE ==================
  public async create(req: Request, res: Response) {
    try {
      const body = req.body as InstallmentI;

      const installment = await Installment.create({
        credit_id: body.credit_id,
        number: body.number,
        due_date: body.due_date,
        principal_amount: body.principal_amount,
        interest_amount: body.interest_amount,
        total_amount: body.total_amount,
        paid_amount: body.paid_amount ?? 0,
        status: body.status ?? "pending",
      });

      res.status(201).json({ installment });
    } catch (error) {
      res.status(500).json({
        error: "Error al crear la cuota",
        detail: String(error),
      });
    }
  }

  // ================== UPDATE ==================
  public async updatePut(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as InstallmentI;

      const installment = await Installment.findByPk(id);

      if (!installment) {
        res.status(404).json({
          error: "Cuota no encontrada",
        });
        return;
      }

      await installment.update({
        credit_id: body.credit_id,
        number: body.number,
        due_date: body.due_date,
        principal_amount: body.principal_amount,
        interest_amount: body.interest_amount,
        total_amount: body.total_amount,
        paid_amount: body.paid_amount ?? installment.paid_amount,
        status: body.status ?? installment.status,
      });

      res.status(200).json({ installment });
    } catch (error) {
      res.status(500).json({
        error: "Error al actualizar la cuota (PUT)",
        detail: String(error),
      });
    }
  }

  public async updatePatch(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as Partial<InstallmentI>;

      const installment = await Installment.findByPk(id);

      if (!installment) {
        res.status(404).json({
          error: "Cuota no encontrada",
        });
        return;
      }

      await installment.update(body);

      res.status(200).json({ installment });
    } catch (error) {
      res.status(500).json({
        error: "Error al actualizar la cuota (PATCH)",
        detail: String(error),
      });
    }
  }

  // ================== DELETE ==================
  /** Eliminación física */
  public async deletePhysical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const installment = await Installment.findByPk(id);

      if (!installment) {
        res.status(404).json({
          error: "Cuota no encontrada",
        });
        return;
      }

      await installment.destroy();

      res.status(200).json({
        message: "Cuota eliminada permanentemente",
        id,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error al eliminar la cuota",
        detail: String(error),
      });
    }
  }

  /** Eliminación lógica → status = cancelled */
  public async deleteLogical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const installment = await Installment.findByPk(id);

      if (!installment) {
        res.status(404).json({
          error: "Cuota no encontrada",
        });
        return;
      }

      await installment.update({
        status: "cancelled",
      });

      res.status(200).json({
        message: "Cuota cancelada (eliminación lógica)",
        installment,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error al cancelar la cuota",
        detail: String(error),
      });
    }
  }
}
EOF
```

![](images/clipboard-2926642036.png)

``` bash
: > src/features/business/installments/installment.routes.ts
cat >> src/features/business/installments/installment.routes.ts << 'EOF'
import { Application } from "express";
import { InstallmentController } from "./installment.controller";

export class InstallmentRoutes {
  public installmentController: InstallmentController =
    new InstallmentController();

  public routes(app: Application): void {
    // ================== RUTAS SIN AUTENTICACIÓN / SIN MIDDLEWARE JWT ==================

    // getAll
    app
      .route("/api/installments")
      .get(
        this.installmentController.getAll.bind(
          this.installmentController
        )
      );

    // getOne
    app
      .route("/api/installments/:id")
      .get(
        this.installmentController.getOne.bind(
          this.installmentController
        )
      );

    // create
    app
      .route("/api/installments")
      .post(
        this.installmentController.create.bind(
          this.installmentController
        )
      );

    // update (PUT / PATCH)
    app
      .route("/api/installments/:id")
      .put(
        this.installmentController.updatePut.bind(
          this.installmentController
        )
      )
      .patch(
        this.installmentController.updatePatch.bind(
          this.installmentController
        )
      );

    // delete físico
    app
      .route("/api/installments/:id")
      .delete(
        this.installmentController.deletePhysical.bind(
          this.installmentController
        )
      );

    // delete lógico
    app
      .route("/api/installments/:id/deactivate")
      .patch(
        this.installmentController.deleteLogical.bind(
          this.installmentController
        )
      );
  }
}
EOF
```

![](images/clipboard-388889907.png)

------------------------------------------------------------------------

## 16.3 HTTP (REST Installment)

``` bash
: > src/features/business/installments/http/installments.get.http
cat >> src/features/business/installments/http/installments.get.http << 'EOF'
### Feature Installment — GET ALL / GET ONE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name getAllInstallments
GET {{baseUrl}}/api/installments

###

# @name getOneInstallment
GET {{baseUrl}}/api/installments/{{id}}
EOF
```

![](images/clipboard-3461956437.png)

``` bash
: > src/features/business/installments/http/installments.create.http
cat >> src/features/business/installments/http/installments.create.http << 'EOF'
### Feature Installment — CREATE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000

# @name createInstallment
POST {{baseUrl}}/api/installments
Content-Type: application/json

{
  "credit_id": 1,
  "number": 1,
  "due_date": "2026-11-30",
  "principal_amount": 500000,
  "interest_amount": 7500,
  "total_amount": 507500,
  "paid_amount": 0,
  "status": "pending"
}
EOF
```

![](images/clipboard-525602418.png)

``` bash
: > src/features/business/installments/http/installments.update.http
cat >> src/features/business/installments/http/installments.update.http << 'EOF'
### Feature Installment — UPDATE (PUT) / UPDATE (PATCH)
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name updateInstallmentPut
PUT {{baseUrl}}/api/installments/{{id}}
Content-Type: application/json

{
  "credit_id": 1,
  "number": 1,
  "due_date": "2026-12-15",
  "principal_amount": 500000,
  "interest_amount": 8000,
  "total_amount": 508000,
  "paid_amount": 0,
  "status": "pending"
}

###

# @name updateInstallmentPatch
PATCH {{baseUrl}}/api/installments/{{id}}
Content-Type: application/json

{
  "paid_amount": 250000,
  "status": "pending"
}
EOF
```

![](images/clipboard-2066105185.png)

``` bash
: > src/features/business/installments/http/installments.delete.http
cat >> src/features/business/installments/http/installments.delete.http << 'EOF'
### Feature Installment — DELETE físico / DELETE lógico
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name deleteInstallmentPhysical
DELETE {{baseUrl}}/api/installments/{{id}}

###

# @name deleteInstallmentLogical
PATCH {{baseUrl}}/api/installments/{{id}}/deactivate
EOF
```

![](images/clipboard-907853746.png)

------------------------------------------------------------------------

## 16.4 Cableado Routes + Config

**PARCHE** — `src/routes/index.ts` **ya existe**.

1.  **Debajo de** `import { RateRoutes } ...`, **añadir**:

``` ts
import { InstallmentRoutes } from "../features/business/installments/installment.routes";
```

2.  **Dentro de** `export class Routes`, **debajo de** `rateRoutes`,
    **añadir**:

``` ts
  public installmentRoutes: InstallmentRoutes =
    new InstallmentRoutes();
```

3.  **Dentro de** `routes(app)`, **debajo de**:

``` ts
this.rateRoutes.routes(app);
```

**añadir**:

``` ts
    this.installmentRoutes.routes(app);
```

------------------------------------------------------------------------

**PARCHE** — `src/config/index.ts` **ya existe**.

1.  **Debajo de**:

``` ts
import "../features/business/rates/rate.model";
```

**añadir**:

``` ts
import "../features/business/installments/installment.model";
```

2.  **Debajo de**:

``` ts
import "../features/business/rates/rate.associations";
```

**añadir**:

``` ts
import "../features/business/installments/installment.associations";
```

### Verificación

Primero comprobar que el proyecto compile correctamente:

``` bash
npx tsc --noEmit
```

Si no aparecen errores, iniciar la API:

``` bash
npm run dev
```

### Verificar la creación de una cuota

``` bash
curl -s -X POST http://localhost:4000/api/installments \
-H 'Content-Type: application/json' \
-d '{"credit_id":1,"number":1,"due_date":"2026-11-30","principal_amount":500000,"interest_amount":7500,"total_amount":507500,"paid_amount":0,"status":"pending"}'
```

### ![](images/clipboard-803396870.png)

------------------------------------------------------------------------

## 16.6 Seeder Installment

``` bash
: > src/features/business/installments/installment.seeder.ts
cat >> src/features/business/installments/installment.seeder.ts << 'EOF'
import { faker } from "@faker-js/faker";
import { Installment } from "./installment.model";
import { Credit } from "../credits/credit.model";

/**
 * Seeder del feature Installment (datos falsos con @faker-js/faker).
 * Se invoca desde `src/database/seeders` (SeedersRunner), no desde la App.
 *
 * Idempotente: si ya hay filas, no vuelve a insertar.
 *
 * Requiere que existan créditos previamente creados,
 * ya que `installments.credit_id` es una FK hacia `credits.id`.
 */
export async function seedInstallments(count: number): Promise<number> {
  if (count <= 0) {
    console.log("⏭️  installments: count=0, se omite");
    return 0;
  }

  const existing = await Installment.count();

  if (existing > 0) {
    console.log(
      `⏭️  installments: ya hay ${existing} registro(s), se omite seeder`
    );
    return 0;
  }

  const credits = await Credit.findAll({
    attributes: ["id"],
  });

  if (credits.length === 0) {
    console.log(
      "⏭️  installments: no existen créditos, se omite seeder"
    );
    return 0;
  }

  const rows = Array.from({ length: count }, (_, index) => {
    const credit = faker.helpers.arrayElement(credits);

    const principalAmount = Number(
      faker.number
        .float({
          min: 100000,
          max: 1000000,
          fractionDigits: 2,
        })
        .toFixed(2)
    );

    const interestAmount = Number(
      (
        principalAmount *
        faker.number.float({
          min: 0.01,
          max: 0.05,
          fractionDigits: 4,
        })
      ).toFixed(2)
    );

    const totalAmount = Number(
      (principalAmount + interestAmount).toFixed(2)
    );

    return {
      credit_id: credit.id,
      number: index + 1,
      due_date: faker.date.future({
        years: 1,
      }),
      principal_amount: principalAmount,
      interest_amount: interestAmount,
      total_amount: totalAmount,
      paid_amount: 0,
      status: "pending" as const,
    };
  });

  await Installment.bulkCreate(rows);

  console.log(
    `✅ installments: insertados ${count} registro(s) falsos`
  );

  return count;
}
EOF
```

![](images/clipboard-2760960787.png)

**PARCHE** — `src/database/seeders/counts.ts` **ya existe**.

-   **Dentro de** `SeedCounts`, **añadir** `product_types: number;`
-   **Dentro de** `DEFAULT_SEED_COUNTS`, **añadir** `product_types: 25,`
-   **Dentro de** la resolución por env, **añadir** lectura de
    `SEED_PRODUCT_TYPES` (ver archivo final abajo en ISS-08 si
    consolidás).

**PARCHE** — `src/database/seeders/index.ts` **ya existe**.

1.  **Debajo de** imports de client, **añadir** import de
    `seedProductTypes`.
2.  **Debajo de** `await seedClients(...)`, **añadir**
    `await seedProductTypes(counts.product_types);`

------------------------------------------------------------------------

## 16.7 Swagger Installment

``` bash
: > src/features/business/installments/installment.swagger.ts
cat >> src/features/business/installments/installment.swagger.ts << 'EOF'
/**
 * Documentación OpenAPI del feature Installment.
 * Se agrega desde `src/swagger` (registry externo), no se monta aquí.
 *
 * Leyenda: endpoints documentados como SIN AUTH (sin middleware JWT).
 */

export const installmentSwagger = {
  tags: [
    {
      name: "Installments",
      description:
        "CRUD de cuotas de crédito — **SIN AUTH** (sin middleware JWT)",
    },
  ],

  paths: {
    "/api/installments": {
      get: {
        tags: ["Installments"],
        summary: "Listar cuotas pendientes",
        description:
          "SIN AUTH — retorna las cuotas con status=pending",
        security: [],
        responses: {
          "200": {
            description: "Lista de cuotas",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    installments: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Installment",
                      },
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Error al consultar las cuotas",
          },
        },
      },

      post: {
        tags: ["Installments"],
        summary: "Crear cuota",
        description:
          "SIN AUTH — registra una nueva cuota asociada a un crédito",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/InstallmentCreate",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Cuota creada correctamente",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    installment: {
                      $ref: "#/components/schemas/Installment",
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Error al crear la cuota",
          },
        },
      },
    },

    "/api/installments/{id}": {
      get: {
        tags: ["Installments"],
        summary: "Obtener cuota por id",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "Cuota encontrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    installment: {
                      $ref: "#/components/schemas/Installment",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Cuota no encontrada",
          },
        },
      },

      put: {
        tags: ["Installments"],
        summary: "Actualizar cuota (PUT — reemplazo)",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/InstallmentUpdate",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Cuota actualizada",
          },
          "404": {
            description: "Cuota no encontrada",
          },
        },
      },

      patch: {
        tags: ["Installments"],
        summary: "Actualizar cuota (PATCH — parcial)",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/InstallmentPatch",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Cuota actualizada",
          },
          "404": {
            description: "Cuota no encontrada",
          },
        },
      },

      delete: {
        tags: ["Installments"],
        summary: "Eliminar cuota (físico)",
        description: "SIN AUTH — elimina permanentemente la fila",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "Cuota eliminada",
          },
          "404": {
            description: "Cuota no encontrada",
          },
        },
      },
    },

    "/api/installments/{id}/deactivate": {
      patch: {
        tags: ["Installments"],
        summary: "Cancelar cuota (eliminación lógica)",
        description:
          "SIN AUTH — cambia el estado de la cuota a cancelled",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "Cuota cancelada",
          },
          "404": {
            description: "Cuota no encontrada",
          },
        },
      },
    },
  },

  components: {
    schemas: {
      Installment: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          credit_id: {
            type: "integer",
            example: 1,
            description: "Identificador del crédito asociado",
          },
          number: {
            type: "integer",
            example: 1,
            description: "Número de la cuota",
          },
          due_date: {
            type: "string",
            format: "date-time",
            example: "2026-11-30T00:00:00.000Z",
            description: "Fecha de vencimiento",
          },
          principal_amount: {
            type: "number",
            format: "double",
            example: 500000,
            description: "Valor del capital de la cuota",
          },
          interest_amount: {
            type: "number",
            format: "double",
            example: 7500,
            description: "Valor de los intereses",
          },
          total_amount: {
            type: "number",
            format: "double",
            example: 507500,
            description: "Valor total de la cuota",
          },
          paid_amount: {
            type: "number",
            format: "double",
            example: 0,
            description: "Valor pagado de la cuota",
          },
          status: {
            type: "string",
            enum: [
              "pending",
              "paid",
              "overdue",
              "cancelled",
            ],
            example: "pending",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },

      InstallmentCreate: {
        type: "object",
        required: [
          "credit_id",
          "number",
          "due_date",
          "principal_amount",
          "interest_amount",
          "total_amount",
        ],
        properties: {
          credit_id: {
            type: "integer",
            example: 1,
          },
          number: {
            type: "integer",
            example: 1,
          },
          due_date: {
            type: "string",
            format: "date-time",
            example: "2026-11-30T00:00:00.000Z",
          },
          principal_amount: {
            type: "number",
            format: "double",
            example: 500000,
          },
          interest_amount: {
            type: "number",
            format: "double",
            example: 7500,
          },
          total_amount: {
            type: "number",
            format: "double",
            example: 507500,
          },
          paid_amount: {
            type: "number",
            format: "double",
            default: 0,
            example: 0,
          },
          status: {
            type: "string",
            enum: [
              "pending",
              "paid",
              "overdue",
              "cancelled",
            ],
            default: "pending",
          },
        },
      },

      InstallmentUpdate: {
        type: "object",
        required: [
          "credit_id",
          "number",
          "due_date",
          "principal_amount",
          "interest_amount",
          "total_amount",
        ],
        properties: {
          credit_id: {
            type: "integer",
          },
          number: {
            type: "integer",
          },
          due_date: {
            type: "string",
            format: "date-time",
          },
          principal_amount: {
            type: "number",
            format: "double",
          },
          interest_amount: {
            type: "number",
            format: "double",
          },
          total_amount: {
            type: "number",
            format: "double",
          },
          paid_amount: {
            type: "number",
            format: "double",
          },
          status: {
            type: "string",
            enum: [
              "pending",
              "paid",
              "overdue",
              "cancelled",
            ],
          },
        },
      },

      InstallmentPatch: {
        type: "object",
        properties: {
          credit_id: {
            type: "integer",
          },
          number: {
            type: "integer",
          },
          due_date: {
            type: "string",
            format: "date-time",
          },
          principal_amount: {
            type: "number",
            format: "double",
          },
          interest_amount: {
            type: "number",
            format: "double",
          },
          total_amount: {
            type: "number",
            format: "double",
          },
          paid_amount: {
            type: "number",
            format: "double",
          },
          status: {
            type: "string",
            enum: [
              "pending",
              "paid",
              "overdue",
              "cancelled",
            ],
          },
        },
      },
    },
  },
};
EOF
```

![](images/clipboard-2153327056.png)

**PARCHE** — `src/swagger/index.ts` **ya existe**.

1.  **Debajo de** `import { clientSwagger } ...`, **añadir** import de
    `productTypeSwagger`.
2.  **Dentro de** `featureSwaggerModules`, **debajo de**
    `clientSwagger,`, **añadir** `productTypeSwagger,`.

### Cierre del ISS

``` bash
npm run dev
```

> ![](images/clipboard-2903526656.png)
>
> ![](images/clipboard-649384963.png)
>
> El servidor debe arrancar sin error. Detenerlo con Ctrl+C antes de
> continuar.
> ------------------------------------------------------------------------

# 17. ISS-12 — Feature InstallmentPayment (pagos de cuota)

**Objetivo:** CRUD + seeder + Swagger de InstallmentPayment.

**Bloqueado por:** ISS-12.

**API:** `/api/installment-payments` — **SIN AUTH**.

**Relación:** Installment 1:N InstallmentPayment.

**FK:** `installment_payments.installment_id` → `installments.id`.

**Patrón:** mismo que las features anteriores de FondoSolidario.

### Criterios de aceptación

-   [x] **17.1** Modelo `installment-payment.model.ts`
    (`installment_id` + `status` + `timestamps: true`)
-   [x] **17.2** Asociación `Installment 1:N InstallmentPayment`
-   [x] **17.3** Controller + routes en este orden: getAll, getOne,
    create, update PUT/PATCH, delete físico y lógico
-   [x] **17.4** Carpeta `http/` en el mismo orden: get, create, update,
    delete
-   [x] **17.5** Cableado en `routes/index.ts` + `config` (import
    model + asociación + route)
-   [x] **17.6** Seeder + registro en SeedersRunner / counts
-   [x] **17.7** Swagger + registro en `src/swagger`

### Crear estructura

``` bash
mkdir -p src/features/business/installment-payments/http
```

------------------------------------------------------------------------

## 17.1 Modelo InstallmentPayment

``` bash
: > src/features/business/installment-payments/installment-payment.model.ts
cat >> src/features/business/installment-payments/installment-payment.model.ts << 'EOF'
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

export interface InstallmentPaymentI {
  id?: number;
  installment_id: number;
  payment_date: Date | string;
  amount: number;
  reference?: string | null;
  method: "cash" | "transfer" | "deposit" | "other";
  status: "active" | "cancelled";
  createdAt?: Date;
  updatedAt?: Date;
}

export class InstallmentPayment extends Model {
  public id!: number;
  public installment_id!: number;
  public payment_date!: Date;
  public amount!: number;
  public reference!: string | null;
  public method!: "cash" | "transfer" | "deposit" | "other";
  public status!: "active" | "cancelled";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

InstallmentPayment.init(
  {
    installment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    method: {
      type: DataTypes.ENUM(
        "cash",
        "transfer",
        "deposit",
        "other"
      ),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "active",
        "cancelled"
      ),
      defaultValue: "active",
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "InstallmentPayment",
    tableName: "installment_payments",
    timestamps: true,
  }
);
EOF
```

![](images/clipboard-3090500255.png)

------------------------------------------------------------------------

## 11.2 Controller + routes (CRUD completo)

``` bash
: > src/features/business/installment-payments/installment-payment.controller.ts
cat >> src/features/business/installment-payments/installment-payment.controller.ts << 'EOF'
import { Request, Response } from "express";
import {
  InstallmentPayment,
  InstallmentPaymentI,
} from "./installment-payment.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

export class InstallmentPaymentController {
  // ================== READ ==================
  public async getAll(req: Request, res: Response) {
    try {
      const installment_payments = await InstallmentPayment.findAll({
        where: { status: "active" },
      });

      res.status(200).json({ installment_payments });
    } catch (error) {
      res.status(500).json({
        error: "Error fetching installment payments",
        detail: String(error),
      });
    }
  }

  public async getOne(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const installment_payment =
        await InstallmentPayment.findByPk(id);

      if (!installment_payment) {
        res.status(404).json({
          error: "Installment payment not found",
        });
        return;
      }

      res.status(200).json({ installment_payment });
    } catch (error) {
      res.status(500).json({
        error: "Error fetching installment payment",
        detail: String(error),
      });
    }
  }

  // ================== CREATE ==================
  public async create(req: Request, res: Response) {
    try {
      const body = req.body as InstallmentPaymentI;

      const installment_payment =
        await InstallmentPayment.create({
          installment_id: body.installment_id,
          payment_date: body.payment_date ?? new Date(),
          amount: body.amount,
          reference: body.reference ?? null,
          method: body.method,
          status: body.status ?? "active",
        });

      res.status(201).json({ installment_payment });
    } catch (error) {
      res.status(500).json({
        error: "Error creating installment payment",
        detail: String(error),
      });
    }
  }

  // ================== UPDATE ==================
  public async updatePut(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as InstallmentPaymentI;

      const installment_payment =
        await InstallmentPayment.findByPk(id);

      if (!installment_payment) {
        res.status(404).json({
          error: "Installment payment not found",
        });
        return;
      }

      await installment_payment.update({
        installment_id: body.installment_id,
        payment_date: body.payment_date,
        amount: body.amount,
        reference: body.reference ?? null,
        method: body.method,
        status: body.status ?? installment_payment.status,
      });

      res.status(200).json({ installment_payment });
    } catch (error) {
      res.status(500).json({
        error: "Error updating installment payment (PUT)",
        detail: String(error),
      });
    }
  }

  public async updatePatch(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as Partial<InstallmentPaymentI>;

      const installment_payment =
        await InstallmentPayment.findByPk(id);

      if (!installment_payment) {
        res.status(404).json({
          error: "Installment payment not found",
        });
        return;
      }

      await installment_payment.update(body);

      res.status(200).json({ installment_payment });
    } catch (error) {
      res.status(500).json({
        error: "Error updating installment payment (PATCH)",
        detail: String(error),
      });
    }
  }

  // ================== DELETE ==================
  /** Eliminación física */
  public async deletePhysical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const installment_payment =
        await InstallmentPayment.findByPk(id);

      if (!installment_payment) {
        res.status(404).json({
          error: "Installment payment not found",
        });
        return;
      }

      await installment_payment.destroy();

      res.status(200).json({
        message: "Installment payment permanently deleted",
        id,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error deleting installment payment",
        detail: String(error),
      });
    }
  }

  /** Eliminación lógica → status = cancelled */
  public async deleteLogical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const installment_payment =
        await InstallmentPayment.findByPk(id);

      if (!installment_payment) {
        res.status(404).json({
          error: "Installment payment not found",
        });
        return;
      }

      await installment_payment.update({
        status: "cancelled",
      });

      res.status(200).json({
        message: "Installment payment cancelled (logical delete)",
        installment_payment,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error cancelling installment payment",
        detail: String(error),
      });
    }
  }
}
EOF
```

![](images/clipboard-2550435637.png)

``` bash
: > src/features/business/installment-payments/installment-payment.routes.ts
cat >> src/features/business/installment-payments/installment-payment.routes.ts << 'EOF'
import { Application } from "express";
import { InstallmentPaymentController } from "./installment-payment.controller";

export class InstallmentPaymentRoutes {
  public installmentPaymentController: InstallmentPaymentController =
    new InstallmentPaymentController();

  public routes(app: Application): void {
    // ================== RUTAS SIN AUTENTICACIÓN / SIN MIDDLEWARE JWT ==================

    // getAll
    app
      .route("/api/installment-payments")
      .get(
        this.installmentPaymentController.getAll.bind(
          this.installmentPaymentController
        )
      );

    // getOne
    app
      .route("/api/installment-payments/:id")
      .get(
        this.installmentPaymentController.getOne.bind(
          this.installmentPaymentController
        )
      );

    // create
    app
      .route("/api/installment-payments")
      .post(
        this.installmentPaymentController.create.bind(
          this.installmentPaymentController
        )
      );

    // update (PUT / PATCH)
    app
      .route("/api/installment-payments/:id")
      .put(
        this.installmentPaymentController.updatePut.bind(
          this.installmentPaymentController
        )
      )
      .patch(
        this.installmentPaymentController.updatePatch.bind(
          this.installmentPaymentController
        )
      );

    // delete físico
    app
      .route("/api/installment-payments/:id")
      .delete(
        this.installmentPaymentController.deletePhysical.bind(
          this.installmentPaymentController
        )
      );

    // delete lógico
    app
      .route("/api/installment-payments/:id/deactivate")
      .patch(
        this.installmentPaymentController.deleteLogical.bind(
          this.installmentPaymentController
        )
      );
  }
}
EOF
```

![](images/clipboard-3637798581.png)

------------------------------------------------------------------------

## 17.3 HTTP (REST InstallmentPayment)

``` bash
: > src/features/business/installment-payments/http/installment-payments.get.http
cat >> src/features/business/installment-payments/http/installment-payments.get.http << 'EOF'
### Feature InstallmentPayment — GET ALL / GET ONE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name getAllInstallmentPayments
GET {{baseUrl}}/api/installment-payments

###

# @name getOneInstallmentPayment
GET {{baseUrl}}/api/installment-payments/{{id}}
EOF
```

![](images/clipboard-3400778411.png)

``` bash
: > src/features/business/installment-payments/http/installment-payments.create.http
cat >> src/features/business/installment-payments/http/installment-payments.create.http << 'EOF'
### Feature InstallmentPayment — CREATE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000

# @name createInstallmentPayment
POST {{baseUrl}}/api/installment-payments
Content-Type: application/json

{
  "installment_id": 1,
  "payment_date": "2026-10-04",
  "amount": 250000.00,
  "reference": "PAGO-CUOTA-001",
  "method": "transfer",
  "status": "active"
}
EOF
```

![](images/clipboard-1244749629.png)

``` bash
: > src/features/business/installment-payments/http/installment-payments.update.http
cat >> src/features/business/installment-payments/http/installment-payments.update.http << 'EOF'
### Feature InstallmentPayment — UPDATE (PUT) / UPDATE (PATCH)
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name updateInstallmentPaymentPut
PUT {{baseUrl}}/api/installment-payments/{{id}}
Content-Type: application/json

{
  "installment_id": 1,
  "payment_date": "2026-10-04",
  "amount": 275000.00,
  "reference": "PAGO-CUOTA-001-ACT",
  "method": "transfer",
  "status": "active"
}

###

# @name updateInstallmentPaymentPatch
PATCH {{baseUrl}}/api/installment-payments/{{id}}
Content-Type: application/json

{
  "amount": 280000.00,
  "reference": "PAGO-CUOTA-001-CORREGIDO"
}
EOF
```

![](images/clipboard-642812768.png)

``` bash
: > src/features/business/installment-payments/http/installment-payments.delete.http
cat >> src/features/business/installment-payments/http/installment-payments.delete.http << 'EOF'
### Feature InstallmentPayment — DELETE físico / DELETE lógico (status = cancelled)
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name deleteInstallmentPaymentPhysical
DELETE {{baseUrl}}/api/installment-payments/{{id}}

###

# @name deleteInstallmentPaymentLogical
PATCH {{baseUrl}}/api/installment-payments/{{id}}/deactivate
EOF
```

![](images/clipboard-3130475435.png)

------------------------------------------------------------------------

## 17.4 Cableado Routes + Config

**PARCHE** — `src/routes/index.ts` **ya existe**.

1.  **Debajo de** los imports actuales de las demás features,
    **añadir**:

``` ts
import { InstallmentPaymentRoutes } from "../features/business/installment-payments/installment-payment.routes";
```

2.  **Dentro de** `export class Routes`, **debajo de**
    `installmentRoutes`, **añadir**:

``` ts
  public installmentPaymentRoutes: InstallmentPaymentRoutes =
    new InstallmentPaymentRoutes();
```

3.  **Dentro de** `routes()`, **debajo de**
    `this.installmentRoutes.routes(app);`, **añadir**:

``` ts
    this.installmentPaymentRoutes.routes(app);
```

**PARCHE** — `src/config/index.ts` **ya existe**.

1.  **Debajo de**
    `import "../features/business/installments/installment.model";`,
    **añadir**:

``` ts
import "../features/business/installment-payments/installment-payment.model";
```

2.  **Debajo de**
    `import "../features/business/installments/installment.associations";`,
    **añadir**:

``` ts
import "../features/business/installment-payments/installment-payment.associations";
```

### Verificación

``` bash
npx tsc --noEmit
```

``` bash
grep -n "InstallmentPayment" src/routes/index.ts
grep -n "installment-payment" src/config/index.ts
```

![](images/clipboard-448174218.png)

------------------------------------------------------------------------

## 17.6 Seeder InstallmentPayment

``` bash
: > src/features/business/installment-payments/installment-payment.seeder.ts
cat >> src/features/business/installment-payments/installment-payment.seeder.ts << 'EOF'
import { faker } from "@faker-js/faker";
import { InstallmentPayment } from "./installment-payment.model";
import { Installment } from "../installments/installment.model";

/**
 * Seeder del feature InstallmentPayment (datos falsos con @faker-js/faker).
 * Se invoca desde `src/database/seeders` (SeedersRunner), no desde la App.
 *
 * Idempotente: si ya hay filas, no vuelve a insertar.
 *
 * Requiere que existan cuotas previamente creadas,
 * ya que `installment_payments.installment_id` es una FK hacia `installments.id`.
 */
export async function seedInstallmentPayments(
  count: number
): Promise<number> {
  if (count <= 0) {
    console.log("⏭️  installment_payments: count=0, se omite");
    return 0;
  }

  const existing = await InstallmentPayment.count();

  if (existing > 0) {
    console.log(
      `⏭️  installment_payments: ya hay ${existing} registro(s), se omite seeder`
    );
    return 0;
  }

  const installments = await Installment.findAll({
    attributes: ["id"],
  });

  if (installments.length === 0) {
    console.log(
      "⏭️  installment_payments: no existen cuotas, se omite seeder"
    );
    return 0;
  }

  const rows = Array.from({ length: count }, () => {
    const installment = faker.helpers.arrayElement(installments);

    return {
      installment_id: installment.id,
      payment_date: faker.date.recent({ days: 30 }),
      amount: Number(
        faker.number
          .float({
            min: 50000,
            max: 1000000,
            fractionDigits: 2,
          })
          .toFixed(2)
      ),
      reference: `PAGO-${faker.string.alphanumeric(8).toUpperCase()}`,
      method: faker.helpers.arrayElement([
        "cash",
        "transfer",
        "deposit",
        "other",
      ]) as "cash" | "transfer" | "deposit" | "other",
      status: "active" as const,
    };
  });

  await InstallmentPayment.bulkCreate(rows);

  console.log(
    `✅ installment_payments: insertados ${count} registro(s) falsos`
  );

  return count;
}
EOF
```

![](images/clipboard-1065293240.png)

**PARCHE** — `src/database/seeders/counts.ts` **ya existe**.

-   **Dentro de** `SeedCounts`, **añadir** `product_types: number;`
-   **Dentro de** `DEFAULT_SEED_COUNTS`, **añadir** `product_types: 25,`
-   **Dentro de** la resolución por env, **añadir** lectura de
    `SEED_PRODUCT_TYPES` (ver archivo final abajo en ISS-08 si
    consolidás).

**PARCHE** — `src/database/seeders/index.ts` **ya existe**.

1.  **Debajo de** imports de client, **añadir** import de
    `seedProductTypes`.
2.  **Debajo de** `await seedClients(...)`, **añadir**
    `await seedProductTypes(counts.product_types);`

------------------------------------------------------------------------

## 17.6 Swagger InstallmentPayment

``` bash
: > src/features/business/installment-payments/installment-payment.swagger.ts
cat >> src/features/business/installment-payments/installment-payment.swagger.ts << 'EOF'
/**
 * Documentación OpenAPI del feature InstallmentPayment.
 * Se agrega desde `src/swagger` (registry externo), no se monta aquí.
 *
 * Leyenda: endpoints documentados como SIN AUTH (sin middleware JWT).
 */

export const installmentPaymentSwagger = {
  tags: [
    {
      name: "PagosCuota",
      description: "CRUD de pagos de cuota — **SIN AUTH** (sin middleware JWT)",
    },
  ],
  paths: {
    "/api/installment-payments": {
      get: {
        tags: ["PagosCuota"],
        summary: "Listar pagos de cuota activos",
        description: "SIN AUTH — retorna pagos con status=active",
        security: [],
        responses: {
          "200": {
            description: "Lista de pagos de cuota",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    installment_payments: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/InstallmentPayment",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["PagosCuota"],
        summary: "Crear pago de cuota",
        description: "SIN AUTH",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/InstallmentPaymentCreate",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Pago de cuota creado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    installment_payment: {
                      $ref: "#/components/schemas/InstallmentPayment",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/installment-payments/{id}": {
      get: {
        tags: ["PagosCuota"],
        summary: "Obtener pago de cuota por id",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Pago de cuota encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    installment_payment: {
                      $ref: "#/components/schemas/InstallmentPayment",
                    },
                  },
                },
              },
            },
          },
          "404": { description: "No encontrado" },
        },
      },
      put: {
        tags: ["PagosCuota"],
        summary: "Actualizar pago de cuota (PUT — reemplazo)",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/InstallmentPaymentUpdate",
              },
            },
          },
        },
        responses: {
          "200": { description: "Actualizado" },
          "404": { description: "No encontrado" },
        },
      },
      patch: {
        tags: ["PagosCuota"],
        summary: "Actualizar pago de cuota (PATCH — parcial)",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/InstallmentPaymentPatch",
              },
            },
          },
        },
        responses: {
          "200": { description: "Actualizado" },
          "404": { description: "No encontrado" },
        },
      },
      delete: {
        tags: ["PagosCuota"],
        summary: "Eliminar pago de cuota (físico)",
        description: "SIN AUTH — borra la fila",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "Eliminado" },
          "404": { description: "No encontrado" },
        },
      },
    },
    "/api/installment-payments/{id}/deactivate": {
      patch: {
        tags: ["PagosCuota"],
        summary: "Eliminar pago de cuota (lógico)",
        description: "SIN AUTH — status = cancelled",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "Cancelado" },
          "404": { description: "No encontrado" },
        },
      },
    },
  },
  components: {
    schemas: {
      InstallmentPayment: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          installment_id: { type: "integer", example: 1 },
          payment_date: {
            type: "string",
            format: "date-time",
            example: "2026-10-04T10:00:00.000Z",
          },
          amount: {
            type: "number",
            format: "decimal",
            example: 250000.00,
          },
          reference: {
            type: "string",
            example: "PAGO-CUOTA-001",
            nullable: true,
          },
          method: {
            type: "string",
            enum: ["cash", "transfer", "deposit", "other"],
            example: "transfer",
          },
          status: {
            type: "string",
            enum: ["active", "cancelled"],
            example: "active",
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      InstallmentPaymentCreate: {
        type: "object",
        required: ["installment_id", "amount", "method"],
        properties: {
          installment_id: {
            type: "integer",
            example: 1,
          },
          payment_date: {
            type: "string",
            format: "date-time",
          },
          amount: {
            type: "number",
            format: "decimal",
            example: 250000.00,
          },
          reference: {
            type: "string",
          },
          method: {
            type: "string",
            enum: ["cash", "transfer", "deposit", "other"],
            example: "transfer",
          },
          status: {
            type: "string",
            enum: ["active", "cancelled"],
            default: "active",
          },
        },
      },
      InstallmentPaymentUpdate: {
        type: "object",
        required: ["installment_id", "amount", "method"],
        properties: {
          installment_id: {
            type: "integer",
          },
          payment_date: {
            type: "string",
            format: "date-time",
          },
          amount: {
            type: "number",
            format: "decimal",
          },
          reference: {
            type: "string",
          },
          method: {
            type: "string",
            enum: ["cash", "transfer", "deposit", "other"],
          },
          status: {
            type: "string",
            enum: ["active", "cancelled"],
          },
        },
      },
      InstallmentPaymentPatch: {
        type: "object",
        properties: {
          installment_id: {
            type: "integer",
          },
          payment_date: {
            type: "string",
            format: "date-time",
          },
          amount: {
            type: "number",
            format: "decimal",
          },
          reference: {
            type: "string",
          },
          method: {
            type: "string",
            enum: ["cash", "transfer", "deposit", "other"],
          },
          status: {
            type: "string",
            enum: ["active", "cancelled"],
          },
        },
      },
    },
  },
};
EOF
```

![](images/clipboard-3754668965.png)

**PARCHE** — `src/swagger/index.ts` **ya existe**.

1.  **Debajo de** los imports existentes, añadir:

``` ts
import { installmentPaymentSwagger } from "../features/business/installment-payments/installment-payment.swagger";
```

2.  **Dentro de** `featureSwaggerModules`, añadir:

``` ts
installmentPaymentSwagger,
```

El bloque debe quedar siguiendo el mismo patrón de los demás Swagger:

``` ts
const featureSwaggerModules = [
  // ...
  installmentSwagger,
  installmentPaymentSwagger,
];
```

### Cierre del ISS

``` bash
npx tsc --noEmit
```

``` bash
npm run dev
```

> ![](images/clipboard-1467051079.png)
>
> ![](images/clipboard-2312770594.png)
>
> El servidor debe arrancar sin error. Detenerlo con Ctrl+C antes de
> continuar.

------------------------------------------------------------------------

# 18. ISS-13 — Feature CommitteeDecision (decisiones del comité)

**Objetivo:** CRUD + seeder + Swagger de CommitteeDecision.

**Bloqueado por:** ISS-13.

**API:** `/api/committee-decisions` — **SIN AUTH**.

**Relación:** CreditApplication 1:N CommitteeDecision.

**FK:** `committee_decisions.credit_application_id` →
`credit_applications.id`.

**Patrón:** mismo que las features anteriores de FondoSolidario.

### Criterios de aceptación

-   [x] **18.1** Modelo `committee-decision.model.ts`
    (`credit_application_id` + `status` + `timestamps: true`)
-   [x] **18.2** Asociación `CreditApplication 1:N CommitteeDecision`
-   [x] **18.3** Controller + routes en este orden: getAll, getOne,
    create, update PUT/PATCH, delete físico y lógico
-   [x] **18.4** Carpeta `http/` en el mismo orden: get, create, update,
    delete
-   [x] **18.5** Cableado en `routes/index.ts` + `config` (import
    model + asociación + route)
-   [x] **18.6** Seeder + registro en SeedersRunner / counts
-   [x] **18.7** Swagger + registro en `src/swagger`

``` bash
mkdir -p src/features/business/committee-decisions/http
```

------------------------------------------------------------------------

## 18.1 Modelo CommitteeDecisions

``` bash
cat > src/features/business/committee-decisions/committee-decision.model.ts << 'EOF'
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

export interface CommitteeDecisionI {
  id?: number;
  credit_application_id: number;
  decision: "pending" | "approved" | "rejected" | "observed";
  decision_date?: Date | string | null;
  comments?: string | null;
  decided_by?: number | null;
  status: "active" | "cancelled";
  createdAt?: Date;
  updatedAt?: Date;
}

export class CommitteeDecision extends Model {
  public id!: number;
  public credit_application_id!: number;
  public decision!: "pending" | "approved" | "rejected" | "observed";
  public decision_date!: Date | null;
  public comments!: string | null;
  public decided_by!: number | null;
  public status!: "active" | "cancelled";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CommitteeDecision.init(
  {
    credit_application_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    decision: {
      type: DataTypes.ENUM(
        "pending",
        "approved",
        "rejected",
        "observed"
      ),
      allowNull: false,
      defaultValue: "pending",
    },
    decision_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    decided_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "cancelled"),
      defaultValue: "active",
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "CommitteeDecision",
    tableName: "committee_decisions",
    timestamps: true,
  }
);
EOF
```

![](images/clipboard-439586155.png)

------------------------------------------------------------------------

## 18.2 Controller + routes (CRUD completo)

``` bash
cat > src/features/business/committee-decisions/committee-decision.controller.ts << 'EOF'
import { Request, Response } from "express";
import {
  CommitteeDecision,
  CommitteeDecisionI,
} from "./committee-decision.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

export class CommitteeDecisionController {
  // ================== READ ==================

  public async getAll(req: Request, res: Response) {
    try {
      const committee_decisions = await CommitteeDecision.findAll({
        where: { status: "active" },
      });

      res.status(200).json({ committee_decisions });
    } catch (error) {
      res.status(500).json({
        error: "Error fetching committee decisions",
        detail: String(error),
      });
    }
  }

  public async getOne(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const committee_decision =
        await CommitteeDecision.findByPk(id);

      if (!committee_decision) {
        res.status(404).json({
          error: "Committee decision not found",
        });
        return;
      }

      res.status(200).json({ committee_decision });
    } catch (error) {
      res.status(500).json({
        error: "Error fetching committee decision",
        detail: String(error),
      });
    }
  }

  // ================== CREATE ==================

  public async create(req: Request, res: Response) {
    try {
      const body = req.body as CommitteeDecisionI;

      const committee_decision =
        await CommitteeDecision.create({
          credit_application_id: body.credit_application_id,
          decision: body.decision ?? "pending",
          decision_date: body.decision_date ?? null,
          comments: body.comments ?? null,
          decided_by: body.decided_by ?? null,
          status: body.status ?? "active",
        });

      res.status(201).json({ committee_decision });
    } catch (error) {
      res.status(500).json({
        error: "Error creating committee decision",
        detail: String(error),
      });
    }
  }

  // ================== UPDATE ==================

  public async updatePut(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as CommitteeDecisionI;

      const committee_decision =
        await CommitteeDecision.findByPk(id);

      if (!committee_decision) {
        res.status(404).json({
          error: "Committee decision not found",
        });
        return;
      }

      await committee_decision.update({
        credit_application_id: body.credit_application_id,
        decision: body.decision ?? committee_decision.decision,
        decision_date:
          body.decision_date ?? committee_decision.decision_date,
        comments:
          body.comments ?? committee_decision.comments,
        decided_by:
          body.decided_by ?? committee_decision.decided_by,
        status: body.status ?? committee_decision.status,
      });

      res.status(200).json({ committee_decision });
    } catch (error) {
      res.status(500).json({
        error: "Error updating committee decision (PUT)",
        detail: String(error),
      });
    }
  }

  public async updatePatch(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as Partial<CommitteeDecisionI>;

      const committee_decision =
        await CommitteeDecision.findByPk(id);

      if (!committee_decision) {
        res.status(404).json({
          error: "Committee decision not found",
        });
        return;
      }

      await committee_decision.update(body);

      res.status(200).json({ committee_decision });
    } catch (error) {
      res.status(500).json({
        error: "Error updating committee decision (PATCH)",
        detail: String(error),
      });
    }
  }

  // ================== DELETE ==================

  /** Eliminación física */
  public async deletePhysical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const committee_decision =
        await CommitteeDecision.findByPk(id);

      if (!committee_decision) {
        res.status(404).json({
          error: "Committee decision not found",
        });
        return;
      }

      await committee_decision.destroy();

      res.status(200).json({
        message: "Committee decision permanently deleted",
        id,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error deleting committee decision",
        detail: String(error),
      });
    }
  }

  /** Eliminación lógica → status = cancelled */
  public async deleteLogical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const committee_decision =
        await CommitteeDecision.findByPk(id);

      if (!committee_decision) {
        res.status(404).json({
          error: "Committee decision not found",
        });
        return;
      }

      await committee_decision.update({
        status: "cancelled",
      });

      res.status(200).json({
        message: "Committee decision cancelled (logical delete)",
        committee_decision,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error cancelling committee decision",
        detail: String(error),
      });
    }
  }
}
EOF
```

![](images/clipboard-1055343622.png)

``` bash
cat > src/features/business/committee-decisions/committee-decision.routes.ts << 'EOF'
import { Application } from "express";
import { CommitteeDecisionController } from "./committee-decision.controller";

export class CommitteeDecisionRoutes {
  public committeeDecisionController: CommitteeDecisionController =
    new CommitteeDecisionController();

  public routes(app: Application): void {
    // ================== RUTAS SIN AUTENTICACIÓN / SIN MIDDLEWARE JWT ==================

    // getAll
    app
      .route("/api/committee-decisions")
      .get(
        this.committeeDecisionController.getAll.bind(
          this.committeeDecisionController
        )
      );

    // getOne
    app
      .route("/api/committee-decisions/:id")
      .get(
        this.committeeDecisionController.getOne.bind(
          this.committeeDecisionController
        )
      );

    // create
    app
      .route("/api/committee-decisions")
      .post(
        this.committeeDecisionController.create.bind(
          this.committeeDecisionController
        )
      );

    // update (PUT / PATCH)
    app
      .route("/api/committee-decisions/:id")
      .put(
        this.committeeDecisionController.updatePut.bind(
          this.committeeDecisionController
        )
      )
      .patch(
        this.committeeDecisionController.updatePatch.bind(
          this.committeeDecisionController
        )
      );

    // delete físico
    app
      .route("/api/committee-decisions/:id")
      .delete(
        this.committeeDecisionController.deletePhysical.bind(
          this.committeeDecisionController
        )
      );

    // delete lógico
    app
      .route("/api/committee-decisions/:id/deactivate")
      .patch(
        this.committeeDecisionController.deleteLogical.bind(
          this.committeeDecisionController
        )
      );
  }
}
EOF
```

![](images/clipboard-4203523685.png)

------------------------------------------------------------------------

## 18.3 HTTP (REST CommitteeDecisions)

``` bash
cat > src/features/business/committee-decisions/http/committee-decisions.get.http << 'EOF'
### Feature CommitteeDecision — GET ALL / GET ONE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name getAllCommitteeDecisions
GET {{baseUrl}}/api/committee-decisions

###

# @name getOneCommitteeDecision
GET {{baseUrl}}/api/committee-decisions/{{id}}
EOF
```

![](images/clipboard-1014370728.png)

``` bash
cat > src/features/business/committee-decisions/http/committee-decisions.create.http << 'EOF'
### Feature CommitteeDecision — CREATE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000

# @name createCommitteeDecision
POST {{baseUrl}}/api/committee-decisions
Content-Type: application/json

{
  "credit_application_id": 1,
  "decision": "approved",
  "decision_date": "2026-10-04",
  "comments": "Solicitud aprobada por el comité.",
  "decided_by": 1,
  "status": "active"
}
EOF
```

![](images/clipboard-1313971383.png)

``` bash
cat > src/features/business/committee-decisions/http/committee-decisions.update.http << 'EOF'
### Feature CommitteeDecision — UPDATE (PUT) / UPDATE (PATCH)
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name updateCommitteeDecisionPut
PUT {{baseUrl}}/api/committee-decisions/{{id}}
Content-Type: application/json

{
  "credit_application_id": 1,
  "decision": "approved",
  "decision_date": "2026-10-04",
  "comments": "Decisión actualizada por el comité.",
  "decided_by": 1,
  "status": "active"
}

###

# @name updateCommitteeDecisionPatch
PATCH {{baseUrl}}/api/committee-decisions/{{id}}
Content-Type: application/json

{
  "comments": "Comentario actualizado parcialmente."
}
EOF
```

![](images/clipboard-387520624.png)

``` bash
cat > src/features/business/committee-decisions/http/committee-decisions.delete.http << 'EOF'
### Feature CommitteeDecision — DELETE físico / DELETE lógico
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name deleteCommitteeDecisionPhysical
DELETE {{baseUrl}}/api/committee-decisions/{{id}}

###

# @name deleteCommitteeDecisionLogical
PATCH {{baseUrl}}/api/committee-decisions/{{id}}/deactivate
EOF
```

![](images/clipboard-500252691.png)

------------------------------------------------------------------------

## 18.4 Cableado Routes + Config

**PARCHE** — `src/routes/index.ts` **ya existe**.

1.  **Debajo de** `import { ClientRoutes } ...`, **añadir**:

``` ts
import { ProductTypeRoutes } from "../features/business/product-type/product-type.routes";
```

2.  **Dentro de** `export class Routes`, **debajo de** `clientRoutes`,
    **añadir**:

``` ts
  public productTypeRoutes: ProductTypeRoutes = new ProductTypeRoutes();
```

**PARCHE** — `src/config/index.ts` **ya existe**.

1.  **Debajo de** `import "../features/business/client/client.model";`,
    **añadir**:

``` ts
import "../features/business/product-type/product-type.model";
```

2.  **Dentro de** `routes()`, **debajo de**
    `this.routePrv.clientRoutes.routes(this.app);`, **añadir**:

``` ts
    this.routePrv.productTypeRoutes.routes(this.app);
```

### Verificación

``` bash
curl -s http://localhost:4000/api/members; echo
curl -s http://localhost:4000/api/credit-applications; echo
curl -s http://localhost:4000/api/committee-decisions; echo
```

![](images/clipboard-2294779617.png)

------------------------------------------------------------------------

## 18.5 Seeder CommitteeDecisions

``` bash
: > src/features/business/committee-decisions/committee-decision.seeder.ts
cat >> src/features/business/committee-decisions/committee-decision.seeder.ts <<'EOF'
import { faker } from "@faker-js/faker";
import { CommitteeDecision } from "./committee-decision.model";
import { CreditApplication } from "../credit-applications/credit-application.model";

/**
 * Seeder del feature CommitteeDecision.
 * Se invoca desde SeedersRunner, no desde la App.
 *
 * Idempotente: si ya hay filas, no vuelve a insertar.
 */
export async function seedCommitteeDecisions(
  count: number
): Promise<number> {
  if (count <= 0) {
    console.log("⏭️  committee_decisions: count=0, se omite");
    return 0;
  }

  const existing = await CommitteeDecision.count();

  if (existing > 0) {
    console.log(
      `⏭️  committee_decisions: ya hay ${existing} registro(s), se omite seeder`
    );
    return 0;
  }

  const creditApplications = await CreditApplication.findAll({
    attributes: ["id"],
  });

  if (creditApplications.length === 0) {
    console.log(
      "⏭️  committee_decisions: no existen credit applications, se omite seeder"
    );
    return 0;
  }

  const rows = Array.from({ length: count }, (_, index) => ({
    credit_application_id:
      creditApplications[index % creditApplications.length].id,
    decision: faker.helpers.arrayElement([
      "pending",
      "approved",
      "rejected",
      "observed",
    ]) as "pending" | "approved" | "rejected" | "observed",
    decision_date: faker.date.recent({ days: 30 }),
    comments: faker.lorem.sentence(),
    decided_by: null,
    status: "active" as const,
  }));

  await CommitteeDecision.bulkCreate(rows);

  console.log(
    `✅ committee_decisions: insertados ${count} registro(s) falsos`
  );

  return count;
}
EOF
```

![](images/clipboard-3054531113.png)

**PARCHE** — `src/database/seeders/counts.ts` **ya existe**.

-   **Dentro de** `SeedCounts`, **añadir** `product_types: number;`
-   **Dentro de** `DEFAULT_SEED_COUNTS`, **añadir** `product_types: 25,`
-   **Dentro de** la resolución por env, **añadir** lectura de
    `SEED_PRODUCT_TYPES` (ver archivo final abajo en ISS-08 si
    consolidás).

**PARCHE** — `src/database/seeders/index.ts` **ya existe**.

1.  **Debajo de** imports de client, **añadir** import de
    `seedProductTypes`.
2.  **Debajo de** `await seedClients(...)`, **añadir**
    `await seedProductTypes(counts.product_types);`

------------------------------------------------------------------------

## 18.6 Swagger CommitteeDecisions

``` bash
: > src/features/business/committee-decisions/committee-decision.swagger.ts
cat >> src/features/business/committee-decisions/committee-decision.swagger.ts <<'EOF'
/**
 * Documentación OpenAPI del feature CommitteeDecision.
 * Se agrega desde `src/swagger` (registry externo), no se monta aquí.
 *
 * Leyenda: endpoints documentados como SIN AUTH (sin middleware JWT).
 */

export const committeeDecisionSwagger = {
  tags: [
    {
      name: "CommitteeDecisions",
      description:
        "CRUD de decisiones del comité — **SIN AUTH** (sin middleware JWT)",
    },
  ],

  paths: {
    "/api/committee-decisions": {
      get: {
        tags: ["CommitteeDecisions"],
        summary: "Listar decisiones del comité activas",
        description: "SIN AUTH — retorna decisiones con status=active",
        security: [],
        responses: {
          "200": {
            description: "Lista de decisiones del comité",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    committee_decisions: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/CommitteeDecision",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      post: {
        tags: ["CommitteeDecisions"],
        summary: "Crear decisión del comité",
        description: "SIN AUTH",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CommitteeDecisionCreate",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Decisión del comité creada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    committee_decision: {
                      $ref: "#/components/schemas/CommitteeDecision",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/committee-decisions/{id}": {
      get: {
        tags: ["CommitteeDecisions"],
        summary: "Obtener decisión del comité por id",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Decisión encontrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    committee_decision: {
                      $ref: "#/components/schemas/CommitteeDecision",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "No encontrada",
          },
        },
      },

      put: {
        tags: ["CommitteeDecisions"],
        summary: "Actualizar decisión del comité (PUT — reemplazo)",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CommitteeDecisionUpdate",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Actualizada",
          },
          "404": {
            description: "No encontrada",
          },
        },
      },

      patch: {
        tags: ["CommitteeDecisions"],
        summary: "Actualizar decisión del comité (PATCH — parcial)",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CommitteeDecisionPatch",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Actualizada",
          },
          "404": {
            description: "No encontrada",
          },
        },
      },

      delete: {
        tags: ["CommitteeDecisions"],
        summary: "Eliminar decisión del comité (físico)",
        description: "SIN AUTH — elimina la fila",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Eliminada",
          },
          "404": {
            description: "No encontrada",
          },
        },
      },
    },

    "/api/committee-decisions/{id}/deactivate": {
      patch: {
        tags: ["CommitteeDecisions"],
        summary: "Eliminar decisión del comité (lógico)",
        description: "SIN AUTH — status = cancelled",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Cancelada",
          },
          "404": {
            description: "No encontrada",
          },
        },
      },
    },
  },

  components: {
    schemas: {
      CommitteeDecision: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          credit_application_id: {
            type: "integer",
            example: 1,
          },
          decision: {
            type: "string",
            enum: ["pending", "approved", "rejected", "observed"],
            example: "approved",
          },
          decision_date: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          comments: {
            type: "string",
            nullable: true,
            example: "Solicitud aprobada por el comité.",
          },
          decided_by: {
            type: "integer",
            nullable: true,
            example: 1,
          },
          status: {
            type: "string",
            enum: ["active", "cancelled"],
            example: "active",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },

      CommitteeDecisionCreate: {
        type: "object",
        required: ["credit_application_id"],
        properties: {
          credit_application_id: {
            type: "integer",
            example: 1,
          },
          decision: {
            type: "string",
            enum: ["pending", "approved", "rejected", "observed"],
            default: "pending",
          },
          decision_date: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          comments: {
            type: "string",
            nullable: true,
          },
          decided_by: {
            type: "integer",
            nullable: true,
          },
          status: {
            type: "string",
            enum: ["active", "cancelled"],
            default: "active",
          },
        },
      },

      CommitteeDecisionUpdate: {
        type: "object",
        required: ["credit_application_id"],
        properties: {
          credit_application_id: {
            type: "integer",
          },
          decision: {
            type: "string",
            enum: ["pending", "approved", "rejected", "observed"],
          },
          decision_date: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          comments: {
            type: "string",
            nullable: true,
          },
          decided_by: {
            type: "integer",
            nullable: true,
          },
          status: {
            type: "string",
            enum: ["active", "cancelled"],
          },
        },
      },

      CommitteeDecisionPatch: {
        type: "object",
        properties: {
          credit_application_id: {
            type: "integer",
          },
          decision: {
            type: "string",
            enum: ["pending", "approved", "rejected", "observed"],
          },
          decision_date: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          comments: {
            type: "string",
            nullable: true,
          },
          decided_by: {
            type: "integer",
            nullable: true,
          },
          status: {
            type: "string",
            enum: ["active", "cancelled"],
          },
        },
      },
    },
  },
};
EOF
```

![](images/clipboard-4086901700.png)

**PARCHE** — `src/swagger/index.ts` **ya existe**.

1.  **Debajo de** `import { clientSwagger } ...`, **añadir** import de
    `productTypeSwagger`.
2.  **Dentro de** `featureSwaggerModules`, **debajo de**
    `clientSwagger,`, **añadir** `productTypeSwagger,`.

### Cierre del ISS

``` bash
npm run dev
```

> ![](images/clipboard-1956241875.png)
>
> ![](images/clipboard-3466061318.png)
>
> El servidor debe arrancar sin error. Detenerlo con Ctrl+C antes de
> continuar.

------------------------------------------------------------------------

# 19. ISS-14 — Feature Audit (auditoría)

**Objetivo:** Registro de auditoría + seeder + swagger de Audit.\
**Bloqueado por:** entidades y usuarios necesarios para
`actor_user_id`.\
**API:** `/api/audits` — **SIN AUTH**.\
**Patrón:** mismo patrón estructural utilizado en los features
anteriores, adaptado a la entidad Audit.

### Criterios de aceptación (ISS-14)

-   [x] **19.1** Modelo `audit.model.ts` con los campos `actor_user_id`,
    `action`, `entity`, `entity_id`, `data` + `timestamps: true`
-   [x] **19.2** Controller + routes en este orden: getAll, getOne,
    create
-   [x] **19.3** Carpeta `http/` en el mismo orden: get, create
-   [x] **19.4** Cableado en `routes/index.ts` + `config` (import
    model + route)
-   [x] **19.5** Seeder + registro en SeedersRunner / counts
-   [x] **19.6** Swagger + registro en `src/swagger`

``` bash
mkdir -p src/features/business/audit/http
```

------------------------------------------------------------------------

## 19.1 Modelo Audit

``` bash
: > src/features/business/audit/audit.model.ts
cat >> src/features/business/audit/audit.model.ts << 'EOF'
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

export interface AuditI {
  id?: number;
  actor_user_id: number;
  action: string;
  entity: string;
  entity_id: number;
  data?: string | null;
  createdAt?: Date;
}

export class Audit extends Model {
  public id!: number;
  public actor_user_id!: number;
  public action!: string;
  public entity!: string;
  public entity_id!: number;
  public data!: string | null;
  public readonly createdAt!: Date;
}

Audit.init(
  {
    actor_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entity_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    data: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Audit",
    tableName: "audits",
    timestamps: true,
    updatedAt: false,
  }
);
EOF
```

![](images/clipboard-3761433972.png)

------------------------------------------------------------------------

## 19.2 Controller + routes (CRUD completo)

``` bash
: > src/features/business/audit/audit.controller.ts
cat >> src/features/business/audit/audit.controller.ts << 'EOF'
import { Request, Response } from "express";
import { Audit, AuditI } from "./audit.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

export class AuditController {
  // ================== READ ==================
  public async getAll(req: Request, res: Response) {
    try {
      const audits = await Audit.findAll({
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json({ audits });
    } catch (error) {
      res.status(500).json({
        error: "Error fetching audits",
        detail: String(error),
      });
    }
  }

  public async getOne(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const audit = await Audit.findByPk(id);

      if (!audit) {
        res.status(404).json({
          error: "Audit not found",
        });
        return;
      }

      res.status(200).json({ audit });
    } catch (error) {
      res.status(500).json({
        error: "Error fetching audit",
        detail: String(error),
      });
    }
  }

  // ================== CREATE ==================
  public async create(req: Request, res: Response) {
    try {
      const body = req.body as AuditI;

      const audit = await Audit.create({
        actor_user_id: body.actor_user_id,
        action: body.action,
        entity: body.entity,
        entity_id: body.entity_id,
        data: body.data ?? null,
      });

      res.status(201).json({ audit });
    } catch (error) {
      res.status(500).json({
        error: "Error creating audit",
        detail: String(error),
      });
    }
  }
}
EOF
```

![](images/clipboard-3475821435.png)

``` bash
: > src/features/business/audit/audit.routes.ts
cat >> src/features/business/audit/audit.routes.ts << 'EOF'
import { Application } from "express";
import { AuditController } from "./audit.controller";

export class AuditRoutes {
  public auditController: AuditController = new AuditController();

  public routes(app: Application): void {
    // ================== RUTAS SIN AUTENTICACIÓN ==================

    // getAll
    app
      .route("/api/audits")
      .get(this.auditController.getAll.bind(this.auditController));

    // getOne
    app
      .route("/api/audits/:id")
      .get(this.auditController.getOne.bind(this.auditController));

    // create
    app
      .route("/api/audits")
      .post(this.auditController.create.bind(this.auditController));
  }
}
EOF
```

![](images/clipboard-3744348897.png)

------------------------------------------------------------------------

## 19.3 HTTP (REST Audit)

``` bash
: > src/features/business/audit/http/audits.get.http
cat >> src/features/business/audit/http/audits.get.http << 'EOF'
### Feature Audit — GET ALL / GET ONE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000
@id = 1

# @name getAllAudits
GET {{baseUrl}}/api/audits

###

# @name getOneAudit
GET {{baseUrl}}/api/audits/{{id}}
EOF
```

![](images/clipboard-3809278081.png)

``` bash
: > src/features/business/audit/http/audits.create.http
cat >> src/features/business/audit/http/audits.create.http << 'EOF'
### Feature Audit — CREATE
### Leyenda: SIN AUTH (sin middleware JWT / sin autenticación)
@baseUrl = http://localhost:4000

# @name createAudit
POST {{baseUrl}}/api/audits
Content-Type: application/json

{
  "actor_user_id": 1,
  "action": "CREATE",
  "entity": "CreditApplication",
  "entity_id": 1,
  "data": "{\"message\":\"Credit application created\"}"
}
EOF
```

![](images/clipboard-1270102962.png)

------------------------------------------------------------------------

## 19.4 Cableado Routes + Config

**PARCHE** — `src/routes/index.ts` **ya existe**.

1.  **Debajo de** `import { ClientRoutes } ...`, **añadir**:

``` ts
import { ProductTypeRoutes } from "../features/business/product-type/product-type.routes";
```

2.  **Dentro de** `export class Routes`, **debajo de** `clientRoutes`,
    **añadir**:

``` ts
  public productTypeRoutes: ProductTypeRoutes = new ProductTypeRoutes();
```

**PARCHE** — `src/config/index.ts` **ya existe**.

1.  **Debajo de** `import "../features/business/client/client.model";`,
    **añadir**:

``` ts
import "../features/business/product-type/product-type.model";
```

2.  **Dentro de** `routes()`, **debajo de**
    `this.routePrv.clientRoutes.routes(this.app);`, **añadir**:

``` ts
    this.routePrv.productTypeRoutes.routes(this.app);
```

### Verificación

``` bash
curl -s -X POST http://localhost:4000/api/audits \
  -H 'Content-Type: application/json' \
  -d '{"actor_user_id":1,"action":"CREATE","entity":"CreditApplication","entity_id":1,"data":"{\"message\":\"Credit application created\"}"}'
```

![](images/clipboard-1403331527.png)

------------------------------------------------------------------------

## 19.5 Seeder Audit

``` bash
: > src/features/business/audit/audit.seeder.ts
cat >> src/features/business/audit/audit.seeder.ts << 'EOF'
import { faker } from "@faker-js/faker";
import { Audit } from "./audit.model";

/**
 * Seeder del feature Audit (datos falsos con @faker-js/faker).
 * Se invoca desde `src/database/seeders` (SeedersRunner), no desde la App.
 *
 * Idempotente: si ya hay filas, no vuelve a insertar.
 */
export async function seedAudits(count: number): Promise<number> {
  if (count <= 0) {
    console.log("⏭️  audits: count=0, se omite");
    return 0;
  }

  const existing = await Audit.count();

  if (existing > 0) {
    console.log(
      `⏭️  audits: ya hay ${existing} registro(s), se omite seeder`
    );
    return 0;
  }

  const actions = ["CREATE", "APPROVE", "REJECT", "UPDATE", "REVERSE"];
  const entities = [
    "CreditApplication",
    "Credit",
    "Movement",
    "Payment",
  ];

  const rows = Array.from({ length: count }, () => ({
    actor_user_id: faker.number.int({ min: 1, max: 5 }),
    action: faker.helpers.arrayElement(actions),
    entity: faker.helpers.arrayElement(entities),
    entity_id: faker.number.int({ min: 1, max: 10 }),
    data: JSON.stringify({
      message: faker.lorem.sentence(),
      source: "seed",
    }),
  }));

  await Audit.bulkCreate(rows);

  console.log(`✅ audits: insertados ${count} registro(s) falsos`);
  return count;
}
EOF
```

![](images/clipboard-3088325449.png)

**PARCHE** — `src/database/seeders/counts.ts` **ya existe**.

-   **Dentro de** `SeedCounts`, **añadir** `product_types: number;`
-   **Dentro de** `DEFAULT_SEED_COUNTS`, **añadir** `product_types: 25,`
-   **Dentro de** la resolución por env, **añadir** lectura de
    `SEED_PRODUCT_TYPES` (ver archivo final abajo en ISS-08 si
    consolidás).

**PARCHE** — `src/database/seeders/index.ts` **ya existe**.

1.  **Debajo de** imports de client, **añadir** import de
    `seedProductTypes`.
2.  **Debajo de** `await seedClients(...)`, **añadir**
    `await seedProductTypes(counts.product_types);`

------------------------------------------------------------------------

## 19.6 Swagger ProductType

``` bash
: > src/features/business/audit/audit.swagger.ts
cat >> src/features/business/audit/audit.swagger.ts << 'EOF'
/**
 * Documentación OpenAPI del feature Audit.
 * Se agrega desde `src/swagger` (registry externo), no se monta aquí.
 *
 * Leyenda: endpoints documentados como SIN AUTH (sin middleware JWT).
 */

export const auditSwagger = {
  tags: [
    {
      name: "Audit",
      description: "Registro de auditoría — **SIN AUTH** (sin middleware JWT)",
    },
  ],
  paths: {
    "/api/audits": {
      get: {
        tags: ["Audit"],
        summary: "Listar registros de auditoría",
        description: "SIN AUTH — retorna los registros de auditoría ordenados por fecha descendente",
        security: [],
        responses: {
          "200": {
            description: "Lista de registros de auditoría",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    audits: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Audit",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Audit"],
        summary: "Crear registro de auditoría",
        description: "SIN AUTH — registra una operación realizada sobre una entidad",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AuditCreate",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Registro de auditoría creado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    audit: {
                      $ref: "#/components/schemas/Audit",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/audits/{id}": {
      get: {
        tags: ["Audit"],
        summary: "Obtener registro de auditoría por id",
        description: "SIN AUTH",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "Registro de auditoría encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    audit: {
                      $ref: "#/components/schemas/Audit",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Registro de auditoría no encontrado",
          },
        },
      },
    },
  },

  components: {
    schemas: {
      Audit: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          actor_user_id: {
            type: "integer",
            example: 1,
          },
          action: {
            type: "string",
            example: "CREATE",
          },
          entity: {
            type: "string",
            example: "CreditApplication",
          },
          entity_id: {
            type: "integer",
            example: 1,
          },
          data: {
            type: "string",
            example: "{\"message\":\"Credit application created\"}",
            nullable: true,
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
        },
      },

      AuditCreate: {
        type: "object",
        required: [
          "actor_user_id",
          "action",
          "entity",
          "entity_id",
        ],
        properties: {
          actor_user_id: {
            type: "integer",
            example: 1,
          },
          action: {
            type: "string",
            example: "CREATE",
          },
          entity: {
            type: "string",
            example: "CreditApplication",
          },
          entity_id: {
            type: "integer",
            example: 1,
          },
          data: {
            type: "string",
            example: "{\"message\":\"Credit application created\"}",
            nullable: true,
          },
        },
      },
    },
  },
};
EOF
```

![](images/clipboard-3762306305.png)

**PARCHE** — `src/swagger/index.ts` **ya existe**.

1.  **Debajo de** `import { clientSwagger } ...`, **añadir** import de
    `productTypeSwagger`.
2.  **Dentro de** `featureSwaggerModules`, **debajo de**
    `clientSwagger,`, **añadir** `productTypeSwagger,`.

### Cierre del ISS

``` bash
npm run dev
```

> ![](images/clipboard-2944188332.png)
>
> ## ![](images/clipboard-2768112993.png)

ISS-09-base-seguridad-auth.md \<\< 'MDEOF' \# Fase II: Auth con RBAC —
ISS-09 — Base de seguridad compartida y modelos Auth

# 20. ISS-15 — Auth — Base de seguridad compartida y modelos Auth

## Contenido de este ISS

-   20.1 Dependencias y variables de entorno
-   20.2 `password.ts` (bcrypt 12 rondas + SHA-256 + token opaco)
-   20.3 `jwt.ts` (firma/verificación HS256 con iss/aud/exp/jti)
-   20.4 `resource-match.ts` (normalizador y matcher de rutas
    parametrizadas)
-   20.5 `auth-user.ts` (extensión de Request + `requireAuthUser`)
-   20.6 `error-response.ts` (mapper único error → HTTP) y PARCHE de
    `BaseController`
-   20.7 `swagger-security.ts` (esquema `bearerAuth` + respuestas
    401/403)
-   20.8 Los seis modelos Sequelize
-   20.9 `rbac.associations.ts` (grafo de relaciones)
-   20.10 Cableado de modelos en config y seeders

**Objetivo:** dejar listas las primitivas de seguridad (hash de
contraseña, hashes de tokens opacos, firma y verificación de JWT,
matcher de rutas) y las seis tablas del modelo RBAC con sus
asociaciones, de modo que los ISS posteriores solo construyan capas
sobre esta base.

**Bloqueado por:** Fase I cerrada (el `App`, `Routes`, `SeedersRunner` y
Swagger ya existen y se extienden, no se reescriben).

## Principios que fija este ISS

### 1. No existe la entidad `Permission`

La autorización se modela como un grafo:

``` text
User
 │  N:M  (RoleUser)
 ↓
Role
 │  N:M  (ResourceRole)
 ↓
Resource
```

Por tanto:

``` text
Role + Resource = permiso concedido
```

Ejemplo: el rol `SELLER` concede el recurso `POST /api/ventas`; eso es
el permiso «SELLER puede crear ventas». No hay una fila «permiso»
intermedia que haya que mantener sincronizada.

### 2. Las tres modalidades de acceso (se deciden por ruta, no globalmente)

| Modalidad | Qué exige | Middleware | Ejemplos |
|------------------|------------------|------------------|------------------|
| **OPEN** | nada | — | `POST /api/sesion/login`, `/refresh`, `/logout`, `/api/docs` |
| **JWT** | access token válido | `authenticate` | `GET /api/sesion/perfil`, `/api/permisos`, `/api/sesiones/*` |
| **JWT + RBAC** | token válido y concesión activa de `(method, path)` | `authenticate` + `authorize` | todo el CRUD de negocio y de administración |

### 3. `status`

`status` es `'active' | 'inactive'` en las seis tablas, igual que en
Fase I. Un registro `inactive` es invisible para la API y, en RBAC, no
autoriza.

### 4. Deny by default

Sin concesión explícita, la respuesta es **403**. No existe lista de
excepciones ni «rol comodín».

## Criterios de aceptación (ISS-15) — consolidados

-   [x] **20.1** `.env` define `JWT_SECRET`, `JWT_ACCESS_TTL` y
    `JWT_REFRESH_TTL_DAYS`; `jsonwebtoken` y `@types/jsonwebtoken`
    instalados
-   [x] **20.2** `src/shared/auth/password.ts` con `hashPassword`,
    `verifyPassword`, `sha256Hex`, `generateOpaqueToken`
-   [x] **20.3** `src/shared/auth/jwt.ts` firma y verifica con HS256,
    issuer, audience, expiresIn y jti
-   [x] **20.4** `src/shared/auth/resource-match.ts` casa
    `/api/productos/42` con el patrón `/api/productos/:id`
-   [x] **20.5** `src/shared/auth/auth-user.ts` declara `Request.auth` y
    exporta `requireAuthUser`
-   [x] **20.6** `sendError` centraliza error → HTTP; `BaseController`
    lo reutiliza
-   [x] **20.7** `bearerSecurityScheme`, `unauthorizedResponse` y
    `forbiddenResponse` exportados
-   [x] **20.8** los 6 modelos (`User`, `Role`, `Resource`, `RoleUser`,
    `ResourceRole`, `RefreshToken`) con sus UK e índices
-   [x] **20.9** `rbac.associations.ts` declara el grafo completo
    (User↔Role, Role↔Resource, User→RefreshToken)
-   [x] **20.10** `config/index.ts` y `seeders/index.ts` importan los
    modelos y las asociaciones, en ese orden
-   [x] `npx tsc --noEmit` OK

------------------------------------------------------------------------

## 20.1 Dependencias y variables de entorno

``` bash
# Paquetes (una vez). bcryptjs ya venía de Fase I.
npm install jsonwebtoken@^9.0.3
npm install -D @types/jsonwebtoken@^9.0.10
```

![](images/clipboard-3019816901.png)

Variables nuevas del `.env` (**PARCHE:** se añaden al final, no
reemplazan las de Fase I):

``` bash
cat >> .env << 'EOF'
# ─────────────────────────────────────────────────────────────
# Fase II — Seguridad (JWT + RBAC)
# ─────────────────────────────────────────────────────────────
# Secreto de firma del access token (HMAC SHA-256). Mínimo 32 caracteres.
# En producción: generar con `openssl rand -base64 48` y NO versionarlo.
JWT_SECRET=storelab-lab-secret-change-me-0123456789abcdef
# Vida útil del access token en segundos (900 = 15 min).
JWT_ACCESS_TTL=900
# Vida útil del refresh token en días.
JWT_REFRESH_TTL_DAYS=7
EOF
```

`JWT_ACCESS_TTL` se expresa en **segundos** y `JWT_REFRESH_TTL_DAYS` en
**días**: son unidades distintas a propósito (el access token es de
minutos; el refresh, de días). El service las convierte a milisegundos
al persistir `expires_at`.

![](images/clipboard-1693129992.png)

------------------------------------------------------------------------

## 20.2 `password.ts` — hash de contraseña y hashes de tokens

Tres responsabilidades, todas de la capa `shared` (no son propias de un
feature):

-   `hashPassword` / `verifyPassword`: bcrypt con **12 rondas** (coste
    alto, deliberado).
-   `sha256Hex`: para los refresh tokens, que no se guardan en claro
    sino como hash.
-   `generateOpaqueToken`:
    `crypto.randomBytes(...).toString("base64url")` → token opaco (no
    JWT).

``` bash
: > src/shared/auth/password.ts
cat >> src/shared/auth/password.ts << 'EOF'
import { hash, compare } from "bcryptjs";

/**
 * Derivación y verificación de contraseñas (bcrypt).
 *
 * Se centraliza aquí porque lo usan tres sitios distintos y **debe** usar los
 * mismos parámetros en los tres:
 *  - el hook `beforeCreate/beforeUpdate` del modelo `User` (hash al persistir);
 *  - el service de usuarios al cambiar la contraseña;
 *  - el login, que compara la credencial en memoria (nunca la devuelve).
 *
 * Coste 12 rondas: el valor de referencia del diseño de la base de datos
 * (`docs/bd-storelab.md` §14.1). Es un compromiso entre coste de CPU del servidor
 * y coste de fuerza bruta para un atacante que obtuviera el hash.
 */
const SALT_ROUNDS = 12;

/** Devuelve el hash bcrypt de una contraseña en claro. */
export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, SALT_ROUNDS);
}

/** `true` si la contraseña en claro corresponde al hash almacenado. */
export async function comparePassword(plain: string, passwordHash: string): Promise<boolean> {
  return compare(plain, passwordHash);
}

/**
 * Hash determinista (SHA-256, hex) para credenciales de **alta entropía**.
 *
 * Se usa con los refresh tokens, no con contraseñas: un token aleatorio de 64
 * bytes no es adivinable, así que no necesita un algoritmo lento; basta con
 * impedir que el valor en claro quede en la base de datos. Esto permite, además,
 * buscar por índice único (`token_hash`) en O(1).
 */
import { createHash, randomBytes } from "node:crypto";

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Genera un token opaco no adivinable (URL-safe, 64 bytes ≈ 86 caracteres). */
export function generateOpaqueToken(): string {
  return randomBytes(64).toString("base64url");
}
EOF
```

![](images/clipboard-3118512937.png)

------------------------------------------------------------------------

## 20.3 `jwt.ts` — firma y verificación del access token

**¿Por qué JWT aquí y token opaco para el refresh?** El access token
viaja en cada petición y debe validarse sin tocar la BD (*stateless*):
JWT firmado. El refresh token, en cambio, debe poder **revocarse**; por
eso es opaco y se persiste (hasheado) en `refresh_tokens`.

``` bash
: > src/shared/auth/jwt.ts
cat >> src/shared/auth/jwt.ts << 'EOF'
import jwt, { JwtPayload } from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { AppError } from "../errors/app-error";

/**
 * Emisión y verificación del access token (JWT firmado, HS256).
 */

const ALGORITHM = "HS256";

/** Emisor/audiencia del sistema. */
export const TOKEN_ISSUER = "app-storelab-express";
export const TOKEN_AUDIENCE = "app-storelab-api";

/** Vida útil del access token en segundos. */
export const ACCESS_TOKEN_TTL_SECONDS = Number(
  process.env.JWT_ACCESS_TTL ?? 900
);

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  username: string;
  jti: string;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new AppError(
      500,
      "JWT_SECRET no configurado (mínimo 32 caracteres). Ver .env"
    );
  }

  return secret;
}

/** Firma un access token para un usuario. */
export function signAccessToken(user: {
  id: number;
  username: string;
}): {
  token: string;
  expiresIn: number;
} {
  const token = jwt.sign(
    { username: user.username },
    getSecret(),
    {
      algorithm: ALGORITHM,
      subject: String(user.id),
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      jwtid: randomUUID(),
    }
  );

  return {
    token,
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
  };
}

/**
 * Verifica firma y claims y devuelve el payload.
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  let payload: JwtPayload;

  try {
    payload = jwt.verify(token, getSecret(), {
      algorithms: [ALGORITHM],
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
      clockTolerance: 5,
    }) as JwtPayload;
  } catch {
    throw new AppError(401, "Invalid or expired access token");
  }

  if (
    typeof payload.sub !== "string" ||
    !/^[1-9]\d*$/.test(payload.sub) ||
    typeof payload.jti !== "string" ||
    payload.jti.length === 0
  ) {
    throw new AppError(401, "Invalid or expired access token");
  }

  return payload as AccessTokenPayload;
}

/** Extrae el token de Authorization: Bearer <token>. */
export function extractBearerToken(
  header: string | undefined
): string | null {
  if (!header) return null;

  const [scheme, value] = header.split(" ");

  if (!scheme || !value || scheme.toLowerCase() !== "bearer") {
    return null;
  }

  return value;
}
EOF
```

![](images/clipboard-4261754311.png)

### Puntos de seguridad (alineados con RFC 8725, JSON Web Token Best Current Practices)

| Práctica | Cómo se aplica |
|------------------------------------|------------------------------------|
| Fijar el algoritmo | `algorithm: "HS256"` explícito al firmar y al verificar (`algorithms: ["HS256"]`) → evita `alg: none` y confusión de algoritmos |
| Emisor y audiencia | `issuer: "storelab"` y `audience: "storelab-api"`; se exigen al verificar |
| Caducidad | `expiresIn: JWT_ACCESS_TTL` |
| Identificador único | claim `jti` (permite trazabilidad/correlación) |
| Carga útil mínima | solo `sub` (id), `username` y `jti`; **nunca roles ni permisos** |

> **Los roles NO viajan en el token.** Si viajaran, revocar un permiso
> no tendría efecto hasta que caducara el token. La autorización se
> resuelve en cada petición contra la matriz (ISS-13), lo que hace la
> revocación inmediata (RFC 6749 / OWASP).

------------------------------------------------------------------------

## 20.4 `resource-match.ts` — casar la petición con el recurso

Un recurso es un par `(method, path)` con el path en patrón:
`/api/productos/:id`. El middleware `authorize` recibe la petición real
(`GET /api/productos/42`) y debe encontrar el recurso. Este módulo hace
esa traducción:

-   `normalizePath`: quita barra final, query string y colapsa barras
    repetidas.
-   `pathMatches`: comprueba un patrón contra un path real (segmento a
    segmento).
-   `isOperationGranted`: decisión final del RBAC sobre el conjunto de
    concesiones.

``` bash
: > src/shared/auth/resource-match.ts
cat >> src/shared/auth/resource-match.ts << 'EOF'
/**
 * Coincidencia entre la ruta de una petición y un recurso almacenado.
 *
 * Un recurso se guarda como patrón (method + path con parámetros).
 *
 * Ejemplo:
 * GET /api/productos/:id
 *
 * Y la petición real:
 * GET /api/productos/42
 *
 * Reglas:
 * - El verbo HTTP debe coincidir.
 * - Un segmento :param coincide con un solo segmento.
 * - Los demás segmentos deben coincidir exactamente.
 * - La cantidad de segmentos debe ser igual.
 */

/** Normaliza una ruta: sin query string, hash, barra final ni barras duplicadas. */
export function normalizePath(path: string): string {
  const withoutQuery = path.split("?")[0].split("#")[0];
  const single = withoutQuery.replace(/\/{2,}/g, "/");
  const trimmed = single.replace(/\/+$/, "");

  return trimmed === "" ? "/" : trimmed;
}

/** true si path concreto coincide con pattern que puede contener :param. */
export function pathMatches(pattern: string, path: string): boolean {
  const patternParts = normalizePath(pattern).split("/");
  const pathParts = normalizePath(path).split("/");

  if (patternParts.length !== pathParts.length) return false;

  for (let i = 0; i < patternParts.length; i++) {
    const p = patternParts[i];

    if (p.startsWith(":")) continue;

    if (p !== pathParts[i]) return false;
  }

  return true;
}

/**
 * true si los recursos concedidos permiten ejecutar la operación solicitada.
 *
 * Deny by default:
 * si ningún recurso coincide, devuelve false.
 */
export function isOperationGranted(
  granted: ReadonlyArray<{ method: string; path: string }>,
  method: string,
  path: string
): boolean {
  const upper = method.toUpperCase();

  return granted.some(
    (resource) =>
      resource.method.toUpperCase() === upper &&
      pathMatches(resource.path, path)
  );
}
EOF
```

![](images/clipboard-4090507783.png)

## 20.5 `auth-user.ts` — la identidad en `Request`

Extiende el tipo `Request` de Express con `auth` y expone
`requireAuthUser`, que los controllers JWT usan para leer al usuario sin
adivinar si el middleware corrió.

``` bash
: > src/shared/auth/auth-user.ts
cat >> src/shared/auth/auth-user.ts << 'EOF'
import { Request } from "express";
import { AppError } from "../errors/app-error";

/**
 * Identidad resuelta que los middlewares de acceso dejan en la petición.
 */
export interface AuthUser {
  id: number;
  username: string;
  email?: string;
  /** Token con el que se autenticó. */
  tokenId?: string;
}

/**
 * Devuelve la identidad de la petición o falla con 401.
 */
export function requireAuthUser(req: Request): AuthUser {
  if (!req.auth) {
    throw new AppError(401, "Authentication required");
  }

  return req.auth;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Identidad resuelta por el middleware authenticate. */
      auth?: AuthUser;
    }
  }
}

export {};
EOF
```

![](images/clipboard-3470105092.png)

------------------------------------------------------------------------

## 20.6 `error-response.ts` y PARCHE de `BaseController`

El mapeo error → HTTP deja de vivir solo en el controller: lo necesitan
también los middlewares `authenticate`/`authorize`. Se extrae a un único
punto (`sendError`) y `BaseController` lo reutiliza.

``` bash
: > src/shared/http/error-response.ts
cat >> src/shared/http/error-response.ts << 'EOF'
import { Response } from "express";
import { AppError } from "../errors/app-error";

/**
 * Traduce cualquier error a una respuesta HTTP. **Único punto** del proyecto
 * donde se decide el mapeo error -> status.
 *
 * Lo usan los dos sitios que pueden fallar antes de llegar a un controller:
 *  - `BaseController.handleError` (handlers de los controllers);
 *  - los middlewares de acceso (`authenticate` / `authorize`), que responden
 *    401/403 sin pasar por un controller.
 *
 * Regla: `AppError` -> su `statusCode`; cualquier otra cosa -> **500** (y el
 * detalle solo en el cuerpo, nunca el stack).
 */
export function sendError(res: Response, error: unknown): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }
  res.status(500).json({ error: "Internal server error", detail: String(error) });
}
EOF
```

![](images/clipboard-2072213680.png)

**PARCHE** en `src/shared/http/base-controller.ts`: `handleError` delega
en `sendError`.

``` bash
: > src/shared/http/base-controller.ts
cat >> src/shared/http/base-controller.ts << 'EOF'
import { Request, Response } from "express";
import { AppError } from "../errors/app-error";
import { sendError } from "./error-response";

/**
 * Base de los controllers HTTP.
 *
 * Aísla las tres responsabilidades puramente HTTP que, si no, se repetirían
 * en los métodos de cada controller:
 *
 * - run: ejecuta el handler y traduce el error a HTTP.
 * - paramId: lee y valida el :id de la URL.
 * - handleError: delega el mapeo de errores a sendError.
 */
export abstract class BaseController {
  /**
   * Ejecuta el cuerpo de un handler y centraliza el manejo de errores.
   */
  protected async run(
    res: Response,
    work: () => Promise<void>
  ): Promise<void> {
    try {
      await work();
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * Lee el :id de la URL y lo valida como entero positivo.
   */
  protected paramId(req: Request): number {
    const raw = req.params.id;
    const value = Array.isArray(raw) ? raw[0] : raw;

    if (!value || !/^\d+$/.test(value) || Number(value) < 1) {
      throw new AppError(
        400,
        "Invalid id: must be a positive integer"
      );
    }

    return Number(value);
  }

  /**
   * Delega el mapeo de errores en sendError.
   */
  protected handleError(
    res: Response,
    error: unknown
  ): void {
    sendError(res, error);
  }
}
EOF
```

![](images/clipboard-1363301817.png)

------------------------------------------------------------------------

## 20.7 `swagger-security.ts` — seguridad reutilizable para OpenAPI

| Export | Para qué |
|------------------------------------|------------------------------------|
| `bearerSecurityScheme` | Esquema `bearerAuth` (`Authorization: Bearer <token>`, RFC 6750) |
| `unauthorizedResponse` | Respuesta 401 reutilizable (`$ref`) |
| `forbiddenResponse` | Respuesta 403 reutilizable (`$ref`) |

``` bash
: > src/shared/http/swagger-security.ts
cat >> src/shared/http/swagger-security.ts << 'EOF'
/**
 * Piezas reutilizables de OpenAPI para las tres modalidades de acceso.
 */

/** Esquema de seguridad (RFC 6750: Authorization: Bearer <token>). */
export const bearerSecurityScheme = {
  bearerAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description:
      "Access token JWT obtenido en `POST /api/sesion/login`. Enviar como " +
      "`Authorization: Bearer <access_token>`. Vida útil corta (por defecto 15 min); " +
      "se renueva con `POST /api/sesion/refresh`.",
  },
};

/** security de un endpoint OPEN. */
export const openSecurity: unknown[] = [];

/** security de un endpoint JWT o RBAC. */
export const bearerSecurity = [{ bearerAuth: [] }];

/** Respuesta 401. */
export const unauthorizedResponse = {
  description:
    "401 No autenticado — falta el Bearer token, el token es inválido/expiró o el usuario está inactivo",
};

/** Respuesta 403. */
export const forbiddenResponse = {
  description:
    "403 Prohibido — autenticado, pero sin concesión activa para esta operación (deny by default)",
};

/** Respuesta 400 ante un :id inválido. */
export const invalidIdResponse = {
  description: "400 id inválido (debe ser un entero positivo)",
};

/** Respuesta 404 estándar. */
export const notFoundResponse = {
  description: "404 No encontrado",
};
EOF
```

![](images/clipboard-798391442.png)

------------------------------------------------------------------------

## 20.8 Los seis modelos Sequelize

| Entidad | Tabla | Responsabilidad |
|------------------------|------------------------|------------------------|
| `User` | `users` | identidad del usuario (contraseña hasheada) |
| `Role` | `roles` | agrupación de responsabilidades |
| `RoleUser` | `role_users` | asignación User ↔ Role (N:M) |
| `Resource` | `resources` | endpoint/acción protegible, `(method, path)` |
| `ResourceRole` | `resource_roles` | **el permiso**: concesión Role ↔ Resource (N:M) |
| `RefreshToken` | `refresh_tokens` | sesión renovable y revocable |

### `User`

``` bash
: > src/features/auth/users/user.model.ts
cat >> src/features/auth/users/user.model.ts << 'EOF'
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";
import { hashPassword } from "../../../shared/auth/password";

/**
 * Modelo User (tabla users) — identidad del sistema.
 *
 * La contraseña nunca se guarda en texto plano.
 * El hash se genera mediante los hooks de Sequelize.
 */
export interface UserI {
  id?: number;
  username: string;
  email: string;
  password: string;
  avatar?: string | null;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends Model {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public avatar!: string | null;
  public status!: "active" | "inactive";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    username: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: "uq_users_username",
      validate: {
        notEmpty: { msg: "Username cannot be empty" },
        len: {
          args: [3, 80],
          msg: "Username must be between 3 and 80 characters",
        },
      },
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: "uq_users_email",
      validate: {
        isEmail: {
          msg: "Email must be a valid email address",
        },
      },
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Password cannot be empty",
        },
      },
    },

    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "inactive",
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,

    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          user.password = await hashPassword(user.password);
        }
      },

      beforeUpdate: async (user: User) => {
        if (user.changed("password") && user.password) {
          user.password = await hashPassword(user.password);
        }
      },

      beforeBulkCreate: async (users: User[]) => {
        for (const user of users) {
          if (user.password) {
            user.password = await hashPassword(user.password);
          }
        }
      },

      beforeValidate: (user: User) => {
        if (user.username) {
          user.username = user.username.trim().toLowerCase();
        }

        if (user.email) {
          user.email = user.email.trim().toLowerCase();
        }
      },
    },
  }
);
EOF
```

![](images/clipboard-3409480782.png)

### `Role`

``` bash
: > src/features/auth/roles/role.model.ts
cat >> src/features/auth/roles/role.model.ts << 'EOF'
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

/**
 * Modelo `Role` (tabla `roles`) — agrupador lógico de responsabilidades.
 *
 * Nota de diseño: **el nombre del rol no autoriza nada**. La autorización se
 * decide por las concesiones (`resource_roles`) asociadas al rol. Un rol
 * `ADMIN` sin concesiones activas no habilita ninguna operación.
 */
export interface RoleI {
  id?: number;
  name: string;
  description?: string | null;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

export class Role extends Model {
  public id!: number;
  public name!: string;
  public description!: string | null;
  public status!: "active" | "inactive";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Role.init(
  {
    name: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: "uq_roles_name",
      validate: {
        notEmpty: { msg: "Role name cannot be empty" },
      },
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "inactive",
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Role",
    tableName: "roles",
    timestamps: true,
    hooks: {
      // El nombre del rol se normaliza a MAYÚSCULAS (ADMIN, SELLER, BUYER):
      // es un identificador funcional, no una etiqueta libre.
      beforeValidate: (role: Role) => {
        if (role.name) role.name = role.name.trim().toUpperCase();
      },
    },
  }
);
EOF
```

![](images/clipboard-3059295985.png)

### `Resource`

``` bash
: > src/features/auth/resources/resource.model.ts
cat >> src/features/auth/resources/resource.model.ts << 'EOF'
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";
import { normalizePath } from "../../../shared/auth/resource-match";

/**
 * Modelo `Resource` (tabla `resources`) — un punto de acceso protegible.
 *
 * Un recurso **no** es una entidad de negocio: es el par `(method, path)`.
 * `GET /api/productos` y `POST /api/productos` son **dos recursos distintos**.
 *
 * Las rutas se guardan con el patrón, no con el valor concreto:
 * `/api/productos/:id`. Así no se crea una fila por cada identificador y la
 * coincidencia se resuelve por patrón (`shared/auth/resource-match.ts`).
 */
export interface ResourceI {
  id?: number;
  method: string;
  path: string;
  description?: string | null;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

export class Resource extends Model {
  public id!: number;
  public method!: string;
  public path!: string;
  public description!: string | null;
  public status!: "active" | "inactive";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Resource.init(
  {
    method: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        isIn: {
          args: [["GET", "POST", "PUT", "PATCH", "DELETE"]],
          msg: "Method must be one of GET, POST, PUT, PATCH, DELETE",
        },
      },
    },
    path: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Path cannot be empty" },
      },
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "inactive",
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Resource",
    tableName: "resources",
    timestamps: true,
    // Clave única compuesta: el mismo verbo con distinta ruta (o al revés) son
    // recursos distintos, pero la tupla exacta no se repite.
    indexes: [
      {
        name: "uq_resources_method_path",
        unique: true,
        fields: ["method", "path"],
      },
    ],
    hooks: {
      // Normalización: verbo en mayúsculas y ruta sin barra final ni duplicados,
      // para que la comparación por patrón sea determinista.
      beforeValidate: (resource: Resource) => {
        if (resource.method) resource.method = resource.method.trim().toUpperCase();
        if (resource.path) resource.path = normalizePath(resource.path.trim());
      },
    },
  }
);
EOF
```

![](images/clipboard-2551152978.png)

### `RoleUser`

``` bash
: > src/features/auth/role-users/role-user.model.ts
cat >> src/features/auth/role-users/role-user.model.ts << 'EOF'
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

/**
 * Modelo `RoleUser` (tabla `role_users`) — asignación N:M `User` ↔ `Role`.
 *
 * Es el **primer eslabón** de la cadena de autorización. Un usuario sin filas
 * activas aquí no tiene ningún permiso granular, aunque tenga roles asignados
 * con estado `inactive`.
 *
 * La restricción única `(user_id, role_id)` impide duplicar la asignación:
 * revocar y volver a conceder se hace cambiando `status`, no insertando filas.
 */
export interface RoleUserI {
  id?: number;
  user_id: number;
  role_id: number;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

export class RoleUser extends Model {
  public id!: number;
  public user_id!: number;
  public role_id!: number;
  public status!: "active" | "inactive";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RoleUser.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "inactive",
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "RoleUser",
    tableName: "role_users",
    timestamps: true,
    indexes: [
      { name: "uq_role_users_user_role", unique: true, fields: ["user_id", "role_id"] },
      { name: "ix_role_users_user_id", fields: ["user_id"] },
      { name: "ix_role_users_role_id", fields: ["role_id"] },
    ],
  }
);
EOF
```

![](images/clipboard-4120273375.png)

### `ResourceRole`

``` bash
: > src/features/auth/resource-roles/resource-role.model.ts
cat >> src/features/auth/resource-roles/resource-role.model.ts << 'EOF'
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

/**
 * Modelo `ResourceRole` (tabla `resource_roles`) — la **concesión** `Role` ↔ `Resource`.
 *
 * Esta tabla **es el permiso**. No existe una entidad `Permission`: el permiso
 * es la tupla `(rol, recurso)` materializada aquí.
 *
 * - Conceder acceso   -> insertar o reactivar una fila.
 * - Retirar acceso    -> `status = inactive`.
 * - Cambiar la matriz -> no requiere código ni despliegue.
 */
export interface ResourceRoleI {
  id?: number;
  role_id: number;
  resource_id: number;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

export class ResourceRole extends Model {
  public id!: number;
  public role_id!: number;
  public resource_id!: number;
  public status!: "active" | "inactive";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ResourceRole.init(
  {
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    resource_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "inactive",
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ResourceRole",
    tableName: "resource_roles",
    timestamps: true,
    indexes: [
      {
        name: "uq_resource_roles_role_resource",
        unique: true,
        fields: ["role_id", "resource_id"],
      },
      { name: "ix_resource_roles_role_id", fields: ["role_id"] },
      { name: "ix_resource_roles_resource_id", fields: ["resource_id"] },
    ],
  }
);
EOF
```

![](images/clipboard-660469051.png)

### `RefreshToken`

``` bash
: > src/features/auth/refresh-tokens/refresh-token.model.ts
cat >> src/features/auth/refresh-tokens/refresh-token.model.ts << 'EOF'
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

/**
 * Modelo `RefreshToken` (tabla `refresh_tokens`) — sesión renovable y revocable.
 *
 * Es el **único** artefacto de sesión que se persiste. El access token (JWT) es
 * autocontenido y no se guarda.
 *
 * Campos de seguridad:
 *  - `token_hash`: solo se almacena el SHA-256 del token opaco. Aunque se
 *    filtrara la tabla, no se puede reconstruir un token utilizable. Permite
 *    buscar por índice único en O(1).
 *  - `family_id`: agrupa todos los tokens derivados de un mismo login por
 *    rotación. Si un token ya rotado se reutiliza, se revoca **toda la familia**
 *    (detección de reutilización, Owasp/OAuth2).
 *  - `expires_at`: vigencia; un token vencido se trata como inválido.
 *  - `device_info`: soporte de auditoría y de listado de sesiones por dispositivo.
 *
 * Desviación deliberada: `status` predetermina **`active`**. Un token recién
 * emitido nace vigente por definición, a diferencia del resto de tablas.
 */
export interface RefreshTokenI {
  id?: number;
  user_id: number;
  token_hash: string;
  family_id: string;
  device_info?: string | null;
  expires_at: Date;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

export class RefreshToken extends Model {
  public id!: number;
  public user_id!: number;
  public token_hash!: string;
  public family_id!: string;
  public device_info!: string | null;
  public expires_at!: Date;
  public status!: "active" | "inactive";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RefreshToken.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "uq_refresh_tokens_token_hash",
    },
    family_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    device_info: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      // Única tabla cuyo estado por defecto es `active` (ver doc del modelo).
      defaultValue: "active",
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "RefreshToken",
    tableName: "refresh_tokens",
    timestamps: true,
    indexes: [
      { name: "ix_refresh_tokens_family_id", fields: ["family_id"] },
      { name: "ix_refresh_tokens_user_id", fields: ["user_id"] },
    ],
  }
);
EOF
```

![](images/clipboard-2833108669.png)

------------------------------------------------------------------------

## 20.9 `rbac.associations.ts` — el grafo en un solo lugar

Las asociaciones se declaran **después** de los modelos (referencian a
los modelos, no al revés) y en un único archivo para que el grafo se lea
entero:

``` text
User N:M Role   mediante RoleUser
User 1:N RefreshToken
Role N:M Resource mediante ResourceRole
```

``` bash
: > src/features/auth/rbac.associations.ts
cat >> src/features/auth/rbac.associations.ts << 'EOF'
import { User } from "./users/user.model";
import { Role } from "./roles/role.model";
import { Resource } from "./resources/resource.model";
import { RoleUser } from "./role-users/role-user.model";
import { ResourceRole } from "./resource-roles/resource-role.model";
import { RefreshToken } from "./refresh-tokens/refresh-token.model";

/**
 * Asociaciones de las seis entidades de seguridad.
 *
 * Se declaran en un solo archivo (y no dispersas por feature) porque la
 * autorización es una **cadena** que atraviesa cinco tablas; verla junta hace
 * evidente el camino que recorre la consulta de permisos:
 *
 * ```text
 * ResourceRole ──► Role ──► RoleUser ──► (filtro por user_id)
 *        │
 *        └────────► Resource  ──► (method, path)
 * ```
 *
 * Los alias (`as`) son los que usan los `include` de los repositories, así que
 * cambiar un alias aquí obliga a revisar las consultas RBAC.
 */

// --- La concesión conoce su rol y su recurso (los dos extremos del permiso) ---
ResourceRole.belongsTo(Role, { foreignKey: "role_id", as: "role" });
ResourceRole.belongsTo(Resource, { foreignKey: "resource_id", as: "resource" });
Role.hasMany(ResourceRole, { foreignKey: "role_id", as: "resource_roles" });
Resource.hasMany(ResourceRole, { foreignKey: "resource_id", as: "resource_roles" });

// --- La asignación conoce su usuario y su rol (primer eslabón de la cadena) ---
RoleUser.belongsTo(User, { foreignKey: "user_id", as: "user" });
RoleUser.belongsTo(Role, { foreignKey: "role_id", as: "role" });
User.hasMany(RoleUser, { foreignKey: "user_id", as: "role_users" });
Role.hasMany(RoleUser, { foreignKey: "role_id", as: "role_users" });

// --- Las sesiones pertenecen a un usuario ---
RefreshToken.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(RefreshToken, { foreignKey: "user_id", as: "refresh_tokens" });
EOF
```

![](images/clipboard-3453728890.png)

------------------------------------------------------------------------

## 20.10 Cableado de modelos en config y seeders

**PARCHE** en `src/config/index.ts` — los seis modelos, y después las
asociaciones:

``` bash
cat >> src/config/index.ts << 'EOF'
import dotenv from "dotenv";
import express, { Application, ErrorRequestHandler } from "express";
import morgan from "morgan";
var cors = require("cors");
import { sequelize, getDatabaseInfo, testConnection } from "../database/db";
import "../features/business/clients/client.model";
import "../features/business/product-types/product-type.model";
import "../features/business/products/product.model";
import "../features/business/sales/sale.model";
import "../features/business/product-sales/product-sale.model";
import "../features/business/products/products.associations";
import "../features/business/sales/sales.associations";
import "../features/business/product-sales/product-sales.associations";
// Fase II — Auth con RBAC: primero los seis modelos, después las asociaciones
// (las asociaciones referencian los modelos, no al revés).
import "../features/auth/users/user.model";
import "../features/auth/roles/role.model";
import "../features/auth/resources/resource.model";
import "../features/auth/role-users/role-user.model";
import "../features/auth/resource-roles/resource-role.model";
import "../features/auth/refresh-tokens/refresh-token.model";
import "../features/auth/rbac.associations";
import { Routes } from "../routes/index";
import { setupSwagger } from "../swagger/index";

dotenv.config();

export class App {
  public app: Application;
  public routePrv: Routes = new Routes();

  constructor(private port?: number | string) {
    this.app = express();
    this.settings();
    this.middlewares();
    this.routes();
    this.docs();
    this.errorHandling();
  }

  private settings(): void {
    this.app.set('port', this.port || process.env.PORT || 4000);
  }

  private middlewares(): void {
    this.app.use(morgan('dev'));
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  private routes(): void {
    // Fase I — Business (cada operación, modalidad JWT + RBAC)
    this.routePrv.clientsRoutes.routes(this.app);
    this.routePrv.productTypesRoutes.routes(this.app);
    this.routePrv.productsRoutes.routes(this.app);
    this.routePrv.salesRoutes.routes(this.app);
    this.routePrv.productSalesRoutes.routes(this.app);

    // Fase II — Auth con RBAC
    // `sessionRoutes` registra los endpoints OPEN/JWT (login, refresh, logout,
    // perfil, permisos); el resto son modalidad JWT + RBAC.
    this.routePrv.sessionRoutes.routes(this.app);
    this.routePrv.refreshTokensRoutes.routes(this.app);
    this.routePrv.usersRoutes.routes(this.app);
    this.routePrv.rolesRoutes.routes(this.app);
    this.routePrv.resourcesRoutes.routes(this.app);
    this.routePrv.roleUsersRoutes.routes(this.app);
    this.routePrv.resourceRolesRoutes.routes(this.app);
  }

  private docs(): void {
    setupSwagger(this.app);
  }

  /**
   * Errores que ocurren **antes** de llegar a un controller o middleware.
   *
   * El caso típico es un cuerpo JSON malformado: `express.json()` lanza un
   * `SyntaxError` que, sin manejador, cae en el de Express por defecto y responde
   * 400 con un HTML que incluye el **stack trace y rutas absolutas del servidor**
   * (fuga de información). Aquí se traduce a un 400 JSON limpio.
   *
   * Debe registrarse **después** de las rutas: Express reconoce un middleware de
   * error por su aridad de 4 argumentos.
   */
  private errorHandling(): void {
    const bodyErrorHandler: ErrorRequestHandler = (err, _req, res, next) => {
      if (err instanceof SyntaxError && "body" in err) {
        res.status(400).json({ error: "Malformed JSON body" });
        return;
      }
      next(err);
    };
    this.app.use(bodyErrorHandler);
  }

  private async dbConnection(): Promise<void> {
    try {
      const dbInfo = getDatabaseInfo();
      console.log(`🔗 Intentando conectar a: ${dbInfo.engine.toUpperCase()}`);

      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error(`No se pudo conectar a la base de datos ${dbInfo.engine.toUpperCase()}`);
      }

      // Lab: sync crea/altera tablas desde los modelos (BD limpia → snake_case desde cero).
      const force = process.env.DB_SYNC_FORCE === "true";
      const isMysql =
        sequelize.getDialect() === "mysql" || sequelize.getDialect() === "mariadb";

      if (isMysql) {
        await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
      }
      try {
        await sequelize.sync({ force, alter: !force });
      } finally {
        if (isMysql) {
          await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
        }
      }

      console.log(
        force
          ? "📦 Base de datos recreada (DB_SYNC_FORCE=true)"
          : "📦 Base de datos sincronizada exitosamente"
      );
    } catch (error) {
      console.error("❌ Error al conectar con la base de datos:", error);
      process.exit(1);
    }
  }

  async listen() {
    // Orden de arranque: primero la BD (conexión + `sync`), después abrir el puerto.
    // Si se abre el puerto antes de terminar `sync({ alter: true })`, las sentencias
    // DDL (ALTER TABLE, DROP/ADD FOREIGN KEY) compiten con las peticiones que ya
    // están entrando y provocan deadlocks y errores de FK intermitentes.
    await this.dbConnection();
    await this.app.listen(this.app.get('port'));
    console.log(`🚀 Servidor ejecutándose en puerto ${this.app.get('port')}`);
  }
}
EOF
```

![](images/clipboard-1469887696.png)

**PARCHE** en `src/database/seeders/index.ts` — mismo bloque de imports
(los seeders de auth se añaden en sus ISS). **El orden importa:**
Sequelize solo conoce las asociaciones que se han declarado.

> El detalle de estos dos archivos completos, ya con las rutas y los
> seeders de todos los ISS, está en `18-cierre-auth.md`.

------------------------------------------------------------------------

## Verificación

``` bash
npx tsc --noEmit
npm run db:seed
npm run dev


mysql -h 172.22.186.72 -P 3306 -u admin -p solia-express_mysql -e "SHOW TABLES LIKE '%role%'; SHOW TABLES LIKE 'users'; SHOW TABLES LIKE 'resources'; SHOW TABLES LIKE 'refresh_tokens';"
```

## DoD del ISS-15

-   [x] Todos los criterios de aceptación (14.1 … 14.10) cumplidos
-   [x] `npx tsc --noEmit` sin errores
-   [x] `npm run db:seed` crea `users`, `roles`, `resources`,
    `role_users`, `resource_roles`, `refresh_tokens` con sus UK
-   [x] `npm run dev` arranca el servidor
-   [x] Sin endpoints nuevos todavía: la API de Fase I sigue funcionando
    SIN AUTH (la protección llega en ISS-13) MDEOF echo "Creado:
    ISS-09-base-seguridad-auth.md"

![](images/clipboard-3780902098.png)

![](images/clipboard-1240184245.png)

![](images/clipboard-2561893165.png)

------------------------------------------------------------------------

# 21. Auth con RBAC — ISS-16 — Feature Users (identidad y contraseña)

## Contexto mínimo (autosuficiente)

Si abres este archivo aislado —o lo llevas a otra IA—, esto es lo que
hay que saber antes de ejecutarlo.

-   **Proyecto:** `app-solia-express_mysql` — Express 5 + TypeScript +
    Sequelize, arquitectura por features.
-   **Ya construido:** Fase I (Business) y, en ISS-09, las primitivas de
    seguridad y los seis modelos de Auth con sus asociaciones.
-   **Recorrido obligatorio de una petición:** HTTP → Controller →
    Service → Repository → Model → Sequelize → BD. Ninguna capa se salta
    a la siguiente.
-   **Diseño de datos (Fase II):** `../bd-solia.md` §14.1 (users).
-   **Capas, convenciones y reglas transversales:** `00-contexto.md`.

| Este ISS            |                                           |
|---------------------|-------------------------------------------|
| **Título**          | Feature Users (identidad y contraseña)    |
| **Feature / tabla** | `features/auth/users/` · `users`          |
| **API**             | `/api/usuarios…` (JWT + RBAC)             |
| **Depende de**      | ISS-09 — Base de seguridad y modelos Auth |
| **Habilita**        | ISS-11 — Features Roles y Resources       |

## Contenido de este ISS

-   15.1 DTOs del feature (`dto/`)
-   15.2 Repository
-   15.3 Service (hash, unicidad y permisos efectivos)
-   15.4 Controller
-   15.5 Rutas (JWT + RBAC)
-   15.6 Seeder (usuarios canónicos)
-   15.7 Swagger
-   15.8 Pruebas HTTP

**Objetivo:** construir el CRUD de identidades como un feature más
(mismas 4 capas y mismo contrato DTO que los de Fase I), con dos
diferencias clave: la contraseña nunca entra ni sale en claro, y el
service expone una consulta de permisos efectivos que recorre el grafo
RBAC.

**Bloqueado por:** ISS-09 (modelo `User` y `rbac.associations.ts`).

## Criterios de aceptación (ISS-16) — consolidados

-   [x] **21.1** carpeta `dto/` con `create-user.dto.ts`,
    `update-user.dto.ts`, `patch-user.dto.ts`, `change-password.dto.ts`,
    `user-response.dto.ts` e `index.ts`
-   [x] **21.2** `users.repository.ts` accede a Sequelize con
    `UserEntity`; incluye `findByUsernameOrEmail`
-   [x] **21.3** `users.service.ts`: hashea al crear/actualizar, valida
    unicidad de `username`/`email` (409) y ofrece
    `getEffectivePermissions`
-   [x] **21.4** `users.controller.ts`: usa `this.run(res, …)` y
    `this.paramId(req)`; nunca devuelve el hash
-   [x] **21.5** `users.routes.ts` protege todas las operaciones con
    `authenticate, authorize`
-   [x] **21.6** `users.seeder.ts` crea `admin` y `seller` de forma
    idempotente
-   [x] **21.7** `users.swagger.ts` documenta los 9 endpoints con
    `security: bearerAuth`
-   [x] **21.8** archivos `.http` de lectura y escritura
-   [x] `npx tsc --noEmit` OK

------------------------------------------------------------------------

## 15.1 DTOs del feature

Contrato de la API (el repository no los conoce):

``` bash
: > src/features/auth/users/dto/create-user.dto.ts
cat >> src/features/auth/users/dto/create-user.dto.ts << 'EOF'
/**
 * Datos de entrada de `POST /api/usuarios`.
 *
 * `status` es opcional y por defecto `active` (como en business). Después de
 * crear el usuario, el estado solo cambia con el borrado lógico.
 */
export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  avatar?: string | null;
  status?: "active" | "inactive";
}
EOF

: > src/features/auth/users/dto/update-user.dto.ts
cat >> src/features/auth/users/dto/update-user.dto.ts << 'EOF'
/**
 * Datos de entrada de `PUT /api/usuarios/:id` (reemplazo completo).
 *
 * Ni `password` ni `status` están aquí, a propósito:
 *  - la contraseña tiene su propia operación (`PATCH /api/usuarios/:id/password`),
 *    porque cambiar una credencial exige verificar la anterior;
 *  - el estado solo cambia con el borrado lógico (`/deactivate`).
 */
export interface UpdateUserDto {
  username: string;
  email: string;
  avatar?: string | null;
}
EOF

: > src/features/auth/users/dto/patch-user.dto.ts
cat >> src/features/auth/users/dto/patch-user.dto.ts << 'EOF'
import { UpdateUserDto } from "./update-user.dto";

/** Datos de entrada de `PATCH /api/usuarios/:id` (actualización parcial). */
export type PatchUserDto = Partial<UpdateUserDto>;
EOF

: > src/features/auth/users/dto/change-password.dto.ts
cat >> src/features/auth/users/dto/change-password.dto.ts << 'EOF'
/**
 * Datos de entrada de `PATCH /api/usuarios/:id/password`.
 *
 * Exige la contraseña **actual** además de la nueva. Es una defensa en
 * profundidad: aunque el RBAC autorice la operación, nadie puede cambiar la
 * credencial de otro usuario sin conocerla (evita que un administrador
 * comprometido rote contraseñas ajenas sin más).
 */
export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
}
EOF

: > src/features/auth/users/dto/user-response.dto.ts
cat >> src/features/auth/users/dto/user-response.dto.ts << 'EOF'
import { User, UserI } from "../user.model";

/**
 * Respuesta HTTP de un usuario.
 *
 * Regla del DTO: `password` **nunca** sale de la API. El repositorio ni siquiera
 * lo proyecta en las lecturas (`attributes: { exclude: ["password"] }`), pero el
 * mapper lo elimina igualmente por si el modelo se cargó con el hash (p. ej. al
 * cambiar la contraseña). Doble red: el tipo no lo permite y el mapper lo borra.
 */
export type UserResponseDto = Omit<UserI, "password">;

/** Mapper modelo -> DTO de respuesta (objeto plano; elimina `password`). */
export function toUserResponse(user: User): UserResponseDto {
  const { password, ...safe } = user.toJSON() as UserI & { password?: string };
  return safe;
}
EOF

: > src/features/auth/users/dto/index.ts
cat >> src/features/auth/users/dto/index.ts << 'EOF'
export * from "./create-user.dto";
export * from "./update-user.dto";
export * from "./patch-user.dto";
export * from "./change-password.dto";
export * from "./user-response.dto";
EOF
```

Regla transversal que se mantiene: `status` no viaja en `UpdateUserDto`
ni en `PatchUserDto`. Solo cambia al crear o con el borrado lógico
`/deactivate`.

`change-password.dto.ts` es específico del cambio de contraseña (no es
un patch del recurso): exige la contraseña actual y la nueva, y permite
`revoke_sessions` para cerrar las sesiones abiertas del usuario.

![](images/clipboard-2000526588.png)

------------------------------------------------------------------------

## 21.2 Repository

Única capa que usa Sequelize. Además del CRUD genérico, aporta
`findByUsernameOrEmail`, que necesita el login (ISS-15): acepta usuario
o correo en un solo campo.

``` bash
: > src/features/auth/users/users.repository.ts
cat >> src/features/auth/users/users.repository.ts << 'EOF'
import { CreationAttributes, Op, Transaction } from "sequelize";
import { User } from "./user.model";

/**
 * Capa Repository del feature Users.
 *
 * Única que habla con Sequelize (el modelo `User`). No contiene reglas de
 * negocio ni conoce `req`/`res`.
 *
 * Detalle de seguridad: las lecturas **normales** excluyen `password` en la
 * proyección SQL. Solo dos consultas lo incluyen, ambas con nombre explícito en
 * su firma (`...WithPassword`), de modo que un `findById` cualquiera jamás puede
 * devolver el hash por descuido.
 */
export class UsersRepository {
  /** Proyección sin credencial: la que usan todas las lecturas de API. */
  private static readonly WITHOUT_PASSWORD = { exclude: ["password"] };

  /** Todos los usuarios activos (sin `password`). */
  public async findAllActive(): Promise<User[]> {
    return User.findAll({
      where: { status: "active" },
      attributes: UsersRepository.WITHOUT_PASSWORD,
    });
  }

  /** Un usuario por PK (o `null`), sin `password`. Acepta transacción. */
  public async findById(id: number, transaction?: Transaction): Promise<User | null> {
    return User.findByPk(id, {
      attributes: UsersRepository.WITHOUT_PASSWORD,
      transaction,
    });
  }

  /** Un usuario por PK **con** su hash. Uso exclusivo: cambio de contraseña. */
  public async findByIdWithPassword(id: number): Promise<User | null> {
    return User.findByPk(id);
  }

  /**
   * Un usuario por `username` **o** `email`, con su hash.
   *
   * Uso exclusivo: validación de credenciales en el login (única operación que
   * lee la credencial). Normaliza el identificador a minúsculas para casar con
   * el valor almacenado.
   */
  public async findByIdentifierWithPassword(identifier: string): Promise<User | null> {
    const value = identifier.trim().toLowerCase();
    return User.findOne({
      where: { [Op.or]: [{ username: value }, { email: value }] },
    });
  }

  /** Busca por `username` o `email` (sin `password`) para detectar duplicados. */
  public async findConflicts(username: string, email: string): Promise<User[]> {
    return User.findAll({
      where: {
        [Op.or]: [
          { username: username.trim().toLowerCase() },
          { email: email.trim().toLowerCase() },
        ],
      },
      attributes: ["id", "username", "email"],
    });
  }

  /** Inserta un usuario (el hook del modelo hashea `password`). */
  public async create(data: CreationAttributes<User>): Promise<User> {
    return User.create(data);
  }

  /** Persiste cambios sobre una instancia existente. */
  public async update(user: User, data: Partial<User>): Promise<User> {
    return user.update(data);
  }

  /** Elimina físicamente una instancia. */
  public async delete(user: User): Promise<void> {
    await user.destroy();
  }
}
EOF
```

![](images/clipboard-1077225353.png)

------------------------------------------------------------------------

## 21.3 Service

Aquí viven las reglas de `User`:

-   Nunca se guarda la contraseña en claro (`hashPassword`, bcrypt 12).
-   `username` y `email` son únicos: si ya existen, `AppError(409, …)`.
-   Al actualizar, si llega `password` se vuelve a hashear; si no llega,
    se conserva.
-   El borrado lógico (`deactivate`) no borra el hash: el registro queda
    inactivo e invisible.
-   `getEffectivePermissions` recorre el grafo y devuelve la lista de
    `(method, path)` vigentes.

``` bash
: > src/features/auth/users/users.service.ts
cat >> src/features/auth/users/users.service.ts << 'EOF'
import {
  ChangePasswordDto,
  CreateUserDto,
  PatchUserDto,
  UpdateUserDto,
  UserResponseDto,
  toUserResponse,
} from "./dto";
import { UsersRepository } from "./users.repository";
import { User } from "./user.model";
import { AppError } from "../../../shared/errors/app-error";
import { comparePassword } from "../../../shared/auth/password";
import { ResourceRolesService } from "../resource-roles/resource-roles.service";
import { EffectivePermissionDto } from "../resource-roles/dto";

/**
 * Capa Service del feature Users.
 *
 * Reglas de negocio: unicidad de `username`/`email`, default de `status`,
 * política de borrado lógico, cambio de credencial y consulta de permisos
 * efectivos (que delega en el feature `resource-roles`: el permiso es una
 * concesión rol-recurso, no un atributo del usuario).
 *
 * No conoce `req`/`res` ni escribe Sequelize directamente.
 */
export class UsersService {
  public constructor(
    private readonly repository: UsersRepository = new UsersRepository(),
    private readonly resourceRolesService: ResourceRolesService = new ResourceRolesService()
  ) {}

  // ================== READ ==================
  public async getAll(): Promise<UserResponseDto[]> {
    const users = await this.repository.findAllActive();
    return users.map((user) => toUserResponse(user));
  }

  public async getOne(id: number): Promise<UserResponseDto> {
    return toUserResponse(await this.findOrFail(id));
  }

  /** Permisos efectivos del usuario (cadena RBAC completa). 404 si no existe. */
  public async getEffectivePermissions(id: number): Promise<EffectivePermissionDto[]> {
    await this.findOrFail(id);
    return this.resourceRolesService.findEffectiveForUser(id);
  }

  // ================== CREATE ==================
  public async create(body: CreateUserDto): Promise<UserResponseDto> {
    await this.assertUnique(body.username, body.email);

    // Copia campo a campo: solo lo que declara el DTO llega al modelo
    // (evita *mass assignment*, p. ej. inyectar un `id` o un `status` raro).
    const user = await this.repository.create({
      username: body.username,
      email: body.email,
      password: body.password,
      avatar: body.avatar ?? null,
      status: body.status ?? "active",
    });
    return toUserResponse(user);
  }

  // ================== UPDATE ==================
  public async updatePut(id: number, body: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.findOrFail(id);
    await this.assertUnique(body.username, body.email, id);

    await this.repository.update(user, {
      username: body.username,
      email: body.email,
      avatar: body.avatar ?? null,
    });
    return toUserResponse(user);
  }

  public async updatePatch(id: number, body: PatchUserDto): Promise<UserResponseDto> {
    const user = await this.findOrFail(id);

    const username = body.username ?? user.username;
    const email = body.email ?? user.email;
    await this.assertUnique(username, email, id);

    await this.repository.update(user, body);
    return toUserResponse(user);
  }

  /**
   * Cambia la contraseña de un usuario.
   *
   * Verifica la credencial actual antes de aceptar la nueva. El hash lo vuelve a
   * calcular el hook `beforeUpdate` del modelo al detectar el campo cambiado.
   */
  public async changePassword(id: number, body: ChangePasswordDto): Promise<void> {
    if (!body.current_password || !body.new_password) {
      throw new AppError(400, "current_password and new_password are required");
    }

    const user = await this.repository.findByIdWithPassword(id);
    if (!user || user.status !== "active") {
      throw new AppError(404, "User not found");
    }

    const matches = await comparePassword(body.current_password, user.password);
    if (!matches) {
      throw new AppError(400, "Current password is incorrect");
    }

    await this.repository.update(user, { password: body.new_password });
  }

  // ================== DELETE ==================
  /** Eliminación física. */
  public async deletePhysical(id: number): Promise<void> {
    const user = await this.findOrFail(id, false);
    await this.repository.delete(user);
  }

  /** Eliminación lógica -> `status = inactive`. */
  public async deleteLogical(id: number): Promise<UserResponseDto> {
    const user = await this.findOrFail(id);
    await this.repository.update(user, { status: "inactive" });
    return toUserResponse(user);
  }

  // ================== HELPERS ==================
  /** Busca por PK y falla con 404. `onlyActive` aplica la política de borrado lógico. */
  private async findOrFail(id: number, onlyActive = true): Promise<User> {
    const user = await this.repository.findById(id);
    if (!user || (onlyActive && user.status !== "active")) {
      throw new AppError(404, "User not found");
    }
    return user;
  }

  /**
   * Comprueba que `username` y `email` no estén tomados por **otro** usuario.
   *
   * `excludeId` permite excluir al propio usuario en las actualizaciones. Se
   * hace antes de escribir para responder 409 con un mensaje útil en lugar de
   * dejar que la restricción única de la BD reviente como un 500.
   */
  private async assertUnique(
    username: string,
    email: string,
    excludeId?: number
  ): Promise<void> {
    const conflicts = await this.repository.findConflicts(username, email);
    const taken = conflicts.find((candidate) => candidate.id !== excludeId);

    if (!taken) return;
    if (taken.username === username.trim().toLowerCase()) {
      throw new AppError(409, "Username already in use");
    }
    throw new AppError(409, "Email already in use");
  }
}
EOF
```

![](images/clipboard-3776411667.png)

La consulta de permisos efectivos es la misma lógica que usará el
middleware `authorize` en ISS-13: partir del usuario y quedarse solo con
los recursos alcanzables por filas activas en toda la cadena.

``` text
User → (role_users.status = 'active') → Role → (resource_roles.status = 'active') → Resource
                                              con Role.status = 'active' y Resource.status = 'active'
```

------------------------------------------------------------------------

## 21.4 Controller

HTTP puro: `this.run(res, …)`, `this.paramId(req)` y `findOrFail` en el
service. Expone dos operaciones que no son CRUD: cambio de contraseña y
permisos efectivos.

``` bash
: > src/features/auth/users/users.controller.ts
cat >> src/features/auth/users/users.controller.ts << 'EOF'
import { Request, Response } from "express";
import { BaseController } from "../../../shared/http/base-controller";
import {
  ChangePasswordDto,
  CreateUserDto,
  PatchUserDto,
  UpdateUserDto,
} from "./dto";
import { UsersService } from "./users.service";

/**
 * Capa Controller del feature Users.
 * Solo HTTP: lee `req`, llama al service y arma la respuesta.
 * El manejo de errores se delega en `run()` (ver `BaseController`).
 */
export class UsersController extends BaseController {
  public constructor(
    private readonly service: UsersService = new UsersService()
  ) {
    super();
  }

  // ================== READ ==================
  public async getAll(_req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const users = await this.service.getAll();
      res.status(200).json({ users });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const user = await this.service.getOne(this.paramId(req));
      res.status(200).json({ user });
    });
  }

  // ================== CREATE ==================
  public async create(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const user = await this.service.create(req.body as CreateUserDto);
      res.status(201).json({ user });
    });
  }

  // ================== UPDATE ==================
  public async updatePut(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const user = await this.service.updatePut(
        this.paramId(req),
        req.body as UpdateUserDto
      );
      res.status(200).json({ user });
    });
  }

  public async updatePatch(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const user = await this.service.updatePatch(
        this.paramId(req),
        req.body as PatchUserDto
      );
      res.status(200).json({ user });
    });
  }

  // ================== DELETE ==================
  /** Eliminación física. */
  public async deletePhysical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const id = this.paramId(req);
      await this.service.deletePhysical(id);
      res.status(200).json({ message: "User permanently deleted", id });
    });
  }

  /** Eliminación lógica -> `status = inactive`. */
  public async deleteLogical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const user = await this.service.deleteLogical(this.paramId(req));
      res.status(200).json({ message: "User deactivated (logical delete)", user });
    });
  }

  // ================== IDENTIDAD Y PERMISOS ==================
  /** Cambio de credencial (exige la contraseña actual). */
  public async changePassword(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const id = this.paramId(req);
      await this.service.changePassword(id, req.body as ChangePasswordDto);
      res.status(200).json({ message: "Password updated", id });
    });
  }

  /** Permisos efectivos del usuario: recursos concedidos por sus roles activos. */
  public async getEffectivePermissions(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const permissions = await this.service.getEffectivePermissions(this.paramId(req));
      res.status(200).json({ permissions });
    });
  }
}
EOF
```

![](images/clipboard-3338097997.png)

------------------------------------------------------------------------

## 21.5 Rutas (modalidad JWT + RBAC)

Todos los endpoints de administración de identidades están ellos mismos
protegidos por la matriz: no basta con estar autenticado, hay que tener
la concesión concreta (`GET /api/usuarios`, `POST /api/usuarios`, …).

``` bash
: > src/features/auth/users/users.routes.ts
cat >> src/features/auth/users/users.routes.ts << 'EOF'
import { Application } from "express";
import { UsersController } from "./users.controller";
import { authenticate, authorize } from "../access";

/**
 * Rutas del feature Users — **modalidad 3 (JWT + RBAC)** en todas las operaciones.
 *
 * La administración de identidades está ella misma protegida por la matriz de
 * permisos: no basta con estar autenticado, hay que tener la concesión concreta
 * (`GET /api/usuarios`, `POST /api/usuarios`, ...). El catálogo de recursos ya
 * incluye las 9 operaciones de este feature.
 */
export class UsersRoutes {
  public usersController: UsersController = new UsersController();

  public routes(app: Application): void {
    // getAll
    app
      .route("/api/usuarios")
      .get(authenticate, authorize, this.usersController.getAll.bind(this.usersController));

    // getOne
    app
      .route("/api/usuarios/:id")
      .get(authenticate, authorize, this.usersController.getOne.bind(this.usersController));

    // create
    app
      .route("/api/usuarios")
      .post(authenticate, authorize, this.usersController.create.bind(this.usersController));

    // update (PUT / PATCH)
    app
      .route("/api/usuarios/:id")
      .put(authenticate, authorize, this.usersController.updatePut.bind(this.usersController))
      .patch(authenticate, authorize, this.usersController.updatePatch.bind(this.usersController));

    // delete físico
    app
      .route("/api/usuarios/:id")
      .delete(
        authenticate,
        authorize,
        this.usersController.deletePhysical.bind(this.usersController)
      );

    // delete lógico
    app
      .route("/api/usuarios/:id/deactivate")
      .patch(
        authenticate,
        authorize,
        this.usersController.deleteLogical.bind(this.usersController)
      );

    // cambio de contraseña
    app
      .route("/api/usuarios/:id/password")
      .patch(
        authenticate,
        authorize,
        this.usersController.changePassword.bind(this.usersController)
      );

    // permisos efectivos del usuario
    app
      .route("/api/usuarios/:id/permisos")
      .get(
        authenticate,
        authorize,
        this.usersController.getEffectivePermissions.bind(this.usersController)
      );
  }
}
EOF
```

![](images/clipboard-3580334279.png)

------------------------------------------------------------------------

## 21.6 Seeder de usuarios canónicos

Dos usuarios de laboratorio, idempotentes (`findOrCreate` por
`username`), con contraseña hasheada. Son la puerta de entrada para
probar las tres modalidades.

``` bash
: > src/features/auth/users/users.seeder.ts
cat >> src/features/auth/users/users.seeder.ts << 'EOF'
import { User } from "./user.model";
import { faker } from "@faker-js/faker";

/**
 * Seeder de usuarios (`users`).
 *
 * Crea **dos usuarios canónicos** que sostienen toda la demostración de RBAC:
 *
 * | username | password    | rol    | permisos |
 * |----------|-------------|--------|----------|
 * | `admin`  | `Admin123!` | ADMIN  | 58 recursos |
 * | `seller` | `Seller123!`| SELLER | 7 recursos |
 *
 * Si `count > 2`, se añaden usuarios aleatorios (sin rol asignado): sirven para
 * comprobar que **estar autenticado no basta**: recibirán 403 en todo.
 *
 * Las contraseñas se guardan como **hash**: las hashea el hook `beforeCreate` del
 * modelo. Idempotente por `username`.
 */
export const SEED_USERS = [
  { username: "admin", email: "admin@storelab.local", password: "Admin123!" },
  { username: "seller", email: "seller@storelab.local", password: "Seller123!" },
] as const;

export async function seedUsers(count: number): Promise<number> {
  if (count <= 0) {
    console.log("⏭️  users: count=0, se omite");
    return 0;
  }

  let created = 0;

  for (const item of SEED_USERS) {
    const [user, wasCreated] = await User.findOrCreate({
      where: { username: item.username },
      defaults: {
        username: item.username,
        email: item.email,
        password: item.password,
        avatar: null,
        status: "active",
      },
    });
    if (wasCreated) {
      created++;
      continue;
    }
    // Reconciliación: igual que los seeders de roles y recursos, el de usuarios
    // **reactiva** los canónicos si quedaron inactivos. Así `npm run db:seed`
    // devuelve siempre el laboratorio a un estado operable.
    if (user.status !== "active") {
      await user.update({ status: "active" });
    }
  }

  const extras = Math.max(0, count - SEED_USERS.length);
  for (let i = 0; i < extras; i++) {
    const username = `user.${i}.${faker.string.alphanumeric(6)}`.toLowerCase();
    await User.create({
      username,
      email: `${username}@example.com`,
      password: "Password123!",
      avatar: null,
      status: "active",
    });
    created++;
  }

  console.log(`✅ users: insertados ${created} usuario(s) (2 canónicos + ${extras} aleatorios)`);
  return created;
}
EOF
```

| Usuario  | Contraseña   | Rol (asignado en ISS-12) | Permisos                |
|----------|--------------|--------------------------|-------------------------|
| `admin`  | `Admin123!`  | ADMIN                    | 58 recursos             |
| `seller` | `Seller123!` | SELLER                   | 7 recursos de operación |

------------------------------------------------------------------------

![](images/clipboard-263752434.png)

## 21.7 Swagger del feature

Los 9 endpoints (`GET/POST /api/usuarios`, `GET/PUT/PATCH/DELETE /:id`,
`/deactivate`, `/password`, `/:id/permisos`) documentados con
`security: [{ bearerAuth: [] }]` y las respuestas 401/403 reutilizables.

``` bash
: > src/features/auth/users/users.swagger.ts
cat >> src/features/auth/users/users.swagger.ts << 'EOF'
import {
  bearerSecurity,
  forbiddenResponse,
  invalidIdResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "../../../shared/http/swagger-security";

/**
 * Documentación OpenAPI del feature Users.
 *
 * Modalidad de **todas** las operaciones: **JWT + RBAC**. La administración de
 * identidades está protegida por la propia matriz de permisos: además de un
 * token válido, se exige la concesión del recurso `(method, path)`.
 */
export const usersSwagger = {
  tags: [
    {
      name: "Usuarios",
      description:
        "CRUD de identidades + cambio de contraseña + permisos efectivos — **JWT + RBAC**",
    },
  ],
  paths: {
    "/api/usuarios": {
      get: {
        tags: ["Usuarios"],
        summary: "Listar usuarios activos",
        description: "JWT + RBAC — recurso `GET /api/usuarios`. Nunca devuelve `password`.",
        security: bearerSecurity,
        responses: {
          "200": { description: "Lista de usuarios (`{ users: [...] }`)" },
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
        },
      },
      post: {
        tags: ["Usuarios"],
        summary: "Crear usuario",
        description:
          "JWT + RBAC — recurso `POST /api/usuarios`. El `password` se hashea (bcrypt, 12 rondas).",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UserCreate" } },
          },
        },
        responses: {
          "201": { description: "Usuario creado (`{ user }`)" },
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "409": { description: "`username` o `email` ya en uso" },
        },
      },
    },
    "/api/usuarios/{id}": {
      get: {
        tags: ["Usuarios"],
        summary: "Obtener usuario por id",
        description: "JWT + RBAC — recurso `GET /api/usuarios/:id`. 404 si no existe o está inactivo.",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Usuario (`{ user }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
      put: {
        tags: ["Usuarios"],
        summary: "Reemplazar usuario (PUT)",
        description: "JWT + RBAC — recurso `PUT /api/usuarios/:id`. No cambia `password` ni `status`.",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UserUpdate" } },
          },
        },
        responses: {
          "200": { description: "Usuario actualizado (`{ user }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
          "409": { description: "`username` o `email` ya en uso" },
        },
      },
      patch: {
        tags: ["Usuarios"],
        summary: "Modificar usuario (PATCH)",
        description: "JWT + RBAC — recurso `PATCH /api/usuarios/:id`. Actualización parcial.",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UserPatch" } },
          },
        },
        responses: {
          "200": { description: "Usuario actualizado (`{ user }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
      delete: {
        tags: ["Usuarios"],
        summary: "Eliminar usuario (físico)",
        description: "JWT + RBAC — recurso `DELETE /api/usuarios/:id`.",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Eliminado (`{ message, id }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
    },
    "/api/usuarios/{id}/deactivate": {
      patch: {
        tags: ["Usuarios"],
        summary: "Desactivar usuario (borrado lógico)",
        description:
          "JWT + RBAC — recurso `PATCH /api/usuarios/:id/deactivate`. " +
          "Efecto inmediato: la revalidación del middleware `authenticate` deja de reconocer al usuario (401).",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Desactivado (`{ message, user }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
    },
    "/api/usuarios/{id}/password": {
      patch: {
        tags: ["Usuarios"],
        summary: "Cambiar contraseña",
        description:
          "JWT + RBAC — recurso `PATCH /api/usuarios/:id/password`. " +
          "Exige `current_password`: ni un administrador puede cambiar una credencial ajena sin conocerla (defensa en profundidad).",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/ChangePassword" } },
          },
        },
        responses: {
          "200": { description: "Contraseña actualizada (`{ message, id }`)" },
          "400": { description: "Faltan campos o `current_password` incorrecta" },
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
    },
    "/api/usuarios/{id}/permisos": {
      get: {
        tags: ["Usuarios"],
        summary: "Permisos efectivos del usuario",
        description:
          "JWT + RBAC — recurso `GET /api/usuarios/:id/permisos`. Ejecuta la consulta de autorización " +
          "(`resource_roles → roles → role_users → resources`, todos los eslabones activos) y devuelve el par `(method, path)` de cada permiso.",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Permisos efectivos (`{ permissions: [...] }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
    },
  },
  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          username: { type: "string", example: "admin" },
          email: { type: "string", format: "email", example: "admin@storelab.local" },
          avatar: { type: "string", nullable: true, example: null },
          status: { type: "string", enum: ["active", "inactive"], example: "active" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      UserCreate: {
        type: "object",
        required: ["username", "email", "password"],
        properties: {
          username: { type: "string", minLength: 3, maxLength: 80, example: "nuevo.usuario" },
          email: { type: "string", format: "email", example: "nuevo@storelab.local" },
          password: { type: "string", format: "password", minLength: 8, example: "Password123!" },
          avatar: { type: "string", nullable: true },
          status: { type: "string", enum: ["active", "inactive"], default: "active" },
        },
      },
      UserUpdate: {
        type: "object",
        required: ["username", "email"],
        properties: {
          username: { type: "string" },
          email: { type: "string", format: "email" },
          avatar: { type: "string", nullable: true },
        },
      },
      UserPatch: {
        type: "object",
        properties: {
          username: { type: "string" },
          email: { type: "string", format: "email" },
          avatar: { type: "string", nullable: true },
        },
      },
      ChangePassword: {
        type: "object",
        required: ["current_password", "new_password"],
        properties: {
          current_password: { type: "string", format: "password" },
          new_password: { type: "string", format: "password", minLength: 8 },
        },
      },
    },
  },
};
EOF
```

![](images/clipboard-1561698.png)

------------------------------------------------------------------------

## 21.8 Pruebas HTTP

``` bash
: > src/features/auth/users/http/users.get.http
cat >> src/features/auth/users/http/users.get.http << 'EOF'
### Feature Users — GET ALL / GET ONE (modalidad JWT + RBAC)
### JWT + RBAC: `authenticate` (401 si no hay identidad válida) +
### `authorize` (403 si la matriz no concede el par method+path).
@baseUrl = http://localhost:4000

# @name loginAdmin
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "admin",
  "password": "Admin123!"
}

@adminToken = {{loginAdmin.response.body.$.access_token}}
@id = 1

### getAll — recurso `GET /api/usuarios` (solo ADMIN). Nunca devuelve `password`.
GET {{baseUrl}}/api/usuarios
Authorization: Bearer {{adminToken}}

### getOne — recurso `GET /api/usuarios/:id`
GET {{baseUrl}}/api/usuarios/{{id}}
Authorization: Bearer {{adminToken}}

### 400 — id no es entero positivo (validado en BaseController.paramId)
GET {{baseUrl}}/api/usuarios/abc
Authorization: Bearer {{adminToken}}

### 401 — sin token
GET {{baseUrl}}/api/usuarios

### 403 — el rol SELLER no tiene concedido `GET /api/usuarios`
# @name loginSeller
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "seller",
  "password": "Seller123!"
}

###
GET {{baseUrl}}/api/usuarios
Authorization: Bearer {{loginSeller.response.body.$.access_token}}
EOF

: > src/features/auth/users/http/users.create.http
cat >> src/features/auth/users/http/users.create.http << 'EOF'
### Feature Users — CREATE / UPDATE / DELETE (modalidad JWT + RBAC)
@baseUrl = http://localhost:4000

# @name loginAdmin
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "admin",
  "password": "Admin123!"
}

@token = {{loginAdmin.response.body.$.access_token}}
@id = 2

### CREATE — recurso `POST /api/usuarios`. El `password` se hashea (bcrypt, 12 rondas).
POST {{baseUrl}}/api/usuarios
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "username": "nuevo.usuario",
  "email": "nuevo.usuario@storelab.local",
  "password": "Password123!",
  "avatar": null
}

### 409 — username/email ya en uso
POST {{baseUrl}}/api/usuarios
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "username": "admin",
  "email": "otro@storelab.local",
  "password": "Password123!"
}

### UPDATE PUT — reemplazo completo. No cambia `password` ni `status`.
PUT {{baseUrl}}/api/usuarios/{{id}}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "username": "seller",
  "email": "seller@storelab.local",
  "avatar": "https://example.com/avatar.png"
}

### UPDATE PATCH — parcial
PATCH {{baseUrl}}/api/usuarios/{{id}}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "avatar": null
}

### CAMBIO DE CONTRASEÑA — recurso `PATCH /api/usuarios/:id/password`.
### Exige la contraseña ACTUAL (defensa en profundidad, incluso para un admin).
PATCH {{baseUrl}}/api/usuarios/{{id}}/password
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "current_password": "Seller123!",
  "new_password": "Seller456!"
}

### PERMISOS EFECTIVOS del usuario — recurso `GET /api/usuarios/:id/permisos`.
### Ejecuta la cadena RBAC completa (seller -> 7 permisos).
GET {{baseUrl}}/api/usuarios/{{id}}/permisos
Authorization: Bearer {{token}}

### DELETE lógico — `status = inactive`. Efecto inmediato: sus tokens dejan de valer (401).
PATCH {{baseUrl}}/api/usuarios/{{id}}/deactivate
Authorization: Bearer {{token}}

### DELETE físico — recurso `DELETE /api/usuarios/:id`
DELETE {{baseUrl}}/api/usuarios/{{id}}
Authorization: Bearer {{token}}
EOF
```

![](images/clipboard-2783820067.png)

------------------------------------------------------------------------

## Verificación

``` bash
npx tsc --noEmit
npm run db:seed
npm run dev
```

Como las rutas son JWT + RBAC y la matriz aún no existe (llega en
ISS-12/13), en este punto un `GET /api/usuarios` responde **401** (no
hay token). La verificación funcional se completa en el ISS-13 y en el
cierre.

## DoD del ISS-16

-   [x] Todos los criterios de aceptación (15.1 … 15.8) cumplidos
-   [x] La contraseña nunca aparece en una respuesta (`toUserResponse`
    la excluye)
-   [x] `POST /api/usuarios` con `username` repetido → 409
-   [x] `PATCH /api/usuarios/:id/password` cambia el hash y es
    verificable con `verifyPassword`
-   [x] `npx tsc --noEmit` sin errores y `npm run dev` arranca MDEOF
    echo "Creado: ISS-10-feature-users.md"

![](images/clipboard-3208295417.png)

![](images/clipboard-1081282973.png)

------------------------------------------------------------------------

# 22. Auth con RBAC — ISS-17 — Features Roles y Resources (catálogo de autorización)

## Contexto mínimo (autosuficiente)

Si abres este archivo aislado —o lo llevas a otra IA—, esto es lo que
hay que saber antes de ejecutarlo.

-   **Proyecto:** `app-solia-express_mysql` — Express 5 + TypeScript +
    Sequelize, arquitectura por features.
-   **Ya construido:** Fase I (Business), infraestructura de seguridad y
    modelos (ISS-09) y feature Users (ISS-10).
-   **Recorrido obligatorio de una petición:** HTTP → Controller →
    Service → Repository → Model → Sequelize → BD. Ninguna capa se salta
    a la siguiente.
-   **Diseño de datos (Fase II):** `../bd-solia.md` §14.2 (roles), §14.3
    (resources) y §21 (catálogo semilla).
-   **Capas, convenciones y reglas transversales:** `00-contexto.md`.

| Este ISS |   |
|------------------------------------|------------------------------------|
| **Título** | Features Roles y Resources (catálogo de autorización) |
| **Feature / tablas** | `features/auth/roles/` · `roles` — `features/auth/resources/` · `resources` |
| **API** | `/api/roles…` y `/api/recursos…` (JWT + RBAC) |
| **Depende de** | ISS-10 — Feature Users |
| **Habilita** | ISS-12 — Asignaciones y concesiones |

## Contenido de este ISS

-   22.1 Feature Roles — DTOs
-   22.2 Feature Roles — repository, service, controller y rutas
-   22.3 Feature Roles — seeder y swagger
-   22.4 Feature Resources — DTOs y catálogo semilla
-   22.5 Feature Resources — repository, service, controller y rutas
-   22.6 Feature Resources — seeder y swagger
-   22.7 Pruebas HTTP

**Objetivo:** construir los dos extremos del permiso:

-   **Role** — el sujeto de la autorización (a quién se concede).
-   **Resource** — el objeto (qué se concede), un par `(method, path)`.

Este ISS crea el CRUD administrativo de ambos y el catálogo semilla de
los 58 recursos del sistema. Las concesiones (el acto de unirlos) son el
ISS-12.

**Bloqueado por:** ISS-10.

## Criterios de aceptación (ISS-17) — consolidados

-   [x] **22.1** `features/auth/roles/dto/` completo (create, update,
    patch, role-response, index)
-   [x] **22.2** `roles.repository.ts`, `roles.service.ts`,
    `roles.controller.ts`, `roles.routes.ts` (JWT + RBAC)
-   [x] **22.3** `roles.seeder.ts` (ADMIN, SELLER, idempotente) y
    `roles.swagger.ts`
-   [x] **22.4** `features/auth/resources/dto/` + `resource-catalog.ts`
    con 58 recursos
-   [x] **22.5** `resources.repository.ts`, `resources.service.ts`,
    `resources.controller.ts`, `resources.routes.ts` (JWT + RBAC)
-   [x] **22.6** `resources.seeder.ts` (carga el catálogo) y
    `resources.swagger.ts`
-   [x] **22.7** archivos `.http` de ambos features
-   [x] `npx tsc --noEmit` OK

------------------------------------------------------------------------

## 22.1 Feature Roles — DTOs

``` bash
: > src/features/auth/roles/dto/create-role.dto.ts
cat >> src/features/auth/roles/dto/create-role.dto.ts << 'EOF'
/**
 * Datos de entrada de `POST /api/roles`.
 * `name` se normaliza a MAYÚSCULAS en el modelo.
 */
export interface CreateRoleDto {
  name: string;
  description?: string | null;
  status?: "active" | "inactive";
}
EOF

: > src/features/auth/roles/dto/update-role.dto.ts
cat >> src/features/auth/roles/dto/update-role.dto.ts << 'EOF'
/**
 * Datos de entrada de `PUT /api/roles/:id` (reemplazo completo).
 * `status` no está aquí: el estado solo cambia con el borrado lógico.
 */
export interface UpdateRoleDto {
  name: string;
  description?: string | null;
}
EOF

: > src/features/auth/roles/dto/patch-role.dto.ts
cat >> src/features/auth/roles/dto/patch-role.dto.ts << 'EOF'
import { UpdateRoleDto } from "./update-role.dto";

/** Datos de entrada de `PATCH /api/roles/:id` (actualización parcial). */
export type PatchRoleDto = Partial<UpdateRoleDto>;
EOF

: > src/features/auth/roles/dto/role-response.dto.ts
cat >> src/features/auth/roles/dto/role-response.dto.ts << 'EOF'
import { Role, RoleI } from "../role.model";

/** Respuesta HTTP de un rol. Sin campos internos: el DTO coincide con el modelo. */
export type RoleResponseDto = RoleI;

/** Mapper modelo -> DTO de respuesta (objeto plano). */
export function toRoleResponse(role: Role): RoleResponseDto {
  return role.toJSON() as RoleI;
}
EOF

: > src/features/auth/roles/dto/index.ts
cat >> src/features/auth/roles/dto/index.ts << 'EOF'
export * from "./create-role.dto";
export * from "./update-role.dto";
export * from "./patch-role.dto";
export * from "./role-response.dto";
EOF
```

Un rol se identifica por `name` (UK). **El nombre no autoriza nada:**
crear un rol `AUDITOR` no le concede ningún recurso; el rol nace sin
permisos.

![](images/clipboard-3624232304.png)

------------------------------------------------------------------------

## 22.2 Feature Roles — repository, service, controller y rutas

``` bash
: > src/features/auth/roles/roles.repository.ts
cat >> src/features/auth/roles/roles.repository.ts << 'EOF'
import { CreationAttributes, Transaction } from "sequelize";
import { Role } from "./role.model";

/**
 * Capa Repository del feature Roles.
 * Única que habla con Sequelize (el modelo `Role`).
 */
export class RolesRepository {
  /** Todos los roles activos. */
  public async findAllActive(): Promise<Role[]> {
    return Role.findAll({ where: { status: "active" } });
  }

  /** Un rol por PK (o `null`). */
  public async findById(id: number, transaction?: Transaction): Promise<Role | null> {
    return Role.findByPk(id, { transaction });
  }

  /** Un rol por nombre normalizado a MAYÚSCULAS (o `null`). */
  public async findByName(name: string): Promise<Role | null> {
    return Role.findOne({ where: { name: name.trim().toUpperCase() } });
  }

  /** Inserta un rol. */
  public async create(data: CreationAttributes<Role>): Promise<Role> {
    return Role.create(data);
  }

  /** Persiste cambios sobre una instancia existente. */
  public async update(role: Role, data: Partial<Role>): Promise<Role> {
    return role.update(data);
  }

  /** Elimina físicamente una instancia. */
  public async delete(role: Role): Promise<void> {
    await role.destroy();
  }
}
EOF

: > src/features/auth/roles/roles.service.ts
cat >> src/features/auth/roles/roles.service.ts << 'EOF'
import {
  CreateRoleDto,
  PatchRoleDto,
  RoleResponseDto,
  UpdateRoleDto,
  toRoleResponse,
} from "./dto";
import { RolesRepository } from "./roles.repository";
import { Role } from "./role.model";
import { AppError } from "../../../shared/errors/app-error";

/**
 * Capa Service del feature Roles.
 *
 * Regla de negocio: el nombre del rol es único. La autorización **nunca** se
 * decide por el nombre, sino por las concesiones (`resource_roles`) asociadas;
 * el nombre solo sirve para agrupar.
 */
export class RolesService {
  public constructor(
    private readonly repository: RolesRepository = new RolesRepository()
  ) {}

  // ================== READ ==================
  public async getAll(): Promise<RoleResponseDto[]> {
    const roles = await this.repository.findAllActive();
    return roles.map((role) => toRoleResponse(role));
  }

  public async getOne(id: number): Promise<RoleResponseDto> {
    return toRoleResponse(await this.findOrFail(id));
  }

  // ================== CREATE ==================
  public async create(body: CreateRoleDto): Promise<RoleResponseDto> {
    if (!body.name) {
      throw new AppError(400, "name is required");
    }
    await this.assertNameAvailable(body.name);

    const role = await this.repository.create({
      name: body.name,
      description: body.description ?? null,
      status: body.status ?? "active",
    });
    return toRoleResponse(role);
  }

  // ================== UPDATE ==================
  public async updatePut(id: number, body: UpdateRoleDto): Promise<RoleResponseDto> {
    const role = await this.findOrFail(id);
    await this.assertNameAvailable(body.name, id);

    await this.repository.update(role, {
      name: body.name,
      description: body.description ?? null,
    });
    return toRoleResponse(role);
  }

  public async updatePatch(id: number, body: PatchRoleDto): Promise<RoleResponseDto> {
    const role = await this.findOrFail(id);

    if (body.name) {
      await this.assertNameAvailable(body.name, id);
    }

    await this.repository.update(role, body);
    return toRoleResponse(role);
  }

  // ================== DELETE ==================
  /** Eliminación física. */
  public async deletePhysical(id: number): Promise<void> {
    const role = await this.findOrFail(id, false);
    await this.repository.delete(role);
  }

  /** Eliminación lógica -> `status = inactive`. Todos sus usuarios pierden ese rol. */
  public async deleteLogical(id: number): Promise<RoleResponseDto> {
    const role = await this.findOrFail(id);
    await this.repository.update(role, { status: "inactive" });
    return toRoleResponse(role);
  }

  // ================== HELPERS ==================
  private async findOrFail(id: number, onlyActive = true): Promise<Role> {
    const role = await this.repository.findById(id);
    if (!role || (onlyActive && role.status !== "active")) {
      throw new AppError(404, "Role not found");
    }
    return role;
  }

  private async assertNameAvailable(name: string, excludeId?: number): Promise<void> {
    const existing = await this.repository.findByName(name);
    if (existing && existing.id !== excludeId) {
      throw new AppError(409, "Role name already in use");
    }
  }
}
EOF

: > src/features/auth/roles/roles.controller.ts
cat >> src/features/auth/roles/roles.controller.ts << 'EOF'
import { Request, Response } from "express";
import { BaseController } from "../../../shared/http/base-controller";
import { CreateRoleDto, PatchRoleDto, UpdateRoleDto } from "./dto";
import { RolesService } from "./roles.service";

/**
 * Capa Controller del feature Roles.
 * Solo HTTP: lee `req`, llama al service y arma la respuesta.
 */
export class RolesController extends BaseController {
  public constructor(
    private readonly service: RolesService = new RolesService()
  ) {
    super();
  }

  // ================== READ ==================
  public async getAll(_req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const roles = await this.service.getAll();
      res.status(200).json({ roles });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const role = await this.service.getOne(this.paramId(req));
      res.status(200).json({ role });
    });
  }

  // ================== CREATE ==================
  public async create(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const role = await this.service.create(req.body as CreateRoleDto);
      res.status(201).json({ role });
    });
  }

  // ================== UPDATE ==================
  public async updatePut(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const role = await this.service.updatePut(
        this.paramId(req),
        req.body as UpdateRoleDto
      );
      res.status(200).json({ role });
    });
  }

  public async updatePatch(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const role = await this.service.updatePatch(
        this.paramId(req),
        req.body as PatchRoleDto
      );
      res.status(200).json({ role });
    });
  }

  // ================== DELETE ==================
  /** Eliminación física. */
  public async deletePhysical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const id = this.paramId(req);
      await this.service.deletePhysical(id);
      res.status(200).json({ message: "Role permanently deleted", id });
    });
  }

  /** Eliminación lógica -> `status = inactive`. */
  public async deleteLogical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const role = await this.service.deleteLogical(this.paramId(req));
      res.status(200).json({ message: "Role deactivated (logical delete)", role });
    });
  }
}
EOF

: > src/features/auth/roles/roles.routes.ts
cat >> src/features/auth/roles/roles.routes.ts << 'EOF'
import { Application } from "express";
import { RolesController } from "./roles.controller";
import { authenticate, authorize } from "../access";

/** Rutas del feature Roles — **modalidad 3 (JWT + RBAC)** en todas las operaciones. */
export class RolesRoutes {
  public rolesController: RolesController = new RolesController();

  public routes(app: Application): void {
    // getAll
    app
      .route("/api/roles")
      .get(authenticate, authorize, this.rolesController.getAll.bind(this.rolesController));

    // getOne
    app
      .route("/api/roles/:id")
      .get(authenticate, authorize, this.rolesController.getOne.bind(this.rolesController));

    // create
    app
      .route("/api/roles")
      .post(authenticate, authorize, this.rolesController.create.bind(this.rolesController));

    // update (PUT / PATCH)
    app
      .route("/api/roles/:id")
      .put(authenticate, authorize, this.rolesController.updatePut.bind(this.rolesController))
      .patch(authenticate, authorize, this.rolesController.updatePatch.bind(this.rolesController));

    // delete físico
    app
      .route("/api/roles/:id")
      .delete(
        authenticate,
        authorize,
        this.rolesController.deletePhysical.bind(this.rolesController)
      );

    // delete lógico
    app
      .route("/api/roles/:id/deactivate")
      .patch(authenticate, authorize, this.rolesController.deleteLogical.bind(this.rolesController));
  }
}
EOF
```

![](images/clipboard-1260459908.png)

------------------------------------------------------------------------

## 22.3 Feature Roles — seeder y swagger

``` bash
: > src/features/auth/roles/roles.seeder.ts
cat >> src/features/auth/roles/roles.seeder.ts << 'EOF'
import { Role } from "./role.model";

/**
 * Seeder del catálogo de roles (`roles`).
 *
 * Crea los dos roles de referencia del sistema. Es determinista (no usa datos
 * aleatorios) e idempotente: `findOrCreate` por nombre y reactivación si ya
 * existía inactivo.
 *
 * Los roles nacen **sin permisos**: las concesiones las crea el seeder de
 * `resource_roles` (ADMIN recibe los 58 recursos, SELLER los 7 de operación).
 */
export const SEED_ROLES = [
  { name: "ADMIN", description: "Administración del sistema: gestiona usuarios, roles y permisos" },
  { name: "SELLER", description: "Operación de ventas: consulta catálogo y registra ventas" },
] as const;

export async function seedRoles(): Promise<number> {
  let created = 0;

  for (const item of SEED_ROLES) {
    const [role, wasCreated] = await Role.findOrCreate({
      where: { name: item.name },
      defaults: { name: item.name, description: item.description, status: "active" },
    });

    if (wasCreated) {
      created++;
      continue;
    }
    if (role.status !== "active") {
      await role.update({ status: "active" });
    }
  }

  console.log(`✅ roles: catálogo reconciliado (${SEED_ROLES.length} roles, ${created} nuevos)`);
  return created;
}
EOF

: > src/features/auth/roles/roles.swagger.ts
cat >> src/features/auth/roles/roles.swagger.ts << 'EOF'
import {
  bearerSecurity,
  forbiddenResponse,
  invalidIdResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "../../../shared/http/swagger-security";

/**
 * Documentación OpenAPI del feature Roles.
 *
 * Modalidad: **JWT + RBAC** en todas las operaciones.
 *
 * Recordatorio de diseño: el **nombre** del rol no autoriza nada. Un rol
 * `ADMIN` sin concesiones activas no habilita ninguna operación; la autorización
 * se decide por las filas de `resource_roles`.
 */
export const rolesSwagger = {
  tags: [
    { name: "Roles", description: "CRUD de roles (agrupadores de permisos) — **JWT + RBAC**" },
  ],
  paths: {
    "/api/roles": {
      get: {
        tags: ["Roles"],
        summary: "Listar roles activos",
        description: "JWT + RBAC — recurso `GET /api/roles`.",
        security: bearerSecurity,
        responses: {
          "200": { description: "Lista de roles (`{ roles: [...] }`)" },
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
        },
      },
      post: {
        tags: ["Roles"],
        summary: "Crear rol",
        description:
          "JWT + RBAC — recurso `POST /api/roles`. El rol nace **sin permisos**: se conceden con `POST /api/concesiones-rol`.",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RoleCreate" } },
          },
        },
        responses: {
          "201": { description: "Rol creado (`{ role }`)" },
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "409": { description: "Nombre de rol ya en uso" },
        },
      },
    },
    "/api/roles/{id}": {
      get: {
        tags: ["Roles"],
        summary: "Obtener rol por id",
        description: "JWT + RBAC — recurso `GET /api/roles/:id`.",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Rol (`{ role }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
      put: {
        tags: ["Roles"],
        summary: "Reemplazar rol (PUT)",
        description: "JWT + RBAC — recurso `PUT /api/roles/:id`.",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RoleUpdate" } },
          },
        },
        responses: {
          "200": { description: "Rol actualizado (`{ role }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
      patch: {
        tags: ["Roles"],
        summary: "Modificar rol (PATCH)",
        description: "JWT + RBAC — recurso `PATCH /api/roles/:id`.",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RolePatch" } },
          },
        },
        responses: {
          "200": { description: "Rol actualizado (`{ role }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
      delete: {
        tags: ["Roles"],
        summary: "Eliminar rol (físico)",
        description: "JWT + RBAC — recurso `DELETE /api/roles/:id`.",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Eliminado (`{ message, id }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
    },
    "/api/roles/{id}/deactivate": {
      patch: {
        tags: ["Roles"],
        summary: "Desactivar rol (borrado lógico)",
        description:
          "JWT + RBAC — recurso `PATCH /api/roles/:id/deactivate`. " +
          "Efecto inmediato: todos los usuarios de ese rol pierden sus permisos (eslabón `roles` inactivo -> DENY).",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Desactivado (`{ message, role }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
    },
  },
  components: {
    schemas: {
      Role: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "SELLER" },
          description: { type: "string", nullable: true },
          status: { type: "string", enum: ["active", "inactive"], example: "active" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      RoleCreate: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "BUYER" },
          description: { type: "string", nullable: true },
          status: { type: "string", enum: ["active", "inactive"], default: "active" },
        },
      },
      RoleUpdate: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string" },
          description: { type: "string", nullable: true },
        },
      },
      RolePatch: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string", nullable: true },
        },
      },
    },
  },
};
EOF
```

![](images/clipboard-596015977.png)

------------------------------------------------------------------------

## 22.4 Feature Resources — DTOs y catálogo semilla

``` bash
: > src/features/auth/resources/dto/create-resource.dto.ts
cat >> src/features/auth/resources/dto/create-resource.dto.ts << 'EOF'
/**
 * Datos de entrada de `POST /api/recursos`.
 *
 * `path` se guarda con el patrón (`/api/productos/:id`), no con un valor concreto.
 */
export interface CreateResourceDto {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  description?: string | null;
  status?: "active" | "inactive";
}
EOF

: > src/features/auth/resources/dto/update-resource.dto.ts
cat >> src/features/auth/resources/dto/update-resource.dto.ts << 'EOF'
/**
 * Datos de entrada de `PUT /api/recursos/:id` (reemplazo completo).
 * `status` no está aquí: el estado solo cambia con el borrado lógico.
 */
export interface UpdateResourceDto {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  description?: string | null;
}
EOF

: > src/features/auth/resources/dto/patch-resource.dto.ts
cat >> src/features/auth/resources/dto/patch-resource.dto.ts << 'EOF'
import { UpdateResourceDto } from "./update-resource.dto";

/** Datos de entrada de `PATCH /api/recursos/:id` (actualización parcial). */
export type PatchResourceDto = Partial<UpdateResourceDto>;
EOF

: > src/features/auth/resources/dto/resource-response.dto.ts
cat >> src/features/auth/resources/dto/resource-response.dto.ts << 'EOF'
import { Resource, ResourceI } from "../resource.model";

/**
 * Respuesta HTTP de un recurso. `resources` no tiene campos internos, así que el
 * DTO coincide con el modelo; se declara igualmente para que la API quede
 * desacoplada del modelo (cambiar el modelo no cambia el contrato por accidente).
 */
export type ResourceResponseDto = ResourceI;

/** Mapper modelo -> DTO de respuesta (objeto plano). */
export function toResourceResponse(resource: Resource): ResourceResponseDto {
  return resource.toJSON() as ResourceI;
}
EOF

: > src/features/auth/resources/dto/index.ts
cat >> src/features/auth/resources/dto/index.ts << 'EOF'
export * from "./create-resource.dto";
export * from "./update-resource.dto";
export * from "./patch-resource.dto";
export * from "./resource-response.dto";
EOF
```

El catálogo es la **fuente única**: define los 58 recursos, de los que
se derivan tanto las filas de `resources` como las concesiones de los
roles. La marca `seller: true` designa los 7 recursos de operación.

``` bash
: > src/features/auth/resources/resource-catalog.ts
cat >> src/features/auth/resources/resource-catalog.ts << 'EOF'
/**
 * Catálogo de los **58 recursos** del sistema (fuente única).
 *
 * Un recurso es un par `(method, path)`; un permiso es la concesión de un
 * recurso a un rol. Este archivo es la definición en código del catálogo que
 * puebla el seeder de `resources` y del que se derivan las concesiones de los
 * roles (`ADMIN` recibe los 58; `SELLER`, los 7 marcados con `seller: true`).
 *
 * Composición (referencia: `docs/bd-storelab.md` §21):
 *
 * | Grupo                                        | Recursos |
 * |----------------------------------------------|---------:|
 * | Clientes                                     | 7 |
 * | Tipos de producto                            | 7 |
 * | Productos                                    | 7 |
 * | Ventas                                       | 3 |
 * | Detalle de ventas                            | 1 |
 * | Usuarios (+ cambio de contraseña + permisos) | 9 |
 * | Roles                                        | 7 |
 * | Recursos                                     | 7 |
 * | Asignaciones usuario-rol                     | 5 |
 * | Concesiones rol-recurso                      | 5 |
 * | **Total**                                    | **58** |
 *
 * Nota: las operaciones de sesión (`/api/sesion/*` y `/api/sesiones/*`) **no**
 * son recursos RBAC. Son las modalidades OPEN y JWT: no dependen de la matriz
 * de permisos, sino de poseer (o no) una identidad válida.
 */
export interface CatalogResource {
  method: string;
  path: string;
  description: string;
  /** `true` si el rol `SELLER` recibe esta concesión (7 en total). */
  seller?: boolean;
}

export const RESOURCE_CATALOG: readonly CatalogResource[] = [
  // ── Clientes (7) ──────────────────────────────────────────────
  { method: "GET", path: "/api/clientes", description: "Listar clientes", seller: true },
  { method: "GET", path: "/api/clientes/:id", description: "Consultar cliente", seller: true },
  { method: "POST", path: "/api/clientes", description: "Crear cliente" },
  { method: "PUT", path: "/api/clientes/:id", description: "Reemplazar cliente" },
  { method: "PATCH", path: "/api/clientes/:id", description: "Modificar cliente" },
  { method: "DELETE", path: "/api/clientes/:id", description: "Eliminar cliente" },
  { method: "PATCH", path: "/api/clientes/:id/deactivate", description: "Desactivar cliente" },

  // ── Tipos de producto (7) ─────────────────────────────────────
  { method: "GET", path: "/api/tipos-producto", description: "Listar tipos de producto" },
  { method: "GET", path: "/api/tipos-producto/:id", description: "Consultar tipo de producto" },
  { method: "POST", path: "/api/tipos-producto", description: "Crear tipo de producto" },
  { method: "PUT", path: "/api/tipos-producto/:id", description: "Reemplazar tipo de producto" },
  { method: "PATCH", path: "/api/tipos-producto/:id", description: "Modificar tipo de producto" },
  { method: "DELETE", path: "/api/tipos-producto/:id", description: "Eliminar tipo de producto" },
  {
    method: "PATCH",
    path: "/api/tipos-producto/:id/deactivate",
    description: "Desactivar tipo de producto",
  },

  // ── Productos (7) ─────────────────────────────────────────────
  { method: "GET", path: "/api/productos", description: "Listar productos", seller: true },
  { method: "GET", path: "/api/productos/:id", description: "Consultar producto", seller: true },
  { method: "POST", path: "/api/productos", description: "Crear producto" },
  { method: "PUT", path: "/api/productos/:id", description: "Reemplazar producto" },
  { method: "PATCH", path: "/api/productos/:id", description: "Modificar producto" },
  { method: "DELETE", path: "/api/productos/:id", description: "Eliminar producto" },
  { method: "PATCH", path: "/api/productos/:id/deactivate", description: "Desactivar producto" },

  // ── Ventas (3) ────────────────────────────────────────────────
  { method: "GET", path: "/api/ventas", description: "Listar ventas", seller: true },
  { method: "GET", path: "/api/ventas/:id", description: "Consultar venta", seller: true },
  { method: "POST", path: "/api/ventas", description: "Registrar venta", seller: true },

  // ── Detalle de ventas (1) ─────────────────────────────────────
  { method: "GET", path: "/api/detalle-ventas", description: "Listar detalle de ventas" },

  // ── Usuarios (9) ──────────────────────────────────────────────
  { method: "GET", path: "/api/usuarios", description: "Listar usuarios" },
  { method: "GET", path: "/api/usuarios/:id", description: "Consultar usuario" },
  { method: "POST", path: "/api/usuarios", description: "Crear usuario" },
  { method: "PUT", path: "/api/usuarios/:id", description: "Reemplazar usuario" },
  { method: "PATCH", path: "/api/usuarios/:id", description: "Modificar usuario" },
  { method: "DELETE", path: "/api/usuarios/:id", description: "Eliminar usuario" },
  { method: "PATCH", path: "/api/usuarios/:id/deactivate", description: "Desactivar usuario" },
  {
    method: "PATCH",
    path: "/api/usuarios/:id/password",
    description: "Cambiar contraseña de usuario",
  },
  {
    method: "GET",
    path: "/api/usuarios/:id/permisos",
    description: "Consultar permisos efectivos del usuario",
  },

  // ── Roles (7) ─────────────────────────────────────────────────
  { method: "GET", path: "/api/roles", description: "Listar roles" },
  { method: "GET", path: "/api/roles/:id", description: "Consultar rol" },
  { method: "POST", path: "/api/roles", description: "Crear rol" },
  { method: "PUT", path: "/api/roles/:id", description: "Reemplazar rol" },
  { method: "PATCH", path: "/api/roles/:id", description: "Modificar rol" },
  { method: "DELETE", path: "/api/roles/:id", description: "Eliminar rol" },
  { method: "PATCH", path: "/api/roles/:id/deactivate", description: "Desactivar rol" },

  // ── Recursos (7) ──────────────────────────────────────────────
  { method: "GET", path: "/api/recursos", description: "Listar recursos" },
  { method: "GET", path: "/api/recursos/:id", description: "Consultar recurso" },
  { method: "POST", path: "/api/recursos", description: "Crear recurso" },
  { method: "PUT", path: "/api/recursos/:id", description: "Reemplazar recurso" },
  { method: "PATCH", path: "/api/recursos/:id", description: "Modificar recurso" },
  { method: "DELETE", path: "/api/recursos/:id", description: "Eliminar recurso" },
  { method: "PATCH", path: "/api/recursos/:id/deactivate", description: "Desactivar recurso" },

  // ── Asignaciones usuario ↔ rol (5) ────────────────────────────
  { method: "GET", path: "/api/asignaciones-rol", description: "Listar asignaciones usuario-rol" },
  {
    method: "GET",
    path: "/api/asignaciones-rol/:id",
    description: "Consultar asignación usuario-rol",
  },
  {
    method: "POST",
    path: "/api/asignaciones-rol",
    description: "Asignar rol a usuario",
  },
  {
    method: "PATCH",
    path: "/api/asignaciones-rol/:id/deactivate",
    description: "Retirar rol a usuario",
  },
  {
    method: "PATCH",
    path: "/api/asignaciones-rol/:id/reactivate",
    description: "Reactivar rol a usuario",
  },

  // ── Concesiones rol ↔ recurso (5) ─────────────────────────────
  { method: "GET", path: "/api/concesiones-rol", description: "Listar concesiones rol-recurso" },
  {
    method: "GET",
    path: "/api/concesiones-rol/:id",
    description: "Consultar concesión rol-recurso",
  },
  {
    method: "POST",
    path: "/api/concesiones-rol",
    description: "Conceder recurso a rol",
  },
  {
    method: "PATCH",
    path: "/api/concesiones-rol/:id/deactivate",
    description: "Retirar recurso a rol",
  },
  {
    method: "PATCH",
    path: "/api/concesiones-rol/:id/reactivate",
    description: "Reactivar recurso a rol",
  },
];

/** Recursos que recibe el rol `SELLER` (7). Derivado del catálogo, no duplicado. */
export const SELLER_RESOURCES: readonly CatalogResource[] = RESOURCE_CATALOG.filter(
  (resource) => resource.seller === true
);
EOF
```

Composición del catálogo:

| Grupo                                        | Recursos |
|----------------------------------------------|---------:|
| Clientes                                     |        7 |
| Tipos de producto                            |        7 |
| Productos                                    |        7 |
| Ventas                                       |        3 |
| Detalle de ventas                            |        1 |
| Usuarios (+ cambio de contraseña + permisos) |        9 |
| Roles                                        |        7 |
| Recursos                                     |        7 |
| Asignaciones usuario-rol                     |        5 |
| Concesiones rol-recurso                      |        5 |
| **Total**                                    |   **58** |

> **Las operaciones de sesión no son recursos.** `/api/sesion/*` y
> `/api/sesiones/*` no dependen de la matriz de permisos, sino de poseer
> (o no) una identidad válida. Por eso son OPEN o JWT, nunca JWT + RBAC.
>
> ![](images/clipboard-897444431.png)

------------------------------------------------------------------------

## 22.5 Feature Resources — repository, service, controller y rutas

``` bash
: > src/features/auth/resources/resources.repository.ts
cat >> src/features/auth/resources/resources.repository.ts << 'EOF'
import { CreationAttributes, Transaction } from "sequelize";
import { Resource } from "./resource.model";
import { normalizePath } from "../../../shared/auth/resource-match";

/**
 * Capa Repository del feature Resources.
 * Única que habla con Sequelize (el modelo `Resource`).
 */
export class ResourcesRepository {
  /** Todos los recursos activos. */
  public async findAllActive(): Promise<Resource[]> {
    return Resource.findAll({ where: { status: "active" } });
  }

  /** Un recurso por PK (o `null`). */
  public async findById(id: number, transaction?: Transaction): Promise<Resource | null> {
    return Resource.findByPk(id, { transaction });
  }

  /** Un recurso por su par `(method, path)` (o `null`). */
  public async findByOperation(method: string, path: string): Promise<Resource | null> {
    return Resource.findOne({
      where: { method: method.trim().toUpperCase(), path: normalizePath(path.trim()) },
    });
  }

  /** Inserta un recurso. */
  public async create(data: CreationAttributes<Resource>): Promise<Resource> {
    return Resource.create(data);
  }

  /** Persiste cambios sobre una instancia existente. */
  public async update(resource: Resource, data: Partial<Resource>): Promise<Resource> {
    return resource.update(data);
  }

  /** Elimina físicamente una instancia. */
  public async delete(resource: Resource): Promise<void> {
    await resource.destroy();
  }
}
EOF

: > src/features/auth/resources/resources.service.ts
cat >> src/features/auth/resources/resources.service.ts << 'EOF'
import {
  CreateResourceDto,
  PatchResourceDto,
  ResourceResponseDto,
  UpdateResourceDto,
  toResourceResponse,
} from "./dto";
import { ResourcesRepository } from "./resources.repository";
import { Resource } from "./resource.model";
import { AppError } from "../../../shared/errors/app-error";

/**
 * Capa Service del feature Resources.
 *
 * Reglas de negocio: la tupla `(method, path)` es única. Se comprueba antes de
 * escribir para responder 409 con un mensaje útil en lugar de dejar reventar la
 * restricción única de la base de datos como 500.
 */
export class ResourcesService {
  public constructor(
    private readonly repository: ResourcesRepository = new ResourcesRepository()
  ) {}

  // ================== READ ==================
  public async getAll(): Promise<ResourceResponseDto[]> {
    const resources = await this.repository.findAllActive();
    return resources.map((resource) => toResourceResponse(resource));
  }

  public async getOne(id: number): Promise<ResourceResponseDto> {
    return toResourceResponse(await this.findOrFail(id));
  }

  // ================== CREATE ==================
  public async create(body: CreateResourceDto): Promise<ResourceResponseDto> {
    if (!body.method || !body.path) {
      throw new AppError(400, "method and path are required");
    }
    await this.assertOperationAvailable(body.method, body.path);

    const resource = await this.repository.create({
      method: body.method,
      path: body.path,
      description: body.description ?? null,
      status: body.status ?? "active",
    });
    return toResourceResponse(resource);
  }

  // ================== UPDATE ==================
  public async updatePut(id: number, body: UpdateResourceDto): Promise<ResourceResponseDto> {
    const resource = await this.findOrFail(id);
    await this.assertOperationAvailable(body.method, body.path, id);

    await this.repository.update(resource, {
      method: body.method,
      path: body.path,
      description: body.description ?? null,
    });
    return toResourceResponse(resource);
  }

  public async updatePatch(id: number, body: PatchResourceDto): Promise<ResourceResponseDto> {
    const resource = await this.findOrFail(id);

    const method = body.method ?? resource.method;
    const path = body.path ?? resource.path;
    await this.assertOperationAvailable(method, path, id);

    await this.repository.update(resource, body);
    return toResourceResponse(resource);
  }

  // ================== DELETE ==================
  /** Eliminación física. */
  public async deletePhysical(id: number): Promise<void> {
    const resource = await this.findOrFail(id, false);
    await this.repository.delete(resource);
  }

  /** Eliminación lógica -> `status = inactive`. Deshabilita el punto de acceso. */
  public async deleteLogical(id: number): Promise<ResourceResponseDto> {
    const resource = await this.findOrFail(id);
    await this.repository.update(resource, { status: "inactive" });
    return toResourceResponse(resource);
  }

  // ================== HELPERS ==================
  private async findOrFail(id: number, onlyActive = true): Promise<Resource> {
    const resource = await this.repository.findById(id);
    if (!resource || (onlyActive && resource.status !== "active")) {
      throw new AppError(404, "Resource not found");
    }
    return resource;
  }

  /** 409 si otro recurso ya declara el mismo `(method, path)`. */
  private async assertOperationAvailable(
    method: string,
    path: string,
    excludeId?: number
  ): Promise<void> {
    const existing = await this.repository.findByOperation(method, path);
    if (existing && existing.id !== excludeId) {
      throw new AppError(409, `Resource ${method.toUpperCase()} ${path} already exists`);
    }
  }
}
EOF

: > src/features/auth/resources/resources.controller.ts
cat >> src/features/auth/resources/resources.controller.ts << 'EOF'
import { Request, Response } from "express";
import { BaseController } from "../../../shared/http/base-controller";
import {
  CreateResourceDto,
  PatchResourceDto,
  UpdateResourceDto,
} from "./dto";
import { ResourcesService } from "./resources.service";

/**
 * Capa Controller del feature Resources.
 * Solo HTTP: lee `req`, llama al service y arma la respuesta.
 */
export class ResourcesController extends BaseController {
  public constructor(
    private readonly service: ResourcesService = new ResourcesService()
  ) {
    super();
  }

  // ================== READ ==================
  public async getAll(_req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const resources = await this.service.getAll();
      res.status(200).json({ resources });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const resource = await this.service.getOne(this.paramId(req));
      res.status(200).json({ resource });
    });
  }

  // ================== CREATE ==================
  public async create(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const resource = await this.service.create(req.body as CreateResourceDto);
      res.status(201).json({ resource });
    });
  }

  // ================== UPDATE ==================
  public async updatePut(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const resource = await this.service.updatePut(
        this.paramId(req),
        req.body as UpdateResourceDto
      );
      res.status(200).json({ resource });
    });
  }

  public async updatePatch(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const resource = await this.service.updatePatch(
        this.paramId(req),
        req.body as PatchResourceDto
      );
      res.status(200).json({ resource });
    });
  }

  // ================== DELETE ==================
  /** Eliminación física. */
  public async deletePhysical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const id = this.paramId(req);
      await this.service.deletePhysical(id);
      res.status(200).json({ message: "Resource permanently deleted", id });
    });
  }

  /** Eliminación lógica -> `status = inactive`. */
  public async deleteLogical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const resource = await this.service.deleteLogical(this.paramId(req));
      res.status(200).json({ message: "Resource deactivated (logical delete)", resource });
    });
  }
}
EOF

: > src/features/auth/resources/resources.routes.ts
cat >> src/features/auth/resources/resources.routes.ts << 'EOF'
import { Application } from "express";
import { ResourcesController } from "./resources.controller";
import { authenticate, authorize } from "../access";

/** Rutas del feature Resources — **modalidad 3 (JWT + RBAC)** en todas las operaciones. */
export class ResourcesRoutes {
  public resourcesController: ResourcesController = new ResourcesController();

  public routes(app: Application): void {
    // getAll
    app
      .route("/api/recursos")
      .get(authenticate, authorize, this.resourcesController.getAll.bind(this.resourcesController));

    // getOne
    app
      .route("/api/recursos/:id")
      .get(authenticate, authorize, this.resourcesController.getOne.bind(this.resourcesController));

    // create
    app
      .route("/api/recursos")
      .post(authenticate, authorize, this.resourcesController.create.bind(this.resourcesController));

    // update (PUT / PATCH)
    app
      .route("/api/recursos/:id")
      .put(
        authenticate,
        authorize,
        this.resourcesController.updatePut.bind(this.resourcesController)
      )
      .patch(
        authenticate,
        authorize,
        this.resourcesController.updatePatch.bind(this.resourcesController)
      );

    // delete físico
    app
      .route("/api/recursos/:id")
      .delete(
        authenticate,
        authorize,
        this.resourcesController.deletePhysical.bind(this.resourcesController)
      );

    // delete lógico
    app
      .route("/api/recursos/:id/deactivate")
      .patch(
        authenticate,
        authorize,
        this.resourcesController.deleteLogical.bind(this.resourcesController)
      );
  }
}
EOF
```

`POST /api/recursos` con un `(method, path)` ya existente → **409**: lo
impone la restricción `UQ(method, path)`.

![](images/clipboard-3471578067.png)

------------------------------------------------------------------------

## 22.6 Feature Resources — seeder y swagger

El seeder es **idempotente y reconciliador**: `findOrCreate` por
`(method, path)` y reactivación si la fila estaba inactiva. Reejecutarlo
deja el catálogo exacto, sin duplicados.

``` bash
: > src/features/auth/resources/resources.seeder.ts
cat >> src/features/auth/resources/resources.seeder.ts << 'EOF'
import { Resource } from "./resource.model";
import { RESOURCE_CATALOG } from "./resource-catalog";

/**
 * Seeder del catálogo de recursos (`resources`).
 *
 * A diferencia de los seeders de business, este **no usa datos aleatorios**: los
 * 58 recursos son un catálogo determinista definido en `resource-catalog.ts`.
 * Es idempotente por partida doble: `findOrCreate` por `(method, path)` y
 * reactivación de las filas que ya existían inactivas, de modo que volver a
 * ejecutarlo reconcilia el catálogo sin duplicar ni perder concesiones.
 */
export async function seedResources(): Promise<number> {
  let created = 0;

  for (const item of RESOURCE_CATALOG) {
    const [resource, wasCreated] = await Resource.findOrCreate({
      where: { method: item.method, path: item.path },
      defaults: {
        method: item.method,
        path: item.path,
        description: item.description,
        status: "active",
      },
    });

    if (wasCreated) {
      created++;
      continue;
    }
    if (resource.status !== "active") {
      await resource.update({ status: "active" });
    }
  }

  console.log(
    `✅ resources: catálogo reconciliado (${RESOURCE_CATALOG.length} recursos, ${created} nuevos)`
  );
  return created;
}
EOF

: > src/features/auth/resources/resources.swagger.ts
cat >> src/features/auth/resources/resources.swagger.ts << 'EOF'
import {
  bearerSecurity,
  forbiddenResponse,
  invalidIdResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "../../../shared/http/swagger-security";

/**
 * Documentación OpenAPI del feature Resources.
 *
 * Modalidad: **JWT + RBAC** en todas las operaciones.
 *
 * Un recurso es un par `(method, path)` con la ruta **en patrón**
 * (`/api/productos/:id`). `GET` y `POST` sobre la misma ruta son dos recursos
 * distintos y se conceden por separado.
 */
export const resourcesSwagger = {
  tags: [
    {
      name: "Recursos",
      description:
        "Catálogo de puntos de acceso protegibles: par `(method, path)` — **JWT + RBAC**",
    },
  ],
  paths: {
    "/api/recursos": {
      get: {
        tags: ["Recursos"],
        summary: "Listar recursos activos",
        description: "JWT + RBAC — recurso `GET /api/recursos`.",
        security: bearerSecurity,
        responses: {
          "200": { description: "Lista de recursos (`{ resources: [...] }`)" },
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
        },
      },
      post: {
        tags: ["Recursos"],
        summary: "Crear recurso",
        description:
          "JWT + RBAC — recurso `POST /api/recursos`. Alta de un nuevo punto de acceso; concederlo a un rol no requiere desplegar código.",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/ResourceCreate" } },
          },
        },
        responses: {
          "201": { description: "Recurso creado (`{ resource }`)" },
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "409": { description: "La tupla `(method, path)` ya existe" },
        },
      },
    },
    "/api/recursos/{id}": {
      get: {
        tags: ["Recursos"],
        summary: "Obtener recurso por id",
        description: "JWT + RBAC — recurso `GET /api/recursos/:id`.",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Recurso (`{ resource }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
      put: {
        tags: ["Recursos"],
        summary: "Reemplazar recurso (PUT)",
        description: "JWT + RBAC — recurso `PUT /api/recursos/:id`.",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/ResourceUpdate" } },
          },
        },
        responses: {
          "200": { description: "Recurso actualizado (`{ resource }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
      patch: {
        tags: ["Recursos"],
        summary: "Modificar recurso (PATCH)",
        description: "JWT + RBAC — recurso `PATCH /api/recursos/:id`.",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/ResourcePatch" } },
          },
        },
        responses: {
          "200": { description: "Recurso actualizado (`{ resource }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
      delete: {
        tags: ["Recursos"],
        summary: "Eliminar recurso (físico)",
        description: "JWT + RBAC — recurso `DELETE /api/recursos/:id`.",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Eliminado (`{ message, id }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
    },
    "/api/recursos/{id}/deactivate": {
      patch: {
        tags: ["Recursos"],
        summary: "Desactivar recurso (borrado lógico)",
        description:
          "JWT + RBAC — recurso `PATCH /api/recursos/:id/deactivate`. " +
          "Efecto inmediato: ningún rol puede autorizar ese punto de acceso (eslabón `resources` inactivo -> DENY).",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Desactivado (`{ message, resource }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
    },
  },
  components: {
    schemas: {
      Resource: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          method: { type: "string", enum: ["GET", "POST", "PUT", "PATCH", "DELETE"], example: "GET" },
          path: { type: "string", example: "/api/productos/:id" },
          description: { type: "string", nullable: true },
          status: { type: "string", enum: ["active", "inactive"], example: "active" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ResourceCreate: {
        type: "object",
        required: ["method", "path"],
        properties: {
          method: { type: "string", enum: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
          path: { type: "string", example: "/api/reportes/:id" },
          description: { type: "string", nullable: true },
          status: { type: "string", enum: ["active", "inactive"], default: "active" },
        },
      },
      ResourceUpdate: {
        type: "object",
        required: ["method", "path"],
        properties: {
          method: { type: "string", enum: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
          path: { type: "string" },
          description: { type: "string", nullable: true },
        },
      },
      ResourcePatch: {
        type: "object",
        properties: {
          method: { type: "string", enum: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
          path: { type: "string" },
          description: { type: "string", nullable: true },
        },
      },
    },
  },
};
EOF
```

![](images/clipboard-595776574.png)

------------------------------------------------------------------------

## 22.7 Pruebas HTTP

``` bash
: > src/features/auth/roles/http/roles.get.http
cat >> src/features/auth/roles/http/roles.get.http << 'EOF'
### Feature Roles — CRUD (modalidad JWT + RBAC)
### El NOMBRE del rol no autoriza nada: la autorización son las filas de `resource_roles`.
@baseUrl = http://localhost:4000

# @name loginAdmin
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "admin",
  "password": "Admin123!"
}

# @name loginSeller
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "seller",
  "password": "Seller123!"
}

@token = {{loginAdmin.response.body.$.access_token}}

### getAll — recurso `GET /api/roles` (ADMIN y SELLER)
GET {{baseUrl}}/api/roles
Authorization: Bearer {{token}}

### getOne
GET {{baseUrl}}/api/roles/1
Authorization: Bearer {{token}}

### CREATE — nace SIN permisos
POST {{baseUrl}}/api/roles
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "AUDITOR",
  "description": "Solo lectura de catálogo"
}

### UPDATE PUT
PUT {{baseUrl}}/api/roles/3
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "AUDITOR",
  "description": "Solo lectura de catálogo y ventas"
}

### UPDATE PATCH
PATCH {{baseUrl}}/api/roles/3
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "description": "Auditoría operativa"
}

### DELETE lógico — efecto inmediato: todos sus usuarios pierden esos permisos (403)
PATCH {{baseUrl}}/api/roles/3/deactivate
Authorization: Bearer {{token}}

### DELETE físico
DELETE {{baseUrl}}/api/roles/3
Authorization: Bearer {{token}}

### 403 — SELLER no tiene concedido `GET /api/roles`
GET {{baseUrl}}/api/roles
Authorization: Bearer {{loginSeller.response.body.$.access_token}}
EOF

: > src/features/auth/resources/http/resources.get.http
cat >> src/features/auth/resources/http/resources.get.http << 'EOF'
### Feature Resources — catálogo de puntos de acceso (modalidad JWT + RBAC)
### Un recurso es el par (method, path) con la ruta EN PATRÓN: /api/productos/:id
### GET y POST sobre la misma ruta son DOS recursos distintos.
@baseUrl = http://localhost:4000

# @name loginAdmin
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "admin",
  "password": "Admin123!"
}

@token = {{loginAdmin.response.body.$.access_token}}

### getAll — el catálogo completo (58 recursos sembrados)
GET {{baseUrl}}/api/recursos
Authorization: Bearer {{token}}

### getOne
GET {{baseUrl}}/api/recursos/25
Authorization: Bearer {{token}}

### CREATE — alta de un punto de acceso nuevo
### Concederlo después a un rol no requiere desplegar código.
POST {{baseUrl}}/api/recursos
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "method": "GET",
  "path": "/api/reportes/ventas/:id",
  "description": "Consultar reporte de ventas"
}

### 409 — la tupla (method, path) ya existe
POST {{baseUrl}}/api/recursos
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "method": "GET",
  "path": "/api/clientes",
  "description": "Duplicado"
}

### UPDATE PUT
PUT {{baseUrl}}/api/recursos/59
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "method": "GET",
  "path": "/api/reportes/ventas/:id",
  "description": "Reporte de ventas por id"
}

### DELETE lógico — ningún rol puede ya autorizar ese endpoint (403 para todos)
PATCH {{baseUrl}}/api/recursos/59/deactivate
Authorization: Bearer {{token}}

### DELETE físico
DELETE {{baseUrl}}/api/recursos/59
Authorization: Bearer {{token}}
EOF
```

------------------------------------------------------------------------

## Verificación

``` bash
npx tsc --noEmit
npm run db:seed
```

``` sql
SELECT COUNT(*) FROM resources;
SELECT COUNT(*) FROM roles;
SELECT name, status FROM roles;
```

## DoD del ISS-17

-   [x] Todos los criterios de aceptación (16.1 … 16.7) cumplidos
-   [x] `resources` tiene 58 filas y `UQ(method, path)` impide
    duplicados (409)
-   [x] Los roles se crean sin permisos; concederlos es el ISS-12
-   [x] `npx tsc --noEmit` sin errores y `npm run db:seed` idempotente
    MDEOF echo "Creado: ISS-11-roles-resources.md"

## ![](images/clipboard-2417795843.png)

# 23. Auth con RBAC — ISS-18 — Features RoleUsers y ResourceRoles (asignar roles y conceder permisos)

## Contexto mínimo (autosuficiente)

Si abres este archivo aislado —o lo llevas a otra IA—, esto es lo que
hay que saber antes de ejecutarlo.

-   **Proyecto:** `app-storelab-express-ii` — Express 5 + TypeScript +
    Sequelize, arquitectura por features.
-   **Ya construido:** Fase I, infraestructura y modelos (ISS-09),
    ISS-10 Users e ISS-11 Roles/Resources.
-   **Recorrido obligatorio de una petición:** HTTP → Controller →
    Service → Repository → Model → Sequelize → BD. Ninguna capa se salta
    a la siguiente.
-   **Diseño de datos (Fase II):** `../bd-storelab.md` §14.4
    (role_users), §14.5 (resource_roles), §15 (por qué no hay
    permissions) y §16 (consulta de autorización efectiva).
-   **Capas, convenciones y reglas transversales:** `00-contexto.md`.

| Este ISS |   |
|------------------------------------|------------------------------------|
| **Título** | Features RoleUsers y ResourceRoles |
| **Feature / tablas** | `features/auth/role-users/` · `role_users` — `features/auth/resource-roles/` · `resource_roles` |
| **API** | `/api/asignaciones-rol…` y `/api/concesiones-rol…` (JWT + RBAC) |
| **Depende de** | ISS-11 — Features Roles y Resources |
| **Habilita** | ISS-13 — Middlewares de acceso |

## Contenido de este ISS 18

-   23.1 DTOs de RoleUsers
-   23.2 Repository, service, controller y rutas de RoleUsers
-   23.3 Seeder y swagger de RoleUsers
-   23.4 DTOs de ResourceRoles
-   23.5 Repository, service, controller y rutas de ResourceRoles
-   23.6 `reconcileRole` — la matriz determinista
-   23.7 Seeder de la matriz + swagger
-   23.8 Pruebas HTTP

**Objetivo:** construir las dos tablas pivote que convierten el modelo
en autorización real:

``` text
User   ──(RoleUser)────▶  Role   ──(ResourceRole)────▶  Resource
        «quién tiene        «qué agrupa»       «qué se concede»
         qué rol»
```

Son los métodos que añaden permisos a los recursos (el requisito
explícito de la Fase II): sin estas dos features, `Role` y `Resource`
serían catálogos inertes.

**Bloqueado por:** ISS-11.

## Criterios de aceptación (ISS-18) — consolidados

-   [x] **23.1** `role-users/dto/` (`create-role-user.dto.ts`,
    `role-user-response.dto.ts`, `index.ts`)
-   [x] **23.2** `role-users.{repository,service,controller,routes}.ts`;
    `POST /api/asignaciones-rol` idempotente (reactiva si existía
    inactiva)
-   [x] **23.3** `role-users.seeder.ts` (admin→ADMIN, seller→SELLER) y
    `role-users.swagger.ts`
-   [x] **23.4** `resource-roles/dto/` (`create-resource-role.dto.ts`,
    `list-resource-roles.dto.ts`, `resource-role-response.dto.ts`,
    `index.ts`)
-   [x] **23.5**
    `resource-roles.{repository,service,controller,routes}.ts`;
    `POST /api/concesiones-rol` idempotente y `/deactivate` ·
    `/reactivate`
-   [x] **23.6**
    `ResourceRolesService.reconcileRole(roleId, resourceIds)`
    determinista (concede lo que falta, reactiva, retira lo que sobra)
-   [x] **23.7** `resource-roles.seeder.ts` construye la matriz (ADMIN
    58, SELLER 7) y `resource-roles.swagger.ts`
-   [x] **23.8** archivos `.http` de ambos features
-   [x] `npx tsc --noEmit` OK

------------------------------------------------------------------------

## 23.1 DTOs de RoleUsers

``` bash
: > src/features/auth/role-users/dto/create-role-user.dto.ts
cat >> src/features/auth/role-users/dto/create-role-user.dto.ts << 'EOF'
/**
 * Datos de entrada de `POST /api/asignaciones-rol` — **asignar un rol a un usuario**.
 *
 * Es el primer eslabón de la autorización. Se envía la pareja de identificadores;
 * si la asignación ya existía inactiva, se **reactiva** en lugar de duplicarla
 * (la restricción única `(user_id, role_id)` lo garantiza).
 */
export interface CreateRoleUserDto {
  user_id: number;
  role_id: number;
}
EOF

: > src/features/auth/role-users/dto/role-user-response.dto.ts
cat >> src/features/auth/role-users/dto/role-user-response.dto.ts << 'EOF'
import { RoleUser, RoleUserI } from "../role-user.model";

/**
 * Respuesta HTTP de una asignación usuario-rol.
 *
 * Incluye, además de las claves foráneas, un resumen del usuario y del rol
 * (`user`, `role`) para que el consumidor no tenga que hacer dos peticiones
 * extra. La proyección del usuario **excluye la contraseña** por `attributes`
 * en el `include` del repository, no aquí: nunca sale de la base de datos.
 */
export interface RoleUserResponseDto extends RoleUserI {
  user?: { id: number; username: string; email: string } | null;
  role?: { id: number; name: string } | null;
}

/** Mapper modelo -> DTO de respuesta (objeto plano, con resúmenes si vienen). */
export function toRoleUserResponse(roleUser: RoleUser): RoleUserResponseDto {
  return roleUser.toJSON() as RoleUserResponseDto;
}
EOF

: > src/features/auth/role-users/dto/index.ts
cat >> src/features/auth/role-users/dto/index.ts << 'EOF'
export * from "./create-role-user.dto";
export * from "./role-user-response.dto";
EOF
```

![](images/clipboard-4090746268.png)

------------------------------------------------------------------------

## 23.2 RoleUsers — repository, service, controller y rutas

Asignar un rol es un *upsert* lógico, no un alta a ciegas:

| Situación de `(user_id, role_id)` | Resultado                       |
|-----------------------------------|---------------------------------|
| No existe                         | se crea la fila `active`        |
| Existe `active`                   | **409** (ya está asignado)      |
| Existe `inactive`                 | se **reactiva** (no se duplica) |

No hay borrado físico: retirar un rol es `PATCH /:id/deactivate` y la
auditoría de quién tuvo qué rol se conserva.

``` bash
: > src/features/auth/role-users/role-users.repository.ts
cat >> src/features/auth/role-users/role-users.repository.ts << 'EOF'
import { CreationAttributes, Transaction } from "sequelize";
import { RoleUser } from "./role-user.model";
import { Role } from "../roles/role.model";
import { User } from "../users/user.model";

/** `include` reutilizable: resumen del usuario (sin contraseña) y del rol. */
const SUMMARIES = [
  { model: User, as: "user", attributes: ["id", "username", "email"] },
  { model: Role, as: "role", attributes: ["id", "name"] },
];

/**
 * Capa Repository del feature RoleUsers (tabla `role_users`).
 * Única que habla con Sequelize. La proyección del usuario excluye `password`.
 */
export class RoleUsersRepository {
  /** Asignaciones activas (con resumen de usuario y rol). */
  public async findAllActive(): Promise<RoleUser[]> {
    return RoleUser.findAll({ where: { status: "active" }, include: SUMMARIES });
  }

  /** Una asignación por PK (o `null`). */
  public async findById(id: number, transaction?: Transaction): Promise<RoleUser | null> {
    return RoleUser.findByPk(id, { include: SUMMARIES, transaction });
  }

  /**
   * La asignación de un usuario a un rol, sea cual sea su estado.
   *
   * Permite la semántica *create-or-reactivate*: si ya existe inactiva, se
   * reactiva en lugar de chocar con la restricción única `(user_id, role_id)`.
   */
  public async findByUserAndRole(userId: number, roleId: number): Promise<RoleUser | null> {
    return RoleUser.findOne({ where: { user_id: userId, role_id: roleId } });
  }

  /** Inserta una asignación. */
  public async create(data: CreationAttributes<RoleUser>): Promise<RoleUser> {
    return RoleUser.create(data);
  }

  /** Persiste cambios sobre una instancia existente. */
  public async update(roleUser: RoleUser, data: Partial<RoleUser>): Promise<RoleUser> {
    return roleUser.update(data);
  }
}
EOF

: > src/features/auth/role-users/role-users.service.ts
cat >> src/features/auth/role-users/role-users.service.ts << 'EOF'
import {
  CreateRoleUserDto,
  RoleUserResponseDto,
  toRoleUserResponse,
} from "./dto";
import { RoleUsersRepository } from "./role-users.repository";
import { RoleUser } from "./role-user.model";
import { UsersRepository } from "../users/users.repository";
import { RolesRepository } from "../roles/roles.repository";
import { AppError } from "../../../shared/errors/app-error";

/**
 * Capa Service del feature RoleUsers — **asignaciones usuario ↔ rol**.
 *
 * Aquí empieza la administración de la autorización. Reglas de negocio:
 *  - Solo se asigna un rol **activo** a un usuario **activo** (un eslabón
 *    inactivo rompería la cadena y el permiso no se concedería de todos modos).
 *  - Asignar es **idempotente**: si la pareja ya existía desactivada, se
 *    reactiva; si ya estaba activa, se informa 409 sin duplicar filas.
 *  - Retirar es un borrado lógico: preserva la auditoría y es reversible.
 *
 * El efecto es inmediato: la próxima petición del usuario vuelve a consultar la
 * cadena RBAC y ya ve (o deja de ver) el permiso. No hay caché que invalidar.
 */
export class RoleUsersService {
  public constructor(
    private readonly repository: RoleUsersRepository = new RoleUsersRepository(),
    private readonly usersRepository: UsersRepository = new UsersRepository(),
    private readonly rolesRepository: RolesRepository = new RolesRepository()
  ) {}

  // ================== READ ==================
  public async getAll(): Promise<RoleUserResponseDto[]> {
    const assignments = await this.repository.findAllActive();
    return assignments.map((assignment) => toRoleUserResponse(assignment));
  }

  public async getOne(id: number): Promise<RoleUserResponseDto> {
    return toRoleUserResponse(await this.findOrFail(id));
  }

  // ================== CREATE (asignar) ==================
  /** Asigna un rol a un usuario (o reactiva la asignación existente). */
  public async assign(body: CreateRoleUserDto): Promise<RoleUserResponseDto> {
    if (!body.user_id || !body.role_id) {
      throw new AppError(400, "user_id and role_id are required");
    }

    await this.assertUserActive(body.user_id);
    await this.assertRoleActive(body.role_id);

    const existing = await this.repository.findByUserAndRole(body.user_id, body.role_id);
    if (existing) {
      if (existing.status === "active") {
        throw new AppError(409, "Role is already assigned to this user");
      }
      const reactivated = await this.repository.update(existing, { status: "active" });
      return toRoleUserResponse(await this.reload(reactivated.id));
    }

    const created = await this.repository.create({
      user_id: body.user_id,
      role_id: body.role_id,
      status: "active",
    });
    return toRoleUserResponse(await this.reload(created.id));
  }

  // ================== STATE (retirar / reactivar) ==================
  /** Retirar el rol -> `status = inactive`. El usuario pierde los permisos del rol. */
  public async deactivate(id: number): Promise<RoleUserResponseDto> {
    const assignment = await this.findOrFail(id);
    await this.repository.update(assignment, { status: "inactive" });
    return toRoleUserResponse(await this.reload(assignment.id));
  }

  /** Reactivar la asignación. */
  public async reactivate(id: number): Promise<RoleUserResponseDto> {
    const assignment = await this.findOrFail(id, false);
    if (assignment.status === "active") {
      throw new AppError(409, "Assignment is already active");
    }
    await this.repository.update(assignment, { status: "active" });
    return toRoleUserResponse(await this.reload(assignment.id));
  }

  // ================== HELPERS ==================
  private async findOrFail(id: number, onlyActive = true): Promise<RoleUser> {
    const assignment = await this.repository.findById(id);
    if (!assignment || (onlyActive && assignment.status !== "active")) {
      throw new AppError(404, "Role assignment not found");
    }
    return assignment;
  }

  /** Recarga con los `include` de resumen (el `findById` ya los trae). */
  private async reload(id: number): Promise<RoleUser> {
    const assignment = await this.repository.findById(id);
    if (!assignment) {
      throw new AppError(404, "Role assignment not found");
    }
    return assignment;
  }

  private async assertUserActive(userId: number): Promise<void> {
    const user = await this.usersRepository.findById(userId);
    if (!user || user.status !== "active") {
      throw new AppError(404, "User not found or inactive");
    }
  }

  private async assertRoleActive(roleId: number): Promise<void> {
    const role = await this.rolesRepository.findById(roleId);
    if (!role || role.status !== "active") {
      throw new AppError(404, "Role not found or inactive");
    }
  }
}
EOF

: > src/features/auth/role-users/role-users.controller.ts
cat >> src/features/auth/role-users/role-users.controller.ts << 'EOF'
import { Request, Response } from "express";
import { BaseController } from "../../../shared/http/base-controller";
import { CreateRoleUserDto } from "./dto";
import { RoleUsersService } from "./role-users.service";

/**
 * Capa Controller del feature RoleUsers.
 *
 * Orden de operaciones (el mismo patrón del proyecto):
 * getAll → getOne → assign (create) → deactivate → reactivate.
 * No expone borrado físico: la revocación es lógica para preservar auditoría.
 */
export class RoleUsersController extends BaseController {
  public constructor(
    private readonly service: RoleUsersService = new RoleUsersService()
  ) {
    super();
  }

  // ================== READ ==================
  public async getAll(_req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const assignments = await this.service.getAll();
      res.status(200).json({ assignments });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const assignment = await this.service.getOne(this.paramId(req));
      res.status(200).json({ assignment });
    });
  }

  // ================== CREATE (asignar) ==================
  public async assign(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const assignment = await this.service.assign(req.body as CreateRoleUserDto);
      res.status(201).json({ assignment });
    });
  }

  // ================== STATE ==================
  /** Retirar el rol (borrado lógico). */
  public async deactivate(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const assignment = await this.service.deactivate(this.paramId(req));
      res.status(200).json({ message: "Role assignment deactivated", assignment });
    });
  }

  /** Reactivar la asignación. */
  public async reactivate(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const assignment = await this.service.reactivate(this.paramId(req));
      res.status(200).json({ message: "Role assignment reactivated", assignment });
    });
  }
}
EOF

: > src/features/auth/role-users/role-users.routes.ts
cat >> src/features/auth/role-users/role-users.routes.ts << 'EOF'
import { Application } from "express";
import { RoleUsersController } from "./role-users.controller";
import { authenticate, authorize } from "../access";

/**
 * Rutas del feature RoleUsers — **modalidad 3 (JWT + RBAC)**.
 *
 * Es la vía administrativa para **asignar un rol a un usuario**:
 * `POST /api/asignaciones-rol` con `{ user_id, role_id }`.
 *
 * No hay borrado físico: retirar un rol es un borrado lógico (`/deactivate`) y
 * es reversible (`/reactivate`). La auditoría de quién tuvo qué rol se conserva.
 */
export class RoleUsersRoutes {
  public roleUsersController: RoleUsersController = new RoleUsersController();

  public routes(app: Application): void {
    // getAll
    app
      .route("/api/asignaciones-rol")
      .get(
        authenticate,
        authorize,
        this.roleUsersController.getAll.bind(this.roleUsersController)
      );

    // getOne
    app
      .route("/api/asignaciones-rol/:id")
      .get(
        authenticate,
        authorize,
        this.roleUsersController.getOne.bind(this.roleUsersController)
      );

    // asignar rol (create)
    app
      .route("/api/asignaciones-rol")
      .post(
        authenticate,
        authorize,
        this.roleUsersController.assign.bind(this.roleUsersController)
      );

    // retirar rol (delete lógico)
    app
      .route("/api/asignaciones-rol/:id/deactivate")
      .patch(
        authenticate,
        authorize,
        this.roleUsersController.deactivate.bind(this.roleUsersController)
      );

    // reactivar asignación
    app
      .route("/api/asignaciones-rol/:id/reactivate")
      .patch(
        authenticate,
        authorize,
        this.roleUsersController.reactivate.bind(this.roleUsersController)
      );
  }
}
EOF
```

![](images/clipboard-1884897591.png)

------------------------------------------------------------------------

## 23.3 RoleUsers — seeder y swagger

``` bash
: > src/features/auth/role-users/role-users.seeder.ts
cat >> src/features/auth/role-users/role-users.seeder.ts << 'EOF'
import { RoleUser } from "./role-user.model";
import { Role } from "../roles/role.model";
import { User } from "../users/user.model";

/**
 * Seeder de las asignaciones usuario ↔ rol (`role_users`).
 *
 * Crea las dos asignaciones de referencia. Con esto el usuario `admin` hereda
 * los 58 recursos de `ADMIN` y el usuario `seller` los 7 de `SELLER`, sin
 * escribir ni una fila de autorización a mano.
 *
 * Idempotente: si la pareja ya existe (activa o no), se asegura de que quede
 * activa en lugar de duplicarla.
 */
export const SEED_ROLE_USERS = [
  { username: "admin", roleName: "ADMIN" },
  { username: "seller", roleName: "SELLER" },
] as const;

export async function seedRoleUsers(): Promise<number> {
  let created = 0;

  for (const item of SEED_ROLE_USERS) {
    const user = await User.findOne({ where: { username: item.username } });
    const role = await Role.findOne({ where: { name: item.roleName } });

    if (!user || !role) {
      console.log(
        `⏭️  role_users: falta ${item.username} o ${item.roleName}, se omite esa asignación`
      );
      continue;
    }

    const [assignment, wasCreated] = await RoleUser.findOrCreate({
      where: { user_id: user.id, role_id: role.id },
      defaults: { user_id: user.id, role_id: role.id, status: "active" },
    });

    if (wasCreated) {
      created++;
      continue;
    }
    if (assignment.status !== "active") {
      await assignment.update({ status: "active" });
    }
  }

  console.log(
    `✅ role_users: asignaciones reconciliadas (${SEED_ROLE_USERS.length}, ${created} nuevas)`
  );
  return created;
}
EOF

: > src/features/auth/role-users/role-users.swagger.ts
cat >> src/features/auth/role-users/role-users.swagger.ts << 'EOF'
import {
  bearerSecurity,
  forbiddenResponse,
  invalidIdResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "../../../shared/http/swagger-security";

/**
 * Documentación OpenAPI del feature RoleUsers — **asignaciones usuario ↔ rol**.
 *
 * Modalidad: **JWT + RBAC** en todas las operaciones.
 *
 * Estas rutas son una de las dos vías administrativas de la autorización:
 * `POST /api/asignaciones-rol` **asigna un rol a un usuario**, primer eslabón de
 * la cadena. Sin asignación activa no hay permisos, por muchos roles que existan.
 */
export const roleUsersSwagger = {
  tags: [
    {
      name: "Asignaciones usuario-rol",
      description:
        "Asignar / retirar / reactivar el rol de un usuario (`role_users`) — **JWT + RBAC**",
    },
  ],
  paths: {
    "/api/asignaciones-rol": {
      get: {
        tags: ["Asignaciones usuario-rol"],
        summary: "Listar asignaciones activas",
        description:
          "JWT + RBAC — recurso `GET /api/asignaciones-rol`. Incluye un resumen del usuario (sin `password`) y del rol.",
        security: bearerSecurity,
        responses: {
          "200": { description: "Lista de asignaciones (`{ assignments: [...] }`)" },
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
        },
      },
      post: {
        tags: ["Asignaciones usuario-rol"],
        summary: "Asignar rol a usuario",
        description:
          "JWT + RBAC — recurso `POST /api/asignaciones-rol`. " +
          "Cuerpo: `{ user_id, role_id }`. Es idempotente: si la pareja existía desactivada, se reactiva. " +
          "El usuario y el rol deben estar activos.",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RoleUserCreate" } },
          },
        },
        responses: {
          "201": { description: "Asignación creada (`{ assignment }`)" },
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": { description: "Usuario o rol inexistente o inactivo" },
          "409": { description: "El rol ya está asignado a ese usuario" },
        },
      },
    },
    "/api/asignaciones-rol/{id}": {
      get: {
        tags: ["Asignaciones usuario-rol"],
        summary: "Obtener asignación por id",
        description: "JWT + RBAC — recurso `GET /api/asignaciones-rol/:id`.",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Asignación (`{ assignment }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
    },
    "/api/asignaciones-rol/{id}/deactivate": {
      patch: {
        tags: ["Asignaciones usuario-rol"],
        summary: "Retirar rol a usuario (borrado lógico)",
        description:
          "JWT + RBAC — recurso `PATCH /api/asignaciones-rol/:id/deactivate`. " +
          "Rompe el eslabón `role_users` -> el usuario pierde los permisos de ese rol de inmediato (403).",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Asignación desactivada (`{ message, assignment }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
    },
    "/api/asignaciones-rol/{id}/reactivate": {
      patch: {
        tags: ["Asignaciones usuario-rol"],
        summary: "Reactivar asignación",
        description:
          "JWT + RBAC — recurso `PATCH /api/asignaciones-rol/:id/reactivate`. Reversible: vuelve a conceder los permisos del rol.",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Asignación reactivada (`{ message, assignment }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
          "409": { description: "La asignación ya estaba activa" },
        },
      },
    },
  },
  components: {
    schemas: {
      RoleUser: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          user_id: { type: "integer", example: 1 },
          role_id: { type: "integer", example: 1 },
          status: { type: "string", enum: ["active", "inactive"], example: "active" },
          user: {
            type: "object",
            properties: {
              id: { type: "integer" },
              username: { type: "string" },
              email: { type: "string", format: "email" },
            },
          },
          role: {
            type: "object",
            properties: { id: { type: "integer" }, name: { type: "string" } },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      RoleUserCreate: {
        type: "object",
        required: ["user_id", "role_id"],
        properties: {
          user_id: { type: "integer", example: 2 },
          role_id: { type: "integer", example: 2 },
        },
      },
    },
  },
};
EOF
```

![](images/clipboard-1619270049.png)

------------------------------------------------------------------------

## 23.4 DTOs de ResourceRoles

``` bash
: > src/features/auth/resource-roles/dto/create-resource-role.dto.ts
cat >> src/features/auth/resource-roles/dto/create-resource-role.dto.ts << 'EOF'
/**
 * Datos de entrada de `POST /api/concesiones-rol` — **conceder un recurso a un rol**.
 *
 * Esta operación **crea un permiso**: el permiso no es una entidad con nombre,
 * es la tupla `(role_id, resource_id)` materializada en `resource_roles`. Si la
 * concesión ya existía inactiva, se reactiva en lugar de duplicarla.
 *
 * Ejemplo: conceder `POST /api/ventas` al rol `SELLER` significa que los
 * usuarios con ese rol podrán registrar ventas, sin tocar el código.
 */
export interface CreateResourceRoleDto {
  role_id: number;
  resource_id: number;
}
EOF

: > src/features/auth/resource-roles/dto/list-resource-roles.dto.ts
cat >> src/features/auth/resource-roles/dto/list-resource-roles.dto.ts << 'EOF'
/**
 * Filtros de `GET /api/concesiones-rol`.
 * Permiten pedir "los permisos de este rol" o "los roles que conceden este recurso".
 */
export interface ListResourceRolesDto {
  role_id?: number;
  resource_id?: number;
}
EOF

: > src/features/auth/resource-roles/dto/resource-role-response.dto.ts
cat >> src/features/auth/resource-roles/dto/resource-role-response.dto.ts << 'EOF'
import { ResourceRole, ResourceRoleI } from "../resource-role.model";

/**
 * Respuesta HTTP de una concesión rol-recurso (un permiso).
 *
 * Incluye un resumen del rol y del recurso: `resource` lleva `(method, path)`,
 * que es exactamente el par que evalúa el middleware de autorización.
 */
export interface ResourceRoleResponseDto extends ResourceRoleI {
  role?: { id: number; name: string } | null;
  resource?: {
    id: number;
    method: string;
    path: string;
    description: string | null;
  } | null;
}

/** Mapper modelo -> DTO de respuesta (objeto plano). */
export function toResourceRoleResponse(resourceRole: ResourceRole): ResourceRoleResponseDto {
  return resourceRole.toJSON() as ResourceRoleResponseDto;
}

/**
 * Un permiso **efectivo**: el resultado de recorrer la cadena completa
 * `role_users → roles → resource_roles → resources` para un usuario concreto.
 *
 * Es plano a propósito: el middleware de autorización solo necesita
 * `(method, path)`; el resto es información útil para el endpoint de consulta.
 */
export interface EffectivePermissionDto {
  resource_id: number;
  method: string;
  path: string;
  description: string | null;
  role_id: number;
  role_name: string;
}
EOF

: > src/features/auth/resource-roles/dto/index.ts
cat >> src/features/auth/resource-roles/dto/index.ts << 'EOF'
export * from "./create-resource-role.dto";
export * from "./list-resource-roles.dto";
export * from "./resource-role-response.dto";
EOF
```

![](images/clipboard-1206060603.png)

El DTO de listado admite dos filtros que se usan para auditar la matriz
desde ambos lados:

-   `?role_id=` — «¿qué concede este rol?»
-   `?resource_id=` — «¿qué roles conceden este recurso?»

------------------------------------------------------------------------

## 23.5 ResourceRoles — repository, service, controller y rutas

`POST /api/concesiones-rol` con `{ role_id, resource_id }` materializa
el permiso. Misma semántica idempotente que en RoleUsers.

``` bash
: > src/features/auth/resource-roles/resource-roles.repository.ts
cat >> src/features/auth/resource-roles/resource-roles.repository.ts << 'EOF'
import { CreationAttributes, Op, Transaction } from "sequelize";
import { ResourceRole } from "./resource-role.model";
import { Role } from "../roles/role.model";
import { Resource } from "../resources/resource.model";
import { RoleUser } from "../role-users/role-user.model";
import { EffectivePermissionDto } from "./dto";

/** `include` reutilizable: resumen del rol y del recurso (con `method`/`path`). */
const SUMMARIES = [
  { model: Role, as: "role", attributes: ["id", "name"] },
  {
    model: Resource,
    as: "resource",
    attributes: ["id", "method", "path", "description"],
  },
];

/**
 * Capa Repository del feature ResourceRoles (tabla `resource_roles`).
 *
 * Aquí vive la **consulta de autorización efectiva**: la única que recorre la
 * cadena completa de seguridad. Es el corazón del RBAC.
 */
export class ResourceRolesRepository {
  /** Todas las concesiones activas (con resumen de rol y recurso). */
  public async findAllActive(): Promise<ResourceRole[]> {
    return ResourceRole.findAll({ where: { status: "active" }, include: SUMMARIES });
  }

  /** Concesiones activas filtradas por rol y/o recurso. */
  public async findAllActiveFiltered(filters: {
    role_id?: number;
    resource_id?: number;
  }): Promise<ResourceRole[]> {
    const where: Record<string, unknown> = { status: "active" };
    if (filters.role_id) where.role_id = filters.role_id;
    if (filters.resource_id) where.resource_id = filters.resource_id;

    return ResourceRole.findAll({ where, include: SUMMARIES, order: [["id", "ASC"]] });
  }

  /** Una concesión por PK (o `null`). */
  public async findById(id: number, transaction?: Transaction): Promise<ResourceRole | null> {
    return ResourceRole.findByPk(id, { include: SUMMARIES, transaction });
  }

  /** La concesión de un recurso a un rol, sea cual sea su estado. */
  public async findByRoleAndResource(
    roleId: number,
    resourceId: number
  ): Promise<ResourceRole | null> {
    return ResourceRole.findOne({
      where: { role_id: roleId, resource_id: resourceId },
    });
  }

  /** Todas las concesiones (activas e inactivas) de un rol. */
  public async findAllByRole(roleId: number, transaction?: Transaction): Promise<ResourceRole[]> {
    return ResourceRole.findAll({ where: { role_id: roleId }, transaction });
  }

  /** Inserta una concesión. */
  public async create(
    data: CreationAttributes<ResourceRole>,
    transaction?: Transaction
  ): Promise<ResourceRole> {
    return ResourceRole.create(data, { transaction });
  }

  /** Persiste cambios sobre una instancia existente. */
  public async update(
    resourceRole: ResourceRole,
    data: Partial<ResourceRole>,
    transaction?: Transaction
  ): Promise<ResourceRole> {
    return resourceRole.update(data, { transaction });
  }

  /**
   * **CONSULTA DE AUTORIZACIÓN EFECTIVA** (`docs/bd-storelab.md` §16).
   *
   * Devuelve los recursos que un usuario puede ejecutar, recorriendo la cadena
   * y exigiendo `status = 'active'` en **los cuatro eslabones**:
   *
   * ```sql
   * resource_roles (rr)  -> rr.status = active
   *   JOIN roles (ro)     -> ro.status = active
   *   JOIN role_users(ru) -> ru.status = active AND ru.user_id = :userId
   *   JOIN resources (r)  -> r.status  = active
   * ```
   *
   * Si cualquier eslabón está inactivo o ausente, la fila no aparece: el
   * resultado vacío se traduce en **deny by default** en el middleware.
   *
   * Los `include` con `required: true` producen INNER JOIN; no se usan
   * `attributes` del `RoleUser` porque solo interesa que exista y cumpla el WHERE.
   */
  public async findEffectiveForUser(userId: number): Promise<EffectivePermissionDto[]> {
    const rows = await ResourceRole.findAll({
      where: { status: "active" },
      attributes: ["id"],
      include: [
        {
          model: Role,
          as: "role",
          required: true,
          attributes: ["id", "name"],
          where: { status: "active" },
          include: [
            {
              model: RoleUser,
              as: "role_users",
              required: true,
              attributes: [],
              where: { status: "active", user_id: userId },
            },
          ],
        },
        {
          model: Resource,
          as: "resource",
          required: true,
          attributes: ["id", "method", "path", "description"],
          where: { status: "active" },
        },
      ],
      order: [["id", "ASC"]],
    });

    return rows.map((row) => {
      const plain = row.toJSON() as unknown as {
        role: { id: number; name: string };
        resource: { id: number; method: string; path: string; description: string | null };
      };
      return {
        resource_id: plain.resource.id,
        method: plain.resource.method,
        path: plain.resource.path,
        description: plain.resource.description,
        role_id: plain.role.id,
        role_name: plain.role.name,
      };
    });
  }

  /** Cuenta las concesiones activas de un rol. */
  public async countActiveByRole(roleId: number): Promise<number> {
    return ResourceRole.count({ where: { role_id: roleId, status: "active" } });
  }

  /** Cuenta las concesiones activas totales. */
  public async countActive(): Promise<number> {
    return ResourceRole.count({ where: { status: "active" } });
  }

  /** Cuenta las concesiones activas cuyo recurso está en una lista de ids. */
  public async countActiveByResources(resourceIds: number[]): Promise<number> {
    if (resourceIds.length === 0) return 0;
    return ResourceRole.count({
      where: { resource_id: { [Op.in]: resourceIds }, status: "active" },
    });
  }
}
EOF
```

``` bash
: > src/features/auth/resource-roles/resource-roles.service.ts
cat >> src/features/auth/resource-roles/resource-roles.service.ts << 'EOF'
import {
  CreateResourceRoleDto,
  EffectivePermissionDto,
  ListResourceRolesDto,
  ResourceRoleResponseDto,
  toResourceRoleResponse,
} from "./dto";
import { ResourceRolesRepository } from "./resource-roles.repository";
import { ResourceRole } from "./resource-role.model";
import { RolesRepository } from "../roles/roles.repository";
import { ResourcesRepository } from "../resources/resources.repository";
import { AppError } from "../../../shared/errors/app-error";
import { withTransaction } from "../../../shared/database/with-transaction";

/** Resumen de una reconciliación de concesiones de un rol. */
export interface ReconcileResult {
  role_id: number;
  activated: number;
  deactivated: number;
  total_active: number;
}

/**
 * Capa Service del feature ResourceRoles — **la gestión de permisos**.
 *
 * Aquí es donde el modelo "Role + Resource = permiso" se vuelve operativo:
 *  - `grant`     -> concede un recurso a un rol (crea o reactiva la concesión).
 *  - `deactivate`-> retira el permiso (borrado lógico, reversible).
 *  - `findEffectiveForUser` -> materializa los permisos de un usuario concreto.
 *  - `reconcileRole` -> deja el catálogo de un rol exactamente en un conjunto
 *    dado de recursos (idempotente); lo usa el seeder para el rol `SELLER`.
 *
 * Nada de esto requiere desplegar código: son filas.
 */
export class ResourceRolesService {
  public constructor(
    private readonly repository: ResourceRolesRepository = new ResourceRolesRepository(),
    private readonly rolesRepository: RolesRepository = new RolesRepository(),
    private readonly resourcesRepository: ResourcesRepository = new ResourcesRepository()
  ) {}

  // ================== READ ==================
  public async getAll(filters: ListResourceRolesDto = {}): Promise<ResourceRoleResponseDto[]> {
    const grants = await this.repository.findAllActiveFiltered({
      role_id: filters.role_id,
      resource_id: filters.resource_id,
    });
    return grants.map((grant) => toResourceRoleResponse(grant));
  }

  public async getOne(id: number): Promise<ResourceRoleResponseDto> {
    return toResourceRoleResponse(await this.findOrFail(id));
  }

  /** Permisos efectivos de un usuario (cadena RBAC completa, todos los eslabones activos). */
  public async findEffectiveForUser(userId: number): Promise<EffectivePermissionDto[]> {
    return this.repository.findEffectiveForUser(userId);
  }

  // ================== CREATE (conceder) ==================
  /** Concede un recurso a un rol (crea el permiso o reactiva la concesión). */
  public async grant(body: CreateResourceRoleDto): Promise<ResourceRoleResponseDto> {
    if (!body.role_id || !body.resource_id) {
      throw new AppError(400, "role_id and resource_id are required");
    }

    const role = await this.rolesRepository.findById(body.role_id);
    if (!role || role.status !== "active") {
      throw new AppError(404, "Role not found or inactive");
    }
    const resource = await this.resourcesRepository.findById(body.resource_id);
    if (!resource || resource.status !== "active") {
      throw new AppError(404, "Resource not found or inactive");
    }

    const existing = await this.repository.findByRoleAndResource(body.role_id, body.resource_id);
    if (existing) {
      if (existing.status === "active") {
        throw new AppError(409, "Role already has this resource granted");
      }
      const reactivated = await this.repository.update(existing, { status: "active" });
      return toResourceRoleResponse(await this.reload(reactivated.id));
    }

    const created = await this.repository.create({
      role_id: body.role_id,
      resource_id: body.resource_id,
      status: "active",
    });
    return toResourceRoleResponse(await this.reload(created.id));
  }

  // ================== STATE (retirar / reactivar) ==================
  /** Retirar el permiso -> `status = inactive`. Solo se pierde esa operación. */
  public async deactivate(id: number): Promise<ResourceRoleResponseDto> {
    const grant = await this.findOrFail(id);
    await this.repository.update(grant, { status: "inactive" });
    return toResourceRoleResponse(await this.reload(grant.id));
  }

  /** Reactivar la concesión. */
  public async reactivate(id: number): Promise<ResourceRoleResponseDto> {
    const grant = await this.findOrFail(id, false);
    if (grant.status === "active") {
      throw new AppError(409, "Grant is already active");
    }
    await this.repository.update(grant, { status: "active" });
    return toResourceRoleResponse(await this.reload(grant.id));
  }

  // ================== RECONCILIACIÓN ==================
  /**
   * Deja las concesiones de un rol **exactamente** en `resourceIds`.
   *
   * - Recursos de la lista sin concesión -> se conceden.
   * - Recursos de la lista con concesión inactiva -> se reactivan.
   * - Recursos concedidos que no están en la lista -> se retiran (inactive).
   *
   * Todo dentro de una transacción: o el rol queda con ese catálogo exacto, o no
   * se toca nada. Lo usa el seeder para el rol `SELLER` (7 recursos) y `ADMIN`
   * (58), de modo que volver a ejecutar el seeder reconcilia en vez de duplicar.
   */
  public async reconcileRole(roleId: number, resourceIds: number[]): Promise<ReconcileResult> {
    const role = await this.rolesRepository.findById(roleId);
    if (!role) {
      throw new AppError(404, "Role not found");
    }

    const wanted = new Set(resourceIds);

    return withTransaction(async (t) => {
      const existing = await this.repository.findAllByRole(roleId, t);
      const byResource = new Map(existing.map((row) => [row.resource_id, row]));

      let activated = 0;
      let deactivated = 0;

      for (const resourceId of wanted) {
        const row = byResource.get(resourceId);
        if (!row) {
          await this.repository.create(
            { role_id: roleId, resource_id: resourceId, status: "active" },
            t
          );
          activated++;
          continue;
        }
        if (row.status !== "active") {
          await this.repository.update(row, { status: "active" }, t);
          activated++;
        }
      }

      for (const row of existing) {
        if (wanted.has(row.resource_id)) continue;
        if (row.status === "active") {
          await this.repository.update(row, { status: "inactive" }, t);
          deactivated++;
        }
      }

      return {
        role_id: roleId,
        activated,
        deactivated,
        total_active: wanted.size,
      };
    });
  }

  // ================== HELPERS ==================
  private async findOrFail(id: number, onlyActive = true): Promise<ResourceRole> {
    const grant = await this.repository.findById(id);
    if (!grant || (onlyActive && grant.status !== "active")) {
      throw new AppError(404, "Grant not found");
    }
    return grant;
  }

  private async reload(id: number): Promise<ResourceRole> {
    const grant = await this.repository.findById(id);
    if (!grant) {
      throw new AppError(404, "Grant not found");
    }
    return grant;
  }
}
EOF

: > src/features/auth/resource-roles/resource-roles.controller.ts
cat >> src/features/auth/resource-roles/resource-roles.controller.ts << 'EOF'
import { Request, Response } from "express";
import { BaseController } from "../../../shared/http/base-controller";
import { CreateResourceRoleDto } from "./dto";
import { ResourceRolesService } from "./resource-roles.service";

/**
 * Capa Controller del feature ResourceRoles.
 *
 * Orden de operaciones: getAll → getOne → grant (create) → deactivate → reactivate.
 * `GET /api/concesiones-rol` acepta filtros `?role_id=` y `?resource_id=`.
 */
export class ResourceRolesController extends BaseController {
  public constructor(
    private readonly service: ResourceRolesService = new ResourceRolesService()
  ) {
    super();
  }

  // ================== READ ==================
  public async getAll(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const grants = await this.service.getAll({
        role_id: toOptionalNumber(req.query.role_id),
        resource_id: toOptionalNumber(req.query.resource_id),
      });
      res.status(200).json({ grants });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const grant = await this.service.getOne(this.paramId(req));
      res.status(200).json({ grant });
    });
  }

  // ================== CREATE (conceder permiso) ==================
  public async grant(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const grant = await this.service.grant(req.body as CreateResourceRoleDto);
      res.status(201).json({ message: "Resource granted to role", grant });
    });
  }

  // ================== STATE ==================
  /** Retirar el permiso (borrado lógico). */
  public async deactivate(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const grant = await this.service.deactivate(this.paramId(req));
      res.status(200).json({ message: "Grant deactivated (permission revoked)", grant });
    });
  }

  /** Reactivar la concesión. */
  public async reactivate(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const grant = await this.service.reactivate(this.paramId(req));
      res.status(200).json({ message: "Grant reactivated", grant });
    });
  }
}

/** Convierte un `query param` en número o `undefined` (sin lanzar por basura). */
function toOptionalNumber(value: unknown): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string" || !/^\d+$/.test(raw)) return undefined;
  return Number(raw);
}
EOF

: > src/features/auth/resource-roles/resource-roles.routes.ts
cat >> src/features/auth/resource-roles/resource-roles.routes.ts << 'EOF'
import { Application } from "express";
import { ResourceRolesController } from "./resource-roles.controller";
import { authenticate, authorize } from "../access";

/**
 * Rutas del feature ResourceRoles — **modalidad 3 (JWT + RBAC)**.
 *
 * Es la vía administrativa para **conceder un recurso a un rol** (crear un
 * permiso):
 * `POST /api/concesiones-rol` con `{ role_id, resource_id }`.
 *
 * El efecto es inmediato y por datos: la siguiente petición del usuario afectado
 * ya consulta la nueva matriz. No se reinicia el servidor ni se despliega nada.
 */
export class ResourceRolesRoutes {
  public resourceRolesController: ResourceRolesController = new ResourceRolesController();

  public routes(app: Application): void {
    // getAll (filtros ?role_id= y ?resource_id=)
    app
      .route("/api/concesiones-rol")
      .get(
        authenticate,
        authorize,
        this.resourceRolesController.getAll.bind(this.resourceRolesController)
      );

    // getOne
    app
      .route("/api/concesiones-rol/:id")
      .get(
        authenticate,
        authorize,
        this.resourceRolesController.getOne.bind(this.resourceRolesController)
      );

    // conceder recurso a rol (create)
    app
      .route("/api/concesiones-rol")
      .post(
        authenticate,
        authorize,
        this.resourceRolesController.grant.bind(this.resourceRolesController)
      );

    // retirar permiso (delete lógico)
    app
      .route("/api/concesiones-rol/:id/deactivate")
      .patch(
        authenticate,
        authorize,
        this.resourceRolesController.deactivate.bind(this.resourceRolesController)
      );

    // reactivar permiso
    app
      .route("/api/concesiones-rol/:id/reactivate")
      .patch(
        authenticate,
        authorize,
        this.resourceRolesController.reactivate.bind(this.resourceRolesController)
      );
  }
}
EOF
```

![](images/clipboard-2604895113.png)

------------------------------------------------------------------------

## 23.6 `reconcileRole` — la matriz determinista

`reconcileRole(roleId, resourceIds)` es el método que hace que un seeder
(o un proceso de despliegue) pueda **declarar** los permisos de un rol
en lugar de mutarlos a mano:

| Recurso en la lista | Fila previa | Acción                  |
|---------------------|-------------|-------------------------|
| sí                  | no existe   | concede                 |
| sí                  | `inactive`  | reactiva                |
| sí                  | `active`    | no toca                 |
| no                  | `active`    | retira (borrado lógico) |

Es total y determinista: al terminar, el conjunto de concesiones activas
del rol es **exactamente** la lista recibida. Por eso el rol `SELLER`
nunca acumula permisos por accidente al reejecutar el seeder.

``` text
reconcileRole(ADMIN,  RESOURCE_CATALOG)  → 58 activas
reconcileRole(SELLER, SELLER_RESOURCES)  →  7 activas
```

![](images/clipboard-2471430844.png)

------------------------------------------------------------------------

## 23.7 Seeder de la matriz y swagger

``` bash
: > src/features/auth/resource-roles/resource-roles.seeder.ts
cat >> src/features/auth/resource-roles/resource-roles.seeder.ts << 'EOF'
import { Resource } from "../resources/resource.model";
import { Role } from "../roles/role.model";
import { RESOURCE_CATALOG, SELLER_RESOURCES } from "../resources/resource-catalog";
import { ResourceRolesService } from "./resource-roles.service";

/**
 * Seeder de las concesiones rol ↔ recurso (`resource_roles`). **Es el que
 * construye la matriz de permisos.**
 *
 * Reparto de referencia (`docs/bd-storelab.md` §21):
 *  - `ADMIN`  -> los **58** recursos (administración total).
 *  - `SELLER` -> los **7** recursos de operación (consultar clientes y
 *    productos, consultar y registrar ventas).
 *
 * Como `reconcileRole` es determinista, reejecutar el seeder **reconcilia** el
 * catálogo: concede lo que falte, reactiva lo inactivo y retira lo que sobre.
 * Así el rol `SELLER` nunca acumula permisos por accidente.
 */
export async function seedResourceRoles(): Promise<number> {
  const service = new ResourceRolesService();

  const resources = await Resource.findAll({ where: { status: "active" } });
  const idByOperation = new Map(
    resources.map((resource) => [`${resource.method} ${resource.path}`, resource.id])
  );

  /** Traduce el catálogo en código a los `resource_id` reales de la base. */
  const idsFor = (catalog: ReadonlyArray<{ method: string; path: string }>): number[] =>
    catalog
      .map((item) => idByOperation.get(`${item.method} ${item.path}`))
      .filter((id): id is number => typeof id === "number");

  let total = 0;

  const admin = await Role.findOne({ where: { name: "ADMIN" } });
  if (admin) {
    const result = await service.reconcileRole(admin.id, idsFor(RESOURCE_CATALOG));
    console.log(
      `✅ resource_roles: ADMIN -> ${result.total_active} recursos ` +
        `(${result.activated} altas, ${result.deactivated} bajas)`
    );
    total += result.total_active;
  }

  const seller = await Role.findOne({ where: { name: "SELLER" } });
  if (seller) {
    const result = await service.reconcileRole(seller.id, idsFor(SELLER_RESOURCES));
    console.log(
      `✅ resource_roles: SELLER -> ${result.total_active} recursos ` +
        `(${result.activated} altas, ${result.deactivated} bajas)`
    );
    total += result.total_active;
  }

  return total;
}
EOF

: > src/features/auth/resource-roles/resource-roles.swagger.ts
cat >> src/features/auth/resource-roles/resource-roles.swagger.ts << 'EOF'
import {
  bearerSecurity,
  forbiddenResponse,
  invalidIdResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "../../../shared/http/swagger-security";

/**
 * Documentación OpenAPI del feature ResourceRoles — **la gestión de permisos**.
 *
 * Modalidad: **JWT + RBAC** en todas las operaciones.
 *
 * Aquí se materializa el principio de diseño: **no existe una entidad
 * `Permission`**. Conceder un permiso es crear (o reactivar) una fila en
 * `resource_roles`; el permiso es la tupla `(rol, recurso)`.
 */
export const resourceRolesSwagger = {
  tags: [
    {
      name: "Concesiones rol-recurso",
      description:
        "Conceder / retirar / reactivar recursos a un rol: **el permiso** — **JWT + RBAC**",
    },
  ],
  paths: {
    "/api/concesiones-rol": {
      get: {
        tags: ["Concesiones rol-recurso"],
        summary: "Listar concesiones activas",
        description:
          "JWT + RBAC — recurso `GET /api/concesiones-rol`. " +
          "Filtros opcionales: `?role_id=` (permisos de un rol) y `?resource_id=` (roles que conceden un recurso).",
        security: bearerSecurity,
        parameters: [
          { name: "role_id", in: "query", required: false, schema: { type: "integer" } },
          { name: "resource_id", in: "query", required: false, schema: { type: "integer" } },
        ],
        responses: {
          "200": { description: "Lista de concesiones (`{ grants: [...] }`)" },
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
        },
      },
      post: {
        tags: ["Concesiones rol-recurso"],
        summary: "Conceder recurso a rol (crear permiso)",
        description:
          "JWT + RBAC — recurso `POST /api/concesiones-rol`. " +
          "Cuerpo: `{ role_id, resource_id }`. Idempotente: si la concesión existía retirada, se reactiva. " +
          "Efecto inmediato y sin despliegue: la siguiente petición del usuario ya consulta la nueva matriz.",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/ResourceRoleCreate" } },
          },
        },
        responses: {
          "201": { description: "Permiso concedido (`{ message, grant }`)" },
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": { description: "Rol o recurso inexistente o inactivo" },
          "409": { description: "El rol ya tiene concedido ese recurso" },
        },
      },
    },
    "/api/concesiones-rol/{id}": {
      get: {
        tags: ["Concesiones rol-recurso"],
        summary: "Obtener concesión por id",
        description: "JWT + RBAC — recurso `GET /api/concesiones-rol/:id`.",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Concesión (`{ grant }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
    },
    "/api/concesiones-rol/{id}/deactivate": {
      patch: {
        tags: ["Concesiones rol-recurso"],
        summary: "Retirar permiso (borrado lógico)",
        description:
          "JWT + RBAC — recurso `PATCH /api/concesiones-rol/:id/deactivate`. " +
          "Solo se pierde esa operación; el resto de permisos del rol siguen vigentes.",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Permiso retirado (`{ message, grant }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
    },
    "/api/concesiones-rol/{id}/reactivate": {
      patch: {
        tags: ["Concesiones rol-recurso"],
        summary: "Reactivar permiso",
        description: "JWT + RBAC — recurso `PATCH /api/concesiones-rol/:id/reactivate`.",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Permiso reactivado (`{ message, grant }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
          "409": { description: "La concesión ya estaba activa" },
        },
      },
    },
  },
  components: {
    schemas: {
      ResourceRole: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          role_id: { type: "integer", example: 2 },
          resource_id: { type: "integer", example: 25 },
          status: { type: "string", enum: ["active", "inactive"], example: "active" },
          role: {
            type: "object",
            properties: { id: { type: "integer" }, name: { type: "string", example: "SELLER" } },
          },
          resource: {
            type: "object",
            properties: {
              id: { type: "integer" },
              method: { type: "string", example: "POST" },
              path: { type: "string", example: "/api/ventas" },
              description: { type: "string", nullable: true },
            },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ResourceRoleCreate: {
        type: "object",
        required: ["role_id", "resource_id"],
        properties: {
          role_id: { type: "integer", example: 2 },
          resource_id: { type: "integer", example: 25 },
        },
      },
    },
  },
};
EOF
```

![](images/clipboard-1956249956.png)

------------------------------------------------------------------------

## 23.8 Pruebas HTTP

``` bash
: > src/features/auth/role-users/http/role-users.assign.http
cat >> src/features/auth/role-users/http/role-users.assign.http << 'EOF'
### Feature RoleUsers — ASIGNAR ROL A USUARIO (modalidad JWT + RBAC)
### Primer eslabón de la cadena: sin asignación activa NO hay permisos.
@baseUrl = http://localhost:4000

# @name loginAdmin
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "admin",
  "password": "Admin123!"
}

@token = {{loginAdmin.response.body.$.access_token}}

### getAll — asignaciones activas (con resumen de usuario y rol)
GET {{baseUrl}}/api/asignaciones-rol
Authorization: Bearer {{token}}

### getOne
GET {{baseUrl}}/api/asignaciones-rol/1
Authorization: Bearer {{token}}

### ASIGNAR — `POST /api/asignaciones-rol` con { user_id, role_id }
### (seller = user_id 2 recibe ADMIN = role_id 1; no lo tiene todavía -> 201)
# @name assignCreate
POST {{baseUrl}}/api/asignaciones-rol
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "user_id": 2,
  "role_id": 1
}

@assignmentId = {{assignCreate.response.body.$.assignment.id}}

### 409 — ese rol ya está asignado a ese usuario (la tupla es única)
POST {{baseUrl}}/api/asignaciones-rol
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "user_id": 2,
  "role_id": 1
}

### 404 — usuario o rol inexistente/inactivo
POST {{baseUrl}}/api/asignaciones-rol
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "user_id": 9999,
  "role_id": 2
}

### RETIRAR ROL (borrado lógico) — el usuario pierde los permisos de ese rol de inmediato
PATCH {{baseUrl}}/api/asignaciones-rol/{{assignmentId}}/deactivate
Authorization: Bearer {{token}}

### Comprobación del efecto: los permisos efectivos cambian sin reiniciar nada
GET {{baseUrl}}/api/usuarios/2/permisos
Authorization: Bearer {{token}}

### REACTIVAR asignación (reversible, la auditoría se conserva)
PATCH {{baseUrl}}/api/asignaciones-rol/{{assignmentId}}/reactivate
Authorization: Bearer {{token}}
EOF

: > src/features/auth/resource-roles/http/resource-roles.grant.http
cat >> src/features/auth/resource-roles/http/resource-roles.grant.http << 'EOF'
### Feature ResourceRoles — CONCEDER / RETIRAR PERMISOS (modalidad JWT + RBAC)
### Aquí se ve el principio de diseño: NO existe entidad `Permission`.
### El permiso es la tupla (rol, recurso) materializada en `resource_roles`.
### resource_id 3 = `POST /api/clientes` (3.ª entrada del catálogo semilla).
@baseUrl = http://localhost:4000

# @name loginAdmin
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "admin",
  "password": "Admin123!"
}

# @name loginSeller
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "seller",
  "password": "Seller123!"
}

@token = {{loginAdmin.response.body.$.access_token}}
@sellerToken = {{loginSeller.response.body.$.access_token}}
@sellerRoleId = 2

### getAll — concesiones activas (ADMIN 58 + SELLER 7 = 65)
GET {{baseUrl}}/api/concesiones-rol
Authorization: Bearer {{token}}

### Filtro: permisos de un rol (?role_id=)
GET {{baseUrl}}/api/concesiones-rol?role_id={{sellerRoleId}}
Authorization: Bearer {{token}}

### Filtro inverso: qué roles conceden un recurso (?resource_id=)
GET {{baseUrl}}/api/concesiones-rol?resource_id=1
Authorization: Bearer {{token}}

### getOne
GET {{baseUrl}}/api/concesiones-rol/1
Authorization: Bearer {{token}}

### ESTADO INICIAL — SELLER no puede crear clientes -> 403 (deny by default)
POST {{baseUrl}}/api/clientes
Authorization: Bearer {{sellerToken}}
Content-Type: application/json

{
  "name": "Prueba RBAC",
  "phone": "3000000000",
  "email": "rbac.demo@example.com",
  "password": "x"
}

### CONCEDER — `POST /api/concesiones-rol` con { role_id: 2 (SELLER), resource_id: 3 (POST /api/clientes) }
# @name grantCreate
POST {{baseUrl}}/api/concesiones-rol
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "role_id": 2,
  "resource_id": 3
}

@grantId = {{grantCreate.response.body.$.grant.id}}

### EFECTO INMEDIATO — el mismo seller ahora sí puede (201), sin reiniciar el servidor
POST {{baseUrl}}/api/clientes
Authorization: Bearer {{sellerToken}}
Content-Type: application/json

{
  "name": "Prueba RBAC 2",
  "phone": "3000000001",
  "email": "rbac.demo2@example.com",
  "password": "x"
}

### RETIRAR EL PERMISO (borrado lógico) — solo se pierde esa operación
PATCH {{baseUrl}}/api/concesiones-rol/{{grantId}}/deactivate
Authorization: Bearer {{token}}

### El seller vuelve a 403
POST {{baseUrl}}/api/clientes
Authorization: Bearer {{sellerToken}}
Content-Type: application/json

{
  "name": "Prueba RBAC 3",
  "phone": "3000000002",
  "email": "rbac.demo3@example.com",
  "password": "x"
}

### REACTIVAR EL PERMISO (reversible, la auditoría se conserva)
PATCH {{baseUrl}}/api/concesiones-rol/{{grantId}}/reactivate
Authorization: Bearer {{token}}

### 403 — el propio SELLER no puede administrar la matriz de permisos
GET {{baseUrl}}/api/concesiones-rol
Authorization: Bearer {{sellerToken}}
EOF
```

El archivo de concesiones demuestra el **efecto inmediato**: un `POST`
concede `POST /api/clientes` al rol `SELLER`, y la siguiente petición
del mismo usuario deja de recibir 403 sin reiniciar el servidor. La
autorización se resuelve por datos en cada petición.

![](images/clipboard-4027926737.png)

------------------------------------------------------------------------

## Verificación

``` bash
npx tsc --noEmit
npm run db:seed
```

``` sql
SELECT COUNT(*) FROM role_users;      -- 2 (admin→ADMIN, seller→SELLER)
SELECT COUNT(*) FROM resource_roles;  -- 65 (ADMIN 58 + SELLER 7)
```

## DoD del ISS-18

-   [x] Todos los criterios de aceptación (17.1 … 17.8) cumplidos
-   [x] Reasignar un rol ya activo → 409; sobre uno inactivo → reactiva
-   [x] Reejecutar `npm run db:seed` deja `resource_roles` en 65 filas
    activas exactas
-   [x] `npx tsc --noEmit` sin errores y `npm run dev` arranca MDEOF
    echo "Creado: ISS-12-roleusers-resourceroles.md"

![![](images/clipboard-3969791918.png)](images/clipboard-623775421.png)

![](images/clipboard-3442990623.png)

# 24. Auth con RBAC — ISS-19 — Middlewares de acceso y las tres modalidades en rutas

## Contexto mínimo (autosuficiente)

Si abres este archivo aislado —o lo llevas a otra IA—, esto es lo que
hay que saber antes de ejecutarlo.

-   **Proyecto:** `app-storelab-express-ii` — Express 5 + TypeScript +
    Sequelize, arquitectura por features.
-   **Ya construido:** Fase I, ISS-09 base, ISS-10 Users, ISS-11
    Roles/Resources y ISS-12 pivotes.
-   **Recorrido obligatorio de una petición:** HTTP → Controller →
    Service → Repository → Model → Sequelize → BD. Además, en este ISS
    se insertan middlewares entre HTTP y Controller.
-   **Diseño de datos (Fase II):** `../bd-storelab.md` §16 (autorización
    efectiva), §18 (tres formas de acceder a la BD) y §20 (deny by
    default).
-   **Capas, convenciones y reglas transversales:** `00-contexto.md`.

| Este ISS |   |
|------------------------------------|------------------------------------|
| **Título** | Middlewares de acceso y las tres modalidades en rutas |
| **Feature / tablas** | `features/auth/access/` + PARCHE de las 5 rutas de negocio |
| **API** | todas las de Fase I pasan a JWT + RBAC |
| **Depende de** | ISS-12 — RoleUsers y ResourceRoles |
| **Habilita** | ISS-14 — Feature RefreshTokens |

## Contenido de este ISS 19

-   24.1 `authenticate.middleware.ts` (modalidad JWT)
-   24.2 `authorize.middleware.ts` (modalidad JWT + RBAC)
-   24.3 `access/index.ts` (barrel)
-   24.4 PARCHE: las 5 rutas de negocio pasan a JWT + RBAC
-   24.5 Las tres modalidades en una tabla
-   24.6 Verificación de 401 y 403

**Objetivo:** materializar las tres modalidades mediante dos middlewares
componibles y aplicarlos a las rutas existentes sin tocar controllers,
services ni repositories.

``` text
OPEN            app.route(...).get(controller)
JWT             app.route(...).get(authenticate, controller)
JWT + RBAC      app.route(...).get(authenticate, authorize, controller)
```

**Bloqueado por:** ISS-12 (la matriz debe existir para que `authorize`
tenga algo que consultar).

## Criterios de aceptación (ISS-19) — consolidados

-   [x] **24.1** `authenticate` valida el Bearer token, verifica
    algoritmo/issuer/audience/exp y carga el usuario activo en
    `req.auth`
-   [x] **24.2** `authorize` resuelve `(method, path)` y busca concesión
    activa; deny by default → 403
-   [x] **24.3** `access/index.ts` reexporta ambos middlewares
-   [x] **24.4** las 5 features de negocio (`clients`, `product-types`,
    `products`, `sales`, `product-sales`) aplican
    `authenticate, authorize`
-   [x] **24.5** documentadas las tres modalidades y qué códigos produce
    cada una
-   [x] **24.6** sin token → 401; con token pero sin concesión → 403;
    con concesión → 200/201
-   [x] `npx tsc --noEmit` OK

------------------------------------------------------------------------

## 24.1 `authenticate` — modalidad JWT

Hace exactamente cuatro cosas, en este orden:

1.  Lee el encabezado `Authorization: Bearer <token>` (RFC 6750). Si
    falta o está mal formado → **401**.
2.  Verifica el JWT con algoritmo, emisor y audiencia fijos (RFC 8725).
    Si falla → **401**.
3.  Carga el usuario en BD y exige `status = 'active'`. Si no existe o
    está inactivo → **401**.
4.  Deja la identidad en `req.auth` (tipado por `auth-user.ts`) y llama
    a `next()`.

**No consulta roles ni permisos.** La autorización es responsabilidad
del siguiente middleware: mezclar ambas impediría tener endpoints
solo-JWT.

``` bash
: > src/features/auth/access/authenticate.middleware.ts
cat >> src/features/auth/access/authenticate.middleware.ts << 'EOF'
import { NextFunction, Request, Response } from "express";
import { AppError } from "../../../shared/errors/app-error";
import { sendError } from "../../../shared/http/error-response";
import { extractBearerToken, verifyAccessToken } from "../../../shared/auth/jwt";
import { UsersRepository } from "../users/users.repository";

/**
 * **MODALIDAD 2 — JWT (identidad).** Middleware de autenticación.
 *
 * Responde únicamente a la pregunta **¿quién eres?**:
 *
 *  1. Lee el token de `Authorization: Bearer <token>` (RFC 6750).
 *  2. Verifica firma, algoritmo, `iss`, `aud`, `exp` (RFC 8725).
 *  3. **Revalida contra la base de datos** que el usuario sigue existiendo y con
 *     `status = active`. Un token firmado sigue siendo válido después de
 *     desactivar la cuenta; esta revalidación hace que la desactivación tenga
 *     efecto inmediato.
 *
 * NO consulta la matriz de permisos: eso es responsabilidad de `authorize`.
 * Si todo va bien, deja la identidad en `req.auth` y cede el paso.
 *
 * Cualquier fallo se responde con **401 (no autenticado)**.
 */
const usersRepository = new UsersRepository();

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) {
      throw new AppError(401, "Missing Bearer token");
    }

    const payload = verifyAccessToken(token);

    // Defensa en profundidad: `verifyAccessToken` ya garantiza que `sub` es un
    // entero positivo. Se vuelve a comprobar para que ningún cambio futuro en la
    // verificación pueda enviar un `NaN` al repositorio (500 en vez de 401).
    const userId = Number(payload.sub);
    if (!Number.isInteger(userId) || userId < 1) {
      throw new AppError(401, "Invalid or expired access token");
    }

    const user = await usersRepository.findById(userId);

    if (!user || user.status !== "active") {
      throw new AppError(401, "User is not active");
    }

    req.auth = {
      id: user.id,
      username: user.username,
      email: user.email,
      tokenId: payload.jti,
    };
    next();
  } catch (error) {
    sendError(res, error);
  }
}
EOF
```

![](images/clipboard-2165647411.png)

## 24.2 `authorize` — modalidad JWT + RBAC

Recibe la petición, normaliza el `(method, path)` real y comprueba si el
usuario autenticado alcanza ese recurso por el grafo:

``` text
req.auth.user
  → role_users (active)
  → roles (active)
  → resource_roles (active)
  → resources (active, method = req.method, path ≈ req.path)
```

Si no hay concesión → **403** (deny by default). Como la consulta se
hace en cada petición, revocar un permiso tiene efecto inmediato (no hay
que esperar a que caduque el token, porque los permisos no viajan en
él).

``` bash
: > src/features/auth/access/authorize.middleware.ts
cat >> src/features/auth/access/authorize.middleware.ts << 'EOF'
import { NextFunction, Request, Response } from "express";
import { AppError } from "../../../shared/errors/app-error";
import { sendError } from "../../../shared/http/error-response";
import { isOperationGranted, normalizePath } from "../../../shared/auth/resource-match";
import { ResourceRolesRepository } from "../resource-roles/resource-roles.repository";

/**
 * **MODALIDAD 3 — RBAC (identidad + autorización granular).** Middleware de
 * autorización.
 *
 * Debe montarse **después** de `authenticate`. Responde a la segunda pregunta:
 * *¿puede esta identidad ejecutar `method + path`?*
 *
 * Cómo resuelve la decisión:
 *  1. Toma la identidad ya resuelta en `req.auth`.
 *  2. Consulta la **cadena completa** de autorización en la base de datos
 *     (`resource_roles → roles → role_users → resources`, todos los eslabones
 *     activos) para ese `user_id`.
 *  3. Compara el par `(method, path)` de la petición con las concesiones,
 *     por patrón (`/api/productos/:id` casa con `/api/productos/42`).
 *
 * Reglas:
 *  - **Deny by default**: sin concesión activa que cubra la operación -> 403.
 *  - **401** si no hay identidad (falta `authenticate` o el token no valió).
 *  - **403** si hay identidad válida pero no hay permiso.
 *
 * No recibe parámetros: el recurso y la acción se derivan de la propia petición.
 * Añadir un permiso es insertar filas en la base de datos, nunca tocar el código.
 */
const resourceRolesRepository = new ResourceRolesRepository();

export async function authorize(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.auth) {
      throw new AppError(401, "Authentication required");
    }

    const method = req.method.toUpperCase();
    const path = normalizePath(req.originalUrl);

    const granted = await resourceRolesRepository.findEffectiveForUser(req.auth.id);

    if (!isOperationGranted(granted, method, path)) {
      throw new AppError(403, `Forbidden: no grant for ${method} ${path}`);
    }

    next();
  } catch (error) {
    sendError(res, error);
  }
}
EOF
```

![](images/clipboard-3392454558.png)

------------------------------------------------------------------------

## 24.3 Barrel de acceso

``` bash
: > src/features/auth/access/index.ts
cat >> src/features/auth/access/index.ts << 'EOF'
export * from "./authenticate.middleware";
export * from "./authorize.middleware";
EOF
```

![](images/clipboard-2348434782.png)

------------------------------------------------------------------------

## 24.4 PARCHE: las 5 rutas de negocio pasan a JWT + RBAC

El cambio es quirúrgico: se importa `authenticate, authorize` desde el
barrel de auth y se insertan entre la ruta y el controller. Ni el
contrato de la API ni las capas de negocio cambian.

``` ts
import { authenticate, authorize } from "../../auth/access";
// ...
app.route("/api/clientes/:id").get(
  authenticate,
  authorize,
  this.clientsController.getOne.bind(this.clientsController)
);
```

**PARCHE** en `account.routes.ts`:

``` bash
: > src/features/business/account/account.routes.ts
cat >> src/features/business/account/account.routes.ts << 'EOF'
import { Application } from "express";
import { AccountController } from "./account.controller";
import { authenticate, authorize } from "../../auth/access";

export class AccountRoutes {
  public accountController: AccountController = new AccountController();

  public routes(app: Application): void {
    // getAll
    app
      .route("/api/accounts")
      .get(
        authenticate,
        authorize,
        this.accountController.getAll.bind(
          this.accountController
        )
      );

    // getOne
    app
      .route("/api/accounts/:id")
      .get(
        authenticate,
        authorize,
        this.accountController.getOne.bind(
          this.accountController
        )
      );

    // create
    app
      .route("/api/accounts")
      .post(
        authenticate,
        authorize,
        this.accountController.create.bind(
          this.accountController
        )
      );

    // update (PUT / PATCH)
    app
      .route("/api/accounts/:id")
      .put(
        authenticate,
        authorize,
        this.accountController.updatePut.bind(
          this.accountController
        )
      )
      .patch(
        authenticate,
        authorize,
        this.accountController.updatePatch.bind(
          this.accountController
        )
      );

    // delete físico
    app
      .route("/api/accounts/:id")
      .delete(
        authenticate,
        authorize,
        this.accountController.deletePhysical.bind(
          this.accountController
        )
      );

    // delete lógico
    app
      .route("/api/accounts/:id/deactivate")
      .patch(
        authenticate,
        authorize,
        this.accountController.deleteLogical.bind(
          this.accountController
        )
      );
  }
}
EOF
```

![](images/clipboard-3982295229.png)

**PARCHE** en `rate.routes.ts`:

``` bash
: > src/features/business/rates/rate.routes.ts
cat >> src/features/business/rates/rate.routes.ts << 'EOF'
import { Application } from "express";
import { RateController } from "./rate.controller";
import { authenticate, authorize } from "../../auth/access";

export class RateRoutes {
  public rateController: RateController =
    new RateController();

  public routes(app: Application): void {
    // getAll
    app
      .route("/api/rates")
      .get(
        authenticate,
        authorize,
        this.rateController.getAll.bind(
          this.rateController
        )
      );

    // getOne
    app
      .route("/api/rates/:id")
      .get(
        authenticate,
        authorize,
        this.rateController.getOne.bind(
          this.rateController
        )
      );

    // create
    app
      .route("/api/rates")
      .post(
        authenticate,
        authorize,
        this.rateController.create.bind(
          this.rateController
        )
      );

    // update (PUT / PATCH)
    app
      .route("/api/rates/:id")
      .put(
        authenticate,
        authorize,
        this.rateController.updatePut.bind(
          this.rateController
        )
      )
      .patch(
        authenticate,
        authorize,
        this.rateController.updatePatch.bind(
          this.rateController
        )
      );

    // delete físico
    app
      .route("/api/rates/:id")
      .delete(
        authenticate,
        authorize,
        this.rateController.deletePhysical.bind(
          this.rateController
        )
      );

    // delete lógico
    app
      .route("/api/rates/:id/deactivate")
      .patch(
        authenticate,
        authorize,
        this.rateController.deleteLogical.bind(
          this.rateController
        )
      );
  }
}
EOF
```

![](images/clipboard-3731386659.png)

**PARCHE** en `credit.routes.ts`

``` bash
: > src/features/business/credits/credit.routes.ts
cat >> src/features/business/credits/credit.routes.ts << 'EOF'
import { Application } from "express";
import { CreditController } from "./credit.controller";
import { authenticate, authorize } from "../../auth/access";

export class CreditRoutes {
  public creditController: CreditController =
    new CreditController();

  public routes(app: Application): void {
    // getAll
    app
      .route("/api/credits")
      .get(
        authenticate,
        authorize,
        this.creditController.getAll.bind(
          this.creditController
        )
      );

    // getOne
    app
      .route("/api/credits/:id")
      .get(
        authenticate,
        authorize,
        this.creditController.getOne.bind(
          this.creditController
        )
      );

    // create
    app
      .route("/api/credits")
      .post(
        authenticate,
        authorize,
        this.creditController.create.bind(
          this.creditController
        )
      );

    // update (PUT / PATCH)
    app
      .route("/api/credits/:id")
      .put(
        authenticate,
        authorize,
        this.creditController.updatePut.bind(
          this.creditController
        )
      )
      .patch(
        authenticate,
        authorize,
        this.creditController.updatePatch.bind(
          this.creditController
        )
      );

    // delete físico
    app
      .route("/api/credits/:id")
      .delete(
        authenticate,
        authorize,
        this.creditController.deletePhysical.bind(
          this.creditController
        )
      );

    // delete lógico
    app
      .route("/api/credits/:id/deactivate")
      .patch(
        authenticate,
        authorize,
        this.creditController.deleteLogical.bind(
          this.creditController
        )
      );
  }
}
EOF
```

![](images/clipboard-4031856755.png)

**PARCHE** en `Installment.routes.ts`:

``` bash
: > src/features/business/installments/installment.routes.ts
cat >> src/features/business/installments/installment.routes.ts << 'EOF'
import { Application } from "express";
import { InstallmentController } from "./installment.controller";
import { authenticate, authorize } from "../../auth/access";

export class InstallmentRoutes {
  public installmentController: InstallmentController =
    new InstallmentController();

  public routes(app: Application): void {
    // getAll
    app
      .route("/api/installments")
      .get(
        authenticate,
        authorize,
        this.installmentController.getAll.bind(
          this.installmentController
        )
      );

    // getOne
    app
      .route("/api/installments/:id")
      .get(
        authenticate,
        authorize,
        this.installmentController.getOne.bind(
          this.installmentController
        )
      );

    // create
    app
      .route("/api/installments")
      .post(
        authenticate,
        authorize,
        this.installmentController.create.bind(
          this.installmentController
        )
      );

    // update (PUT / PATCH)
    app
      .route("/api/installments/:id")
      .put(
        authenticate,
        authorize,
        this.installmentController.updatePut.bind(
          this.installmentController
        )
      )
      .patch(
        authenticate,
        authorize,
        this.installmentController.updatePatch.bind(
          this.installmentController
        )
      );

    // delete físico
    app
      .route("/api/installments/:id")
      .delete(
        authenticate,
        authorize,
        this.installmentController.deletePhysical.bind(
          this.installmentController
        )
      );

    // delete lógico
    app
      .route("/api/installments/:id/deactivate")
      .patch(
        authenticate,
        authorize,
        this.installmentController.deleteLogical.bind(
          this.installmentController
        )
      );
  }
}
EOF
```

![](images/clipboard-2425564038.png)

**PARCHE** en `credit-application.routes.ts`:

``` bash
: > src/features/business/credit-applications/credit-application.routes.ts
cat >> src/features/business/credit-applications/credit-application.routes.ts << 'EOF'
import { Application } from "express";
import { CreditApplicationController } from "./credit-application.controller";
import { authenticate, authorize } from "../../auth/access";

export class CreditApplicationRoutes {
  public creditApplicationController: CreditApplicationController =
    new CreditApplicationController();

  public routes(app: Application): void {
    // getAll
    app
      .route("/api/credit-applications")
      .get(
        authenticate,
        authorize,
        this.creditApplicationController.getAll.bind(
          this.creditApplicationController
        )
      );

    // getOne
    app
      .route("/api/credit-applications/:id")
      .get(
        authenticate,
        authorize,
        this.creditApplicationController.getOne.bind(
          this.creditApplicationController
        )
      );

    // create
    app
      .route("/api/credit-applications")
      .post(
        authenticate,
        authorize,
        this.creditApplicationController.create.bind(
          this.creditApplicationController
        )
      );

    // update (PUT / PATCH)
    app
      .route("/api/credit-applications/:id")
      .put(
        authenticate,
        authorize,
        this.creditApplicationController.updatePut.bind(
          this.creditApplicationController
        )
      )
      .patch(
        authenticate,
        authorize,
        this.creditApplicationController.updatePatch.bind(
          this.creditApplicationController
        )
      );

    // delete físico
    app
      .route("/api/credit-applications/:id")
      .delete(
        authenticate,
        authorize,
        this.creditApplicationController.deletePhysical.bind(
          this.creditApplicationController
        )
      );

    // delete lógico
    app
      .route("/api/credit-applications/:id/deactivate")
      .patch(
        authenticate,
        authorize,
        this.creditApplicationController.deleteLogical.bind(
          this.creditApplicationController
        )
      );
  }
}
EOF
```

![](images/clipboard-2009185556.png)

------------------------------------------------------------------------

## 24.5 Las tres modalidades en una tabla — FondoSolidario

| Modalidad | Middleware en la ruta | Qué exige | Sin cumplir |
|------------------|------------------|------------------|------------------|
| **OPEN** | — | No exige autenticación ni autorización | — |
| **JWT** | `authenticate` | Access token válido y usuario activo | `401` |
| **JWT + RBAC** | `authenticate, authorize` | Access token válido, usuario activo y concesión activa para `(method, path)` | `401` sin token / `403` sin permiso |

### Aplicación en FondoSolidario

| Petición | Resultado esperado |
|------------------------------------|------------------------------------|
| `GET /api/members` sin `Authorization` | `401` — Authentication required |
| `GET /api/members` con token de `seller` | `200` — SELLER tiene permiso de lectura |
| `POST /api/members` con token de `seller` | `403` — SELLER no tiene esa concesión |
| `POST /api/members` con token de `admin` | `201` — ADMIN tiene la concesión |
| `GET /api/members/abc` con token válido | `400` — identificador `id` inválido, según la validación del endpoint |
| Cualquier ruta con token caducado o manipulado | `401` — token inválido o expirado |

### Recursos protegidos del proyecto

En FondoSolidario, el esquema **JWT + RBAC** se aplica actualmente a:

``` text
/api/members
/api/accounts
/api/movements
/api/rates
/api/credit-applications
/api/credits
/api/installments
/api/installment-payments
/api/committee-decisions
/api/audits
```

------------------------------------------------------------------------

## 24.6 Verificación de 401 y 403

Iniciar el servidor:

``` bash
npm run dev
```

![](images/clipboard-68116202.png)

### 401 — sin token

``` bash
curl -i http://localhost:4000/api/members
```

Resultado esperado:

``` text
HTTP/1.1 401 Unauthorized
```

![](images/clipboard-1081507502.png)

Esto demuestra que `authenticate` rechaza una petición que no contiene
un token Bearer.

### 401 — token manipulado

``` bash
curl -i \
  -H "Authorization: Bearer no.es.un.jwt" \
  http://localhost:4000/api/members
```

Resultado esperado:

``` text
HTTP/1.1 401 Unauthorized
```

![](images/clipboard-3441191960.png)

Esto demuestra que el middleware `authenticate` valida el access token.

### Login del usuario SELLER

Obtener el access token:

``` bash
TOKEN=$(curl -s -X POST http://localhost:4000/api/sesion/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"seller","password":"Seller123!"}' \
  | node -pe "JSON.parse(require('fs').readFileSync(0)).access_token")
```

Verificar el token:

``` bash
echo "$TOKEN"
```

![](images/clipboard-3465763286.png)

### 200 — SELLER consulta Members

El rol `SELLER` tiene la concesión:

``` text
GET /api/members
```

Realizar la petición:

``` bash
curl -i \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/api/members
```

Resultado esperado:

``` text
HTTP/1.1 200 OK
```

![](images/clipboard-2448759748.png)

Esto demuestra que el usuario está autenticado y que `authorize`
encuentra una concesión activa para `GET /api/members`.

### 403 — SELLER intenta crear un Member

El rol `SELLER` **no** tiene la concesión:

``` text
POST /api/members
```

Realizar la petición:

``` bash
curl -i -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Member de prueba",
    "description": "Prueba RBAC",
    "isActive": true
  }' \
  http://localhost:4000/api/members
```

Resultado esperado:

``` text
HTTP/1.1 403 Forbidden
```

![](images/clipboard-287373171.png)

Esto demuestra que el usuario `seller` tiene un JWT válido, pero no
posee una concesión activa para ejecutar `POST /api/members`. \`\`\`

## DoD del ISS-19

-   [x] Todos los criterios de aceptación (18.1 … 18.6) cumplidos
-   [x] `GET /api/clientes` pasa de SIN AUTH a exigir token (401 sin él)
-   [x] `POST /api/clientes` con `seller` → 403; con `admin` → 201
-   [x] Los controllers, services y repositories de Fase I no fueron
    modificados
-   [x] `npx tsc --noEmit` sin errores y `npm run dev` arranca MDEOF
    echo "Creado: ISS-19-middlewares-acceso.md"

------------------------------------------------------------------------

# 25. Auth con RBAC — ISS-20 — Feature RefreshTokens (sesiones renovables y revocables)

## Contexto mínimo (autosuficiente)

Si abres este archivo aislado —o lo llevas a otra IA—, esto es lo que
hay que saber antes de ejecutarlo.

-   **Proyecto:** `app-storelab-express-ii` — Express 5 + TypeScript +
    Sequelize, arquitectura por features.
-   **Ya construido:** Fase I, ISS-09 base, ISS-10 Users, ISS-11
    Roles/Resources, ISS-12 pivotes e ISS-13 middlewares.
-   **Recorrido obligatorio de una petición:** HTTP → Controller →
    Service → Repository → Model → Sequelize → BD. Ninguna capa se salta
    a la siguiente.
-   **Diseño de datos (Fase II):** `../bd-storelab.md` §14.6
    (refresh_tokens) y §17 (ciclo de vida de la sesión persistida).
-   **Capas, convenciones y reglas transversales:** `00-contexto.md`.

| Este ISS |   |
|------------------------------------|------------------------------------|
| **Título** | Feature RefreshTokens (sesiones renovables y revocables) |
| **Feature / tabla** | `features/auth/refresh-tokens/` · `refresh_tokens` |
| **API** | `/api/sesiones…` (modalidad JWT) |
| **Depende de** | ISS-13 — Middlewares de acceso |
| **Habilita** | ISS-15 — Feature Session |

## Contenido de este ISS

-   25.1 DTOs del feature
-   25.2 Repository (búsqueda por hash, bloqueo pesimista y revocación
    por familia)
-   25.3 Service (emitir, rotar con detección de reuso y revocar)
-   25.4 Controller y rutas (sesiones propias, modalidad JWT)
-   25.5 Swagger
-   25.6 Pruebas HTTP

**Objetivo:** persistir las sesiones como tokens opacos, de modo que un
access token corto pueda renovarse mientras el usuario trabaja, y que
una sesión pueda revocarse de verdad.

**Bloqueado por:** ISS-13 (`authenticate` es lo que permite hablar de
«sesiones propias»).

## Criterios de aceptación (ISS-20) — consolidados

-   [x] **25.1** `refresh-tokens/dto/` (`refresh-token-response.dto.ts`,
    `index.ts`)
-   [x] **25.2** `refresh-tokens.repository.ts`: busca por `token_hash`,
    lista por usuario, aplica lock pesimista al rotar y revoca por
    familia
-   [x] **25.3** `refresh-tokens.service.ts`: `issue`, `rotate` (con
    reuse detection) y `revoke*`
-   [x] **25.4** `refresh-tokens.controller.ts` y
    `refresh-tokens.routes.ts` (modalidad JWT, sin `authorize`)
-   [x] **25.5** `refresh-tokens.swagger.ts`
-   [x] **25.6** `http/sessions.get.http`
-   [x] `npx tsc --noEmit` OK

------------------------------------------------------------------------

## 25.1 DTOs del feature

El service nunca devuelve la instancia de Sequelize: proyecta a un DTO
plano que **jamás** incluye `token_hash`.

``` bash
: > src/features/auth/refresh-tokens/dto/refresh-token-response.dto.ts
cat >> src/features/auth/refresh-tokens/dto/refresh-token-response.dto.ts << 'EOF'
import { RefreshToken, RefreshTokenI } from "../refresh-token.model";

/**
 * Respuesta HTTP de una sesión persistida (refresh token).
 *
 * `token_hash` **se omite deliberadamente**: es un artefacto de seguridad. Ni
 * siquiera su hash tiene por qué salir de la API. El `id` basta para revocar.
 */
export type RefreshTokenResponseDto = Omit<RefreshTokenI, "token_hash"> & {
  /** Derivado, no columna: `expires_at` ya pasó. */
  is_expired: boolean;
};

/** Mapper modelo -> DTO de respuesta (objeto plano; elimina `token_hash`). */
export function toRefreshTokenResponse(token: RefreshToken): RefreshTokenResponseDto {
  const { token_hash, ...safe } = token.toJSON() as RefreshTokenI & { token_hash?: string };
  return {
    ...safe,
    is_expired: new Date(token.expires_at).getTime() <= Date.now(),
  };
}
EOF

: > src/features/auth/refresh-tokens/dto/index.ts
cat >> src/features/auth/refresh-tokens/dto/index.ts << 'EOF'
export * from "./refresh-token-response.dto";
EOF
```

![](images/clipboard-1638389435.png)

------------------------------------------------------------------------

## 25.2 Repository

Tres operaciones son específicas y describen el diseño de seguridad:

| Método | Por qué existe |
|------------------------------------|------------------------------------|
| `findByTokenHash` | el token en claro no se almacena: se busca por su SHA-256 |
| `rotate` con `lock: UPDATE` | la rotación es un *read-modify-write*; el lock evita que dos peticiones concurrentes consuman el mismo refresh token |
| `revokeFamily` | la reutilización de un token ya rotado es señal de robo: se revoca toda la familia |

``` bash
: > src/features/auth/refresh-tokens/refresh-tokens.repository.ts
cat >> src/features/auth/refresh-tokens/refresh-tokens.repository.ts << 'EOF'
import { CreationAttributes, Op, Transaction } from "sequelize";
import { RefreshToken } from "./refresh-token.model";

/**
 * Capa Repository del feature RefreshTokens (tabla `refresh_tokens`).
 *
 * Única que habla con Sequelize. Las consultas que participan en la rotación
 * aceptan transacción y, cuando corresponde, bloquean la fila (`FOR UPDATE`)
 * para que dos peticiones de refresh simultáneas no emitan dos tokens válidos.
 */
export class RefreshTokensRepository {
  /**
   * Busca por hash del token.
   *
   * `lock: true` añade `FOR UPDATE` dentro de la transacción: es lo que hace que
   * la rotación sea segura bajo concurrencia (solo una petición gana).
   */
  public async findByHash(
    tokenHash: string,
    transaction?: Transaction,
    lock = false
  ): Promise<RefreshToken | null> {
    return RefreshToken.findOne({
      where: { token_hash: tokenHash },
      transaction,
      ...(lock ? { lock: transaction?.LOCK.UPDATE } : {}),
    });
  }

  /** Sesiones de un usuario (activas o todas según `onlyActive`). */
  public async findAllByUser(userId: number, onlyActive = true): Promise<RefreshToken[]> {
    const where: Record<string, unknown> = { user_id: userId };
    if (onlyActive) where.status = "active";

    return RefreshToken.findAll({ where, order: [["createdAt", "DESC"]] });
  }

  /** Una sesión por PK (o `null`). */
  public async findById(id: number): Promise<RefreshToken | null> {
    return RefreshToken.findByPk(id);
  }

  /** Inserta un refresh token (alta de sesión o rotación). */
  public async create(
    data: CreationAttributes<RefreshToken>,
    transaction?: Transaction
  ): Promise<RefreshToken> {
    return RefreshToken.create(data, { transaction });
  }

  /** Persiste cambios sobre una instancia existente. */
  public async update(
    token: RefreshToken,
    data: Partial<RefreshToken>,
    transaction?: Transaction
  ): Promise<RefreshToken> {
    return token.update(data, { transaction });
  }

  /**
   * Revoca **toda la familia** de rotación.
   *
   * Se ejecuta al detectar reutilización de un token ya rotado: si un atacante
   * tiene una copia del token anterior, la sesión legítima se invalida por
   * completo y el usuario debe autenticarse de nuevo (Owasp/OAuth2: reuse
   * detection con revocación de familia).
   */
  public async revokeFamily(familyId: string, transaction?: Transaction): Promise<number> {
    const [updated] = await RefreshToken.update(
      { status: "inactive" },
      { where: { family_id: familyId, status: "active" }, transaction }
    );
    return updated;
  }

  /** Revoca todas las sesiones activas de un usuario (cierre de sesión global). */
  public async revokeAllByUser(userId: number): Promise<number> {
    const [updated] = await RefreshToken.update(
      { status: "inactive" },
      { where: { user_id: userId, status: "active" } }
    );
    return updated;
  }

  /** Elimina físicamente las sesiones ya expiradas o revocadas de un usuario. */
  public async purgeInactiveByUser(userId: number): Promise<number> {
    return RefreshToken.destroy({
      where: {
        user_id: userId,
        [Op.or]: [{ status: "inactive" }, { expires_at: { [Op.lt]: new Date() } }],
      },
    });
  }

  /** Cuenta las sesiones activas de un usuario. */
  public async countActiveByUser(userId: number): Promise<number> {
    return RefreshToken.count({ where: { user_id: userId, status: "active" } });
  }
}
EOF
```

![](images/clipboard-2483918604.png)

------------------------------------------------------------------------

## 25.3 Service — emitir, rotar, revocar

Ciclo de vida (RFC 6749 §1.5, RFC 6750, OWASP):

``` text
login  → emite family_id = <uuid>  +  refresh token (se guarda sha256)  +  access token (15 min)
uso    → POST /api/sesion/refresh con el refresh token
         ├─ token válido y no usado  → ROTA: el viejo pasa a `used`, nace uno nuevo (misma familia)
         └─ token ya usado           → REUSE DETECTION: se revoca la familia completa
logout → revoca el refresh token (o toda la familia)
```

| Decisión | Motivo |
|------------------------------------|------------------------------------|
| Access token corto (15 min) | acota la ventana de un token robado |
| Refresh token opaco y hasheado | puede revocarse y, si roban la BD, no sirve para autenticarse |
| Rotación en cada refresh | un refresh token es de un solo uso |
| Familia (`family_id`) | permite revocar toda una cadena de sesión, no solo el último eslabón |
| Reuse detection | un token ya consumido que reaparece implica robo → se corta la familia entera |
| Lock pesimista al rotar | dos refreshes simultáneos no pueden ganar los dos |

``` bash
: > src/features/auth/refresh-tokens/refresh-tokens.service.ts
cat >> src/features/auth/refresh-tokens/refresh-tokens.service.ts << 'EOF'
import { Transaction } from "sequelize";
import { randomUUID } from "node:crypto";
import {
  RefreshTokenResponseDto,
  toRefreshTokenResponse,
} from "./dto";
import { RefreshTokensRepository } from "./refresh-tokens.repository";
import { RefreshToken } from "./refresh-token.model";
import { AppError } from "../../../shared/errors/app-error";
import { generateOpaqueToken, sha256Hex } from "../../../shared/auth/password";
import { withTransaction } from "../../../shared/database/with-transaction";

/** Vida útil de un refresh token (días). Configurable por entorno. */
const REFRESH_TTL_DAYS = Number(process.env.JWT_REFRESH_TTL_DAYS ?? 7);

/** Resultado de emitir una sesión nueva. */
export interface IssuedSession {
  rawToken: string;
  familyId: string;
  expiresAt: Date;
}

/**
 * Resultado de intentar rotar un refresh token.
 *
 * Se devuelve una **unión discriminada** en lugar de lanzar dentro de la
 * transacción: si se lanzara, el `rollback` desharía la revocación de la familia
 * que acabamos de escribir. El service de sesión decide el error **después** de
 * que la transacción confirme.
 */
export type RotationOutcome =
  | { kind: "rotated"; userId: number; rawToken: string; familyId: string; expiresAt: Date }
  | { kind: "invalid" }
  | { kind: "expired" }
  | { kind: "reuse"; familyId: string; revoked: number };

/**
 * Capa Service del feature RefreshTokens.
 *
 * Cubre dos responsabilidades:
 *  1. **Gestión de las sesiones propias** (listar, consultar, revocar): es la
 *     parte que se expone con la modalidad JWT, sin RBAC, porque opera solo sobre
 *     las sesiones del usuario autenticado.
 *  2. **Ciclo de vida del token** (emitir, rotar, revocar), que consume el
 *     feature `session` en login/refresh/logout.
 */
export class RefreshTokensService {
  public constructor(
    private readonly repository: RefreshTokensRepository = new RefreshTokensRepository()
  ) {}

  // ================== GESTIÓN (sesiones propias) ==================
  public async getAllMine(userId: number): Promise<RefreshTokenResponseDto[]> {
    const tokens = await this.repository.findAllByUser(userId);
    return tokens.map((token) => toRefreshTokenResponse(token));
  }

  public async getMine(userId: number, id: number): Promise<RefreshTokenResponseDto> {
    return toRefreshTokenResponse(await this.findMineOrFail(userId, id));
  }

  /** Revoca una sesión propia concreta. */
  public async revokeMine(userId: number, id: number): Promise<RefreshTokenResponseDto> {
    const token = await this.findMineOrFail(userId, id);
    await this.repository.update(token, { status: "inactive" });
    return toRefreshTokenResponse(token);
  }

  /** Revoca **todas** las sesiones propias (útil si se sospecha un robo). */
  public async revokeAllMine(userId: number): Promise<number> {
    return this.repository.revokeAllByUser(userId);
  }

  /** Purga las sesiones propias ya revocadas o expiradas. */
  public async purgeMine(userId: number): Promise<number> {
    return this.repository.purgeInactiveByUser(userId);
  }

  public async countActiveMine(userId: number): Promise<number> {
    return this.repository.countActiveByUser(userId);
  }

  // ================== CICLO DE VIDA ==================
  /** Emite una sesión nueva (alta de login). Genera un `family_id` nuevo. */
  public async issue(
    userId: number,
    deviceInfo: string | null,
    transaction?: Transaction
  ): Promise<IssuedSession> {
    const rawToken = generateOpaqueToken();
    const familyId = randomUUID();
    const expiresAt = expiryFromNow();

    await this.repository.create(
      {
        user_id: userId,
        token_hash: sha256Hex(rawToken),
        family_id: familyId,
        device_info: deviceInfo,
        expires_at: expiresAt,
        status: "active",
      },
      transaction
    );

    // El token en claro se devuelve **una sola vez**; en la base solo queda el hash.
    return { rawToken, familyId, expiresAt };
  }

  /**
   * Rota un refresh token: lo invalida y emite uno nuevo con el mismo
   * `family_id`. Todo dentro de una transacción con bloqueo de fila.
   *
   * Concurrencia: si dos peticiones presentan el mismo token, una rota y la otra
   * encuentra el token ya inactivo -> se interpreta como reutilización y se
   * revoca la familia completa.
   */
  public async rotate(rawToken: string, deviceInfo: string | null): Promise<RotationOutcome> {
    const hash = sha256Hex(rawToken);

    // El valor de retorno de la transacción se decide **dentro**, pero los
    // efectos de revocación quedan confirmados aunque el resultado final sea un
    // rechazo (por eso no se lanza aquí dentro).
    const outcome = await withTransaction<RotationOutcome>(async (t) => {
      const current = await this.repository.findByHash(hash, t, true);

      if (!current) {
        return { kind: "invalid" };
      }

      // REUSE DETECTION: el token existía pero ya no está activo (fue rotado).
      if (current.status !== "active") {
        const revoked = await this.repository.revokeFamily(current.family_id, t);
        return { kind: "reuse", familyId: current.family_id, revoked };
      }

      if (new Date(current.expires_at).getTime() <= Date.now()) {
        await this.repository.update(current, { status: "inactive" }, t);
        return { kind: "expired" };
      }

      // Rotación: el token usado se invalida y nace uno nuevo en la misma familia.
      await this.repository.update(current, { status: "inactive" }, t);

      const rawNext = generateOpaqueToken();
      const expiresAt = expiryFromNow();
      await this.repository.create(
        {
          user_id: current.user_id,
          token_hash: sha256Hex(rawNext),
          family_id: current.family_id,
          device_info: deviceInfo ?? current.device_info,
          expires_at: expiresAt,
          status: "active",
        },
        t
      );

      return {
        kind: "rotated",
        userId: current.user_id,
        rawToken: rawNext,
        familyId: current.family_id,
        expiresAt,
      };
    });

    return outcome;
  }

  /**
   * Cierra la sesión asociada a un refresh token (logout).
   *
   * Es idempotente: un token inexistente o ya revocado no es un error, porque el
   * efecto deseado (que no sirva) ya se cumple.
   */
  public async revokeByToken(rawToken: string): Promise<boolean> {
    const token = await this.repository.findByHash(sha256Hex(rawToken));
    if (!token) return false;
    if (token.status !== "active") return true;

    await this.repository.update(token, { status: "inactive" });
    return true;
  }

  // ================== HELPERS ==================
  /**
   * Busca una sesión **del propio usuario**.
   *
   * El filtro por `user_id` es la frontera de seguridad: aunque el RBAC no
   * intervenga en estas rutas, un usuario nunca puede ver ni revocar la sesión
   * de otro. Un `id` ajeno responde 404, no 403 (no se filtra su existencia).
   */
  private async findMineOrFail(userId: number, id: number): Promise<RefreshToken> {
    const token = await this.repository.findById(id);
    if (!token || token.user_id !== userId) {
      throw new AppError(404, "Session not found");
    }
    return token;
  }
}

/** `now + REFRESH_TTL_DAYS`. Ventana deslizante: cada rotación la renueva. */
function expiryFromNow(): Date {
  return new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
}
EOF
```

![](images/clipboard-1763389471.png)

------------------------------------------------------------------------

## 25.4 Controller y rutas

A diferencia del CRUD de administración, estas rutas son **modalidad JWT
y sin `authorize`**: ver y revocar las propias sesiones es un derecho
derivado de estar autenticado, no una concesión de la matriz (no tendría
sentido pedir un permiso para cerrar la propia sesión). Por eso tampoco
figuran en el catálogo de 58 recursos.

``` bash
: > src/features/auth/refresh-tokens/refresh-tokens.controller.ts
cat >> src/features/auth/refresh-tokens/refresh-tokens.controller.ts << 'EOF'
import { Request, Response } from "express";
import { BaseController } from "../../../shared/http/base-controller";
import { requireAuthUser } from "../../../shared/auth/auth-user";
import { RefreshTokensService } from "./refresh-tokens.service";

/**
 * Capa Controller del feature RefreshTokens — **modalidad JWT**.
 *
 * Todas las operaciones actúan sobre las sesiones del usuario autenticado
 * (`req.auth.id`). No exigen RBAC: poder ver y revocar **tus propias** sesiones
 * es un derecho derivado de estar autenticado, no de tener un permiso concreto.
 *
 * Orden de operaciones (con una salvedad de enrutado, ver `refresh-tokens.routes.ts`):
 * getAll → getOne → revokeAll (literal) → revokeOne → purge.
 */
export class RefreshTokensController extends BaseController {
  public constructor(
    private readonly service: RefreshTokensService = new RefreshTokensService()
  ) {
    super();
  }

  // ================== READ ==================
  public async getAll(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const sessions = await this.service.getAllMine(requireAuthUser(req).id);
      res.status(200).json({ sessions });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const session = await this.service.getMine(requireAuthUser(req).id, this.paramId(req));
      res.status(200).json({ session });
    });
  }

  // ================== STATE (revocar) ==================
  /** Revoca **todas** las sesiones del usuario autenticado. */
  public async revokeAll(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const revoked = await this.service.revokeAllMine(requireAuthUser(req).id);
      res.status(200).json({ message: "All sessions revoked", revoked });
    });
  }

  /** Revoca una sesión propia. */
  public async revokeOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const session = await this.service.revokeMine(
        requireAuthUser(req).id,
        this.paramId(req)
      );
      res.status(200).json({ message: "Session revoked", session });
    });
  }

  // ================== PURGE ==================
  /** Purga (borrado físico) las sesiones propias ya revocadas o expiradas. */
  public async purge(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const purged = await this.service.purgeMine(requireAuthUser(req).id);
      res.status(200).json({ message: "Inactive sessions purged", purged });
    });
  }
}
EOF

: > src/features/auth/refresh-tokens/refresh-tokens.routes.ts
cat >> src/features/auth/refresh-tokens/refresh-tokens.routes.ts << 'EOF'
import { Application } from "express";
import { RefreshTokensController } from "./refresh-tokens.controller";
import { authenticate } from "../access";

/**
 * Rutas del feature RefreshTokens — **modalidad 2 (JWT, sin RBAC)**.
 *
 * Todas operan sobre las **sesiones del usuario autenticado**. Ver y revocar las
 * propias sesiones es un derecho derivado de estar autenticado, no de un permiso
 * concreto; por eso no llevan `authorize` ni figuran en el catálogo de recursos.
 *
 * Nota de enrutado: `/api/sesiones/deactivate-all` es una **ruta literal** del
 * mismo verbo (`PATCH`) que la ruta parametrizada de una sola sesión
 * (`/api/sesiones/:id/deactivate`). No colisionan porque tienen distinto número
 * de segmentos, pero la literal se registra primero por claridad y para que
 * cualquier ruta literal futura siga la misma regla (Express resuelve por orden
 * de registro).
 */
export class RefreshTokensRoutes {
  public refreshTokensController: RefreshTokensController = new RefreshTokensController();

  public routes(app: Application): void {
    // getAll (sesiones propias)
    app
      .route("/api/sesiones")
      .get(
        authenticate,
        this.refreshTokensController.getAll.bind(this.refreshTokensController)
      );

    // revocar todas las sesiones propias (ruta literal: va ANTES de /:id)
    app
      .route("/api/sesiones/deactivate-all")
      .patch(
        authenticate,
        this.refreshTokensController.revokeAll.bind(this.refreshTokensController)
      );

    // getOne
    app
      .route("/api/sesiones/:id")
      .get(
        authenticate,
        this.refreshTokensController.getOne.bind(this.refreshTokensController)
      );

    // revocar una sesión propia
    app
      .route("/api/sesiones/:id/deactivate")
      .patch(
        authenticate,
        this.refreshTokensController.revokeOne.bind(this.refreshTokensController)
      );

    // purga de sesiones propias revocadas/expiradas
    app
      .route("/api/sesiones")
      .delete(authenticate, this.refreshTokensController.purge.bind(this.refreshTokensController));
  }
}
EOF
```

> ![](images/clipboard-694534882.png)
>
> **Nota de enrutado:** `/api/sesiones/deactivate-all` es una ruta
> literal del mismo verbo (`PATCH`) que `/api/sesiones/:id/deactivate`.
> No colisionan (distinto número de segmentos), pero la literal se
> registra antes por claridad y por si en el futuro se añade otra ruta
> literal.

------------------------------------------------------------------------

## 25.5 Swagger

``` bash
: > src/features/auth/refresh-tokens/refresh-tokens.swagger.ts
cat >> src/features/auth/refresh-tokens/refresh-tokens.swagger.ts << 'EOF'
import { bearerSecurity, invalidIdResponse, unauthorizedResponse } from "../../../shared/http/swagger-security";

/**
 * Documentación OpenAPI del feature RefreshTokens — **sesiones propias**.
 *
 * Modalidad: **JWT** (sin RBAC). No forman parte del catálogo de recursos: ver y
 * revocar las **propias** sesiones deriva de estar autenticado, no de un permiso
 * concedido. Un `id` de sesión ajeno responde **404** (no se filtra su existencia).
 */
export const refreshTokensSwagger = {
  tags: [
    {
      name: "Sesiones",
      description:
        "Sesiones persistidas del usuario autenticado (refresh tokens): listar, consultar y revocar — **JWT**",
    },
  ],
  paths: {
    "/api/sesiones": {
      get: {
        tags: ["Sesiones"],
        summary: "Listar mis sesiones activas",
        description: "JWT — devuelve las sesiones del usuario del token. `token_hash` nunca se expone.",
        security: bearerSecurity,
        responses: {
          "200": { description: "Sesiones propias (`{ sessions: [...] }`)" },
          "401": unauthorizedResponse,
        },
      },
      delete: {
        tags: ["Sesiones"],
        summary: "Purgar mis sesiones revocadas/expiradas",
        description: "JWT — borrado físico de las sesiones propias ya inútiles.",
        security: bearerSecurity,
        responses: {
          "200": { description: "Purga realizada (`{ message, purged }`)" },
          "401": unauthorizedResponse,
        },
      },
    },
    "/api/sesiones/deactivate-all": {
      patch: {
        tags: ["Sesiones"],
        summary: "Revocar todas mis sesiones",
        description:
          "JWT — pone `inactive` todas las sesiones propias (todos los dispositivos). " +
          "Útil ante sospecha de robo: el refresh token deja de servir de inmediato.",
        security: bearerSecurity,
        responses: {
          "200": { description: "Sesiones revocadas (`{ message, revoked }`)" },
          "401": unauthorizedResponse,
        },
      },
    },
    "/api/sesiones/{id}": {
      get: {
        tags: ["Sesiones"],
        summary: "Consultar una sesión propia",
        description: "JWT — `family_id`, `device_info`, `expires_at`, `status`. 404 si no es del usuario.",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Sesión (`{ session }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "404": { description: "No encontrada o no pertenece al usuario autenticado" },
        },
      },
    },
    "/api/sesiones/{id}/deactivate": {
      patch: {
        tags: ["Sesiones"],
        summary: "Revocar una sesión propia",
        description: "JWT — revocación lógica de una sesión concreta.",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Sesión revocada (`{ message, session }`)" },
          "400": invalidIdResponse,
          "401": unauthorizedResponse,
          "404": { description: "No encontrada o no pertenece al usuario autenticado" },
        },
      },
    },
  },
  components: {
    schemas: {
      Session: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          user_id: { type: "integer", example: 2 },
          family_id: { type: "string", format: "uuid" },
          device_info: { type: "string", nullable: true, example: "Mozilla/5.0 ..." },
          expires_at: { type: "string", format: "date-time" },
          status: { type: "string", enum: ["active", "inactive"], example: "active" },
          is_expired: { type: "boolean", example: false },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
};
EOF
```

![](images/clipboard-1319546846.png)

------------------------------------------------------------------------

## 25.6 Pruebas HTTP

``` bash
: > src/features/auth/refresh-tokens/http/sessions.get.http
cat >> src/features/auth/refresh-tokens/http/sessions.get.http << 'EOF'
### Feature RefreshTokens — SESIONES PROPIAS (modalidad JWT, sin RBAC)
### Ver y revocar las propias sesiones deriva de estar autenticado, no de un permiso.
### Un id de sesión ajeno responde 404 (no se filtra su existencia).
@baseUrl = http://localhost:4000

# @name loginSeller
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "seller",
  "password": "Seller123!"
}

@token = {{loginSeller.response.body.$.access_token}}

### Listar mis sesiones activas (nunca expone `token_hash`)
GET {{baseUrl}}/api/sesiones
Authorization: Bearer {{token}}

### Consultar una sesión propia
GET {{baseUrl}}/api/sesiones/1
Authorization: Bearer {{token}}

### Revocar TODAS mis sesiones (ruta literal; registrar antes que /:id)
PATCH {{baseUrl}}/api/sesiones/deactivate-all
Authorization: Bearer {{token}}

### Revocar una sesión concreta
PATCH {{baseUrl}}/api/sesiones/1/deactivate
Authorization: Bearer {{token}}

### Purgar (borrado físico) mis sesiones revocadas/expiradas
DELETE {{baseUrl}}/api/sesiones
Authorization: Bearer {{token}}

### Modalidad JWT: sin token -> 401
GET {{baseUrl}}/api/sesiones
EOF
```

![](images/clipboard-814498141.png)

------------------------------------------------------------------------

## Verificación

``` sql
-- Tras un login hay una fila `active`; tras un refresh, la vieja queda `used`.
SELECT id, user_id, family_id, status, expires_at FROM refresh_tokens ORDER BY id;
```

## DoD del ISS-20

-   [x] Todos los criterios de aceptación (19.1 … 19.6) cumplidos
-   [x] En BD nunca hay un refresh token en claro: solo `token_hash`
-   [x] Rotar dos veces el mismo token dispara la revocación de la
    familia
-   [x] `PATCH /api/sesiones/:id/deactivate` solo afecta a una sesión
    propia
-   [x] `npx tsc --noEmit` sin errores y `npm run dev` arranca MDEOF
    echo "Creado: ISS-14-refresh-tokens.md"

![](images/clipboard-249854831.png)

------------------------------------------------------------------------

# 26. Auth con RBAC — ISS-21 — Feature Session (login, refresh, logout, perfil y permisos)

## Contexto mínimo (autosuficiente)

Si abres este archivo aislado —o lo llevas a otra IA—, esto es lo que
hay que saber antes de ejecutarlo.

-   **Proyecto:** `app-storelab-express-ii` — Express 5 + TypeScript +
    Sequelize, arquitectura por features.
-   **Ya construido:** Fase I, ISS-09 base, ISS-10 Users, ISS-11
    Roles/Resources, ISS-12 pivotes, ISS-13 middlewares e ISS-14
    RefreshTokens.
-   **Recorrido obligatorio de una petición:** HTTP → Controller →
    Service → Repository → Model → Sequelize → BD. Ninguna capa se salta
    a la siguiente.
-   **Diseño de datos (Fase II):** `../bd-storelab.md` §17 (ciclo de
    vida de la sesión) y §18 (tres formas de acceder a la BD).
-   **Capas, convenciones y reglas transversales:** `00-contexto.md`.

| Este ISS |   |
|------------------------------------|------------------------------------|
| **Título** | Feature Session (login, refresh, logout, perfil y permisos) |
| **Feature / tabla** | `features/auth/session/` · cruza `users` y `refresh_tokens` |
| **API** | `/api/sesion/*` y `/api/permisos` (OPEN y JWT) |
| **Depende de** | ISS-14 — Feature RefreshTokens |
| **Habilita** | Cierre de Fase II |

## Contenido de este ISS 21

-   26.1 DTOs del feature
-   26.2 Service (login, refresh, logout, perfil, permisos)
-   26.3 Controller
-   26.4 Rutas: las tres modalidades conviviendo en un archivo
-   26.5 Swagger
-   26.6 Pruebas HTTP
-   26.7 Verificación end-to-end de las tres modalidades

**Objetivo:** exponer el punto de entrada al sistema (login), la
renovación automática (refresh con rotación), la salida (logout), el
perfil del usuario y sus permisos efectivos. Es el feature que demuestra
que las tres modalidades conviven sin fricción.

**Bloqueado por:** ISS-14.

## Criterios de aceptación (ISS-21) — consolidados

-   [x] **26.1** `session/dto/` (`login.dto.ts`,
    `refresh-session.dto.ts`, `logout-session.dto.ts`,
    `session-response.dto.ts`, `index.ts`)
-   [x] **26.2** `session.service.ts`: `login` (verifica contraseña +
    emite sesión), `refresh` (rota), `logout` (revoca), `profile`,
    `myPermissions`
-   [x] **26.3** `session.controller.ts` con `this.run(res, …)`
-   [x] **26.4** `session.routes.ts`: login/refresh/logout OPEN;
    perfil/permisos JWT
-   [x] **26.5** `session.swagger.ts` con `security: []` en las OPEN y
    `bearerAuth` en las JWT
-   [x] **26.6** archivos `.http` de login, refresh y perfil
-   [x] **26.7** recorrido E2E que prueba OPEN → JWT → JWT + RBAC
-   [x] `npx tsc --noEmit` OK

------------------------------------------------------------------------

## 26.1 DTOs del feature

``` bash
: > src/features/auth/session/dto/login.dto.ts
cat >> src/features/auth/session/dto/login.dto.ts << 'EOF'
/**
 * Datos de entrada de `POST /api/sesion/login` (modalidad OPEN).
 *
 * `identifier` acepta **usuario o correo**: la consulta de credenciales busca por
 * cualquiera de los dos, normalizando a minúsculas.
 */
export interface LoginDto {
  identifier: string;
  password: string;
}
EOF

: > src/features/auth/session/dto/refresh-session.dto.ts
cat >> src/features/auth/session/dto/refresh-session.dto.ts << 'EOF'
/**
 * Datos de entrada de `POST /api/sesion/refresh` (modalidad OPEN con credencial
 * de sesión).
 *
 * El refresh token viaja en el **cuerpo**, no en la cabecera `Authorization`:
 * es una credencial de sesión, no un token de acceso.
 */
export interface RefreshSessionDto {
  refresh_token: string;
}
EOF

: > src/features/auth/session/dto/logout-session.dto.ts
cat >> src/features/auth/session/dto/logout-session.dto.ts << 'EOF'
/**
 * Datos de entrada de `POST /api/sesion/logout`.
 *
 * Se envía el refresh token que se quiere revocar (la sesión concreta). Es
 * idempotente: repetirlo no devuelve error.
 */
export interface LogoutSessionDto {
  refresh_token: string;
}
EOF

: > src/features/auth/session/dto/session-response.dto.ts
cat >> src/features/auth/session/dto/session-response.dto.ts << 'EOF'
/**
 * Respuesta de `login` y `refresh`: el **par de tokens**.
 *
 * - `access_token`: JWT corto, autocontenido; viaja en `Authorization: Bearer`.
 * - `refresh_token`: token opaco larga vida; **se devuelve solo aquí**, en claro,
 *   porque el servidor guarda únicamente su hash. El cliente debe guardarlo y
 *   enviarlo a `/api/sesion/refresh` para renovar sin volver a autenticarse.
 * - `expires_in`: segundos de vida del token de acceso (para que el cliente
 *   programe la renovación *antes* de que expire).
 */
export interface SessionTokensDto {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
}

/** Datos públicos del perfil propio (modalidad JWT). Nunca incluye `password`. */
export interface ProfileDto {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  status: "active" | "inactive";
}
EOF

: > src/features/auth/session/dto/index.ts
cat >> src/features/auth/session/dto/index.ts << 'EOF'
export * from "./login.dto";
export * from "./refresh-session.dto";
export * from "./logout-session.dto";
export * from "./session-response.dto";
EOF
```

![](images/clipboard-1246820440.png)

------------------------------------------------------------------------

## 26.2 Service

`SessionService` orquesta piezas ya construidas y no duplica su lógica:

| Método | Reutiliza | Hace |
|------------------------|------------------------|------------------------|
| `login` | `UsersRepository.findByUsernameOrEmail`, `verifyPassword`, `RefreshTokensService.issue` | autentica y abre sesión |
| `refresh` | `RefreshTokensService.rotate` | renueva el access token rotando el refresh |
| `logout` | `RefreshTokensService.revoke` | revoca la sesión |
| `profile` | `requireAuthUser` | devuelve la identidad |
| `myPermissions` | `UsersService.getEffectivePermissions` | lista los `(method, path)` vigentes |

**Seguridad del login:** si el usuario no existe o la contraseña no
coincide, la respuesta es el mismo 401 genérico. No se distingue
«usuario inexistente» de «contraseña incorrecta» (evita enumeración de
usuarios). Un usuario `inactive` tampoco puede iniciar sesión.

``` bash
: > src/features/auth/session/session.service.ts
cat >> src/features/auth/session/session.service.ts << 'EOF'
import {
  LoginDto,
  LogoutSessionDto,
  ProfileDto,
  RefreshSessionDto,
  SessionTokensDto,
} from "./dto";
import { UsersRepository } from "../users/users.repository";
import { RefreshTokensService } from "../refresh-tokens/refresh-tokens.service";
import { ResourceRolesService } from "../resource-roles/resource-roles.service";
import { EffectivePermissionDto } from "../resource-roles/dto";
import { User } from "../users/user.model";
import { AppError } from "../../../shared/errors/app-error";
import { comparePassword } from "../../../shared/auth/password";
import { ACCESS_TOKEN_TTL_SECONDS, signAccessToken } from "../../../shared/auth/jwt";

/**
 * Capa Service del feature Session — **el ciclo de vida de la sesión**.
 *
 * Cubre las dos modalidades sin autorización granular:
 *
 * | Operación | Modalidad | Escribe seguridad |
 * |---|---|---|
 * | `login`    | OPEN (valida credenciales) | `refresh_tokens` (nueva familia) |
 * | `refresh`  | OPEN (credencial de sesión) | `refresh_tokens` (rotación) |
 * | `logout`   | OPEN (credencial de sesión) | `refresh_tokens` (revocación) |
 * | `profile`  | JWT | — (solo lectura) |
 *
 * **Renovación automática.** El cliente mantiene la sesión sin volver a pedir
 * credenciales: cuando el access token está por expirar, llama a `refresh` con
 * el refresh token y recibe un par nuevo. La ventana del refresh token se
 * reinicia en cada rotación (ventana deslizante), así que un usuario que sigue
 * trabajando no se ve expulsado; uno inactivo durante toda la ventana, sí.
 */
export class SessionService {
  public constructor(
    private readonly usersRepository: UsersRepository = new UsersRepository(),
    private readonly refreshTokensService: RefreshTokensService = new RefreshTokensService(),
    private readonly resourceRolesService: ResourceRolesService = new ResourceRolesService()
  ) {}

  // ================== LOGIN (OPEN) ==================
  /**
   * Valida credenciales y abre una sesión.
   *
   * Nota de seguridad: la respuesta es **la misma** para "usuario inexistente" y
   * "contraseña incorrecta" (`Invalid credentials`) para no revelar qué usuarios
   * existen. La comparación de la contraseña ocurre en memoria; el hash nunca
   * sale de la base de datos.
   */
  public async login(body: LoginDto, deviceInfo: string | null): Promise<SessionTokensDto> {
    if (!body.identifier || !body.password) {
      throw new AppError(400, "identifier and password are required");
    }

    const user = await this.usersRepository.findByIdentifierWithPassword(body.identifier);
    if (!user || user.status !== "active") {
      throw new AppError(401, "Invalid credentials");
    }

    const matches = await comparePassword(body.password, user.password);
    if (!matches) {
      throw new AppError(401, "Invalid credentials");
    }

    const session = await this.refreshTokensService.issue(user.id, deviceInfo);
    return this.buildTokens(user, session.rawToken, session.expiresAt);
  }

  // ================== REFRESH (OPEN con credencial de sesión) ==================
  /**
   * Rota el refresh token y emite un par nuevo.
   *
   * Traduce el resultado de la rotación (que no lanza dentro de la transacción,
   * para no deshacer la revocación por reutilización) al error HTTP que
   * corresponde:
   *  - `invalid`  -> 401
   *  - `expired`  -> 401
   *  - `reuse`    -> 401 **habiendo revocado toda la familia**
   */
  public async refresh(
    body: RefreshSessionDto,
    deviceInfo: string | null
  ): Promise<SessionTokensDto> {
    if (!body.refresh_token) {
      throw new AppError(400, "refresh_token is required");
    }

    const outcome = await this.refreshTokensService.rotate(body.refresh_token, deviceInfo);

    if (outcome.kind === "invalid") {
      throw new AppError(401, "Invalid refresh token");
    }
    if (outcome.kind === "expired") {
      throw new AppError(401, "Refresh token expired");
    }
    if (outcome.kind === "reuse") {
      throw new AppError(401, "Refresh token reuse detected: session family revoked");
    }

    // Revalida la identidad: si el usuario fue desactivado, se corta la sesión
    // aunque el refresh token siga siendo válido.
    const user = await this.usersRepository.findById(outcome.userId);
    if (!user || user.status !== "active") {
      await this.refreshTokensService.revokeAllMine(outcome.userId);
      throw new AppError(401, "User is not active");
    }

    return this.buildTokens(user, outcome.rawToken, outcome.expiresAt);
  }

  // ================== LOGOUT (OPEN con credencial de sesión) ==================
  /** Revoca la sesión del refresh token presentado. Idempotente. */
  public async logout(body: LogoutSessionDto): Promise<void> {
    if (!body.refresh_token) {
      throw new AppError(400, "refresh_token is required");
    }
    await this.refreshTokensService.revokeByToken(body.refresh_token);
  }

  // ================== PERFIL (JWT) ==================
  /** Datos públicos del usuario autenticado. */
  public async profile(userId: number): Promise<ProfileDto> {
    const user = await this.usersRepository.findById(userId);
    if (!user || user.status !== "active") {
      throw new AppError(404, "User not found");
    }
    return toProfile(user);
  }

  /** Permisos efectivos del propio usuario (modalidad JWT, sin RBAC). */
  public async myPermissions(userId: number): Promise<EffectivePermissionDto[]> {
    return this.resourceRolesService.findEffectiveForUser(userId);
  }

  // ================== HELPERS ==================
  /** Arma el par de tokens: firma el access y adjunta el refresh recién emitido. */
  private buildTokens(user: User, refreshToken: string, refreshExpiresAt: Date): SessionTokensDto {
    const access = signAccessToken({ id: user.id, username: user.username });
    return {
      access_token: access.token,
      token_type: "Bearer",
      expires_in: access.expiresIn,
      refresh_token: refreshToken,
      refresh_expires_in: Math.max(
        0,
        Math.floor((refreshExpiresAt.getTime() - Date.now()) / 1000)
      ),
    };
  }
}

/** Proyección a `ProfileDto`: solo campos públicos. */
function toProfile(user: User): ProfileDto {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar ?? null,
    status: user.status,
  };
}

/** Reexporta la constante para que el controller pueda documentar `expires_in`. */
export { ACCESS_TOKEN_TTL_SECONDS };
EOF
```

![](images/clipboard-2935371814.png)

**Renovación automática mientras el usuario trabaja:** el cliente llama
a `POST /api/sesion/refresh` con el refresh token cuando el access token
expira. Como el refresh rota en cada uso y la familia se revoca ante
reuso, la sesión puede prolongarse indefinidamente sin degradar la
seguridad.

------------------------------------------------------------------------

## 26.3 Controller

``` bash
: > src/features/auth/session/session.controller.ts
cat >> src/features/auth/session/session.controller.ts << 'EOF'
import { Request, Response } from "express";
import { BaseController } from "../../../shared/http/base-controller";
import { requireAuthUser } from "../../../shared/auth/auth-user";
import { LoginDto, LogoutSessionDto, RefreshSessionDto } from "./dto";
import { SessionService } from "./session.service";

/**
 * Capa Controller del feature Session.
 *
 * Mezcla las dos modalidades base:
 *  - `login`, `refresh` y `logout` son **OPEN** (no hay identidad previa; la
 *    credencial va en el cuerpo);
 *  - `profile` y `myPermissions` son **JWT** (la identidad la resolvió
 *    `authenticate` antes de llegar aquí).
 */
export class SessionController extends BaseController {
  public constructor(
    private readonly service: SessionService = new SessionService()
  ) {
    super();
  }

  // ================== OPEN ==================
  /** Inicia sesión: credenciales -> par de tokens. */
  public async login(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const tokens = await this.service.login(req.body as LoginDto, deviceInfo(req));
      res.status(200).json(tokens);
    });
  }

  /** Renueva el access token rotando el refresh token. */
  public async refresh(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const tokens = await this.service.refresh(req.body as RefreshSessionDto, deviceInfo(req));
      res.status(200).json(tokens);
    });
  }

  /** Cierra la sesión del refresh token presentado. */
  public async logout(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      await this.service.logout(req.body as LogoutSessionDto);
      res.status(200).json({ message: "Session closed" });
    });
  }

  // ================== JWT ==================
  /** Perfil del usuario autenticado. */
  public async profile(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const user = await this.service.profile(requireAuthUser(req).id);
      res.status(200).json({ user });
    });
  }

  /** Permisos efectivos del usuario autenticado. */
  public async myPermissions(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const permissions = await this.service.myPermissions(requireAuthUser(req).id);
      res.status(200).json({ permissions });
    });
  }
}

/** `device_info` de auditoría a partir del encabezado `User-Agent`. */
function deviceInfo(req: Request): string | null {
  const value = req.headers["user-agent"];
  if (!value) return null;
  return String(value).slice(0, 500);
}
EOF
```

![](images/clipboard-1506076604.png)

------------------------------------------------------------------------

## 26.4 Rutas — las tres modalidades en un solo archivo

| Ruta                       | Modalidad                   | Middleware     |
|----------------------------|-----------------------------|----------------|
| `POST /api/sesion/login`   | OPEN                        | —              |
| `POST /api/sesion/refresh` | OPEN (credencial de sesión) | —              |
| `POST /api/sesion/logout`  | OPEN (credencial de sesión) | —              |
| `GET /api/sesion/perfil`   | JWT                         | `authenticate` |
| `GET /api/permisos`        | JWT                         | `authenticate` |

Ninguna lleva `authorize`: la autorización granular no aplica a los
puntos de acceso previos a la matriz. `GET /api/permisos` devuelve, eso
sí, los permisos efectivos del usuario autenticado —la misma consulta
que usa el middleware `authorize`—, lo que lo hace ideal para depurar el
RBAC.

``` bash
: > src/features/auth/session/session.routes.ts
cat >> src/features/auth/session/session.routes.ts << 'EOF'
import { Application } from "express";
import { SessionController } from "./session.controller";
import { authenticate } from "../access";

/**
 * Rutas del feature Session — **las tres modalidades en un solo archivo**.
 *
 * | Ruta | Modalidad | Middleware |
 * |---|---|---|
 * | `POST /api/sesion/login`   | OPEN | — |
 * | `POST /api/sesion/refresh` | OPEN (credencial de sesión) | — |
 * | `POST /api/sesion/logout`  | OPEN (credencial de sesión) | — |
 * | `GET  /api/sesion/perfil`  | JWT | `authenticate` |
 * | `GET  /api/permisos`       | JWT | `authenticate` |
 *
 * Ninguna lleva `authorize`: la autorización granular no aplica a los puntos de
 * acceso previos o ajenos a la matriz de permisos. `/api/permisos` devuelve, eso
 * sí, **los permisos efectivos** del usuario autenticado (la misma consulta que
 * usa el middleware `authorize`), lo que lo hace ideal para depurar el RBAC.
 */
export class SessionRoutes {
  public sessionController: SessionController = new SessionController();

  public routes(app: Application): void {
    // login (OPEN)
    app
      .route("/api/sesion/login")
      .post(this.sessionController.login.bind(this.sessionController));

    // refresh (OPEN + refresh token)
    app
      .route("/api/sesion/refresh")
      .post(this.sessionController.refresh.bind(this.sessionController));

    // logout (OPEN + refresh token)
    app
      .route("/api/sesion/logout")
      .post(this.sessionController.logout.bind(this.sessionController));

    // perfil (JWT)
    app
      .route("/api/sesion/perfil")
      .get(authenticate, this.sessionController.profile.bind(this.sessionController));

    // permisos efectivos del usuario autenticado (JWT)
    app
      .route("/api/permisos")
      .get(authenticate, this.sessionController.myPermissions.bind(this.sessionController));
  }
}
EOF
```

![](images/clipboard-1405049133.png)

------------------------------------------------------------------------

## 26.5 Swagger

`refresh` y `logout` son OPEN de facto: no exigen access token, sino el
refresh token en el cuerpo. Por eso declaran `security: []` y documentan
su propio cuerpo.

``` bash
: > src/features/auth/session/session.swagger.ts
cat >> src/features/auth/session/session.swagger.ts << 'EOF'
import {
  bearerSecurity,
  openSecurity,
  unauthorizedResponse,
} from "../../../shared/http/swagger-security";

/**
 * Documentación OpenAPI del feature Session — **las tres modalidades juntas**.
 *
 * - `login` / `refresh` / `logout`: **OPEN**. Nota didáctica: OPEN no significa
 *   "sin base de datos", significa "sin identidad previa". El login **lee** el
 *   hash de `users` y **escribe** `refresh_tokens`; el refresh **rota** el token.
 * - `perfil` / `permisos`: **JWT**.
 *
 * La respuesta de `login` y `refresh` es el **par de tokens**. El `refresh_token`
 * se devuelve en claro **solo aquí**: el servidor guarda únicamente su SHA-256.
 */
export const sessionSwagger = {
  tags: [
    { name: "Sesión", description: "Login, renovación, cierre y perfil — **OPEN** + **JWT**" },
  ],
  paths: {
    "/api/sesion/login": {
      post: {
        tags: ["Sesión"],
        summary: "Iniciar sesión (OPEN)",
        description:
          "Modalidad **OPEN**. Valida usuario/correo + contraseña y abre una sesión: " +
          "emite un access token corto (JWT) y un refresh token persistido como hash, con un `family_id` nuevo. " +
          "La respuesta es idéntica para usuario inexistente y contraseña incorrecta (no se enumeran usuarios).",
        security: openSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/Login" } },
          },
        },
        responses: {
          "200": { description: "Par de tokens (`access_token`, `refresh_token`, `expires_in`)" },
          "400": { description: "Faltan `identifier` o `password`" },
          "401": { description: "Credenciales inválidas o usuario inactivo" },
        },
      },
    },
    "/api/sesion/refresh": {
      post: {
        tags: ["Sesión"],
        summary: "Renovar el access token (OPEN con credencial de sesión)",
        description:
          "Modalidad **OPEN**. **Rota** el refresh token: invalida el presentado y emite uno nuevo con el mismo " +
          "`family_id`. Si se presenta un token ya rotado, se interpreta como **reutilización** y se revoca toda la " +
          "familia (401). La rotación es atómica y con bloqueo de fila, así que dos peticiones simultáneas no emiten " +
          "dos tokens válidos. La ventana del refresh se reinicia en cada rotación: renovación automática mientras el usuario trabaja.",
        security: openSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RefreshToken" } },
          },
        },
        responses: {
          "200": { description: "Par de tokens nuevo (`access_token` + `refresh_token` rotado)" },
          "400": { description: "Falta `refresh_token`" },
          "401": {
            description:
              "Token inválido, expirado o **reutilizado** (en este último caso, la familia queda revocada)",
          },
        },
      },
    },
    "/api/sesion/logout": {
      post: {
        tags: ["Sesión"],
        summary: "Cerrar sesión (OPEN con credencial de sesión)",
        description:
          "Modalidad **OPEN**. Revoca el refresh token presentado. Idempotente: repetirlo no devuelve error. " +
          "El access token sigue siendo válido hasta expirar (vida corta); para invalidación inmediata, desactivar el usuario.",
        security: openSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RefreshToken" } },
          },
        },
        responses: {
          "200": { description: "Sesión cerrada (`{ message }`)" },
          "400": { description: "Falta `refresh_token`" },
        },
      },
    },
    "/api/sesion/perfil": {
      get: {
        tags: ["Sesión"],
        summary: "Perfil del usuario autenticado (JWT)",
        description:
          "Modalidad **JWT**. El middleware `authenticate` valida el token y **revalida en la base** que el usuario " +
          "sigue activo: desactivar una cuenta invalida sus tokens al instante (401).",
        security: bearerSecurity,
        responses: {
          "200": { description: "Perfil (`{ user }`) — nunca incluye `password`" },
          "401": unauthorizedResponse,
        },
      },
    },
    "/api/permisos": {
      get: {
        tags: ["Sesión"],
        summary: "Mis permisos efectivos (JWT)",
        description:
          "Modalidad **JWT**. Ejecuta la misma consulta que el middleware `authorize` " +
          "(`resource_roles → roles → role_users → resources`, todos los eslabones activos) y devuelve el par " +
          "`(method, path)` de cada permiso. Es la herramienta para **depurar el RBAC**: lo que aparece aquí es exactamente lo que autoriza.",
        security: bearerSecurity,
        responses: {
          "200": { description: "Permisos efectivos (`{ permissions: [...] }`)" },
          "401": unauthorizedResponse,
        },
      },
    },
  },
  components: {
    schemas: {
      Login: {
        type: "object",
        required: ["identifier", "password"],
        properties: {
          identifier: { type: "string", example: "admin", description: "`username` o `email`" },
          password: { type: "string", format: "password", example: "Admin123!" },
        },
      },
      RefreshToken: {
        type: "object",
        required: ["refresh_token"],
        properties: {
          refresh_token: { type: "string", example: "9f2c... (opaco, no es un JWT)" },
        },
      },
      SessionTokens: {
        type: "object",
        properties: {
          access_token: { type: "string", description: "JWT firmado (HS256), vida corta" },
          token_type: { type: "string", example: "Bearer" },
          expires_in: { type: "integer", example: 900, description: "Segundos de vida del access token" },
          refresh_token: { type: "string", description: "Token opaco; se devuelve solo en login/refresh" },
          refresh_expires_in: { type: "integer", example: 604800 },
        },
      },
    },
  },
};
EOF
```

![](images/clipboard-3037202387.png)

------------------------------------------------------------------------

## 26.6 Pruebas HTTP

``` bash
: > src/features/auth/session/http/session.login.http
cat >> src/features/auth/session/http/session.login.http << 'EOF'
### Feature Session — LOGIN (modalidad OPEN)
### OPEN = sin identidad previa. Aquí SÍ se consulta `users` (hash) y se escribe `refresh_tokens`.
@baseUrl = http://localhost:4000

# @name loginAdmin
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "admin",
  "password": "Admin123!"
}

### Credenciales de ejemplo
# admin  / Admin123!   -> rol ADMIN  (58 permisos)
# seller / Seller123!  -> rol SELLER (7 permisos)

### Login por correo (mismo endpoint, `identifier` acepta username o email)
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "admin@storelab.local",
  "password": "Admin123!"
}

### Respuesta 401 - credenciales inválidas (mismo mensaje que "usuario inexistente")
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "admin",
  "password": "password-incorrecta"
}

### Guarda los tokens para los demás archivos .http
@adminAccessToken = {{loginAdmin.response.body.$.access_token}}
@adminRefreshToken = {{loginAdmin.response.body.$.refresh_token}}
@expiresIn = {{loginAdmin.response.body.$.expires_in}}
EOF

: > src/features/auth/session/http/session.refresh.http
cat >> src/features/auth/session/http/session.refresh.http << 'EOF'
### Feature Session — REFRESH (modalidad OPEN con credencial de sesión)
### Renovación automática: el cliente llama aquí cuando el access token está por expirar.
### ROTACIÓN: el refresh token enviado queda inválido y se emite uno nuevo (misma familia).
### REUSE DETECTION: si se reenvía un token ya rotado -> 401 y se revoca toda la familia.
@baseUrl = http://localhost:4000

### 1) Login para obtener el par inicial
# @name loginAdmin
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "admin",
  "password": "Admin123!"
}

### 2) Refresh: devuelve access_token nuevo + refresh_token ROTADO
# @name refresh
POST {{baseUrl}}/api/sesion/refresh
Content-Type: application/json

{
  "refresh_token": "{{loginAdmin.response.body.$.refresh_token}}"
}

### 3) El access token nuevo sirve en una ruta JWT
GET {{baseUrl}}/api/sesion/perfil
Authorization: Bearer {{refresh.response.body.$.access_token}}

### 4) REUSE: reenviar el token viejo -> 401 y la familia queda revocada
POST {{baseUrl}}/api/sesion/refresh
Content-Type: application/json

{
  "refresh_token": "{{loginAdmin.response.body.$.refresh_token}}"
}

### 5) Consecuencia: el token rotado (paso 2) tampoco sirve ya -> 401
POST {{baseUrl}}/api/sesion/refresh
Content-Type: application/json

{
  "refresh_token": "{{refresh.response.body.$.refresh_token}}"
}
EOF

: > src/features/auth/session/http/session.profile.http
cat >> src/features/auth/session/http/session.profile.http << 'EOF'
### Feature Session — LOGOUT y PERFIL (OPEN con credencial de sesión + JWT)
@baseUrl = http://localhost:4000

# @name loginSeller
POST {{baseUrl}}/api/sesion/login
Content-Type: application/json

{
  "identifier": "seller",
  "password": "Seller123!"
}

### PERFIL — modalidad JWT: `authenticate` valida el token y REVALIDA en la BD
### que el usuario sigue activo (desactivarlo invalida sus tokens al instante).
GET {{baseUrl}}/api/sesion/perfil
Authorization: Bearer {{loginSeller.response.body.$.access_token}}

### MIS PERMISOS — modalidad JWT: misma consulta RBAC que usa `authorize`
### (seller -> 7 permisos; admin -> 58). Es la herramienta para depurar el RBAC.
GET {{baseUrl}}/api/permisos
Authorization: Bearer {{loginSeller.response.body.$.access_token}}

### Sin token -> 401 (no autenticado)
GET {{baseUrl}}/api/sesion/perfil

### LOGOUT — modalidad OPEN con credencial de sesión. Idempotente.
POST {{baseUrl}}/api/sesion/logout
Content-Type: application/json

{
  "refresh_token": "{{loginSeller.response.body.$.refresh_token}}"
}

### Ya no se puede renovar -> 401
POST {{baseUrl}}/api/sesion/refresh
Content-Type: application/json

{
  "refresh_token": "{{loginSeller.response.body.$.refresh_token}}"
}
EOF
```

![](images/clipboard-2103286100.png)

------------------------------------------------------------------------

## 26.7 Verificación end-to-end de las tres modalidades

``` bash
npm run db:seed && npm run dev

BASE=http://localhost:4000

# 1) OPEN — login (no requiere identidad)
curl -s -X POST $BASE/api/sesion/login -H "Content-Type: application/json" \
  -d '{"identifier":"admin","password":"Admin123!"}'

# 2) JWT — perfil con el access token (sin permisos RBAC de por medio)
ADMIN=$(curl -s -X POST $BASE/api/sesion/login -H "Content-Type: application/json" \
  -d '{"identifier":"admin","password":"Admin123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0)).access_token")
curl -s -H "Authorization: Bearer $ADMIN" $BASE/api/sesion/perfil

# 3) JWT + RBAC — el mismo token, ahora sí, autoriza negocio
curl -s -H "Authorization: Bearer $ADMIN" $BASE/api/clientes

# 4) JWT + RBAC (denegado) — seller no tiene POST /api/clientes
SELLER=$(curl -s -X POST $BASE/api/sesion/login -H "Content-Type: application/json" \
  -d '{"identifier":"seller","password":"Seller123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0)).access_token")
curl -i -X POST -H "Authorization: Bearer $SELLER" -H "Content-Type: application/json" \
  -d '{"name":"x","phone":"1","email":"x@x.com","password":"x"}' $BASE/api/clientes   # 403

# 5) Renovación — rotar el refresh token
curl -s -X POST $BASE/api/sesion/refresh -H "Content-Type: application/json" \
  -d '{"refresh_token":"<refresh_token del login>"}'
```

| Comprobación | Esperado |
|------------------------------------|------------------------------------|
| `POST /api/sesion/login` con credenciales válidas | 200 + `access_token` + `refresh_token` |
| `POST /api/sesion/login` con contraseña errónea | 401 genérico |
| `GET /api/sesion/perfil` sin token | 401 |
| `GET /api/permisos` con token de `seller` | lista de 7 recursos |
| `POST /api/clientes` con token de `seller` | 403 |
| `POST /api/sesion/refresh` con el refresh válido | 200 + nuevos tokens; el anterior queda `used` |
| Reusar el refresh anterior | 401 + familia revocada |

## DoD del ISS-21

-   [x] Todos los criterios de aceptación (20.1 … 20.7) cumplidos
-   [x] Las tres modalidades son observables con `curl` (401 sin token,
    403 sin concesión, 200/201 con ella)
-   [x] `GET /api/permisos` refleja la matriz real (58 para admin, 7
    para seller)
-   [x] La rotación de refresh invalida el token anterior
-   [x] `npx tsc --noEmit` sin errores y `npm run dev` arranca MDEOF
    echo "Creado: ISS-15-session.md"

![![](images/clipboard-779109171.png)](images/clipboard-2062251323.png)

![](images/clipboard-1612444581.png)

![](images/clipboard-3506127891.png)

![](images/clipboard-3146882701.png)

![](images/clipboard-913095949.png)

![](images/clipboard-686240088.png)

------------------------------------------------------------------------

# 27. Auth con RBAC — Cierre del laboratorio (backend completo)

## Contexto mínimo (autosuficiente)

Si abres este archivo aislado —o lo llevas a otra IA—, esto es lo que
hay que saber antes de ejecutarlo:

-   **Proyecto:** `app-storelab-express-ii` — Express 5 + TypeScript +
    Sequelize, arquitectura por features.
-   **Alcance final:** Fase I (Business) + Fase II (Auth con RBAC).
    Todas las rutas de negocio pasan de SIN AUTH a JWT + RBAC.
-   **Recorrido obligatorio de una petición:** HTTP → (middlewares) →
    Controller → Service → Repository → Model → Sequelize → BD. Ninguna
    capa se salta a la siguiente.
-   **Diseño de datos:** `../bd-storelab.md` — Fase I (§4–§11) y Fase II
    (§12–§22).
-   **Capas, convenciones y reglas transversales:** `00-contexto.md`.

## Este cierre

| Propiedad | Detalle |
|:-----------------------------------|:-----------------------------------|
| **Título** | Cierre del laboratorio (backend completo con Auth + RBAC) |
| **Feature / tablas** | Las 11 tablas |
| **API** | Todas |
| **Depende de** | ISS-15 — Feature Session |
| **Habilita** | — |

### Contenido de este cierre

-   Cableado final (config, routes, swagger, seeders)
-   Las tres modalidades — mapa definitivo de rutas
-   DoD del laboratorio
-   Cómo repetir el patrón (otra entidad)
-   Referencia rápida de paquetes
-   Fuentes

**Objetivo:** Dejar el backend completo y funcional: 12 features, 11
tablas, 3 modalidades, seguridad stateless con revocación inmediata, y
todo verificable con TypeScript, seeders y Swagger.

------------------------------------------------------------------------

## Cableado final

### `src/config/index.ts`

Arranque: modelos → asociaciones → rutas → Swagger.

``` bash
: > src/config/index.ts
cat >> src/config/index.ts << 'EOF'
import dotenv from "dotenv";
import express, {
  Application,
  ErrorRequestHandler,
} from "express";
import morgan from "morgan";
var cors = require("cors");

import {
  sequelize,
  getDatabaseInfo,
  testConnection,
} from "../database/db";

// ================== MODELOS DE NEGOCIO ==================

import "../features/business/members/members.model";
import "../features/business/audit/audit.model";
import "../features/business/associations";
import "../features/business/account/account.model";
import "../features/business/movements/movement.model";
import "../features/business/credit-applications/credit-application.model";
import "../features/business/credits/credit.model";
import "../features/business/rates/rate.model";
import "../features/business/installments/installment.model";
import "../features/business/installment-payments/installment-payment.model";
import "../features/business/committee-decisions/committee-decision.model";

import "../features/business/rates/rate.associations";
import "../features/business/installments/installment.associations";
import "../features/business/installment-payments/installment-payment.associations";
import "../features/business/committee-decisions/committee-decision.associations";
import "../features/business/credit-applications/credit-application.associations";

// ================== AUTH + RBAC ==================

// Primero modelos, después asociaciones.
import "../features/auth/users/user.model";
import "../features/auth/roles/role.model";
import "../features/auth/resources/resource.model";
import "../features/auth/role-users/role-user.model";
import "../features/auth/resource-roles/resource-role.model";
import "../features/auth/refresh-tokens/refresh-token.model";
import "../features/auth/rbac.associations";

import { Routes } from "../routes/index";
import { setupSwagger } from "../swagger/index";

dotenv.config();

export class App {
  public app: Application;
  public routePrv: Routes = new Routes();

  constructor(
    private port?: number | string
  ) {
    this.app = express();

    this.settings();
    this.middlewares();
    this.routes();
    this.docs();
    this.errorHandling();
  }

  private settings(): void {
    this.app.set(
      "port",
      this.port ||
        process.env.PORT ||
        4000
    );
  }

  private middlewares(): void {
    this.app.use(morgan("dev"));
    this.app.use(cors());

    this.app.use(express.json());

    this.app.use(
      express.urlencoded({
        extended: false,
      })
    );
  }

  private routes(): void {
    this.routePrv.routes(this.app);
  }

  private docs(): void {
    setupSwagger(this.app);
  }

  /**
   * Maneja errores producidos antes de llegar
   * al controller, especialmente JSON malformado.
   *
   * Evita que Express responda HTML con stack trace
   * y rutas absolutas del servidor.
   */
  private errorHandling(): void {
    const bodyErrorHandler: ErrorRequestHandler = (
      err,
      _req,
      res,
      next
    ) => {
      if (
        err instanceof SyntaxError &&
        "body" in err
      ) {
        res.status(400).json({
          error: "Malformed JSON body",
        });
        return;
      }

      next(err);
    };

    this.app.use(bodyErrorHandler);
  }

  private async dbConnection(): Promise<void> {
    try {
      const dbInfo =
        getDatabaseInfo();

      console.log(
        `🔗 Intentando conectar a: ${dbInfo.engine.toUpperCase()}`
      );

      const isConnected =
        await testConnection();

      if (!isConnected) {
        throw new Error(
          `No se pudo conectar a la base de datos ${dbInfo.engine.toUpperCase()}`
        );
      }

      const force =
        process.env.DB_SYNC_FORCE === "true";

      const isMysql =
        sequelize.getDialect() === "mysql" ||
        sequelize.getDialect() === "mariadb";

      if (isMysql) {
        await sequelize.query(
          "SET FOREIGN_KEY_CHECKS = 0"
        );
      }

      try {
        await sequelize.sync({
          force,
          alter: !force,
        });
      } finally {
        if (isMysql) {
          await sequelize.query(
            "SET FOREIGN_KEY_CHECKS = 1"
          );
        }
      }

      console.log(
        force
          ? "📦 Base de datos recreada (DB_SYNC_FORCE=true)"
          : "📦 Base de datos sincronizada exitosamente"
      );
    } catch (error) {
      console.error(
        "❌ Error al conectar con la base de datos:",
        error
      );

      process.exit(1);
    }
  }

  async listen(): Promise<void> {
    // Primero conexión y sincronización de BD.
    // Después se abre el puerto HTTP.
    await this.dbConnection();

    await this.app.listen(
      this.app.get("port")
    );

    console.log(
      `🚀 Servidor ejecutándose en puerto ${this.app.get("port")}`
    );
  }
}
EOF
```

![](images/clipboard-3886893454.png)

------------------------------------------------------------------------

## DoD del laboratorio (Fase I + Fase II)

-   [x] 12 features (5 business + 7 auth), cada uno con sus capas
    `controller → service → repository → model`
-   [x] 11 tablas: `clients`, `product_types`, `products`, `sales`,
    `product_sales`, `users`, `roles`, `resources`, `role_users`,
    `resource_roles`, `refresh_tokens`
-   [x] 3 modalidades aplicadas por ruta: OPEN, JWT, JWT + RBAC
-   [x] No existe entidad `Permission`; el permiso es
    `resource_roles (role_id, resource_id)`
-   [x] *deny by default*: sin concesión activa → 403
-   [x] Access token corto (HS256, `iss`/`aud`/`exp`/`jti`), refresh
    token opaco, hasheado, rotativo y revocable
-   [x] `role_users` y `resource_roles` soportan asignar / retirar /
    reactivar y `reconcileRole`
-   [x] Seeders deterministas: 2 roles, 58 recursos, 2 usuarios, 2
    asignaciones, 65 concesiones
-   [x] Swagger `/api/docs` con `bearerAuth`, 401/403 y las 3
    modalidades por operación
-   [x] `npx tsc --noEmit` OK
-   [x] Smoke test E2E de las tres modalidades en verde

------------------------------------------------------------------------

## Cómo repetir el patrón (otra entidad)

``` text
ISS-n-A    modelo + DTO + esqueletos repository/service/controller/routes + cableado
ISS-n-B…E  CRUD en orden: getAll, getOne, create, update PUT/PATCH, delete físico/lógico
           (cada paso toca las 3 capas: repository -> service -> controller) + http
ISS-n-F    seeder + PARCHE counts/runner
ISS-n-G    swagger + PARCHE registry
ISS-n-R    si hay FK `tabla_singular_id`: associations.ts + PARCHE config
ISS-n-S    si el recurso debe protegerse: alta en `resource-catalog.ts` + concesión por rol
```

**Regla de oro del lab:**
`routes -> controller -> service -> repository -> model`. Ninguna capa
se salta a la siguiente ni consulta el modelo directamente. El DTO es el
contrato que cruza routes/controller/service; el repository y el model
no lo conocen.

------------------------------------------------------------------------

## Referencia rápida de paquetes

``` bash
npm install express@^5.2.1 cors@^2.8.6 dotenv@^17.4.2 morgan@^1.12.1 \
  sequelize@^6.37.8 mysql2@^3.24.4 pg@^8.23.0 pg-hstore@^2.3.4 \
  tedious@^20.0.0 oracledb@^7.0.1 bcryptjs@^3.0.3 \
  jsonwebtoken@^9.0.3 swagger-ui-express@^5.0.1

npm install -D typescript@~5.9.2 ts-node@^10.9.2 nodemon@^3.1.14 \
  @types/node@^22.20.4 @types/express@^5.0.6 \
  @types/cors@^2.8.19 @types/morgan@^1.9.10 \
  @types/sequelize@^6.12.0 @types/bcryptjs@^3.0.0 \
  @types/jsonwebtoken@^9.0.10 @types/swagger-ui-express@^4.1.8 \
  @faker-js/faker@^10.6.0
```

------------------------------------------------------------------------

# 28. Pruebas de acceso, autenticación JWT, Refresh Token y RBAC

## 28.1. Objetivo

Verificar el funcionamiento de las modalidades de acceso implementadas
en la API Solia Express:

-   **OPEN:** acceso sin autenticación.
-   **JWT:** acceso mediante un token de acceso válido.
-   **JWT + RBAC:** acceso mediante JWT y comprobación de los permisos
    asignados al usuario y a su rol.

También se comprueban el inicio de sesión, la renovación de tokens, el
cierre de sesión y la consulta de permisos.

## 28.2. Requisitos previos

1.  Abrir una terminal de Ubuntu (WSL).
2.  Ubicarse en el proyecto `app-solia-express`.
3.  Tener disponibles los motores de base de datos y la base de datos
    configurada para la aplicación.
4.  Iniciar el servidor con `npm run dev`.
5.  Disponer de un usuario activo con credenciales válidas.

La API se consulta en `http://localhost:4000`.

En una segunda terminal, ejecutar las pruebas de este capítulo. No se
deben registrar como exitosas hasta comprobar las respuestas reales.

## 28.3. Modalidades de acceso

| Modalidad | Funcionamiento | Resultado esperado |
|------------------------|------------------------|------------------------|
| OPEN | No requiere token | La respuesta depende del controlador |
| JWT | Requiere un access token válido | 200 si la operación es correcta |
| JWT + RBAC | Requiere JWT y permiso vigente | 200 si está autorizado; 403 si no tiene permiso |
| JWT sin token o con token inválido | No se acredita la identidad | 401 |

## 28.4. Pruebas de rutas OPEN

### P01. Consultar socios sin token

``` bash
curl -i http://localhost:4000/api/members
```

**Esperado:** `200 OK`, siempre que el servidor y la base de datos
funcionen correctamente.

![](images/clipboard-2674991979.png)

Esta prueba verifica que la ruta de socios permite el acceso sin
autenticación.

### P02. Consultar socios con un token inválido

``` bash
curl -i http://localhost:4000/api/members \
  -H "Authorization: Bearer token-invalido"
```

![](images/clipboard-2230001433.png)

**Esperado:** la ruta continúa siendo pública y responde como una
consulta normal, generalmente `200 OK`. El controlador puede devolver
otro resultado si existe un error de aplicación o de base de datos.

## 28.5. Pruebas de inicio de sesión

### P03. Iniciar sesión con credenciales válidas

``` bash
curl -i -X POST http://localhost:4000/api/sesion/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin","password":"Admin123!"}'
```

![](images/clipboard-3319020369.png)

**Esperado:** `200 OK` y una respuesta JSON que contenga `access_token`,
`refresh_token`, `token_type` y los tiempos de expiración.

### P04. Iniciar sesión con contraseña incorrecta

``` bash
curl -i -X POST http://localhost:4000/api/sesion/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin","password":"password-incorrecta"}'
```

![](images/clipboard-3989707505.png)

**Esperado:** `401 Unauthorized`.

### P05. Iniciar sesión sin los campos requeridos

``` bash
curl -i -X POST http://localhost:4000/api/sesion/login \
  -H "Content-Type: application/json" \
  -d '{}'
```

![](images/clipboard-3428865490.png)

**Esperado:** `400 Bad Request`.

## 28.6. Pruebas de autenticación JWT

Sustituye `PEGAR_ACCESS_TOKEN` por el `access_token` obtenido en el
inicio de sesión.

### P06. Consultar el perfil sin token

``` bash
curl -i http://localhost:4000/api/sesion/perfil
```

![](images/clipboard-2004537351.png)

**Esperado:** `401 Unauthorized`.

### P07. Consultar el perfil con un token inválido

``` bash
curl -i http://localhost:4000/api/sesion/perfil \
  -H "Authorization: Bearer token-invalido"
```

![](images/clipboard-488371451.png)

**Esperado:** `401 Unauthorized`.

### P08. Consultar el perfil con un token válido

``` bash
curl -i http://localhost:4000/api/sesion/perfil \
  -H "Authorization: Bearer PEGAR_ACCESS_TOKEN"
```

![](images/clipboard-3127036682.png)

**Esperado:** `200 OK` si el token es válido y el usuario continúa
activo.

## 28.7. Pruebas de renovación del Refresh Token

### P09. Renovar la sesión con un Refresh Token válido

Sustituye `PEGAR_REFRESH_TOKEN` por el `refresh_token` obtenido en el
login.

``` bash
cd ~/ia-lab/projects/motores-bd/dw/pry-sprada/app-solia-express || exit 1

LOGIN_JSON=$(curl -sS -X POST http://localhost:4000/api/sesion/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin","password":"Admin123!"}')

REFRESH_TOKEN=$(printf '%s' "$LOGIN_JSON" | node -pe 'JSON.parse(require("fs").readFileSync(0,"utf8")).refresh_token')

if [ -z "$REFRESH_TOKEN" ] || [ "$REFRESH_TOKEN" = "undefined" ]; then
  echo "ERROR: no se pudo obtener el refresh token."
  exit 1
fi

echo "===== P09: REFRESH VALIDO ====="

curl -sS -w '\nHTTP_STATUS:%{http_code}\n' \
  -X POST http://localhost:4000/api/sesion/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\":\"$REFRESH_TOKEN\"}" \
  -o /tmp/solia_p09_response.json

node -e '
const fs = require("fs");
const r = JSON.parse(fs.readFileSync("/tmp/solia_p09_response.json", "utf8"));
if (r.access_token && r.refresh_token) {
  fs.writeFileSync("/tmp/solia_access_token.txt", r.access_token);
  fs.writeFileSync("/tmp/solia_refresh_token.txt", r.refresh_token);
  console.log("P09 CORRECTA: tokens renovados.");
} else {
  console.log("Respuesta:", JSON.stringify(r));
}
'
```

![](images/clipboard-2772485199.png)

**Esperado:** `200 OK`, con un nuevo `access_token` y un nuevo
`refresh_token`.

La implementación rota el Refresh Token. Guarda el nuevo token devuelto
y utilízalo en las operaciones siguientes.

### P10. Renovar sin enviar el Refresh Token

``` bash
curl -i -X POST http://localhost:4000/api/sesion/refresh \
  -H "Content-Type: application/json" \
  -d '{}'
```

![](images/clipboard-154965315.png)**Esperado:** `400 Bad Request`.

### P11. Renovar con un Refresh Token inexistente

``` bash
curl -i -X POST http://localhost:4000/api/sesion/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"refresh-token-inexistente"}'
```

![](images/clipboard-2403188127.png)

**Esperado:** `401 Unauthorized`.

### P12. Comprobar el uso del nuevo Access Token

Utiliza el `access_token` devuelto por P09:

``` bash
curl -i http://localhost:4000/api/sesion/perfil \
  -H "Authorization: Bearer PEGAR_NUEVO_ACCESS_TOKEN"
```

![](images/clipboard-3047002131.png)

**Esperado:** `200 OK` si el token nuevo es válido.

## 28.8. Pruebas de autorización JWT + RBAC

La ruta `/api/accounts` utiliza los middlewares `authenticate` y
`authorize`. Por tanto, no basta con presentar un token válido: el
usuario debe contar con un permiso activo para el método y la ruta
solicitados.

### P13. Consultar cuentas sin token

``` bash
curl -i http://localhost:4000/api/accounts
```

![](images/clipboard-3184992226.png)

**Esperado:** `401 Unauthorized`.

### P14. Consultar cuentas con un token inválido

``` bash
curl -i http://localhost:4000/api/accounts \
  -H "Authorization: Bearer token-invalido"
```

![](images/clipboard-2495514784.png)

**Esperado:** `401 Unauthorized`.

### P15. Consultar cuentas con un usuario autorizado

``` bash
curl -i http://localhost:4000/api/accounts \
  -H "Authorization: Bearer PEGAR_ACCESS_TOKEN"
```

![](images/clipboard-1718682362.png)

**Esperado:** `200 OK` si el usuario tiene un permiso activo para
`GET /api/accounts` y la consulta se ejecuta correctamente.

### P16. Comprobar la denegación por falta de permiso

Inicia sesión con un usuario cuyo rol no tenga concedido el permiso para
`GET /api/accounts`. Utiliza su `access_token`:

``` bash
LOGIN_JSON=$(curl -sS -X POST http://localhost:4000/api/sesion/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin","password":"Admin123!"}')

ACCESS_TOKEN=$(printf '%s' "$LOGIN_JSON" | node -pe 'JSON.parse(require("fs").readFileSync(0,"utf8")).access_token')

echo "===== P18: PERMISOS CON TOKEN VALIDO ====="
curl -sS -i http://localhost:4000/api/permisos \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

![](images/clipboard-100601899.png)

**Esperado:** `403 Forbidden` cuando el token es válido, el usuario está
activo y la autorización RBAC deniega la operación.

Si el usuario sí tiene el permiso, esta prueba no demuestra una
denegación: debe utilizarse una cuenta de prueba con permisos conocidos.

## 28.9. Consultar los permisos del usuario

### P17. Consultar permisos sin token

``` bash
curl -i http://localhost:4000/api/permisos
```

![](images/clipboard-3285973070.png)

**Esperado:** `401 Unauthorized`.

### P18. Consultar permisos con un token válido

``` bash
LOGIN_JSON=$(curl -sS -X POST http://localhost:4000/api/sesion/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"seller","password":"Seller123!"}')

SELLER_TOKEN=$(printf '%s' "$LOGIN_JSON" | node -pe \
  'JSON.parse(require("fs").readFileSync(0,"utf8")).access_token || ""')

if [ -z "$SELLER_TOKEN" ]; then
  echo "ERROR: no se pudo obtener el token de SELLER."
  printf '%s\n' "$LOGIN_JSON"
else
  curl -sS -i http://localhost:4000/api/accounts \
    -H "Authorization: Bearer $SELLER_TOKEN"
fi

unset LOGIN_JSON SELLER_TOKE
```

![](images/clipboard-240267607.png)**Esperado:** `200 OK` si el usuario
está autenticado y activo. La respuesta debe permitir comprobar los
permisos efectivos que la aplicación reconoce para ese usuario.

## 28.10. Prueba de cierre de sesión

### P19. Cerrar la sesión con el Refresh Token vigente

``` bash
LOGIN_JSON=$(curl -sS -X POST http://localhost:4000/api/sesion/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin","password":"Admin123!"}')

REFRESH_TOKEN=$(printf '%s' "$LOGIN_JSON" | node -pe \
  'JSON.parse(require("fs").readFileSync(0,"utf8")).refresh_token || ""')

if [ -z "$REFRESH_TOKEN" ]; then
  echo "ERROR: no se pudo obtener el refresh token."
  printf '%s\n' "$LOGIN_JSON"
else
  echo "P19. POST /api/sesion/logout:"
  curl -sS -i -X POST http://localhost:4000/api/sesion/logout \
    -H "Content-Type: application/json" \
    -d "{\"refresh_token\":\"$REFRESH_TOKEN\"}"
fi

unset LOGIN_JSON REFRESH_TOKEN
```

![](images/clipboard-1662616293.png)

**Esperado:** `200 OK` y un mensaje de confirmación, según la
implementación actual.

## 28.11. Registro de resultados

Marca cada casilla después de ejecutar la prueba y comprobar que el
resultado obtenido coincide con el esperado.

### Checklist de pruebas de acceso

-   [x] **P01. Socios sin token:** esperado `200`.
-   [x] **P02. Socios con token inválido:** la ruta continúa siendo
    pública.
-   [x] **P03. Login válido:** esperado `200`.
-   [x] **P04. Login inválido:** esperado `401`.
-   [x] **P05. Login incompleto:** esperado `400`.
-   [x] **P06. Perfil sin token:** esperado `401`.
-   [x] **P07. Perfil con token inválido:** esperado `401`.
-   [x] **P08. Perfil con token válido:** esperado `200`.
-   [x] **P09. Refresh válido:** esperado `200`.
-   [x] **P10. Refresh sin token:** esperado `400`.
-   [x] **P11. Refresh inexistente:** esperado `401`.
-   [x] **P12. Perfil con nuevo Access Token:** esperado `200`.
-   [x] **P13. Cuentas sin token:** esperado `401`.
-   [x] **P14. Cuentas con token inválido:** esperado `401`.
-   [x] **P15. Cuentas con permiso:** esperado `200`.
-   [x] **P16. Cuentas sin permiso:** esperado `403`.
-   [x] **P17. Permisos sin token:** esperado `401`.
-   [x] **P18. Permisos con token válido:** esperado `200`.
-   [x] **P19. Cierre de sesión:** esperado `200`.

**Criterio de cumplimiento:** marca una casilla únicamente después de
ejecutar la prueba y verificar su respuesta. Si el resultado difiere del
esperado, deja la casilla sin marcar hasta investigar y corregir el
problema.
