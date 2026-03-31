import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JerarquiaModule } from '../jerarquia/jerarquia.module';
import { MiembrosController } from './miembros.controller';
import { MiembrosService } from './miembros.service';

@Module({
  imports: [AuthModule, JerarquiaModule],
  controllers: [MiembrosController],
  providers: [MiembrosService],
  exports: [MiembrosService],
})
export class MiembrosModule {}
