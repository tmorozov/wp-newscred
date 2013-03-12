<?php
/*
Plugin Name: Tim Newscred
Description: This plugin allows to load posts from http://newscred.com
Author: Timur Morozov
Version: 1.0
*/

define('TIM_NEWSCRED_API_DIR', plugin_dir_url(__FILE__));
// TODO: add key here:
define('TIM_NEWSCRED_API_KEY', );
define('TIM_NEWSCRED_POST_META', 'newscred_guid');


// --- Admin part BEGIN ---
add_action( 'save_post', 'ats_newscred_save_postdata' );
function tim_newscred_save_postdata($post_id) {
	// Check authorization, permissions, autosave, etc
	if (!wp_verify_nonce($_POST['newscred_guid_nonce'], plugin_basename(__FILE__))) {
		return $post_id;
	}

	if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
		return $post_id;
	}

	if('page' == $_POST['post_type'] ) {
		if(!current_user_can('edit_page', $post_id)) {
			return $post_id;
		}
	} else {
		if(!current_user_can('edit_post', $post_id)) {
			return $post_id;
		}
	}

	$guid = $_POST['newscred-guid'];
	if ($guid) {
		update_post_meta($post_id, TIM_NEWSCRED_POST_META, $guid);
	}

	return $post_id;
}

add_action('wp_ajax_get-newscred-topics', 'get_newscred_topics' );
function get_newscred_topics() {
	$topics = array();
	$request = urlencode($_POST['title']);
	if (!$request) {
		echo json_encode($topics);
		exit;
	}
	
	$responceStr = file_get_contents('http://api.newscred.com/topics?access_key='.TIM_NEWSCRED_API_KEY.'&format=json&query='.$request);
	$responce_json = json_decode($responceStr, true);
	
	foreach($responce_json['topic_set'] as $topic) {
		$topics[] = array(
			'title' => $topic['name'],
			'guid' => $topic['guid'],
			'description' => $topic['description']
		);
	}
	
	echo json_encode($topics);
	exit;
}


add_action('admin_head-post-new.php', 'tim_newscred_admin_head');
add_action('admin_head-post.php', 'tim_newscred_admin_head');
function tim_newscred_admin_head() {
	wp_enqueue_script("jquery");
	wp_enqueue_script('underscore', TIM_NEWSCRED_API_DIR.'js/libs/underscore/underscore-min.js', array());
	wp_enqueue_script('backbone', TIM_NEWSCRED_API_DIR.'js/libs/backbone/backbone-min.js', array('jquery', 'underscore', 'json2'));
	wp_enqueue_script('backbone-marionette-bundled', TIM_NEWSCRED_API_DIR.'js/libs/backbone_marionette_bundled/backbone.marionette-ie8.min.js', array('jquery', 'backbone'));
	wp_enqueue_script('newscred-topics-app_ns', TIM_NEWSCRED_API_DIR.'js/newscred-topics-app/namespace.js', array());
	wp_enqueue_script('newscred-topics-app_topic_model', TIM_NEWSCRED_API_DIR.'js/newscred-topics-app/models/topic-model.js', array('jquery', 'backbone','backbone-marionette-bundled', 'newscred-topics-app_ns'));
	wp_enqueue_script('newscred-topics-app_search_view', TIM_NEWSCRED_API_DIR.'js/newscred-topics-app/views/search-view.js', array('jquery', 'backbone','backbone-marionette-bundled', 'newscred-topics-app_ns'));
	wp_enqueue_script('newscred-topics-app_topic_view', TIM_NEWSCRED_API_DIR.'js/newscred-topics-app/views/topic-view.js', array('jquery', 'backbone','backbone-marionette-bundled', 'newscred-topics-app_ns', 'newscred-topics-app_topic_model'));
	wp_enqueue_script('newscred-topics-app_app', TIM_NEWSCRED_API_DIR.'js/newscred-topics-app/app.js', array('jquery', 'backbone', 'backbone-marionette-bundled', 'newscred-topics-app_ns', 'newscred-topics-app_search_view', 'newscred-topics-app_topic_view'));
}

add_action( 'add_meta_boxes', 'tim_newscred_add_meta_box' );
function tim_newscred_add_meta_box() {
	add_meta_box('tim_newscred_sectionid', __( 'ATS Newscred API' ), 'tim_newscred_inner_custom_box', 'page', 'side' );
}

function tim_newscred_inner_custom_box() {
	global $post;
	$post_id = $post->ID;
	$topic_guid = esc_js(get_post_meta($post_id, TIM_NEWSCRED_POST_META, true));
	$topic = array(
		'title' => '',
		'description' => '',
		'guid' => $topic_guid
	);
	
	include 'template.html';
	?>
	<input type="hidden" id="newscred_guid_nonce" name="newscred_guid_nonce" value="<?php echo wp_create_nonce(plugin_basename(__FILE__) ); ?>" />
	<!-- newscred topic api start-up -->
	<script>
		jQuery(document).ready(function () {
			var options = {
				<?php 
					if ($topic_guid) {
						echo "'selectedTopic' : ".json_encode($topic);
					}
				?>
			};
			NewsCreadApi.ajaxurl = '<?php echo admin_url('admin-ajax.php'); ?>';
			
			NewsCreadApi.startApplication(options);
		});	
	</script>
	<?php
}
// --- Admin part END---


