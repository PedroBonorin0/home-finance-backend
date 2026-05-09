import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreatePercentageDto,
  PercentageResponseDto,
} from './percentages.dto';
import { PercentagesService } from './percentages.service';

@ApiTags('Configurações')
@Controller('config')
export class PercentagesController {
  constructor(private readonly service: PercentagesService) {}

  @Put()
  @ApiOperation({ summary: 'Salvar percentuais' })
  @ApiResponse({ status: 200, type: PercentageResponseDto })
  upsert(@Body() dto: CreatePercentageDto) {
    return this.service.upsert(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Buscar percentuais' })
  @ApiResponse({ status: 200, type: PercentageResponseDto })
  @ApiResponse({ status: 404, description: 'Configuração não encontrada' })
  find() {
    return this.service.find();
  }
}
