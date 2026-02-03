import { User } from "@/shared/types/user";

// Request DTOs
export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  email: string;
  password: string;
  fullName?: string;
}

// Response DTOs
export interface UserDto {
  id: string;
  email: string;
  fullName: string | null;
  credits: number;
  createdAt: number;
}

export interface AuthResponseDto {
  user: UserDto;
  expiresAt: number;
}

export interface MeResponseDto {
  user: UserDto | null;
}

export interface ErrorResponseDto {
  error: string;
  code?: string;
}

// Mappers
export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName || null,
    credits: user.credits ?? 0,
    createdAt: user.createdAt,
  };
}

export function toAuthResponseDto(
  user: User,
  expiresAt: number
): AuthResponseDto {
  return {
    user: toUserDto(user),
    expiresAt,
  };
}
