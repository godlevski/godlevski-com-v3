export type AgnosticOutput = {
  statusCode: number,
  headers?: Record<string, string>,
  isBase64Encoded?: boolean,
  body?: string,
  cookies?: Array<string>,
}

export type AgnosticOutputJson<T extends Record<string, any> = any> = Omit<AgnosticOutput, 'body'> & {
  json: T
}
