import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark an endpoint as public (no authentication required)
 * @example
 * @Public()
 * @Post('/login')
 * login(@Body() loginDto: LoginDto) { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
