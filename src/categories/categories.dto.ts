import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export enum CategoryType {
  INCOME = 'income',
  OUTCOME = 'outcome',
}

export class CreateCategoryDto {
  @ApiProperty({ example: 'Salário', description: 'Nome da categoria' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ enum: CategoryType, example: CategoryType.INCOME })
  @IsEnum(CategoryType)
  type: CategoryType;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

export class CategoryResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty({ enum: CategoryType }) type: CategoryType;
  @ApiProperty() created_at: string;
  @ApiProperty() updated_at: string;
}
