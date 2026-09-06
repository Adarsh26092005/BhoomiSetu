import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class OrganizationActionDto {
  @ApiPropertyOptional({ example: 'Verified valid government gazette appointment letter and authorization credentials.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  remarks?: string;

  @ApiPropertyOptional({ example: 'Invalid corporate documentation / missing nodal agency authorization letter.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  rejectionReason?: string;

  @ApiPropertyOptional({ example: 'Administrative audit hold pending compliance review.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  suspensionReason?: string;
}
