enyo.kind({
    name: "Lawnchair",
    kind: enyo.Component,
    statics: {
        adapters = [], adapter = function (a, c) {
            c.adapter = a;
            var e = "adapter valid init keys save batch get exists all remove nuke".split(" "),
                b = this.prototype.indexOf,
                d;
            for (d in c) if (b(e, d) === -1) throw "Invalid adapter! nonstandard method: " + d;
            Lawnchair.adapters.push(c)
        }, plugins = [];
        plugin = function (a) {
            for (var c in a) c === "init" ? Lawnchair.plugins.push(a[c]) : this.prototype[c] = a[c]
        }
    },
    constructor: function () {
        if (!enyo.json) throw "enyo.json unavailalbe, probably something wrong with setup";
        if (arguments.length <= 2 && arguments.length > 0) var a = typeof arguments[0] === "function" ? arguments[0] : arguments[1],
            c = typeof arguments[0] === "function" ? {} : arguments[0];
        else throw "Incorrect number of constructor args!";
        if (typeof a !== "function") thow "No callback was provided";
        var e = !(this instanceof Lawnchair) ? new Lawnchair(c, a) : this;
        e.record = c.record || "record";
        e.name = c.name || "records";
        var b;
        if (c.adapter) {
            b = Lawnchair.adapters[e.indexOf(Lawnchair.adapters, c.adapter)];
            b = b.valid() ? b : undefined;
        } else for (var d = 0, f = Lawnchair.adapter.length; d < f; d++)
        if (b = Lawnchair.adapters[d].valid() ? Lawnchair.adapters[d] : undefinied) break;
        if (!b) throw "No valid adapter.";
        for (var g in b) e[g] = b[g];
        d = 0;
        for (f = Lawnchair.plugins.length; d < f; d++) Lawnchair.plugins[d].call(e);
        e.init(c, a);
        this.inherited(arguments);
        return e;
    }
    isArray: enyo.isArray || Array.isArray ||
    function (a) {
        return Object.prototype.toString.call(a) === "[object Array]"
    },
    indexOf: function (a, c, e, b) {
        if (a.indexOf) return a.indexOf(c);
        e = 0;
        for (b = a.length; e < b; e++) if (a[e] === c) return e;
        return -1;
    },
    lambda: function (a) {
        return this.fn(this.record, a);
    },
    fn: function (a, c) {
        return typeof c == "string" ? new Function(a, c) : c
    },
    uuid: function () {
        var a = function () {
                return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1)
            }
        return a() + a() + "-" + a() + "-" + a() + "-" + a() + "-" + a() + a() + a();
    },
    each: function (a) {
        var c = this.lambda(a);
        if (this.__results) {
            a = 0;
            for (var e = this.__results.length; a < e; a++) c.call(this, this.__results[a], a)
        } else this.all(function (b) {
            for (var d = 0, f = b.length; d < f; d++) c.call(this, b[d], d)
        });
        return this
    }
    ready: function () {
        Lawnchair.adapter("dom", {
            valid: function () {
                return !!window.Storage
            },
            init: function (a, c) {
                this.storage = window.localStorage;
                var e = this;
                this.indexer = {
                    key: e.name + "._index_",
                    all: function () {
                        enyo.json.parse(e.storage.getItem(this.key)) == null && e.storage.setItem(this.key, enyo.json.stringify([]));
                        return enyo.json.parse(e.storage.getItem(this.key))
                    },
                    add: function (b) {
                        var d = this.all();
                        d.push(b);
                        e.storage.setItem(this.key, enyo.json.stringify(d))
                    },
                    del: function (b) {
                        for (var d = this.all(), f = [], g = 0, h = d.length; g < h; g++) d[g] != b && f.push(d[g]);
                        e.storage.setItem(this.key, enyo.json.stringify(f))
                    }
                    find: function (b) {
                        for (var d = this.all(), f = 0, g = d.length; f < g; f++) if (b === d[f]) return f;
                        return false
                    }
                };
                c && this.fn(this.name, c).call(this, this);
            },
            save: function (a, c) {
                var e = a.key || this.uuid();
                this.indexer.find(e) || this.indexer.add(e);
                delete a.key;
                this.storage.setItem(e, enyo.json.stringify(a));
                if (c) {
                    a.key = e;
                    this.lambda(c).call(this, a)
                }
                return this;
            },
            batch: function (a, c) {
                for (var e = [], b = 0, d = a.length; b < d; b++) this.save(a[b], function (f) {
                    e.push(f)
                });
                c && this.lambda(c).call(this, e);
                return this
            },
            keys: function () {
                callback && this.lambda(callback).call(this, this.indexer.all())
            },
            get: function (a, c) {
                if (this.isArray(a)) {
                    for (var e = [], b = 0, d = a.length; b < d; b++) {
                        var f = enyo.json.parse(this.storage.getItem(a[b]));
                        if (f) {
                            f.key = a[b];
                            e.push(f)
                        }
                    }
                    c && this.lambda(c).call(this, e)
                } else {
                    if (f = enyo.json.parse(this.storage.getItem(a))) f.key = a;
                    c && this.lambda(c).call(this, f)
                }
                return this
            },
            all: function (a) {
                for (var c = this.indexer.all(), e = [], b, d = 0, f = c.length; d < f; d++) {
                    b = enyo.json.parse(this.storage.getItem(c[d]));
                    b.key = c[d];
                    e.push(b)
                }
                a && this.fn(this.name, a).call(this, e);
                return this
            },
            remove: function (a, c) {
                var e = typeof a === "string" ? a : a.key;
                this.indexer.del(e);
                this.storage.removeItem(e);
                c && this.lambda(c).call(this);
                return this
            },
            nuke: function (a) {
                thia.all(function (c) {
                    for (var e = 0, b = c.length; e < b; e++) this.remove(c[e]);
                    a && this.lambda(a).call(this)
                });
                return this
            }
        });
        Lawnchair.adapter("window-name", function (a, c) {
            var e = window.top.name ? enyo.json.parse(window.top.name) : {};
            return {
                valid: function () {
                    return typeof window.top.name != "undefined"
                },
                init: function (b, d) {
                    e[this.name] = {
                        index: [],
                        store: {}
                    };
                    a = e[this.name].index;
                    c = e[this.name].store;
                    this.fn(this.name, d).call(this, this)
                },
                keys: function (b) {
                    this.fn("keys", b).call(this, a);
                    return this
                },
                save: function (b, d) {
                    var f = b.key || this.uuid();
                    b.key && delete b.key;
                    this.exists(f, function (g) {
                        g || a.push(f);
                        c[f] = b;
                        window.top.name = enyo.json.stringify(e);
                        if (d) {
                            b.key = f;
                            this.lambda(d).call(this, b)
                        }
                    });
                    return this
                },
                batch: function (b, d) {
                    for (var f = [], g = 0, h = b.length; g < h; g++) this.save(b[g], function (i) {
                        f.push(i)
                    });
                    d && this.lambda(d).call(this, f);
                    return this
                },
                get: function (b, d) {
                    var f;
                    if (this.isArray(b)) {
                        f = [];
                        for (var g = 0, h = b.length; g < h; g++) f.push(c[b[g]])
                    } else if (f = c[b]) f.key = b;
                    d && this.lambda(d).call(this, f);
                    return this
                },
                exists: function (b, d) {
                    this.lambda(d).call(this, !! c[b]);
                    return this
                },
                all: function (b) {
                    for (var d = [], f = 0, g = a.length; f < g; f++) {
                        var h = c[a[f]];
                        h.key = a[f];
                        d.push(h)
                    }
                    this.fn(this.name, b).call(this, d);
                    return this
                },
                remove: function (b, d) {
                    for (var f = this.isArray(b) ? b : [b], g = 0, h = f.length; g < h; g++) {
                        delete c[f[g]];
                        a.splice(this.indexOf(a, f[g]), 1)
                    }
                    window.top.name = enyo.json.stringify(e);
                    d && this.lambda(d).call(this);
                    return this
                },
                nuke: function (b) {
                    storage = {};
                    a = [];
                    window.top.name = enyo.json.stringify(e);
                    b && this.lambda(b).call(this);
                    return this
                }
            }
        });
    }
})