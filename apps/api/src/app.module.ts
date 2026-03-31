import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConsejoModule } from './consejo/consejo.module';
import { JerarquiaModule } from './jerarquia/jerarquia.module';
import { McpController } from './mcp/mcp.controller';
import { McpService } from './mcp/mcp.service';
import { MiembrosModule } from './miembros/miembros.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReportesModule } from './reportes/reportes.module';
import { TareasModule } from './tareas/tareas.module';

@Module({
  imports: [AuthModule, PrismaModule, JerarquiaModule, MiembrosModule, TareasModule, ConsejoModule, ReportesModule],
  controllers: [McpController],
  providers: [McpService],
})
export class AppModule {}
