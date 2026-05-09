import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export enum PaymentMethod {
  PIX = 'Pix',
  CREDIT = 'Credit',
  DEBIT = 'Debit',
}

export enum People {
  PEDRO = 'Pedro',
  CLARISSA = 'Clarissa',
}

export class CreateRecordDto {
  @ApiProperty({ example: 'uuid-da-categoria' })
  @IsUUID()
  @IsNotEmpty()
  category_id: string;

  @ApiProperty({ example: 'Pedro', description: 'Pessoa envolvida' })
  @IsEnum(People)
  responsible: People;

  @ApiProperty({ example: 1500.0, description: 'Valor positivo' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  value: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.PIX })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ example: '2024-01-15', description: 'Data no formato YYYY-MM-DD' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 'Pagamento do mês de janeiro' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({ example: 3, description: 'Numero de parcelas (apenas para credito)' })
  @IsInt()
  @Min(1)
  @Max(24)
  @IsOptional()
  installments?: number;
}

export class UpdateRecordDto extends PartialType(CreateRecordDto) {}

export class RecordFiltersDto {
  @ApiPropertyOptional({ description: 'Filtrar por categoria' })
  @IsUUID()
  @IsOptional()
  category_id?: string;

  @ApiPropertyOptional({ description: 'Filtrar por responsável' })
  @IsString()
  @IsOptional()
  responsible?: string;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsDateString()
  @IsOptional()
  date_from?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsDateString()
  @IsOptional()
  date_to?: string;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  @IsOptional()
  method?: PaymentMethod;

  @ApiPropertyOptional({ description: 'Filtrar por grupo de parcelas' })
  @IsUUID()
  @IsOptional()
  installment_group_id?: string;
}

export class RecordResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() category_id: string;
  @ApiProperty() value: number;
  @ApiProperty({ enum: PaymentMethod }) method: PaymentMethod;
  @ApiProperty() date: string;
  @ApiPropertyOptional() notes?: string;
  @ApiPropertyOptional() installment_group_id?: string;
  @ApiPropertyOptional() installment_number?: number;
  @ApiProperty() created_at: string;
  @ApiProperty() updated_at: string;
  @ApiPropertyOptional({ description: 'Dados da categoria (quando expandido)' })
  categories?: any;
}

export class RecordsSummaryDto {
  @ApiProperty() total_income: number;
  @ApiProperty() total_outcome: number;
  @ApiProperty() balance: number;
  @ApiProperty() count: number;
}
