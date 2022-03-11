import needle from 'needle';

const escape = encodeURIComponent;

type RequestData = {
  [ key: string ] : string | number | boolean | undefined | RequestData | TorrentFile[];
}

type RequestOptions = {
  [ key : string ] : string | number | boolean | undefined;
}

export type TorrentFile = {
  filename?:    string;
  name?:        string;
  buffer:       Buffer | string;
  content_type: string;
}

export type TorrentAddParameters = {
  urls:               string[] | string;
  torrents:           TorrentFile[] | TorrentFile;
  savepath:           string;
  cookie:             string;
  category:           string;
  tags:               string[] | string;
  skip_checking:      boolean;
  paused:             boolean;
  root_folder:        string;
  rename:             string;
  upLimit:            number;
  dlLimit:            number;
  ratioLimit:         number;
  seedingTimeLimit:   number;
  autoTMM:            number;
  sequentialDownload: boolean;
  firstLastPiecePrio: boolean;
};

export type TorrentInfoParameters = {
  filter:   'all' | 'downloading' | 'seeding' | 'completed' | 'paused' |
            'active' | 'inactive' | 'resumed' | 'stalled' |
            'stalled_uploading' | 'stalled_downloading' | 'errored';
  category: string;
  tag:      string;
  sort:     string;
  reverse:  boolean;
  limit:    number;
  offset:   number;
  hashes:   string[] | string;
}

export type TorrentSearchStatus = {
  id:     number;
  status: string;
  total:  number;
}

export type TorrentSearchResult = {
  descrLink:  string;
  fileName:   string;
  fileSize:   number;
  fileUrl:    string;
  nbLeechers: number;
  nbSeeders:  number;
  siteUrl:    string;
}

class qBittorrentClientError extends Error {
  public statusCode? : number;
  public url?        : string;
}

function join(s : string[] | string | number[] | number, separator = '|') {
  if (Array.isArray(s)) return s.join(separator);
  return String(s);
}

export class qBittorrentClient {
  // private properties
  #url      : string;
  #username : string;
  #password : string;
  #SID      = '';

  // API method levels
  auth      : qBittorrentAuthClient;
  app       : qBittorrentAppClient;
  log       : qBittorrentLogClient;
  sync      : qBittorrentSyncClient;
  transfer  : qBittorrentTransferClient;
  torrents  : qBittorrentTorrentsClient;
  search    : qBittorrentSearchClient;

  constructor(url : string, username = '', password = '') {
    this.#url      = url.replace(/\/$/, '');
    this.#username = username;
    this.#password = password;
    // instantiate subclients
    this.auth      = new qBittorrentAuthClient(this);
    this.app       = new qBittorrentAppClient(this);
    this.log       = new qBittorrentLogClient(this);
    this.sync      = new qBittorrentSyncClient(this);
    this.transfer  = new qBittorrentTransferClient(this);
    this.torrents  = new qBittorrentTorrentsClient(this);
    this.search    = new qBittorrentSearchClient(this);
  }

  async request(method : string, data : RequestData = {}, options : RequestOptions = {}) {
    // make sure we're logged in
    if (! this.#SID && method !== '/auth/login') {
      await this.auth.login();
      if (! this.#SID) {
        throw Error('unable to get session id');
      }
    }
    const url      = this.#url + '/api/v2/' + method.replace(/^\//, '');
    const response = await needle('post', url, data, Object.assign({}, options, {
      headers : {
        referer : this.#url,
        origin  : this.#url,
      },
      cookies : {
        SID : this.#SID
      }
    }));

    if (response.statusCode !== 200) {
      const error      = new qBittorrentClientError(`${ response.statusCode } ${ response.body}`);
      error.statusCode = response.statusCode;
      error.url        = url;
      throw error;
    }

    if (response.cookies?.SID) {
      this.#SID = response.cookies.SID;
    }

    return response.body;
  }
}

class qBittorrentSubClient {
  protected client;

