import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsPositive, IsUUID, Max, Min } from 'class-validator';

export class CreateInstallmentGroupDto {
  @ApiProperty({ example: 'uuid-da-categoria' })
  @IsUUID()
  @IsNotEmpty()
  category_id: string;

  @ApiProperty({ example: 'Pedro', description: 'Pessoa envolvida' })
  @IsNotEmpty()
  responsible: string;

  @ApiProperty({ example: 1500.0, description: 'Valor total da compra' })
  @IsPositive()
  total_value: number;

  @ApiProperty({ example: 3, description: 'Numero de parcelas' })
  @IsInt()
  @Min(2)
  @Max(24)
  installments: number;

  @ApiProperty({ example: '2024-01-15', description: 'Data da primeira parcela' })
  @IsDateString()
  first_date: string;

  @ApiPropertyOptional({ example: 'Compra parcelada' })
  @IsOptional()
  description?: string;
}

export class InstallmentGroupResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() category_id: string;
  @ApiProperty() responsible: string;
  @ApiProperty() total_value: number;
  @ApiProperty() installment_value: number;
  @ApiProperty() installments: number;
  @ApiProperty() first_date: string;
  @ApiProperty() description?: string;
  @ApiProperty() created_at: string;
  @ApiProperty() updated_at: string;
}
