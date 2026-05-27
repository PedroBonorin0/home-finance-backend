import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateSubcategoryDto {
  @ApiProperty({ example: 'Mercado', description: 'Nome da subcategoria' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'uuid-da-categoria' })
  @IsUUID()
  @IsNotEmpty()
  category_id: string;
}

export class UpdateSubcategoryDto extends PartialType(CreateSubcategoryDto) {}

export class SubcategoryResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() category_id: string;
  @ApiProperty() created_at: string;
  @ApiProperty() updated_at: string;
  @ApiPropertyOptional({ description: 'Dados da categoria (quando expandido)' })
  categories?: any;
}
