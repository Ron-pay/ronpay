import { Module } from '@nestjs/common';
import { ClaudeService } from './claude.service';
import { GeminiService } from './gemini.service';
import { AiService } from './ai.service';

@Module({
  providers: [
    ClaudeService,
    GeminiService,
    {
      provide: AiService,
      useFactory: (claudeService: ClaudeService, geminiService: GeminiService) => {
        const provider = process.env.AI_PROVIDER || 'gemini';
        return provider === 'claude' ? claudeService : geminiService;
      },
      inject: [ClaudeService, GeminiService],
    },
  ],
  exports: [AiService],
})
export class AiModule {}
