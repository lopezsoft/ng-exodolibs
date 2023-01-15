
export interface JsonResponse {
  success: boolean;
  message: string;
  dataRecords: DataRecords;
}


export interface ProxyApi {
    create?: string;
    read?: string;
    update?: string;
    destroy?: string;
}

export interface Proxy {
    api: ProxyApi;
}

export interface LinksContract {
    active  : boolean;
    label   : string;
    url     : string;
}

export interface DataRecords {
    first_page_url: string;
    from: number;
    current_page: number;
    last_page: number;
    last_page_url: string;
    links: LinksContract[];
    next_page_url: string;
    path: string;
    per_page: number;
    prev_page_url: string;
    to: number;
    total: number;
    data: Array<any>;
}

export interface PaginationOptions {
    from: number;
    currentPage: number;
    lastPage: number;
    perPage?: number;
    to: number;
    total: number;
}
export interface DataSourceContract {
    rows: any[];
    dataRecords?: DataRecords;
}

