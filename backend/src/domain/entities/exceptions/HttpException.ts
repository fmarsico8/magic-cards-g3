export class HttpException extends Error {
    constructor(
      public readonly message: string,
      public readonly status: number = 500
    ) {
      super(message);
      this.name = this.constructor.name;
    }
}

export class BadRequestException extends HttpException {
    constructor(message: string = 'Bad Request') {
        super(message, 400);
    }
}

export class UnauthorizedException extends HttpException {
    constructor(message: string) {
        super(`${message}`, 401);
        this.name = 'UnauthorizedException';
    }
}

export class UserAlreadyExistsError extends HttpException {
    constructor(message: string) {
        super(`${message}`, 409);
        this.name = 'UserAlreadyExistsError';
    }
}

export class ForbiddenException extends HttpException {
    constructor(message: string = 'Forbidden') {
      super(message, 403);
    }
}

export class UserNotFoundError extends HttpException {
    constructor(message: string) {
      super(message, 404);
      this.name = 'UserNotFoundError';
    }
}

export class NotFoundException extends HttpException {
  constructor(message: string = 'Not Found') {
    super(message, 404);
  }
}

export class ConflictException extends HttpException {
  constructor(message: string = 'Conflict') {
    super(message, 409);
  }
}

export class UnprocessableEntityException extends HttpException {
    constructor(message: string = 'Unprocessable Entity') {
      super(message, 422);
    }
}

  