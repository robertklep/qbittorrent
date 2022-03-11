# qBittorrent v2 API client

Implements almost all of the methods of the current (v2.8.3) qBittorrent [WebUI API](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)).

Disclaimer: not all of the API methods have been tested.

## Installation

```
npm install @robertklep/qbittorrent
```

## Examples

#### Instantiating

TypeScript:
```typescript
import { qBittorrentClient } from '@robertklep/qbittorrent';

const client = new qBittorrentClient('http://127.0.0.1:8080', 'username', 'password');
```

JavaScript:
```javascript
const { qBittorrentClient } = require('@robertklep/qbittorrent');

const client = new qBittorrentClient('http://127.0.0.1:8080', 'username', 'password');
```

There is no need to explicitly call `client.auth.login()`, the client will log in automatically on the first API call.

#### Getting the server version

```typescript
const info = await client.app.version();
```

#### Adding torrents

Add a single torrent by URL:
```typescript
const res = await client.torrents.add('https://distrowatch.com/dwres/torrents/xubuntu-20.04.4-desktop-amd64.iso.torrent');

// also works for Magnet URI's
const res = await client.torrents.add('magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fbig-buck-bunny.torrent')
```

Add multiple torrents by URL:
```typescript
const res = await client.torrents.add([
  'https://distrowatch.com/dwres/torrents/xubuntu-20.04.4-desktop-amd64.iso.torrent',
  'https://distrowatch.com/dwres/torrents/ubuntu-budgie-20.04.4-desktop-amd64.iso.torrent'
]);
```

Add by file contents:
```typescript
import { qBittorrentClient, TorrentAddParameters } from '@robertklep/qbittorrent';
import { readFile }                   from 'fs/promises';

const res = await client.torrents.add(<TorrentAddParameters>{
  torrents: { // TorrentFile[] | TorrentFile
    buffer : await readFile('xubuntu-20.04.4-desktop-amd64.iso.torrent')
  },
  // start this torrent in a paused state (see Torrent type for options)
  paused: true
});
```

#### Searching torrents

(your qBittorrent installation needs to support search for this to work)

```typescript
const wait = (ms : number) => new Promise(r => setTimeout(r, ms));

// start a search
const id = await client.search.start('linux');

// run the search for 20 seconds, check status every second
for (let i = 0; i < 20; i++) {
  const { status, total } = await client.search.status(id) as TorrentSearchStatus;
  console.log(`Status: ${ status }, total number of results so far: ${ total }`);
  await wait(1000);
}

// retrieve the results
console.log( await client.search.results(id) );

// delete the search
await client.search.delete(id);
```

## Documentation

The structure of this module follows the structure and naming of the [qBittorrent WebUI API](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)) methods.

For example, the [Authentication `login` method](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#authentication) is accessible as `client.auth.login()`

#### Types
```
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
    login(): Promise<any>;
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
    filePrio(hash: string, id: string[] | string, priority: number): Promise<any>;
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
```

#### Methods

Most methods that accept parameters that are either a single ór multiple values, like `hashes`, will accept both strings and arrays of strings. When passing as a string, make sure you use the correct separator when passing multiple values (usually `|`), or just pass the values as an array and the client will take care of concatenating the values properly.

All methods are async (return a Promise) and will thrown an error when the backend returns an non-200 status code. Please refer to the WebUI API documentation for full explanation of every method and their parameters.

List of implemented methods:
```
client.auth.login()
client.auth.logout()

client.app.version()
client.app.webapiVersion()
client.app.buildInfo()
client.app.shutdown()
client.app.preferences()
client.app.setPreferences(prefs : RequestData)
client.app.defaultSavePath()

client.log.main(params : RequestData)
client.log.peers(last_known_id = -1)

client.sync.maindata(rid = 0)
client.sync.torrentPeers(hash : string, rid = 0)

client.transfer.info()
client.transfer.speedLimitsMode()
client.transfer.toggleSpeedLimitsMode()
client.transfer.downloadLimit()
client.transfer.setDownloadLimit(limit : number)
client.transfer.uploadLimit()
client.transfer.setUploadLimit(limit : number)
client.transfer.banPeers(peers : string[] | string)

info(params : Partial<TorrentInfoParameters> = {}) {
client.torrents.properties(hash : string)
client.torrents.trackers(hash : string)
client.torrents.webseeds(hash : string)
client.torrents.files(hash : string, indexes : string[] | string = '')
client.torrents.pieceStates(hash : string)
client.torrents.pieceHashes(hash : string)
client.torrents.pause(hashes : string[] | string)
client.torrents.resume(hashes : string[] | string)
client.torrents.delete(hashes : string[] | string, deleteFiles = false)
client.torrents.recheck(hashes : string[] | string)
client.torrents.reannounce(hashes : string[] | string)
client.torrents.editTracker(hash : string, origUrl : string, newUrl : string)
client.torrents.removeTracker(hash : string, urls : string[] | string)
client.torrents.addPeers(hashes : string[] | string, peers : string[] | string)
client.torrents.increasePrio(hashes : string[] | string)
client.torrents.decreasePrio(hashes : string[] | string)
client.torrents.topPrio(hashes : string[] | string)
client.torrents.bottomPrio(hashes : string[] | string)
client.torrents.filePrio(hash : string, id : string[] | string, priority : number)
client.torrents.downloadLimit(hashes : string[] | string)
client.torrents.setDownloadLimit(hashes : string[] | string, limit : number)
client.torrents.setShareLimits(hashes : string[] | string, ratioLimit = -1, seedingTimeLimit = -1)
client.torrents.uploadLimit(hashes : string[] | string)
client.torrents.setUploadLimit(hashes : string[] | string, limit : number)
client.torrents.setLocation(hashes : string[] | string, location : string)
client.torrents.rename(hash : string, name : string)
client.torrents.setCategory(hashes : string[] | string, category : string)
client.torrents.categories()
client.torrents.createCategory(category : string, savePath : string)
client.torrents.editCategory(category : string, savePath : string)
client.torrents.removeCategories(categories : string[] | string)
client.torrents.addTags(hashes : string[] | string, tags : string[] | string)
client.torrents.removeTags(hashes : string[] | string, tags : string[] | string)
client.torrents.tags()
client.torrents.createTags(tags : string[] | string)
client.torrents.deleteTags(tags : string[] | string)
client.torrents.setAutoManagement(hashes : string[] | string, enable = false)
client.torrents.toggleSequentialDownload(hashes : string[])
client.torrents.toggleFirstLastPiecePrio(hashes : string[])
client.torrents.setForceStart(hashes : string[] | string, value = false)
client.torrents.setSuperSeeding(hashes : string[] | string, value = false)
client.torrents.renameFile(hash : string, oldPath : string, newPath : string)
client.torrents.renameFolder(hash : string, oldPath : string, newPath : string)
client.torrents.add(torrent : Torrent | string[] | string)
// TODO: client.torrents.addTrackers()

client.search.start( pattern : string, plugins : string[] | string = 'all', category : string[] | string = 'all' )
client.search.stop( id : number )
client.search.status( id? : number )
client.search.results( id : number, limit = 0, offset = 0 )
client.search.delete( id : number )
client.search.plugins()
client.search.installPlugin(sources : string[] | string)
client.search.uninstallPlugin(names : string[] | string)
client.search.enablePlugin(names : string[] | string, enable : boolean)
client.search.updatePlugins()
```
