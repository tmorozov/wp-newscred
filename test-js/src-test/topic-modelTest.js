TestCase("Topic Model", {
	"test Topic Model is defined": function() {
		assertFunction(NewsCreadApi.Models.Topic);
	}
});

TestCase("Topic Collection Model", {	
	"test TopicCollection Model is defined": function() {
		assertFunction(NewsCreadApi.Models.TopicCollection);
	},
	
	"test TopicCollection holds Topic": function() {
		assertEquals(NewsCreadApi.Models.Topic, NewsCreadApi.Models.TopicCollection.prototype.model);
	}
});

TestCase("Topic Collection Model serialization", {	
	setUp: function() {
		this.old_ajaxurl = NewsCreadApi.ajaxurl;
		NewsCreadApi.ajaxurl = "test.php";
		sinon.stub(jQuery, "ajax");		
	},
		
	tearDown: function () {
		NewsCreadApi.ajaxurl = this.old_ajaxurl;
		jQuery.ajax.restore();
    },
	
	"test TopicCollection loadByTitle() defined": function() {
		var topics = new NewsCreadApi.Models.TopicCollection();
		assertFunction(topics.loadByTitle);
	},
	
	"test TopicCollection loadByTitle() POSTs to ajaxurl": function() {
		var topics = new NewsCreadApi.Models.TopicCollection();
		var title = '111';
		topics.loadByTitle(title);
		
		assertTrue("AJAX params match", jQuery.ajax.calledWithMatch({ 
			url: NewsCreadApi.ajaxurl,
			type: "post",
			data: {
				'action' : 'get-newscred-topics',
				'title' : title
			}
		}));	
	},
	
	"test TopicCollection loadByTitle() resets collection on success": function() {
		var topics = new NewsCreadApi.Models.TopicCollection();
		var content = [{"title" : "aa"}, {"title" : "bb"}, {"title" : "cc"}];
		var title = '111';
		topics.loadByTitle(title);
		jQuery.ajax.args[0][0].success(content);
		assertEquals("length corect", 3, topics.length);
	}
});
