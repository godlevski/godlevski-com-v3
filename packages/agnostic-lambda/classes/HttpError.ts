export class HttpError extends Error {
  isUserFacing: boolean = true;
  statusCode: number = 500;
  // marks error as broadcasted to avoid poping it twice
  broadcasted?: boolean;

  constructor(message: string, settings?: Partial<HttpError>) {
    super(message);
    Object.entries(settings || {}).forEach(([key, value]) => {
      (this as any)[key] = value;
    });
  }
}
