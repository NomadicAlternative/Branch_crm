import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JerarquiaModule } from '../jerarquia/jerarquia.module';
import { TareasController } from './tareas.controller';
import { TareasService } from './tareas.service';

@Module({
  imports: [AuthModule, JerarquiaModule],
  controllers: [TareasController],
  providers: [TareasService],
  exports: [TareasService],
})
export class TareasModule {}
