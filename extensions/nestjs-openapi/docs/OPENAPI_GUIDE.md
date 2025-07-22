# NestJS OpenAPI Guide

## Quick Start

OpenAPI (Swagger) is configured for your NestJS API. See the [official documentation](https://docs.nestjs.com/openapi/introduction) for complete details.

## Essential Patterns

### Basic Setup
Configure OpenAPI in your application:

```typescript
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
bootstrap();
```

### Controller Documentation
Document your endpoints:

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateUserDto, UserResponseDto } from './dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of users',
    type: [UserResponseDto]
  })
  async findAll(): Promise<UserResponseDto[]> {
    return this.userService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User created successfully',
    type: UserResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(createUserDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.findOne(id);
  }
}
```

### DTO Documentation
Document your data transfer objects:

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ 
    description: 'User email', 
    example: 'user@example.com' 
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    description: 'User full name', 
    example: 'John Doe' 
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({ 
    description: 'User role', 
    enum: ['user', 'admin'],
    default: 'user' 
  })
  @IsEnum(['user', 'admin'])
  @IsOptional()
  role?: string;
}

export class UserResponseDto {
  @ApiProperty({ description: 'User ID', example: '123' })
  id: string;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'User name', example: 'John Doe' })
  name: string;

  @ApiProperty({ description: 'User role', example: 'user' })
  role: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;
}
```

### Authentication Documentation
Document secured endpoints:

```typescript
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('protected')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ProtectedController {
  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid token' })
  async getProfile(@Request() req): Promise<UserResponseDto> {
    return req.user;
  }
}
```

## Advanced Patterns

### Custom Decorators
Create reusable decorators:

```typescript
import { applyDecorators } from '@nestjs/common';
import { ApiResponse, ApiOperation } from '@nestjs/swagger';

export function ApiSuccessResponse(type: any, description: string) {
  return applyDecorators(
    ApiOperation({ summary: description }),
    ApiResponse({ status: 200, type, description }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiResponse({ status: 500, description: 'Internal Server Error' })
  );
}

// Usage
@Get()
@ApiSuccessResponse(UserResponseDto, 'Get all users')
async findAll() {
  return this.userService.findAll();
}
```

### File Upload Documentation
Document file uploads:

```typescript
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@Post('upload')
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
      },
    },
  },
})
@UseInterceptors(FileInterceptor('file'))
async uploadFile(@UploadedFile() file: Express.Multer.File) {
  return { filename: file.filename };
}
```

### Pagination Documentation
Document paginated responses:

```typescript
export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Data array' })
  data: T[];

  @ApiProperty({ description: 'Total items' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;
}

@Get()
@ApiResponse({ 
  status: 200, 
  schema: {
    allOf: [
      { $ref: getSchemaPath(PaginatedResponseDto) },
      {
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(UserResponseDto) },
          },
        },
      },
    ],
  },
})
async findAll(@Query() query: PaginationDto) {
  return this.userService.findAllPaginated(query);
}
```

## Configuration

### Environment-based Setup
Configure different environments:

```typescript
const swaggerConfig = new DocumentBuilder()
  .setTitle('API Documentation')
  .setDescription('API description')
  .setVersion('1.0')
  .addServer(process.env.API_URL || 'http://localhost:3000')
  .addBearerAuth()
  .build();

// Only enable in development
if (process.env.NODE_ENV !== 'production') {
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);
}
```

### Custom Options
Customize Swagger UI:

```typescript
SwaggerModule.setup('api/docs', app, document, {
  customSiteTitle: 'API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
    tagsSorter: 'alpha',
    operationsSorter: 'alpha',
  },
});
```

## Best Practices

### Group Related Operations
Use tags to organize endpoints:
```typescript
@ApiTags('User Management')
@Controller('users')
export class UserController {}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {}
```

### Consistent Error Responses
Document standard error formats:
```typescript
export class ErrorResponseDto {
  @ApiProperty({ description: 'Error message' })
  message: string;

  @ApiProperty({ description: 'Error code' })
  statusCode: number;

  @ApiProperty({ description: 'Timestamp' })
  timestamp: string;
}
```

### Version Your API
Include versioning in documentation:
```typescript
const config = new DocumentBuilder()
  .setVersion('1.0')
  .addServer('/api/v1')
  .build();
```

## Common Issues

### Missing Types
Ensure DTOs are properly exported:
```typescript
// ✅ Good: Proper export
export class CreateUserDto {}

// ❌ Bad: Missing export
class CreateUserDto {}
```

### Generic Types
Handle generic types properly:
```typescript
@ApiExtraModels(PaginatedResponseDto, UserResponseDto)
@Get()
@ApiResponse({
  schema: {
    allOf: [
      { $ref: getSchemaPath(PaginatedResponseDto) },
      {
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(UserResponseDto) },
          },
        },
      },
    ],
  },
})
```

## Resources

- [NestJS OpenAPI Documentation](https://docs.nestjs.com/openapi/introduction)
- [Swagger UI Documentation](https://swagger.io/docs/open-source-tools/swagger-ui/)
- [OpenAPI Specification](https://swagger.io/specification/) 