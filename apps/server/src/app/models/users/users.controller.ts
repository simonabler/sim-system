import {
  Get,
  Put,
  Body,
  Controller,
  UseInterceptors,
  SerializeOptions,
  ClassSerializerInterceptor,
  Param,
  UseGuards,
  ValidationPipe,
  UsePipes,
  Patch,
  Delete,
} from '@nestjs/common';
import {
  UserEntity,
  extendedUserGroupsForSerializing,
} from './serializers/user.serializer';
import { UsersService } from './users.service';
import { EntityBeingQueried } from './decorators/user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReS } from '../../common/res.model';

@ApiBearerAuth()
@Controller('users')
@ApiTags('users')
//@UseGuards(JWTAuthGuard)
@ApiExtraModels(ReS)
@ApiResponse({ status: 403, description: 'Forbidden.' })
@SerializeOptions({
  groups: extendedUserGroupsForSerializing,
})
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {
  }

  @Get('/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({
    summary: 'Get specified user',
    description: 'Fetches data of id',
  })
  async get(
    @Param('id') id: string,
    @EntityBeingQueried() user: UserEntity,
  ): Promise<ReS<UserEntity>> {
    return ReS.FromData(
      await this.usersService.get(+id, ['roles', 'roles.permissions']),
    );
  }

  @Get('/')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({
    summary: 'Get all users',
    description: 'Fetches all data',
  })
  async getAll(): Promise<ReS<UserEntity[]>> {
    return ReS.FromData(
      await this.usersService.getAll(['roles', 'roles.permissions']),
    );
  }

  @Put('/:id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({
    summary: 'Update specified user',
    description: 'Fetches new data and updates values',
  })
  async update(
    @Param('id') id: string,
    @EntityBeingQueried() user: UserEntity,
    @Body()
    inputs: UpdateUserDto,
  ): Promise<ReS<UserEntity>> {
    const userToUpdate = await this.usersService.get(+id);
    const userPostUpdate = await this.usersService.update(userToUpdate, inputs);

    const logActionDataJson: any = {
      preEvent: userToUpdate,
      postEvent: userPostUpdate,
    };
   
    return ReS.FromData(userPostUpdate);
  }

  

  @Delete('/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({
    summary: 'Delete specified user',
    description: 'ATTENTION only for sa and admin user',
  })
  async delete(@Param('id') id: string): Promise<ReS<null>> {
    const success = await this.usersService.delete(+id, true);
    const logActionDataJson: any = {
      success: success,
    };
    return ReS.FromData(null);
  }
}
