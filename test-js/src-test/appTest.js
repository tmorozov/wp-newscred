TestCase("TeamHub App", {
	setUp: function() {
/*:DOC +=
<div>
	<div class="templates">
		<script id="newscred-search-template" type="template">
			<input type="text" />
			<button>Load</button>
		</script>	

		<script id="newscred-topic-template" type="template">
			<h2 class='title'><%=title%></h2>
			<div class='description'><%=description%></div>
		</script>
		
		<script id="newscred-selected-topic-template" type="template">
			<h2 class='title'><%=title%></h2>
			<h3 class='guid'><%=guid%></h3>
			<input type='hidden' name='newscred-guid' value='<%=guid%>' />
			<div class='description'><%=description%></div>
		</script>
	</div>
	
	<div class="newscred-search">
	</div>
	<div class="newscred-topic">
	</div>
	

</div>

*/
		
		this.old_ajaxurl = NewsCreadApi.ajaxurl;
		NewsCreadApi.ajaxurl = "test.php";
		sinon.stub(jQuery, "ajax");		

		this.options = {
		};

		NewsCreadApi.startApplication(this.options);
	},
	
	tearDown: function () {
		NewsCreadApi.ajaxurl = this.old_ajaxurl;
		jQuery.ajax.restore();
    },	
	
	"test NewsCreadApi App defined": function() {
		assertObject(NewsCreadApi.App);
	},
	
	"test App search region is attached": function() {
		assertObject(NewsCreadApi.App['searchRegion']);
	},

	"test App topic region is attached": function() {
		assertObject(NewsCreadApi.App['topicRegion']);
	},
	
	"test on start() search rendered": function() {
		assertEquals("input present", 1, jQuery(".newscred-search input[type=text]").length);
		assertEquals("button present", 1, jQuery(".newscred-search button").length);
	},

	"test on load click AJAX request with input value is sent": function() {
		var value = '111';
		jQuery(".newscred-search input[type=text]").val(value);
		jQuery(".newscred-search button").click();

		assertTrue("AJAX params match", jQuery.ajax.calledWithMatch({ 
			url: NewsCreadApi.ajaxurl,
			type: "post",
			data: {
				'action' : 'get-newscred-topics',
				'title' : value
			}
		}));	
	},
	
	"test on responce to AJAX request after Load click topics are shown": function() {
		var content = [{
				"title" : "aa",
				'description' : '1111',
				'guid' : 'aaa'
			}, {
				"title" : "bb",
				'description' : '2222',
				'guid' : 'bbb'
			}, {
				"title" : "cc",
				'description' : '3333',
				'guid' : 'ccc'
			}
		];
		jQuery(".newscred-search button").click();
		jQuery.ajax.args[0][0].success(content);
		assertEquals(3, jQuery('ul>li').length);
	},
	
	"test on 'select-topic' selected topic info is sown": function() {
		var guid0 = '111111111111';
		var content = [{
				"title" : "aa",
				'description' : '1111',
				'guid' : guid0
			}, {
				"title" : "bb",
				'description' : '2222',
				'guid' : 'bbb'
			}, {
				"title" : "cc",
				'description' : '3333',
				'guid' : 'ccc'
			}
		];
		jQuery(".newscred-search button").click();
		jQuery.ajax.args[0][0].success(content);
		jQuery('ul>li').eq(0).click();
		assertEquals('guid present', 1, jQuery('h3.guid').length );
		assertEquals('right guid shown', guid0, jQuery('h3.guid').html() );		
	}

});

TestCase("TeamHub App with pre-selected topic", {
	setUp: function() {
/*:DOC +=
<div>
	<div class="templates">
		<script id="newscred-search-template" type="template">
			<input type="text" />
			<button>Load</button>
		</script>	

		<script id="newscred-topic-template" type="template">
			<h2 class='title'><%=title%></h2>
			<div class='description'><%=description%></div>
		</script>
		
		<script id="newscred-selected-topic-template" type="template">
			<h2 class='title'><%=title%></h2>
			<h3 class='guid'><%=guid%></h3>
			<input type='hidden' name='newscred-guid' value='<%=guid%>' />
			<div class='description'><%=description%></div>
		</script>
	</div>
	
	<div class="newscred-search">
	</div>
	<div class="newscred-topic">
	</div>
	

</div>

*/
		
		this.guid = 'bbbb';
		this.topic = {
			'title' : '333',
			'description' : '444444444',
			'guid' : this.guid
		};

		this.options = {
			'selectedTopic' : this.topic
		};

		NewsCreadApi.startApplication(this.options);
	},
	
	tearDown: function () {
    },	
	

	"test if topic set in options it should be shown": function() {
		assertEquals('guid present', 1, jQuery('h3.guid').length );
		assertEquals('right guid shown', this.guid, jQuery('h3.guid').html() );			
	},
});