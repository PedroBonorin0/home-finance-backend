import {
  Controller,
  Post,
  UploadedFile,
  Body,
  UseInterceptors,
  BadRequestException,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CsvImportService } from './csv-import.service';
import { CsvImportDto } from './csv-import.dto';

@ApiTags('Importação CSV')
@Controller('csv-import')
export class CsvImportController {
  constructor(private readonly service: CsvImportService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Importar registros de arquivo CSV' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'Arquivo CSV' },
        responsible: { type: 'string', enum: ['Pedro', 'Clarissa'], description: 'Responsável' },
        method: { type: 'string', enum: ['Pix', 'Credit'], description: 'Método de pagamento' },
      },
    },
  })
  async import(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body() dto: CsvImportDto,
  ) {
    return this.service.import(file, dto);
  }
}
