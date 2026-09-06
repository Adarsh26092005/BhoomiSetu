import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { JurisdictionService } from './jurisdiction.service';
import { JurisdictionController } from './jurisdiction.controller';

@Global()
@Module({
  imports: [DatabaseModule],
  controllers: [JurisdictionController],
  providers: [JurisdictionService],
  exports: [JurisdictionService],
})
export class JurisdictionModule {}
