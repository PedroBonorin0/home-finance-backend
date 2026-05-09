import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class CreatePercentageDto {
  @ApiProperty({ example: 50, description: 'Porcentagem do Pedro' })
  @IsNumber()
  @Min(0)
  @Max(100)
  pedro_percentage: number;

  @ApiProperty({ example: 50, description: 'Porcentagem da Clarissa' })
  @IsNumber()
  @Min(0)
  @Max(100)
  clarissa_percentage: number;
}

export class PercentageResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() pedro_percentage: number;
  @ApiProperty() clarissa_percentage: number;
  @ApiProperty() created_at: string;
  @ApiProperty() updated_at: string;
}
