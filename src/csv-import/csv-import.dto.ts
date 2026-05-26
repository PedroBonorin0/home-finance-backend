import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PaymentMethod, People } from '../records/records.dto';

export class CsvImportDto {
  @ApiProperty({ enum: People, description: 'Responsável' })
  @IsEnum(People)
  responsible: People;

  @ApiProperty({ enum: PaymentMethod, description: 'Método de pagamento (Pix ou Credit)' })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}
