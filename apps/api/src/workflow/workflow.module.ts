import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { JurisdictionModule } from '../jurisdiction/jurisdiction.module';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';

@Module({
  imports: [DatabaseModule, JurisdictionModule],
  controllers: [WorkflowController],
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule {}
