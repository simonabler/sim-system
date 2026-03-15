import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class UpdateInventoryDto  {
    @ApiProperty({
      example: '5',
      description: 'New Inventory Stock',
    })
    @IsNotEmpty()
    @IsNumber()
    newStock: number;
}  