  constructor(client : qBittorrentClient) {
    this.client = client;
  }
}

class qBittorrentAuthClient extends qBittorrentSubClient {

  login() {
    return this.client.request('/auth/login');
  }

  logout() {
    return this.client.request('/auth/logout');
  }
}

class qBittorrentAppClient extends qBittorrentSubClient {
  version() {
    return this.client.request('/app/version');
  }

  webapiVersion() {
    return this.client.request('/app/webapiVersion');
  }

  buildInfo() {
    return this.client.request('/app/buildInfo');
  }

  shutdown() {
    return this.client.request('/app/shutdown');
  }

  preferences() {
    return this.client.request('/app/preferences');
  }

  setPreferences(prefs : RequestData) {
    return this.client.request('/app/setPreferences', { json : JSON.stringify(prefs) });
  }

  defaultSavePath() {
    return this.client.request('/app/defaultSavePath');
  }
}

class qBittorrentLogClient extends qBittorrentSubClient {
  main(params : RequestData) {
    return this.client.request('/log/main', params);
  }

  peers(last_known_id = -1) {
    return this.client.request('/log/peers', { last_known_id });
  }
}

class qBittorrentSyncClient extends qBittorrentSubClient {
  maindata(rid = 0) {
    return this.client.request('/sync/maindata', { rid });
  }

  torrentPeers(hash : string, rid = 0) {
    return this.client.request('/sync/torrentPeers', { hash, rid });
  }
}

class qBittorrentTransferClient extends qBittorrentSubClient {
  info() {
    return this.client.request('/transfer/info');
  }

  speedLimitsMode() {
    return this.client.request('/transfer/speedLimitsMode');
  }

  toggleSpeedLimitsMode() {
    return this.client.request('/transfer/toggleSpeedLimitsMode');
  }

  downloadLimit() {
    return this.client.request('/transfer/downloadLimit');
  }

  setDownloadLimit(limit : number) {
    return this.client.request('/transfer/setDownloadLimit', { limit });
  }

  uploadLimit() {
    return this.client.request('/transfer/uploadLimit');
  }

  setUploadLimit(limit : number) {
    return this.client.request('/transfer/setUploadLimit', { limit });
  }

  banPeers(peers : string[] | string) {
    return this.client.request('/transfer/banPeers', { peers : join(peers) });
  }
}

class qBittorrentTorrentsClient extends qBittorrentSubClient {
  info(params : Partial<TorrentInfoParameters> = {}) {
    const data = <RequestData>{};
    for (const [ key, value ] of Object.entries(params)) {
      switch (key) {
        case 'category':
        case 'tag':
          data[key] = escape(String(value));
          break;
        case 'hashes':
          data[key] = Array.isArray(value) ? join(value) : value;
          break;
      }
    }
    return this.client.request('/torrents/info', data);
  }

  properties(hash : string) {
    return this.client.request('/torrents/properties', { hash });
  }

  trackers(hash : string) {
    return this.client.request('/torrents/trackers', { hash });
  }

  webseeds(hash : string) {
    return this.client.request('/torrents/webseeds', { hash });
  }

  files(hash : string, indexes? : string[] | string | number) {
    return this.client.request('/torrents/files', { hash, ...(indexes !== undefined) && { indexes : join(indexes) }});
  }

  pieceStates(hash : string) {
    return this.client.request('/torrents/pieceStates', { hash });
  }

  pieceHashes(hash : string) {
    return this.client.request('/torrents/pieceHashes', { hash });
  }

  pause(hashes : string[] | string) {
    return this.client.request('/torrents/pause', { hashes : join(hashes) });
  }

  resume(hashes : string[] | string) {
    return this.client.request('/torrents/resume', { hashes : join(hashes) });
  }

  delete(hashes : string[] | string, deleteFiles = false) {
    return this.client.request('/torrents/delete', { hashes : join(hashes), deleteFiles });
  }

  recheck(hashes : string[] | string) {
    return this.client.request('/torrents/recheck', { hashes : join(hashes) });
  }

