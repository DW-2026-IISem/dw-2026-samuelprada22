import { Application } from "express";

import { accountSwagger } from "../features/business/account/account.swagger";
import { creditApplicationSwagger } from "../features/business/credit-applications/credit-application.swagger";
import { creditSwagger } from "../features/business/credits/credit.swagger";
import { installmentPaymentSwagger } from "../features/business/installment-payments/installment-payment.swagger";
import { installmentSwagger } from "../features/business/installments/installment.swagger";
import { membersSwagger } from "../features/business/members/members.swagger";
import { movementSwagger } from "../features/business/movements/movement.swagger";
import { rateSwagger } from "../features/business/rates/rate.swagger";
import { committeeDecisionSwagger } from "../features/business/committee-decisions/committee-decision.swagger";
import { auditSwagger } from "../features/business/audit/audit.swagger";
import { sessionSwagger } from "../features/auth/sessions/session.swagger";

const featureSwaggerModules = [
  membersSwagger,
  accountSwagger,
  movementSwagger,
  creditApplicationSwagger,
  creditSwagger,
  rateSwagger,
  installmentSwagger,
  installmentPaymentSwagger,
  committeeDecisionSwagger,
  auditSwagger,
  sessionSwagger,
];

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Solia Express API",
    version: "1.0.0",
    description: "API REST de FondoSolidario",
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Servidor local",
    },
  ],
  tags: featureSwaggerModules.flatMap((module) => module.tags || []),
  paths: Object.assign(
    {},
    ...featureSwaggerModules.map((module) => module.paths || {})
  ),
  components: {
    schemas: Object.assign(
      {},
      ...featureSwaggerModules.map(
        (module) => module.components?.schemas || {}
      )
    ),
  },
};

export function buildOpenApiDocument() {
  return swaggerDefinition;
}

export function setupSwagger(app: Application): void {
  const swaggerUi = require("swagger-ui-express");

  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDefinition)
  );

  app.get("/api/docs.json", (_req, res) => {
    res.json(swaggerDefinition);
  });

  // Compatibilidad con la URL anterior.
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDefinition)
  );

  console.log(
    "📘 Swagger UI: /api/docs | OpenAPI JSON: /api/docs.json"
  );
}

export default swaggerDefinition;
