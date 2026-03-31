import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JerarquiaModule } from '../jerarquia/jerarquia.module';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';

@Module({
  imports: [AuthModule, JerarquiaModule],
  controllers: [ReportesController],
  providers: [ReportesService],
  exports: [ReportesService],
})
export class ReportesModule {}
