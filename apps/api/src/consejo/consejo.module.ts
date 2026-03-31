import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JerarquiaModule } from '../jerarquia/jerarquia.module';
import { ConsejoController } from './consejo.controller';
import { ConsejoService } from './consejo.service';

@Module({
  imports: [AuthModule, JerarquiaModule],
  controllers: [ConsejoController],
  providers: [ConsejoService],
  exports: [ConsejoService],
})
export class ConsejoModule {}
