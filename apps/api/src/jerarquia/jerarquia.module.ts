import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JerarquiaController } from './jerarquia.controller';
import { JerarquiaService } from './jerarquia.service';

@Module({
  imports: [AuthModule],
  controllers: [JerarquiaController],
  providers: [JerarquiaService],
  exports: [JerarquiaService],
})
export class JerarquiaModule {}
