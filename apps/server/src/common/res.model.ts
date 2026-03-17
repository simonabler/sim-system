import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ReturnHelper {
  @ApiProperty({ example: true, description: 'success indicator' })
  @Expose()
  public success = true;
}

export class ReS<T> extends ReturnHelper {
  static FromData<T>(arg0: T): ReS<T> {
    const ret = new ReS<T>();
    ret.success = true;
    ret.data = arg0;
    return ret;
  }

  @Expose()
  public data: T;
}

export class ReE extends ReturnHelper {
  static FromData(statusCode: number, error: string, message: string[]): ReE {
    const ret = new ReE();
    ret.success = false;
    ret.message = message;
    ret.error = error;
    ret.statusCode = statusCode;
    return ret;
  }
  @ApiProperty({ description: 'statusCode' })
  @Expose()
  public statusCode: number;
  @ApiProperty({ description: 'detail message' })
  @Expose()
  public message: string[];
  @ApiProperty({ description: 'error description' })
  @Expose()
  public error: string;
}