  reannounce(hashes : string[] | string) {
    return this.client.request('/torrents/reannounce', { hashes : join(hashes) });
  }

  editTracker(hash : string, origUrl : string, newUrl : string) {
    return this.client.request('/torrents/editTracker', { hash, origUrl, newUrl });
  }

  removeTracker(hash : string, urls : string[] | string) {
    return this.client.request('/torrents/removeTracker', { hash, urls : join(urls) });
  }

  addPeers(hashes : string[] | string, peers : string[] | string) {
    return this.client.request('/torrents/addPeers', { hashes : join(hashes), peers : join(peers) });
  }

  increasePrio(hashes : string[] | string) {
    return this.client.request('/torrents/increasePrio', { hashes : join(hashes) });
  }

  decreasePrio(hashes : string[] | string) {
    return this.client.request('/torrents/decreasePrio', { hashes : join(hashes) });
  }

  topPrio(hashes : string[] | string) {
    return this.client.request('/torrents/topPrio', { hashes : join(hashes) });
  }

  bottomPrio(hashes : string[] | string) {
    return this.client.request('/torrents/bottomPrio', { hashes : join(hashes) });
  }

  filePrio(hash : string, id : string[] | string | number[] | number, priority : number) {
    return this.client.request('/torrents/filePrio', { hash, id : join(id), priority });
  }

  downloadLimit(hashes : string[] | string) {
    return this.client.request('/torrents/downloadLimit', { hashes : join(hashes) });
  }

  setDownloadLimit(hashes : string[] | string, limit : number) {
    return this.client.request('/torrents/setDownloadLimit', { hashes : join(hashes), limit });
  }

  setShareLimits(hashes : string[] | string, ratioLimit = -1, seedingTimeLimit = -1) {
    return this.client.request('/torrents/setShareLimits', { hashes : join(hashes), ratioLimit, seedingTimeLimit });
  }

  uploadLimit(hashes : string[] | string) {
    return this.client.request('/torrents/uploadLimit', { hashes : join(hashes) });
  }

  setUploadLimit(hashes : string[] | string, limit : number) {
    return this.client.request('/torrents/setUploadLimit', { hashes : join(hashes), limit });
  }

  setLocation(hashes : string[] | string, location : string) {
    return this.client.request('/torrents/setLocation', { hashes : join(hashes), location });
  }

  rename(hash : string, name : string) {
    return this.client.request('/torrents/rename', { hash, name });
  }

  setCategory(hashes : string[] | string, category : string) {
    return this.client.request('/torrents/setCategory', { hashes : join(hashes), category });
  }

  categories() {
    return this.client.request('/torrents/categories');
  }

  createCategory(category : string, savePath : string) {
    return this.client.request('/torrents/createCategory', { category, savePath });
  }

  editCategory(category : string, savePath : string) {
    return this.client.request('/torrents/editCategory', { category, savePath });
  }

  removeCategories(categories : string[] | string) {
    return this.client.request('/torrents/removeCategories', { categories : join(categories, '%0A') });
  }

  addTags(hashes : string[] | string, tags : string[] | string) {
    return this.client.request('/torrents/addTags', { hashes : join(hashes), tags : join(tags, ',') });
  }

  removeTags(hashes : string[] | string, tags : string[] | string) {
    return this.client.request('/torrents/removeTags', { hashes : join(hashes), tags : join(tags, ',') });
  }

  tags() {
    return this.client.request('/torrents/tags');
  }

  createTags(tags : string[] | string) {
    return this.client.request('/torrents/createTags', { tags : join(tags, ',') });
  }

  deleteTags(tags : string[] | string) {
    return this.client.request('/torrents/deleteTags', { tags : join(tags, ',') });
  }

  setAutoManagement(hashes : string[] | string, enable = false) {
    return this.client.request('/torrents/setAutoManagement', { hashes : join(hashes), enable });
  }

