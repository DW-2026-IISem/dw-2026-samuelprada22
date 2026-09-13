import { Status } from '../../../../../common/enums/status.enum.js';
import { InstallmentPayment } from '../../domain/entities/installment-payment.entity.js';
import { InstallmentPaymentResponseDto } from '../dto/installment-payment-response.dto.js';
import { InstallmentPaymentModel } from '../../infrastructure/persistence/models/installment-payment.model.js';

export class InstallmentPaymentMapper {
  static toDomain(
    model: InstallmentPaymentModel,
  ): InstallmentPayment {
    return InstallmentPayment.reconstitute({
      id: model.id,
      installmentId: model.installmentId,
      name: model.name,
      description: model.description ?? undefined,
      isActive: model.isActive,
      status: model.status,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  static toResponse(
    entity: InstallmentPayment,
  ): InstallmentPaymentResponseDto {
    return {
      id: entity.id!,
      installmentId: entity.installmentId,
      name: entity.name,
      description: entity.description,
      isActive: entity.isActive,
      status: entity.status,
      createdAt: entity.createdAt!,
      updatedAt: entity.updatedAt!,
    };
  }

  static toPersistence(
    entity: InstallmentPayment,
  ): Partial<InstallmentPaymentModel> {
    return {
      id: entity.id,
      installmentId: entity.installmentId,
      name: entity.name,
      description: entity.description ?? null,
      isActive: entity.isActive,
      status: entity.status ?? Status.ACTIVE,
    };
  }
}
