import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateSubcategoryDto,
  SubcategoryResponseDto,
  UpdateSubcategoryDto,
} from './subcategories.dto';
import { SubcategoriesService } from './subcategories.service';

@ApiTags('Subcategorias')
@Controller('subcategories')
export class SubcategoriesController {
  constructor(private readonly service: SubcategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as subcategorias' })
  @ApiQuery({ name: 'category_id', required: false })
  @ApiResponse({ status: 200, type: [SubcategoryResponseDto] })
  findAll(@Query('category_id') category_id?: string) {
    return this.service.findAll(category_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar subcategoria por ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, type: SubcategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Subcategoria não encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova subcategoria' })
  @ApiResponse({ status: 201, type: SubcategoryResponseDto })
  create(@Body() dto: CreateSubcategoryDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar subcategoria' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, type: SubcategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Subcategoria não encontrada' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubcategoryDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover subcategoria' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Subcategoria removida' })
  @ApiResponse({ status: 404, description: 'Subcategoria não encontrada' })
  @ApiResponse({ status: 409, description: 'Subcategoria possui registros vinculados' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
