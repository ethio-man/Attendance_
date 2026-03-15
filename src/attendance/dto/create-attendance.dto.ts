import {
  IsBoolean,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

class StudentAttendance {
  @IsString()
  student_id: string;

  @IsBoolean()
  is_present: boolean;
}

export class CreateAttendanceDto {
  @IsPositive()
  date_id: number;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => StudentAttendance)
  students: StudentAttendance[];

  @IsOptional()
  @IsPositive()
  recorded_by_user_id: number;
}

// export class CreateAttendanceDto {
//   @IsBoolean()
//   is_present: boolean;
//   @IsString()
//   student_id: string;
//   @IsPositive()
//   date_id: number;
//   @IsOptional()
//   @IsPositive()
//   recorded_by_user_id: number;
// }
