# Mongoose with NestJS Guide

## Quick Start

Mongoose is configured for MongoDB integration. See the [official documentation](https://docs.nestjs.com/techniques/mongodb) for complete setup details.

## Essential Patterns

### Schema Definition
Create schemas with proper validation:

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  })
  role: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
```

### Service Implementation
Create service with common operations:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new this.userModel(createUserDto);
    return user.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findById(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  async delete(id: string): Promise<User> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
```

### Module Configuration
Set up Mongoose module:

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema }
    ])
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

### Advanced Querying
Implement complex queries:

```typescript
@Injectable()
export class UserService {
  // Pagination
  async findWithPagination(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return this.userModel
      .find()
      .skip(skip)
      .limit(limit)
      .exec();
  }

  // Search and filtering
  async search(filters: UserFilters) {
    const query = this.userModel.find();
    
    if (filters.name) {
      query.where('name').regex(new RegExp(filters.name, 'i'));
    }
    
    if (filters.role) {
      query.where('role').equals(filters.role);
    }
    
    return query.exec();
  }

  // Aggregation
  async getUserStats() {
    return this.userModel.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
  }
}
```

### Relationships
Handle document relationships:

```typescript
@Schema()
export class Post extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: User;

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  likes: User[];
}

// Populate relationships
async findPostsWithAuthor(): Promise<Post[]> {
  return this.postModel
    .find()
    .populate('author')
    .populate('likes')
    .exec();
}
```

## Validation Patterns

### DTO Validation
Combine with class-validator:

```typescript
import { IsEmail, IsString, IsEnum, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(['user', 'admin'])
  @IsOptional()
  role?: string;
}
```

### Schema Validation
Add custom validators:

```typescript
@Schema()
export class User extends Document {
  @Prop({
    required: true,
    validate: {
      validator: (v: string) => v.length >= 2,
      message: 'Name must be at least 2 characters'
    }
  })
  name: string;

  @Prop({
    required: true,
    validate: {
      validator: (v: string) => /\S+@\S+\.\S+/.test(v),
      message: 'Please provide a valid email'
    }
  })
  email: string;
}
```

## Performance Tips

- Use indexes for frequently queried fields
- Implement pagination for large datasets
- Use `lean()` for read-only operations
- Avoid N+1 queries with proper population

## Common Issues

### Connection Issues
Ensure proper connection string:
```typescript
MongooseModule.forRoot('mongodb://localhost:27017/mydb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
```

### Validation Errors
Handle validation properly:
```typescript
try {
  await this.userModel.create(userData);
} catch (error) {
  if (error.name === 'ValidationError') {
    throw new BadRequestException(error.message);
  }
  throw error;
}
```

### ObjectId Conversion
Convert strings to ObjectId:
```typescript
import { Types } from 'mongoose';

const objectId = new Types.ObjectId(id);
```

## Resources

- [NestJS Mongoose Documentation](https://docs.nestjs.com/techniques/mongodb)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Best Practices](https://www.mongodb.com/developer/products/mongodb/mongodb-schema-design-best-practices/) 