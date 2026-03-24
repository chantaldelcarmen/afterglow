import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
 
interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}
 
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
 
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
 
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';
 
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
 
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as Record<string, unknown>;
        message =
          typeof res.message === 'string'
            ? res.message
            : Array.isArray(res.message)
              ? (res.message as string[]).join(', ')
              : message;
      }
 
      error = exception.name.replace('Exception', '');
    }
 
    // Only log stack traces outside of production
    if (process.env.NODE_ENV !== 'production') {
      this.logger.error(
        `${request.method} ${request.url} → ${statusCode}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.error(`${request.method} ${request.url} → ${statusCode}`);
    }
 
    const errorResponse: ErrorResponse = {
      statusCode,
      message,
      error,
    };
 
    response.status(statusCode).json(errorResponse);
  }
}