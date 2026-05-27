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
  @ApiProperty({ example: 'uuid-da-subcategoria' })
  @IsUUID()
  @IsNotEmpty()
  subcategory_id: string;

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
}

export class UpdateRecordDto extends PartialType(CreateRecordDto) {}

export class RecordFiltersDto {
  @ApiPropertyOptional({ description: 'Filtrar por subcategoria' })
  @IsOptional()
  subcategory_id?: string | null;

  @ApiPropertyOptional({ description: 'Filtrar por categoria (através da subcategoria)' })
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

  @ApiPropertyOptional({ example: 1, description: 'Número da página (começa em 1)' })
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 20, description: 'Registros por página (max 100)' })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  per_page?: number;
}

export class RecordResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() subcategory_id: string;
  @ApiProperty() value: number;
  @ApiProperty({ enum: PaymentMethod }) method: PaymentMethod;
  @ApiProperty() date: string;
  @ApiPropertyOptional() notes?: string;
  @ApiProperty() created_at: string;
  @ApiProperty() updated_at: string;
  @ApiPropertyOptional({ description: 'Dados da subcategoria (quando expandido)' })
  subcategories?: any;
}

export class PaginatedRecordsDto {
  @ApiProperty({ type: [RecordResponseDto] })
  data: RecordResponseDto[];

  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  per_page: number;

  @ApiProperty({ example: 3 })
  total_pages: number;
}

export class RecordsSummaryDto {
  @ApiProperty() total_income: number;
  @ApiProperty() total_outcome: number;
  @ApiProperty() balance: number;
  @ApiProperty() count: number;
}
