export interface BaseSerializer {
    fromJson(json: any): any;
    toJson(resource: any): any;
}
