TestCase("SearchView", {	
	setUp: function() {
/*:DOC +=
<div class="templates">

<script id="newscred-search-template" type="template">
<input type="text" />
<button>Load</button>
</script>

</div>
*/	
		this.vent = {
			trigger: sinon.spy()
		};
		
		this.searchView = new NewsCreadApi.Views.Search({
			vent: this.vent
		});
		this.searchView.render();	
	},
		
	tearDown: function () {
    },
	
	"test Search View is defined": function() {
		assertFunction(NewsCreadApi.Views.Search);
	},

	"test Search View shows input": function() {
		assertEquals(1, this.searchView.$("input[type=text]").length);
	},

	"test Search View shows button": function() {
		assertEquals(1, this.searchView.$("button").length);
	},

	"test Search View triggers 'topics:load' event with input value on button click": function() {
		var testVal = '111';
		this.searchView.$("input").val(testVal);
		this.searchView.$("button").click();
		assertTrue(this.vent.trigger.calledWith('topics:load', testVal) );
	},
});
