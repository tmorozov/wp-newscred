
TestCase("NewsCreadApi namespace", {
	"test NewsCreadApi namespace defined": function() {
		assertObject(NewsCreadApi);
	},

	"test NewsCreadApi.Views defined": function() {
		assertObject(NewsCreadApi.Views);
	},

	"test NewsCreadApi.Models defined": function() {
		assertObject(NewsCreadApi.Models);
	},

	"test NewsCreadApi.ajaxurl defined": function() {
		assertString(NewsCreadApi.ajaxurl);
	}	
});

