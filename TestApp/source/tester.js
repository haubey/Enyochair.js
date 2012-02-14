enyo.kind({
	name: "TestClass",
	flex: 1,
	kind: enyo.VFlexBox,
	components: [
		{kind: "Button", caption: "Click for data storage", onclick: "storeData"},
		{kind: "Button", caption: "GetData", onclick: "getData"},
		{kind: "Input", name: "myInput"},
		{name: "output", content: "Type something in the textbox, and then click set and then get data"},
		{kind: "Lawnchair", name: "chair"}
	],
	storeData: function() {
		this.$.chair.save({key: "data", name: "Lawnchair in Enyo", can: this.$.myInput.getValue()}, enyo.bind(this, function() {
			this.$.output.setContent("Data set...");
		}));
	},
	getData: function() {
		this.$.chair.get('data' , enyo.bind(this, function(record) {
			this.$.output.setContent(enyo.json.stringify(record));
			console.log(enyo.json.stringify(record));
		}));
	}
});