// --- Upload part BEGIN ---
class TimNewscredStat {
	static private $processed_request;
	static private $current_stat;
	static private $start_time;
	static private $end_time;
	
	static function reset() {
		TimNewscredStat::$start_time = date('Y-m-d H:i:s');
		TimNewscredStat::$processed_request = array();
	}

	static function new_stat($time) {
		TimNewscredStat::$current_stat = array(
			'loaded' => 0,
			'inserted' => 0,
			'duplicates' => 0,
			'errors' => 0,
			'invalid' =>0,
			'time' => $time,
		);
	}
	
	static function save_stat($cat_wp_name, $topic_articles_req) {
		TimNewscredStat::$processed_request[] = array(
			'category' => $cat_wp_name,
			'request' => $topic_articles_req,
			'stat' => TimNewscredStat::$current_stat
		);
	}
	
	static function get_results() {
		TimNewscredStat::$end_time = date('Y-m-d H:i:s');
		return array(
			'results' => TimNewscredStat::$processed_request,
			'start_at' => TimNewscredStat::$start_time,
			'end_at' => TimNewscredStat::$end_time
		);
	}
	
	static function add_loaded() {
		TimNewscredStat::$current_stat['loaded']++;
	}
	static function add_invalid() {
		TimNewscredStat::$current_stat['invalid']++;
	}
	static function add_duplicate() {
		TimNewscredStat::$current_stat['duplicates']++;
	}
	static function add_error() {
		TimNewscredStat::$current_stat['errors']++;
	}
	static function add_inserted() {
		TimNewscredStat::$current_stat['inserted']++;
	}
}

class TimNewscred {
	function loadCategories() {
		$categories = array();

		$args = array(
			'post_type' => 'page',
			'posts_per_page'=>-1
		);

		$the_query = new WP_Query( $args );

		while ( $the_query->have_posts() ) : $the_query->the_post();
			$id = get_the_ID();
			
			$guid = get_post_meta($id, TIM_NEWSCRED_POST_META, true);
			if (!$guid) {
				continue;
			}

			$category_terms_arr = wp_get_post_terms($id, 'category');
			$cat_id = '';
			$cat_name = '';
			foreach($category_terms_arr as $category) {
				$cat_id = $category->term_id;
				$cat_name = $category->name;
			}
			if (!$cat_id) {
				continue;
			}
			
			$categories[] = array(
				'cat_wp_name' => $cat_name,
				'cat_wp_id' => $cat_id,
				'newscred_topic_guid' => $guid
			);
		endwhile;
		
		return $categories;
		

		// $categories = array(
			// array(
				// 'cat_wp_name' => 'NFL',
				// 'newscred_topic_guid' => '873fe68215e119b14403321c4c4bc9fd'
			// ),
			// array(
				// 'cat_wp_name' => 'NBA',
				// 'newscred_topic_guid' => '17336ec8e13133048e2c6cb9909585cf'
			// ),
			// array(
				// 'cat_wp_name' => 'MLB',
				// 'newscred_topic_guid' => '87699af687ea5bfd0e740489cb8fc152'
			// ),
			// array(
				// 'cat_wp_name' => 'MLB',
				// 'newscred_topic_guid' => '94f7e7a8709441e52b8e94a2179bf155'
			// ),
			// array(
				// 'cat_wp_name' => 'NHL',
				// 'newscred_topic_guid' => '0715099753b5fb0621179b58332b4595'
			// ),
			// array(
				// 'cat_wp_name' => 'NASCAR',
				// 'newscred_topic_guid' => '37b96fc4c8f7e543d71a7a39f207862a'
			// )
		// );
		
		return $categories;
	}
	
	function update () {
		if (isset($_REQUEST['update-ats-newscred'])) {
			// TODO: make it work in safe_mode (timelimit could fail)! 
			set_time_limit(0);
			
			$user_name = 'ATS';
			$newscred_key = TIM_NEWSCRED_API_KEY;
			
			$categories = TimNewscred::loadCategories();

			$user = get_user_by('login', $user_name);
			$user_id = $user->ID ? $user->ID : 0;
			
			TimNewscredStat::reset();
			
			foreach($categories as $category) {
				//TimNewscred::load_category($category['cat_wp_name'], $category['newscred_topic_guid'], $newscred_key, $user_id);
				TimNewscred::load_category($category, $newscred_key, $user_id);
			}

			echo json_encode(TimNewscredStat::get_results());
			exit;
		}
	}
	
	function load_category($category, $newscred_key, $user_id) {
		$time = date('Y-m-d H:i:s');
		$wp_category_id = $category['cat_wp_id'];
		$cat_wp_name = $category['cat_wp_name'];
		if (! $category['cat_wp_id']) {
			$wp_category = get_term_by('name', $cat_wp_name, 'category');
			$wp_category_id = $wp_category->term_id;
		}
		
		$newscred_topic_guid = $category['newscred_topic_guid'];
		TimNewscred::load_articles($newscred_topic_guid, $newscred_key, $time, $user_id, $wp_category_id, $cat_wp_name);
		TimNewscred::load_videos($newscred_topic_guid, $newscred_key, $time, $user_id, $wp_category_id, $cat_wp_name);
	}
	
