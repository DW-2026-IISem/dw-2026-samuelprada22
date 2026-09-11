import { PartialType } from '@nestjs/mapped-types';
import { CreateMovementDto } from './create-movement.dto.js';

export class UpdateMovementDto extends PartialType(CreateMovementDto) {}
