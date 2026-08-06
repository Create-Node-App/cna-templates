import { ApiProperty } from '@nestjs/swagger';

export class AppHealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status!: 'ok';

  @ApiProperty({ example: 12.34, description: 'Process uptime in seconds.' })
  uptime!: number;

  @ApiProperty({ example: '2026-07-16T20:00:00.000Z' })
  timestamp!: string;
}