	function load_videos($newscred_topic_guid, $newscred_key, $time, $user_id, $wp_category_id, $cat_wp_name) {
		$topic_videos_req = 'http://api.newscred.com/topic/'.$newscred_topic_guid.'/videos?access_key='.$newscred_key.'&format=json&sort=date';
		$videos = json_decode(file_get_contents($topic_videos_req));

		TimNewscredStat::new_stat($time);

		foreach($videos->video_set as $video) {
			TimNewscred::process_video($video, $time, $user_id, $wp_category_id);
		}
		
		TimNewscredStat::save_stat($cat_wp_name, $topic_videos_req);
	}
	
	function load_articles($newscred_topic_guid, $newscred_key, $time, $user_id, $wp_category_id, $cat_wp_name) {
		$topic_articles_req = 'http://api.newscred.com/topic/'.$newscred_topic_guid.'/articles?access_key='.$newscred_key.'&format=json&sort=date';
		$articles = json_decode(file_get_contents($topic_articles_req));

		TimNewscredStat::new_stat($time);

		foreach($articles->article_set as $article) {
			TimNewscred::process_article($article, $time, $user_id, $wp_category_id);
		}
		
		TimNewscredStat::save_stat($cat_wp_name, $topic_articles_req);
	}
	
	function process_video($video, $time, $user_id, $wp_cat_id) {
		TimNewscredStat::add_loaded();
		
		if (!$video->media_file) {
			TimNewscredStat::add_invalid();
			return;
		}

		// we currently support only youtube video
		if( ! strstr($video->media_file, 'youtube') ) {
			TimNewscredStat::add_invalid();
			return;
		}

		if (get_page_by_title($video->title, 'OBJECT', 'post')) {
			TimNewscredStat::add_duplicate();
			return;
		} 
		
		$post_id = TimNewscred::insert_post($video->title, $video->caption, $time, $user_id, $wp_cat_id);
		
		if (!$post_id) {
			TimNewscredStat::add_error();
			return;
		}
		
		TimNewscredStat::add_inserted();
	
		update_post_meta($post_id, 'link_video', $video->media_file);
		set_post_format($post_id, 'video');
		
		if ($video->thumbnail) {
			$guid = $video->guid ? $video->guid : '';			
			TimNewscred::append_thumbnail($post_id, $video->thumbnail, $guid);
		}
	}
	
	function process_article($article, $time, $user_id, $wp_cat_id) {
		TimNewscredStat::add_loaded();
		
		if (!$article->description) {
			TimNewscredStat::add_invalid();
			return;
		}

		if (get_page_by_title($article->title, 'OBJECT', 'post')) {
			TimNewscredStat::add_duplicate();
			return;
		} 
		
		$post_id = TimNewscred::insert_post($article->title, $article->description, $time, $user_id, $wp_cat_id);
		
		if (!$post_id) {
			TimNewscredStat::add_error();
			return;
		}

		TimNewscredStat::add_inserted();
		
		if ($article->thumbnail) {
			if ($article->thumbnail->original_image) {
				$guid = $article->guid ? $article->guid : '';
				TimNewscred::append_thumbnail($post_id, $article->thumbnail->original_image, $guid);
			}
		}
	}

	function insert_post($title, $caption, $time, $user_id, $wp_cat_id) {
		$new_post = array(
			'post_title' => $title,
			'post_content' => $caption,
			'post_status' => 'publish',
			'post_date' => $time,
			'post_author' => $user_id,
			'post_type' => 'post',
			'post_category' => array($wp_cat_id)
		);
		
		return wp_insert_post($new_post);
	}
	
	function append_thumbnail($post_id, $image_url, $guid) {
		$upload_dir = wp_upload_dir();
		$image_data = @file_get_contents($image_url);
		if (!$image_data) {
			return;
		}
		$filename = 'thumb_'.$guid.'.jpg'; //basename($image_url);
		if(wp_mkdir_p($upload_dir['path'])) {
			$file = $upload_dir['path'] . '/' . $filename;
		} else {
			$file = $upload_dir['basedir'] . '/' . $filename;
		}
		file_put_contents($file, $image_data);

		$wp_filetype = wp_check_filetype($filename, null );
		$attachment = array(
			'post_mime_type' => $wp_filetype['type'],
			'post_title' => sanitize_file_name($filename),
			'post_content' => '',
			'post_status' => 'inherit'
		);
		$attach_id = wp_insert_attachment( $attachment, $file, $post_id );
		require_once(ABSPATH . 'wp-admin/includes/image.php');
		$attach_data = wp_generate_attachment_metadata( $attach_id, $file );
		wp_update_attachment_metadata( $attach_id, $attach_data );

		set_post_thumbnail( $post_id, $attach_id );	
	}
}

// TimNewscred::update will be starting point
add_action('init', array(TimNewscred, 'update'));

// --- Upload part END ---

?>