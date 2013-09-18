Enyochair.js
===========
Lawnchair for Enyo
------------------

Create it as a normal component withen a kind

```javascript
components: [
  {kind: "Lawnchair", name: "storage"}
]

this.$.storage.add({some: "json"}, enyo.bind(this, function() {}));

this.$.storage.get("key", enyo.bind(this, function(record) {
 /*Do something with data*/
}));```

You can add in plugins and adapters by making the same calls you would normally with lawnchair
