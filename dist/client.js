"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _qBittorrentClient_url, _qBittorrentClient_username, _qBittorrentClient_password, _qBittorrentClient_SID;
Object.defineProperty(exports, "__esModule", { value: true });
exports.qBittorrentClient = void 0;
const needle_1 = __importDefault(require("needle"));
const escape = encodeURIComponent;
class qBittorrentClientError extends Error {
}
function join(s, separator = '|') {
    if (Array.isArray(s))
        return s.join(separator);
    return String(s);
}
class qBittorrentClient {
    constructor(url, username = '', password = '') {
        // private properties
        _qBittorrentClient_url.set(this, void 0);
        _qBittorrentClient_username.set(this, void 0);
        _qBittorrentClient_password.set(this, void 0);
        _qBittorrentClient_SID.set(this, '');
        __classPrivateFieldSet(this, _qBittorrentClient_url, url.replace(/\/$/, ''), "f");
        __classPrivateFieldSet(this, _qBittorrentClient_username, username, "f");
        __classPrivateFieldSet(this, _qBittorrentClient_password, password, "f");
        // instantiate subclients
        this.auth = new qBittorrentAuthClient(this);
        this.app = new qBittorrentAppClient(this);
        this.log = new qBittorrentLogClient(this);
        this.sync = new qBittorrentSyncClient(this);
        this.transfer = new qBittorrentTransferClient(this);
        this.torrents = new qBittorrentTorrentsClient(this);
        this.search = new qBittorrentSearchClient(this);
    }
    request(method, data = {}, options = {}) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // make sure we're logged in
            if (!__classPrivateFieldGet(this, _qBittorrentClient_SID, "f") && method !== '/auth/login') {
                yield this.auth.login();
                if (!__classPrivateFieldGet(this, _qBittorrentClient_SID, "f")) {
                    throw Error('unable to get session id');
                }
            }
            const url = __classPrivateFieldGet(this, _qBittorrentClient_url, "f") + '/api/v2/' + method.replace(/^\//, '');
            const response = yield (0, needle_1.default)('post', url, data, Object.assign({}, options, {
                headers: {
                    referer: __classPrivateFieldGet(this, _qBittorrentClient_url, "f"),
                    origin: __classPrivateFieldGet(this, _qBittorrentClient_url, "f"),
                },
                cookies: {
                    SID: __classPrivateFieldGet(this, _qBittorrentClient_SID, "f")
                }
            }));
            if (response.statusCode !== 200) {
                const error = new qBittorrentClientError(`${response.statusCode} ${response.body}`);
                error.statusCode = response.statusCode;
                error.url = url;
                throw error;
            }
            if ((_a = response.cookies) === null || _a === void 0 ? void 0 : _a.SID) {
                __classPrivateFieldSet(this, _qBittorrentClient_SID, response.cookies.SID, "f");
            }
            return response.body;
        });
    }
}
exports.qBittorrentClient = qBittorrentClient;
_qBittorrentClient_url = new WeakMap(), _qBittorrentClient_username = new WeakMap(), _qBittorrentClient_password = new WeakMap(), _qBittorrentClient_SID = new WeakMap();
class qBittorrentSubClient {
    constructor(client) {
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
    setPreferences(prefs) {
        return this.client.request('/app/setPreferences', { json: JSON.stringify(prefs) });
    }
    defaultSavePath() {
        return this.client.request('/app/defaultSavePath');
    }
}
class qBittorrentLogClient extends qBittorrentSubClient {
    main(params) {
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
    torrentPeers(hash, rid = 0) {
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
    setDownloadLimit(limit) {
        return this.client.request('/transfer/setDownloadLimit', { limit });
    }
    uploadLimit() {
        return this.client.request('/transfer/uploadLimit');
    }
    setUploadLimit(limit) {
        return this.client.request('/transfer/setUploadLimit', { limit });
    }
    banPeers(peers) {
        return this.client.request('/transfer/banPeers', { peers: join(peers) });
    }
}
class qBittorrentTorrentsClient extends qBittorrentSubClient {
    info(params = {}) {
        const data = {};
        for (const [key, value] of Object.entries(params)) {
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
    properties(hash) {
        return this.client.request('/torrents/properties', { hash });
    }
    trackers(hash) {
        return this.client.request('/torrents/trackers', { hash });
    }
    webseeds(hash) {
        return this.client.request('/torrents/webseeds', { hash });
    }
    files(hash, indexes) {
        return this.client.request('/torrents/files', Object.assign({ hash }, (indexes !== undefined) && { indexes: join(indexes) }));
    }
    pieceStates(hash) {
        return this.client.request('/torrents/pieceStates', { hash });
    }
    pieceHashes(hash) {
        return this.client.request('/torrents/pieceHashes', { hash });
    }
    pause(hashes) {
        return this.client.request('/torrents/pause', { hashes: join(hashes) });
    }
    resume(hashes) {
        return this.client.request('/torrents/resume', { hashes: join(hashes) });
    }
    delete(hashes, deleteFiles = false) {
        return this.client.request('/torrents/delete', { hashes: join(hashes), deleteFiles });
    }
    recheck(hashes) {
        return this.client.request('/torrents/recheck', { hashes: join(hashes) });
    }
    reannounce(hashes) {
        return this.client.request('/torrents/reannounce', { hashes: join(hashes) });
    }
    editTracker(hash, origUrl, newUrl) {
        return this.client.request('/torrents/editTracker', { hash, origUrl, newUrl });
    }
    removeTracker(hash, urls) {
        return this.client.request('/torrents/removeTracker', { hash, urls: join(urls) });
    }
    addPeers(hashes, peers) {
        return this.client.request('/torrents/addPeers', { hashes: join(hashes), peers: join(peers) });
    }
    increasePrio(hashes) {
        return this.client.request('/torrents/increasePrio', { hashes: join(hashes) });
    }
    decreasePrio(hashes) {
        return this.client.request('/torrents/decreasePrio', { hashes: join(hashes) });
    }
    topPrio(hashes) {
        return this.client.request('/torrents/topPrio', { hashes: join(hashes) });
    }
    bottomPrio(hashes) {
        return this.client.request('/torrents/bottomPrio', { hashes: join(hashes) });
    }
    filePrio(hash, id, priority) {
        return this.client.request('/torrents/filePrio', { hash, id: join(id), priority });
    }
    downloadLimit(hashes) {
        return this.client.request('/torrents/downloadLimit', { hashes: join(hashes) });
    }
    setDownloadLimit(hashes, limit) {
        return this.client.request('/torrents/setDownloadLimit', { hashes: join(hashes), limit });
    }
    setShareLimits(hashes, ratioLimit = -1, seedingTimeLimit = -1) {
        return this.client.request('/torrents/setShareLimits', { hashes: join(hashes), ratioLimit, seedingTimeLimit });
    }
    uploadLimit(hashes) {
        return this.client.request('/torrents/uploadLimit', { hashes: join(hashes) });
    }
    setUploadLimit(hashes, limit) {
        return this.client.request('/torrents/setUploadLimit', { hashes: join(hashes), limit });
    }
    setLocation(hashes, location) {
        return this.client.request('/torrents/setLocation', { hashes: join(hashes), location });
    }
    rename(hash, name) {
        return this.client.request('/torrents/rename', { hash, name });
    }
    setCategory(hashes, category) {
        return this.client.request('/torrents/setCategory', { hashes: join(hashes), category });
    }
    categories() {
        return this.client.request('/torrents/categories');
    }
    createCategory(category, savePath) {
        return this.client.request('/torrents/createCategory', { category, savePath });
    }
    editCategory(category, savePath) {
        return this.client.request('/torrents/editCategory', { category, savePath });
    }
    removeCategories(categories) {
        return this.client.request('/torrents/removeCategories', { categories: join(categories, '%0A') });
    }
    addTags(hashes, tags) {
        return this.client.request('/torrents/addTags', { hashes: join(hashes), tags: join(tags, ',') });
    }
    removeTags(hashes, tags) {
        return this.client.request('/torrents/removeTags', { hashes: join(hashes), tags: join(tags, ',') });
    }
    tags() {
        return this.client.request('/torrents/tags');
    }
    createTags(tags) {
        return this.client.request('/torrents/createTags', { tags: join(tags, ',') });
    }
    deleteTags(tags) {
        return this.client.request('/torrents/deleteTags', { tags: join(tags, ',') });
    }
    setAutoManagement(hashes, enable = false) {
        return this.client.request('/torrents/setAutoManagement', { hashes: join(hashes), enable });
    }
    toggleSequentialDownload(hashes) {
        return this.client.request('/torrents/toggleSequentialDownload', { hashes: join(hashes) });
    }
    toggleFirstLastPiecePrio(hashes) {
        return this.client.request('/torrents/toggleFirstLastPiecePrio', { hashes: join(hashes) });
    }
    setForceStart(hashes, value = false) {
        return this.client.request('/torrents/setForceStart', { hashes: join(hashes), value });
    }
    setSuperSeeding(hashes, value = false) {
        return this.client.request('/torrents/setSuperSeeding', { hashes: join(hashes), value });
    }
    renameFile(hash, oldPath, newPath) {
        return this.client.request('/torrents/renameFile', { hash, oldPath, newPath });
    }
    renameFolder(hash, oldPath, newPath) {
        return this.client.request('/torrents/renameFolder', { hash, oldPath, newPath });
    }
    add(torrent) {
        const data = {};
        if (typeof torrent === 'string' || Array.isArray(torrent)) {
            data.urls = join(torrent, '\n');
        }
        else {
            if (torrent === null || torrent === void 0 ? void 0 : torrent.urls) {
                data.urls = join(torrent.urls, '\n');
            }
            if (torrent === null || torrent === void 0 ? void 0 : torrent.torrents) {
                const torrents = Array.isArray(torrent.torrents) ? torrent.torrents : [torrent.torrents];
                data.torrents = torrents.map(torrent => {
                    torrent.content_type = 'application/x-bittorrent';
                    return torrent;
                });
            }
            if (torrent === null || torrent === void 0 ? void 0 : torrent.tags) {
                data.tags = join(torrent.tags, ',');
            }
            for (const key of ['savepath', 'cookie', 'category', 'skip_checking', 'paused', 'root_folder', 'rename', 'upLimit', 'dlLimit', 'ratioLimit', 'seedingTimeLimit', 'autoTMM', 'sequentialDownload', 'firstLastPiecePrio']) {
                if (key in torrent) {
                    //@ts-ignore 😑
                    data[key] = torrent[key];
                }
            }
            // XXX: for some reason, qBittorrent doesn't accept the last part of
            // a multipart message. We'll add a dummy part so the rest will be
            // accepted. Not sure who's at fault here... 🤔
            data.dummy = 'true';
        }
        return this.client.request('/torrents/add', data, { multipart: true });
    }
}
class qBittorrentSearchClient extends qBittorrentSubClient {
    start(pattern, plugins = 'all', category = 'all') {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = yield this.client.request('/search/start', { pattern, plugins: join(plugins), category: join(category) });
            return id;
        });
    }
    stop(id) {
        return this.client.request('/search/stop', { id });
    }
    status(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.client.request('/search/status', { id: typeof id === 'number' ? id : undefined });
            if (typeof id === 'number') {
                return res[0];
            }
            return res;
        });
    }
    results(id, limit = 0, offset = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.client.request('/search/results', { id, limit, offset })).results;
        });
    }
    delete(id) {
        return this.client.request('/search/delete', { id });
    }
    plugins() {
        return this.client.request('/search/plugins');
    }
    installPlugin(sources) {
        return this.client.request('/search/installPlugin', { sources: join(sources) });
    }
    uninstallPlugin(names) {
        return this.client.request('/search/uninstallPlugin', { names: join(names) });
    }
    enablePlugin(names, enable) {
        return this.client.request('/search/enablePlugin', { names: join(names), enable });
    }
    updatePlugins() {
        return this.client.request('/search/updatePlugins');
    }
}
