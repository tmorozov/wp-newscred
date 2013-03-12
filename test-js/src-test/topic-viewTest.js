TestCase("Topic View", {
	setUp : function() {
/*:DOC +=
<div class="templates">

<script id="newscred-topic-template" type="template">
<h2 class='title'><%=title%></h2>
<div class='description'><%=description%></div>
</script>

</div>
*/
	
		this.vent = {
			trigger: sinon.spy()
		};
		
		this.topic = new NewsCreadApi.Models.Topic({
			'title' : '111',
			'description' : '222222222'
		});
		
		this.topicView = new NewsCreadApi.Views.Topic({
			model : this.topic,
			vent : this.vent
		});
		
		this.topicView.render();
	},

	"test Topic Views is defined": function() {
		assertFunction(NewsCreadApi.Views.Topic);
	},

	"test Topic View is li": function() {
		assertEquals("is li", "li", this.topicView.tagName);
	},
	
	"test Topic View shows topic h2 title": function() {
		assertTrue("title set", this.topic.get('title').length > 0);	
		assertEquals(this.topic.get('title'), this.topicView.$('h2.title').html());
	},
	
	"test Topic View shows div description": function() {
		assertTrue("description set", this.topic.get('description').length > 0);	
		assertEquals("description from model", this.topic.get('description'), this.topicView.$('div.description').html() );
	},
	"test Topic View triggers 'topic:selected' event with model on click": function() {
		this.topicView.$el.click();
		assertTrue(this.vent.trigger.calledWith('topic:selected', this.topic) );
	},
	
});

TestCase("Topics View", {
	setUp : function() {
/*:DOC +=
<div class="templates">

<script id="newscred-topic-template" type="template">
<h2 class='title'><%=title%></h2>
<div class='description'><%=description%></div>
</script>

</div>
*/
		this.vent = {
			trigger: sinon.spy()
		};
	
		this.topics = new NewsCreadApi.Models.TopicCollection([ {
				'title' : '111',
				'description' : '222222222',
				'guid' : 'aaaa'
				
			}, {
				'title' : '333',
				'description' : '444444444',
				'guid' : 'bbbb'
			}
		]);
		
		this.topicsView = new NewsCreadApi.Views.Topics({
			collection : this.topics,
			vent : this.vent
		});
		
		this.topicsView.render();
	},
	
	"test Topics View is defined": function() {
		assertFunction(NewsCreadApi.Views.Topics);
	},
	"test Topics View holds Topic View": function() {
		assertEquals(NewsCreadApi.Views.Topic, NewsCreadApi.Views.Topics.prototype.itemView);
	},
	"test Topics View is ul": function() {
		assertEquals("ul", this.topicsView.tagName);
	},
	"test Topics View renders list": function() {
		assertEquals("topicsView renders list", 2, this.topicsView.$('li').length);
	},
	"test Topics View shuld pass vetn to Topic": function() {
		var view = this.topicsView.children.findByIndex(0);
		assertEquals(this.vent, view.options.vent);
	},
});

TestCase("SelectedTopic View", {
	setUp : function() {
/*:DOC +=
<div class="templates">

	<script id="newscred-selected-topic-template" type="template">
		<h2 class='title'><%=title%></h2>
		<h3 class='guid'><%=guid%></h3>
		<input type='hidden' name='newscred-guid' value='<%=guid%>' />
		<div class='description'><%=description%></div>
	</script>

</div>
*/
		this.guid = 'aaaaaaaaa';
		this.topic = new NewsCreadApi.Models.Topic({
			'title' : '111',
			'description' : '222222222',
			'guid' : this.guid
		});
		
		this.topicView = new NewsCreadApi.Views.SelectedTopic({
			model : this.topic,
		});
		
		this.topicView.render();
	},

	"test SelectedTopic Views is defined": function() {
		assertFunction(NewsCreadApi.Views.SelectedTopic);
	},

	"test SelectedTopic View is div": function() {
		assertEquals("div", this.topicView.tagName);
	},
	
	"test SelectedTopic View shows topic h2 title": function() {
		assertTrue("title set", this.topic.get('title').length > 0);	
		assertEquals(this.topic.get('title'), this.topicView.$('h2.title').html());
	},
	
	"test SelectedTopic View shows topic h3 guid": function() {
		assertTrue("guid set", this.topic.get('guid').length > 0);	
		assertEquals(this.topic.get('guid'), this.topicView.$('h3.guid').html());
	},

	"test SelectedTopic View shows div description": function() {
		assertTrue("description set", this.topic.get('description').length > 0);	
		assertEquals("description from model", this.topic.get('description'), this.topicView.$('div.description').html() );
	},

	"test SelectedTopic View shows topic hidden input guid": function() {
		assertTrue("guid set", this.topic.get('guid').length > 0);	
		assertEquals(this.topic.get('guid'), this.topicView.$('input[type=hidden]').val());
		assertEquals(this.topic.get('guid'), this.topicView.$('input[name="newscred-guid"]').val());
	},
});
