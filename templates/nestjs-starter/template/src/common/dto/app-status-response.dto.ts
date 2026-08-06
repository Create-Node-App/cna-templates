import { ApiProperty } from '@nestjs/swagger';

class AppRoutesDto {
  @ApiProperty({ example: '/' })
  root!: string;

  @ApiProperty({ example: '/health' })
  health!: string;

  @ApiProperty({ example: '/docs' })
  docs!: string;
}

export class AppStatusResponseDto {
  @ApiProperty({ example: 'ok' })
  status!: 'ok';

  @ApiProperty({ example: 'NestJS starter API is running.' })
  message!: string;

  @ApiProperty({ example: '2026-07-16T20:00:00.000Z' })
  timestamp!: string;

  @ApiProperty({ type: AppRoutesDto })
  routes!: AppRoutesDto;

  @ApiProperty({
    type: [String],
    example: ['Add your first feature module.', 'Wire your environment variables in .env.'],
  })
  nextSteps!: string[];
}
