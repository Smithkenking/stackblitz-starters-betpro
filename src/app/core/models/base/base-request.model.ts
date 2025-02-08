export interface BaseRequest<T> {
    body: T;
    queryParameter: any;
    endPoint: string;
    baseUrl: string | null;
}
