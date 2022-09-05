/// <reference types="node" />
declare type RequestData = {
    [key: string]: string | number | boolean | undefined | RequestData | TorrentFile[];
};
declare type RequestOptions = {
    [key: string]: string | number | boolean | undefined;
};
export declare type TorrentFile = {
    filename?: string;
    name?: string;
    buffer: Buffer | string;
    content_type: string;
};
export declare type TorrentAddParameters = {
    urls: string[] | string;
    torrents: TorrentFile[] | TorrentFile;
    savepath: string;
    cookie: string;
    category: string;
    tags: string[] | string;
    skip_checking: boolean;
    paused: boolean;
    root_folder: string;
    rename: string;
    upLimit: number;
    dlLimit: number;
    ratioLimit: number;
    seedingTimeLimit: number;
    autoTMM: number;
    sequentialDownload: boolean;
    firstLastPiecePrio: boolean;
};
export declare type TorrentInfoParameters = {
    filter: 'all' | 'downloading' | 'seeding' | 'completed' | 'paused' | 'active' | 'inactive' | 'resumed' | 'stalled' | 'stalled_uploading' | 'stalled_downloading' | 'errored';
    category: string;
    tag: string;
    sort: string;
    reverse: boolean;
    limit: number;
    offset: number;
    hashes: string[] | string;
};
export declare type TorrentSearchStatus = {
    id: number;
    status: string;
    total: number;
};
export declare type TorrentSearchResult = {
    descrLink: string;
    fileName: string;
    fileSize: number;
    fileUrl: string;
    nbLeechers: number;
    nbSeeders: number;
    siteUrl: string;
};
export declare class qBittorrentClient {
    #private;
    auth: qBittorrentAuthClient;
    app: qBittorrentAppClient;
    log: qBittorrentLogClient;
    sync: qBittorrentSyncClient;
    transfer: qBittorrentTransferClient;
    torrents: qBittorrentTorrentsClient;
    search: qBittorrentSearchClient;
    constructor(url: string, username?: string, password?: string);
    request(method: string, data?: RequestData, options?: RequestOptions): Promise<any>;
}
declare class qBittorrentSubClient {
    protected client: qBittorrentClient;
    constructor(client: qBittorrentClient);
}
declare class qBittorrentAuthClient extends qBittorrentSubClient {
    login(username: string, password: string): Promise<any>;
    logout(): Promise<any>;
}
declare class qBittorrentAppClient extends qBittorrentSubClient {
    version(): Promise<any>;
    webapiVersion(): Promise<any>;
    buildInfo(): Promise<any>;
    shutdown(): Promise<any>;
    preferences(): Promise<any>;
    setPreferences(prefs: RequestData): Promise<any>;
    defaultSavePath(): Promise<any>;
}
declare class qBittorrentLogClient extends qBittorrentSubClient {
    main(params: RequestData): Promise<any>;
    peers(last_known_id?: number): Promise<any>;
}
declare class qBittorrentSyncClient extends qBittorrentSubClient {
    maindata(rid?: number): Promise<any>;
    torrentPeers(hash: string, rid?: number): Promise<any>;
}
declare class qBittorrentTransferClient extends qBittorrentSubClient {
    info(): Promise<any>;
    speedLimitsMode(): Promise<any>;
    toggleSpeedLimitsMode(): Promise<any>;
    downloadLimit(): Promise<any>;
    setDownloadLimit(limit: number): Promise<any>;
    uploadLimit(): Promise<any>;
    setUploadLimit(limit: number): Promise<any>;
    banPeers(peers: string[] | string): Promise<any>;
}
declare class qBittorrentTorrentsClient extends qBittorrentSubClient {
    info(params?: Partial<TorrentInfoParameters>): Promise<any>;
    properties(hash: string): Promise<any>;
    trackers(hash: string): Promise<any>;
    webseeds(hash: string): Promise<any>;
    files(hash: string, indexes?: string[] | string | number): Promise<any>;
    pieceStates(hash: string): Promise<any>;
    pieceHashes(hash: string): Promise<any>;
    pause(hashes: string[] | string): Promise<any>;
    resume(hashes: string[] | string): Promise<any>;
    delete(hashes: string[] | string, deleteFiles?: boolean): Promise<any>;
    recheck(hashes: string[] | string): Promise<any>;
    reannounce(hashes: string[] | string): Promise<any>;
    editTracker(hash: string, origUrl: string, newUrl: string): Promise<any>;
    removeTracker(hash: string, urls: string[] | string): Promise<any>;
    addPeers(hashes: string[] | string, peers: string[] | string): Promise<any>;
    increasePrio(hashes: string[] | string): Promise<any>;
    decreasePrio(hashes: string[] | string): Promise<any>;
    topPrio(hashes: string[] | string): Promise<any>;
    bottomPrio(hashes: string[] | string): Promise<any>;
    filePrio(hash: string, id: string[] | string | number[] | number, priority: number): Promise<any>;
    downloadLimit(hashes: string[] | string): Promise<any>;
    setDownloadLimit(hashes: string[] | string, limit: number): Promise<any>;
    setShareLimits(hashes: string[] | string, ratioLimit?: number, seedingTimeLimit?: number): Promise<any>;
    uploadLimit(hashes: string[] | string): Promise<any>;
    setUploadLimit(hashes: string[] | string, limit: number): Promise<any>;
    setLocation(hashes: string[] | string, location: string): Promise<any>;
    rename(hash: string, name: string): Promise<any>;
    setCategory(hashes: string[] | string, category: string): Promise<any>;
    categories(): Promise<any>;
    createCategory(category: string, savePath: string): Promise<any>;
    editCategory(category: string, savePath: string): Promise<any>;
    removeCategories(categories: string[] | string): Promise<any>;
    addTags(hashes: string[] | string, tags: string[] | string): Promise<any>;
    removeTags(hashes: string[] | string, tags: string[] | string): Promise<any>;
    tags(): Promise<any>;
    createTags(tags: string[] | string): Promise<any>;
    deleteTags(tags: string[] | string): Promise<any>;
    setAutoManagement(hashes: string[] | string, enable?: boolean): Promise<any>;
    toggleSequentialDownload(hashes: string[]): Promise<any>;
    toggleFirstLastPiecePrio(hashes: string[]): Promise<any>;
    setForceStart(hashes: string[] | string, value?: boolean): Promise<any>;
    setSuperSeeding(hashes: string[] | string, value?: boolean): Promise<any>;
    renameFile(hash: string, oldPath: string, newPath: string): Promise<any>;
    renameFolder(hash: string, oldPath: string, newPath: string): Promise<any>;
    add(torrent: TorrentAddParameters | string[] | string): Promise<any>;
}
declare class qBittorrentSearchClient extends qBittorrentSubClient {
    start(pattern: string, plugins?: string[] | string, category?: string[] | string): Promise<number>;
    stop(id: number): Promise<any>;
    status(id?: number): Promise<TorrentSearchStatus[] | TorrentSearchStatus>;
    results(id: number, limit?: number, offset?: number): Promise<TorrentSearchResult[]>;
    delete(id: number): Promise<any>;
    plugins(): Promise<any>;
    installPlugin(sources: string[] | string): Promise<any>;
    uninstallPlugin(names: string[] | string): Promise<any>;
    enablePlugin(names: string[] | string, enable: boolean): Promise<any>;
    updatePlugins(): Promise<any>;
}
export {};
