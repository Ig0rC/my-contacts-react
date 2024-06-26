import APIError from '../../errors/APIError';
import delay from '../../utils/delay';

interface IHeaders {
  Authorization?: string;
}

interface RequestMask<O = null> {
  body?: O;
  method: string;
  headers?: IHeaders;
}

interface RequestMethod {
  body?: unknown;
  headers?: IHeaders;
}

class HttpClient {
  private readonly baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  public async get<T>(path: string, options?: RequestMethod): Promise<T> {
    return this.makeRequest(path, {
      method: 'GET',
      headers: options?.headers,
    });
  }

  public post<R>(path: string, options: RequestMethod): Promise<R> {
    return this.makeRequest(path, {
      body: options.body,
      method: 'POST',
      headers: options?.headers,
    });
  }

  public put<R>(path: string, options: RequestMethod): Promise<R> {
    return this.makeRequest(path, {
      body: options.body,
      method: 'PUT',
      headers: options?.headers,
    });
  }

  public delete<R>(path: string, options?: RequestMethod): Promise<R> {
    return this.makeRequest(path, {
      method: 'DELETE',
      headers: options?.headers,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async makeRequest<D>(path: string, options: RequestMask<D>): Promise<any> {
    await delay(500);
    const headers = new Headers();

    if (options.body) {
      headers.append('Content-Type', 'application/json');
    }

    if (options.headers !== undefined) {
      Object.entries(options.headers).forEach(([nameHeader, valueHeader]) => {
        headers.append(nameHeader, valueHeader);
      });
    }

    const response = await fetch(`${this.baseURL}${path}`, {
      method: options.method,
      body: JSON.stringify(options.body),
      headers,
    });

    const contentType = response.headers.get('Content-Type');

    let responseBody = null;

    if (contentType?.includes('application/json')) {
      responseBody = await response.json();
    }

    if (response.ok) {
      return responseBody;
    }

    throw new APIError(response, responseBody);
  }
}

export default HttpClient;