  toggleSequentialDownload(hashes : string[]) {
    return this.client.request('/torrents/toggleSequentialDownload', { hashes : join(hashes) });
  }

  toggleFirstLastPiecePrio(hashes : string[]) {
    return this.client.request('/torrents/toggleFirstLastPiecePrio', { hashes : join(hashes) });
  }

  setForceStart(hashes : string[] | string, value = false) {
    return this.client.request('/torrents/setForceStart', { hashes : join(hashes), value });
  }

  setSuperSeeding(hashes : string[] | string, value = false) {
    return this.client.request('/torrents/setSuperSeeding', { hashes : join(hashes), value });
  }

  renameFile(hash : string, oldPath : string, newPath : string) {
    return this.client.request('/torrents/renameFile', { hash, oldPath, newPath });
  }

  renameFolder(hash : string, oldPath : string, newPath : string) {
    return this.client.request('/torrents/renameFolder', { hash, oldPath, newPath });
  }

  add(torrent : TorrentAddParameters | string[] | string) {
    const data = <RequestData>{};

    if (typeof torrent === 'string' || Array.isArray(torrent)) {
      data.urls = join(torrent, '\n');
    } else {
      if (torrent?.urls) {
        data.urls = join(torrent.urls, '\n');
      }
      if (torrent?.torrents) {
        const torrents = Array.isArray(torrent.torrents) ? torrent.torrents : [ torrent.torrents ];
        data.torrents = torrents.map(torrent => {
          torrent.content_type = 'application/x-bittorrent';
          return torrent;
        });
      }
      if (torrent?.tags) {
        data.tags = join(torrent.tags, ',');
      }
      for (const key of [ 'savepath', 'cookie', 'category', 'skip_checking', 'paused', 'root_folder', 'rename', 'upLimit', 'dlLimit', 'ratioLimit', 'seedingTimeLimit', 'autoTMM', 'sequentialDownload', 'firstLastPiecePrio' ]) {
        if (key in torrent) {
          //@ts-ignore 😑
          data[key] = torrent[key]
        }
      }
      // XXX: for some reason, qBittorrent doesn't accept the last part of
      // a multipart message. We'll add a dummy part so the rest will be
      // accepted. Not sure who's at fault here... 🤔
      data.dummy = 'true';
    }

    return this.client.request('/torrents/add', data, { multipart : true });
  }

  // addTrackers: TODO
  // https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#add-trackers-to-torrent
}

class qBittorrentSearchClient extends qBittorrentSubClient {
  async start( pattern : string, plugins : string[] | string = 'all', category : string[] | string = 'all' ) : Promise<number> {
    const { id } = await this.client.request('/search/start', { pattern, plugins : join(plugins), category : join(category) });
    return id;
  }

  stop( id : number ) {
    return this.client.request('/search/stop', { id });
  }

  async status( id? : number ) : Promise<TorrentSearchStatus[] | TorrentSearchStatus> {
    const res = await this.client.request('/search/status', { id : typeof id === 'number' ? id : undefined });
    if (typeof id === 'number') {
      return <TorrentSearchStatus>res[0];
    }
    return <TorrentSearchStatus[]>res;
  }

  async results( id : number, limit = 0, offset = 0 ) : Promise<TorrentSearchResult[]> {
    return (await this.client.request('/search/results', { id, limit, offset })).results;
  }

  delete( id : number ) {
    return this.client.request('/search/delete', { id });
  }

  plugins() {
    return this.client.request('/search/plugins');
  }

  installPlugin(sources : string[] | string) {
    return this.client.request('/search/installPlugin', { sources : join(sources) });
  }

  uninstallPlugin(names : string[] | string) {
    return this.client.request('/search/uninstallPlugin', { names : join(names) });
  }

  enablePlugin(names : string[] | string, enable : boolean) {
    return this.client.request('/search/enablePlugin', { names : join(names), enable });
  }

  updatePlugins() {
    return this.client.request('/search/updatePlugins');
  }
}
