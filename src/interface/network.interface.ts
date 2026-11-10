export interface INetworkCall {
  url: string;
  method: string;
  payload?: { [key: string]: string | number | object } | FormData;
  headers?: any;
}
