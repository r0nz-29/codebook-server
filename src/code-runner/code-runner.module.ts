import { Module } from '@nestjs/common';
import { CodeRunnerGateway } from './codeRunner.gateway';

@Module({
  providers: [CodeRunnerGateway],
})
export class CodeRunnerModule {}
